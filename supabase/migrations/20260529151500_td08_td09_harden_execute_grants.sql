-- TD-08 / TD-09 follow-up — revoke the default PUBLIC execute grant on the
-- SECURITY DEFINER functions added earlier in this PR.
--
-- Postgres grants EXECUTE to PUBLIC by default on every new function. The
-- TD-09 migration added `grant execute ... to authenticated` for the six
-- replace_<entity> RPCs but did not revoke the implicit PUBLIC grant, so
-- the `anon` role could still reach them (the in-function `auth.uid() is
-- null` guard rejected such calls, but defense-in-depth says don't expose
-- the entrypoint at all). The TD-08 trigger function log_domain_activity()
-- is never meant to be called directly as an RPC — triggers fire as the
-- table owner regardless of EXECUTE grant — so it should be callable by
-- nobody.
--
-- This migration was authored after the Supabase security advisor flagged
-- the seven functions under lints 0028 / 0029. It clears the anon exposure
-- and the trigger-function exposure. The remaining advisor entries for the
-- replace_* RPCs under the `authenticated` role are intentional and match
-- the existing posture of is_member / accept_invitation / admin_* — signed-in
-- household members must be able to call them, and each carries its own
-- auth.uid() + is_member(h) guard.

begin;

-- Trigger function: callable by nobody as an RPC.
revoke execute on function public.log_domain_activity() from public, anon, authenticated;

-- Atomic bulk-replace RPCs: keep the authenticated grant from the TD-09
-- migration; drop the implicit PUBLIC grant so anon cannot reach them.
revoke execute on function public.replace_transactions(uuid, jsonb) from public, anon;
revoke execute on function public.replace_budgets(uuid, jsonb)      from public, anon;
revoke execute on function public.replace_goals(uuid, jsonb)        from public, anon;
revoke execute on function public.replace_debts(uuid, jsonb)        from public, anon;
revoke execute on function public.replace_assets(uuid, jsonb)       from public, anon;
revoke execute on function public.replace_memberships(uuid, jsonb)  from public, anon;

commit;
