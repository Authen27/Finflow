import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Select, Field, FieldRow } from '../ui/Input';
import { useStore } from '../../store';
import { uid, today } from '../../lib/format';
import {
  ALL_CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
} from '../../constants';
import type { Transaction, TxnType, Recurrence } from '../../types';

interface Props {
  /** Optional override props — when omitted, the modal binds to the global store
   *  state (txnModalOpen / editingTxn / closeTxnModal). Used at App root. */
  open?: boolean;
  initial?: Transaction | null;
  onClose?: () => void;
}

interface SplitParticipantForm {
  name: string;
  share: string;
  isYou: boolean;
  paid: boolean;
  paidOn?: string | null;
}

interface FormState {
  type: TxnType;
  amount: string;
  currency: string;
  date: string;
  description: string;
  category: string;
  note: string;
  memberId: string;
  paymentMethod: string;
  recurring: Recurrence | '';
  excluded: boolean;
  // ── split ──
  splitEnabled: boolean;
  splitPaidBy: 'me' | 'external';
  splitParticipants: SplitParticipantForm[];
}

const defaultParticipants = (): SplitParticipantForm[] => ([
  { name: 'You', share: '', isYou: true,  paid: true },
  { name: '',    share: '', isYou: false, paid: false },
]);

const blank = (currency: string): FormState => ({
  type: 'expense',
  amount: '',
  currency,
  date: today(),
  description: '',
  category: 'food',
  note: '',
  memberId: '',
  paymentMethod: '',
  recurring: '',
  excluded: false,
  splitEnabled: false,
  splitPaidBy: 'me',
  splitParticipants: defaultParticipants(),
});

function categoriesFor(type: TxnType) {
  if (type === 'income')   return INCOME_CATEGORIES;
  if (type === 'expense')  return EXPENSE_CATEGORIES;
  return ALL_CATEGORIES;
}

export default function TransactionFormModal(props: Props) {
  const profile          = useStore(s => s.profile);
  const members          = useStore(s => s.members);
  const upsertTransaction = useStore(s => s.upsertTransaction);
  const removeTransaction = useStore(s => s.removeTransaction);
  const toast            = useStore(s => s.toast);

  // Bind to the global store unless explicit props are passed
  const storeOpen     = useStore(s => s.txnModalOpen);
  const storeInitial  = useStore(s => s.editingTxn);
  const storeClose    = useStore(s => s.closeTxnModal);
  const open          = props.open    ?? storeOpen;
  const initial       = props.initial ?? storeInitial;
  const onClose       = props.onClose ?? storeClose;

  const [form, setForm]    = useState<FormState>(blank(profile.baseCurrency));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const sp = initial.split;
      setForm({
        type: initial.type,
        amount: String(sp?.isSplit ? sp.totalAmount : initial.amount),
        currency: initial.currency,
        date: initial.date,
        description: initial.description,
        category: initial.category,
        note: initial.note ?? '',
        memberId: initial.memberId ?? '',
        paymentMethod: initial.paymentMethod ?? '',
        recurring: initial.recurring ?? '',
        excluded: Boolean(initial.excluded),
        splitEnabled: Boolean(sp?.isSplit),
        splitPaidBy: sp?.paidBy ?? 'me',
        splitParticipants: sp?.isSplit && sp.participants.length
          ? sp.participants.map(p => ({
              name: p.isYou ? 'You' : p.name,
              share: String(p.share),
              isYou: Boolean(p.isYou),
              paid: p.paid,
              paidOn: p.paidOn,
            }))
          : defaultParticipants(),
      });
    } else {
      setForm(blank(profile.baseCurrency));
    }
  }, [open, initial, profile.baseCurrency]);

  const cats = categoriesFor(form.type);

  // Reset category to a valid one if type change orphans it
  useEffect(() => {
    if (!cats.find(c => c.id === form.category)) {
      setForm(f => ({ ...f, category: cats[0]?.id ?? f.category }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  async function save() {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast('Enter a valid amount greater than 0', 'error');
      return;
    }
    if (!form.description.trim()) {
      toast('Description is required', 'error');
      return;
    }

    // ── Build split info (expense only) ──
    let split: Transaction['split'] | undefined = undefined;
    if (form.type === 'expense' && form.splitEnabled) {
      const parts = form.splitParticipants
        .map(p => ({ ...p, shareNum: parseFloat(p.share) }))
        .filter(p => (p.isYou || p.name.trim()) && !isNaN(p.shareNum) && p.shareNum >= 0);
      const you = parts.find(p => p.isYou);
      if (!you) { toast('A split needs your share', 'error'); return; }
      if (parts.length < 2) { toast('A split needs at least one other participant', 'error'); return; }
      const sumShares = parts.reduce((s, p) => s + p.shareNum, 0);
      if (Math.abs(sumShares - amount) > 0.01) {
        toast(`Participant shares (${sumShares.toFixed(2)}) must add up to the total bill (${amount.toFixed(2)})`, 'error');
        return;
      }
      split = {
        isSplit: true,
        totalAmount: amount,
        yourShare: you.shareNum,
        paidBy: form.splitPaidBy,
        participants: parts.map(p => ({
          name: p.isYou ? 'You' : p.name.trim(),
          isYou: p.isYou || undefined,
          share: p.shareNum,
          // If you paid, you're settled; counterparties settle later.
          // If someone external paid, they're settled and you owe your share.
          paid: form.splitPaidBy === 'me' ? Boolean(p.isYou || p.paid) : Boolean(!p.isYou || p.paid),
          paidOn: p.paidOn ?? null,
        })),
      };
    }

    setSaving(true);
    try {
      const txn: Transaction = {
        id: initial?.id ?? uid(),
        type: form.type,
        amount,
        currency: form.currency,
        date: form.date,
        description: form.description.trim(),
        category: form.category,
        note: form.note.trim() || undefined,
        memberId: form.memberId || undefined,
        paymentMethod: form.paymentMethod || undefined,
        recurring: form.recurring || undefined,
        excluded: form.excluded || undefined,
        // preserve fields the form doesn't edit
        linkedAssetId: initial?.linkedAssetId,
        linkedDebtId:  initial?.linkedDebtId,
        linkedTxnId:   initial?.linkedTxnId,
        split,
      };
      await upsertTransaction(txn);
      toast(initial ? 'Transaction updated' : 'Transaction added', 'success');
      onClose();
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!initial) return;
    if (!confirm('Delete this transaction?')) return;
    try {
      await removeTransaction(initial.id);
      toast('Transaction deleted', 'info');
      onClose();
    } catch (e) {
      toast(`Delete failed: ${(e as Error).message}`, 'error');
    }
  }

  return (
    <Modal open={open} title={initial ? 'Edit Transaction' : 'Add Transaction'} onClose={onClose}>
      <FieldRow>
        <Field label="Type">
          <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TxnType }))}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="investment">Investment</option>
            <option value="transfer">Transfer</option>
          </Select>
        </Field>
        <Field label="Date">
          <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </Field>
      </FieldRow>

      <Field label="Description">
        <Input
          autoFocus
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="e.g. Tesco grocery run"
        />
      </Field>

      <FieldRow>
        <Field label="Amount">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="0.00"
          />
        </Field>
        <Field label="Currency">
          <Select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
            {Object.entries(CURRENCIES).map(([code, c]) => (
              <option key={code} value={code}>{c.symbol} {code}</option>
            ))}
          </Select>
        </Field>
      </FieldRow>

      <Field label="Category">
        <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </Select>
      </Field>

      <FieldRow>
        <Field label="Member" hint="optional">
          <Select value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}>
            <option value="">— None —</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
        </Field>
        <Field label="Payment method" hint="optional">
          <Select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
            <option value="">— None —</option>
            {Object.entries(PAYMENT_METHODS).map(([id, m]) => (
              <option key={id} value={id}>{m.name}</option>
            ))}
          </Select>
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label="Recurring" hint="optional">
          <Select value={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.value as Recurrence | '' }))}>
            <option value="">— Not recurring —</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </Field>
        <Field label="Note" hint="optional">
          <Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="" />
        </Field>
      </FieldRow>

      <label className="flex items-center gap-2 mb-3 text-[0.84rem] text-ink-mid cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.excluded}
          onChange={e => setForm(f => ({ ...f, excluded: e.target.checked }))}
        />
        <span>🔒 Private — exclude from totals, charts and Pulse Score</span>
      </label>

      {/* ── Split a bill (expense only) ── */}
      {form.type === 'expense' && (
        <div className="mb-4 border border-line rounded-lg overflow-hidden">
          <label className="flex items-center gap-2 px-3 py-2.5 bg-bg3 text-[0.84rem] text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.splitEnabled}
              onChange={e => setForm(f => ({ ...f, splitEnabled: e.target.checked }))}
            />
            <span>🤝 Split this bill with others</span>
          </label>

          {form.splitEnabled && (
            <div className="p-3 space-y-3">
              <Field label="Who paid the bill?">
                <Select
                  value={form.splitPaidBy}
                  onChange={e => setForm(f => ({ ...f, splitPaidBy: e.target.value as 'me' | 'external' }))}
                >
                  <option value="me">You paid — others owe you</option>
                  <option value="external">Someone else paid — you owe your share</option>
                </Select>
              </Field>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="mono-label">Participants &amp; shares ({form.currency})</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, splitParticipants: [...f.splitParticipants, { name: '', share: '', isYou: false, paid: false }] }))}
                    className="font-mono text-[0.6rem] tracking-wider uppercase text-coral hover:underline"
                  >
                    + Add person
                  </button>
                </div>
                <div className="space-y-1.5">
                  {form.splitParticipants.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className="input flex-1 py-1.5"
                        value={p.isYou ? 'You' : p.name}
                        disabled={p.isYou}
                        placeholder="Name"
                        onChange={e => setForm(f => ({ ...f, splitParticipants: f.splitParticipants.map((x, j) => j === i ? { ...x, name: e.target.value } : x) }))}
                      />
                      <input
                        className="input w-28 py-1.5 text-right"
                        type="number" min="0" step="0.01"
                        value={p.share}
                        placeholder="0.00"
                        onChange={e => setForm(f => ({ ...f, splitParticipants: f.splitParticipants.map((x, j) => j === i ? { ...x, share: e.target.value } : x) }))}
                      />
                      {!p.isYou ? (
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, splitParticipants: f.splitParticipants.filter((_, j) => j !== i) }))}
                          className="text-ink-dim hover:text-terra w-7 flex-shrink-0 text-center"
                          aria-label="Remove participant"
                        >✕</button>
                      ) : <span className="w-7 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
                {/* Running total vs bill */}
                {(() => {
                  const bill = parseFloat(form.amount) || 0;
                  const sum = form.splitParticipants.reduce((s, p) => s + (parseFloat(p.share) || 0), 0);
                  const ok = Math.abs(sum - bill) < 0.01 && bill > 0;
                  return (
                    <div className={`mt-2 font-mono text-[0.62rem] tracking-wider ${ok ? 'text-sage' : 'text-honey'}`}>
                      Shares total {sum.toFixed(2)} / bill {bill.toFixed(2)} {ok ? '✓' : '— must match'}
                    </div>
                  );
                })()}
                <p className="mt-1.5 text-[0.7rem] text-ink-dim leading-snug">
                  The <strong>Amount</strong> above is the full bill. Only your share counts toward your
                  expenses; the rest is tracked as IOUs on the Splits page.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {initial ? (
          <button
            type="button"
            onClick={del}
            className="font-mono text-[0.62rem] tracking-wider uppercase text-terra hover:underline"
          >
            Delete
          </button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
