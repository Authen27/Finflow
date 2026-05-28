-- TD-04 final — closes the family.
--
-- PR #13 documented that three originally-requested admin READ RPCs
-- remained unaddressed after the dev's batch went sideways:
--   • admin_list_users()       — backs Users page
--   • admin_weekly_trend(weeks) — backs Dashboard trend chart
--   • admin_ai_usage_summary() — backs Intelligence page
-- This migration delivers all three. The Intelligence RPC reads a new
-- `ai_usage` table that the admin app already assumes exists but was
-- never committed to a migration — it ships here too, with privacy-safe
-- columns only (intent, sentiment score, message length; never content).
--
-- All three functions are SECURITY DEFINER with a fixed search_path
-- (matching the is_member / role_in / is_admin pattern); each guards on
-- `is_admin(auth.uid())` at the top so a non-admin caller gets
-- 42501 / insufficient_privilege rather than data.

BEGIN;

-- ── ai_usage table ──────────────────────────────────────────────
-- Privacy-safe AI interaction log. Stores intent + numeric sentiment +
-- message length only — never the message content. The admin app's
-- Intelligence page segments users from these fields alone (see
-- admin/src/pages/Intelligence.tsx).
create table if not exists ai_usage (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  -- Intent vocabulary mirrors INTENT_COLORS in admin/src/pages/Intelligence.tsx.
  intent          text not null check (intent in (
                    'spending','savings','budget','debt','networth',
                    'goals','pulse','planning','help','other'
                  )),
  -- Sentiment score in [-1, 1]; consumer/edge classifier produces this.
  -- The byte-label (positive/neutral/negative) is derived in
  -- admin_ai_usage_summary() so the column count stays minimal.
  sentiment_score numeric(4,3) not null check (sentiment_score between -1 and 1),
  -- Message character length — kept as a privacy-safe proxy for engagement
  -- depth (no content stored). Indexed only via the foreign-key path.
  message_length  integer not null check (message_length >= 0),
  created_at      timestamptz not null default now()
);
create index if not exists ai_usage_user_idx    on ai_usage(user_id);
create index if not exists ai_usage_created_idx on ai_usage(created_at desc);
create index if not exists ai_usage_intent_idx  on ai_usage(intent);

-- RLS — a user inserts their own rows (the consumer Edge Function does
-- this via the authenticated session); admins read all rows. No update
-- semantics — interactions are append-only by design.
alter table ai_usage enable row level security;

drop policy if exists "user inserts own ai_usage" on ai_usage;
drop policy if exists "user reads own ai_usage"   on ai_usage;
drop policy if exists "admin reads all ai_usage"  on ai_usage;

create policy "user inserts own ai_usage" on ai_usage
  for insert with check (user_id = auth.uid());
create policy "user reads own ai_usage" on ai_usage
  for select using (user_id = auth.uid());
create policy "admin reads all ai_usage" on ai_usage
  for select using (is_admin());

-- Attach the existing audit trigger if it exists (TD-08, may run before
-- or after this migration depending on environment).
do $$
begin
  if exists (select 1 from pg_proc where proname = 'log_domain_activity') then
    if not exists (select 1 from pg_trigger where tgname = 'activity_ai_usage_trigger') then
      create trigger activity_ai_usage_trigger
        after insert or update or delete on ai_usage
        for each row execute function log_domain_activity();
    end if;
  end if;
end$$;

-- ── admin_list_users() ──────────────────────────────────────────
-- Backs admin/src/lib/adminApi.ts:fetchAllUsers. Joins auth.users +
-- public.profiles (display_name) + a memberships count subquery +
-- public.admin_roles (privilege tier). Returns jsonb array; the admin
-- app's TS contract is AdminUserRow[].
create or replace function admin_list_users()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not is_admin() then
    raise exception 'admin_list_users: caller is not an admin'
      using errcode = '42501';
  end if;

  return (
    select coalesce(jsonb_agg(row_to_jsonb(u)), '[]'::jsonb)
    from (
      select
        au.id,
        au.email::text                       as email,
        p.display_name,
        (au.email_confirmed_at is not null)  as email_confirmed,
        au.created_at,
        au.last_sign_in_at,
        coalesce(mc.cnt, 0)                  as household_count,
        (ar.user_id is not null)             as is_admin,
        ar.role                              as admin_role
      from auth.users au
      left join public.profiles p on p.id = au.id
      left join (
        select user_id, count(*) as cnt
        from public.memberships
        where user_id is not null
        group by user_id
      ) mc on mc.user_id = au.id
      left join public.admin_roles ar on ar.user_id = au.id
      order by au.created_at desc
    ) u
  );
end;
$$;
grant execute on function admin_list_users() to authenticated;

-- ── admin_weekly_trend(weeks) ───────────────────────────────────
-- Backs admin/src/lib/adminApi.ts:fetchWeeklyTrend. Produces one row
-- per ISO week for the requested look-back window (default 12 weeks),
-- with signups (from profiles), active users (distinct created_by on
-- non-deleted transactions), and new_txns (insert count). generate_series
-- gives the row template so weeks with zero activity still appear.
create or replace function admin_weekly_trend(weeks integer default 12)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  bounded_weeks integer := greatest(1, least(weeks, 104));   -- guardrail: 1..104
begin
  if not is_admin() then
    raise exception 'admin_weekly_trend: caller is not an admin'
      using errcode = '42501';
  end if;

  return (
    select coalesce(jsonb_agg(row_to_jsonb(t) order by t.week_start), '[]'::jsonb)
    from (
      select
        date_trunc('week', wk)::date              as week_start,
        coalesce(s.signups, 0)::integer           as signups,
        coalesce(a.active_users, 0)::integer      as active_users,
        coalesce(x.new_txns, 0)::integer          as new_txns
      from generate_series(
        date_trunc('week', now() - (bounded_weeks * interval '1 week')),
        date_trunc('week', now()),
        interval '1 week'
      ) wk
      left join (
        select date_trunc('week', created_at)::date as ws, count(*) as signups
        from public.profiles
        group by 1
      ) s on s.ws = date_trunc('week', wk)::date
      left join (
        select date_trunc('week', created_at)::date as ws,
               count(distinct created_by) as active_users
        from public.transactions
        where deleted_at is null and created_by is not null
        group by 1
      ) a on a.ws = date_trunc('week', wk)::date
      left join (
        select date_trunc('week', created_at)::date as ws, count(*) as new_txns
        from public.transactions
        where deleted_at is null
        group by 1
      ) x on x.ws = date_trunc('week', wk)::date
    ) t
  );
end;
$$;
grant execute on function admin_weekly_trend(integer) to authenticated;

-- ── admin_ai_usage_summary() ────────────────────────────────────
-- Backs admin/src/lib/adminApi.ts:fetchAiUsageSummary. Returns jsonb
-- matching the AiUsageSummary TS contract:
--   total, users, last7, last30, byIntent, bySentiment, segments
-- The bySentiment label is derived from the numeric sentiment_score
-- using the same thresholds the admin Intelligence page uses
-- (segmentOf in admin/src/pages/Intelligence.tsx: < -0.15 negative;
-- > 0.15 positive; else neutral). segments[] surfaces the per-user
-- aggregations the page renders.
create or replace function admin_ai_usage_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not is_admin() then
    raise exception 'admin_ai_usage_summary: caller is not an admin'
      using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total',  (select count(*)::integer from public.ai_usage),
    'users',  (select count(distinct user_id)::integer from public.ai_usage),
    'last7',  (select count(*)::integer from public.ai_usage where created_at >= now() - interval '7 days'),
    'last30', (select count(*)::integer from public.ai_usage where created_at >= now() - interval '30 days'),
    'byIntent', (
      select coalesce(jsonb_object_agg(intent, cnt), '{}'::jsonb)
      from (select intent, count(*)::integer as cnt from public.ai_usage group by intent) i
    ),
    'bySentiment', (
      select coalesce(jsonb_object_agg(label, cnt), '{}'::jsonb)
      from (
        select case
                 when sentiment_score < -0.15 then 'negative'
                 when sentiment_score >  0.15 then 'positive'
                 else                              'neutral'
               end as label,
               count(*)::integer as cnt
        from public.ai_usage
        group by 1
      ) s
    ),
    'segments', (
      select coalesce(jsonb_agg(row_to_jsonb(seg)), '[]'::jsonb)
      from (
        select
          u.user_id::text                as "userId",
          au.email::text                 as email,
          count(*)::integer              as interactions,
          mode() within group (order by u.intent)        as "topIntent",
          round(avg(u.sentiment_score)::numeric, 3)      as "avgSentiment",
          max(u.created_at)              as "lastSeen"
        from public.ai_usage u
        left join auth.users au on au.id = u.user_id
        group by u.user_id, au.email
        order by interactions desc
        limit 200    -- safety cap; the UI shows top engagement only
      ) seg
    )
  );
end;
$$;
grant execute on function admin_ai_usage_summary() to authenticated;

COMMIT;
