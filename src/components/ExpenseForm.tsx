import { useState, type FormEvent } from 'react';
import { X, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { type Group, type GroupMember } from '@/services/groupService';
import { type SplitType } from '@/services/expenseService';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';

export const EXPENSE_CATEGORIES = [
  'Food', 'Rent', 'Groceries', 'Utilities', 'Transport',
  'Entertainment', 'Education', 'Shopping', 'Medical', 'Other',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Rent: 'bg-blue-100 text-blue-700',
  Groceries: 'bg-green-100 text-green-700',
  Utilities: 'bg-cyan-100 text-cyan-700',
  Transport: 'bg-purple-100 text-purple-700',
  Entertainment: 'bg-pink-100 text-pink-700',
  Education: 'bg-indigo-100 text-indigo-700',
  Shopping: 'bg-amber-100 text-amber-700',
  Medical: 'bg-red-100 text-red-700',
  Other: 'bg-slate-100 text-slate-700',
};

const SPLIT_TYPES: { value: SplitType; label: string }[] = [
  { value: 'equal', label: 'Equal' },
  { value: 'custom', label: 'Custom' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'shares', label: 'Shares' },
];

export interface ExpenseFormValues {
  groupId: string;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  participants: string[];
  splitType: SplitType;
  individualShares: { user: string; amount: number; percentage: number; shares: number }[];
  notes: string;
  date: string;
}

interface ExpenseFormProps {
  groups: Group[];
  defaultGroup?: Group | null;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  onCancel: () => void;
  initial?: Partial<ExpenseFormValues>;
  submitLabel?: string;
}

export default function ExpenseForm({ groups, defaultGroup, onSubmit, onCancel, initial, submitLabel = 'Add expense' }: ExpenseFormProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [category, setCategory] = useState(initial?.category || 'Food');
  const [groupId, setGroupId] = useState(initial?.groupId || defaultGroup?.id || groups[0]?.id || '');
  const [paidBy, setPaidBy] = useState(initial?.paidBy || user?.id || '');
  const [splitType, setSplitType] = useState<SplitType>(initial?.splitType || 'equal');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initial?.participants || defaultGroup?.members.map((m) => m.id) || (groups[0]?.members.map((m) => m.id) || [])
  );
  const [shares, setShares] = useState<Record<string, { amount: string; percentage: string; sharesStr: string }>>(
    () => Object.fromEntries((initial?.individualShares || []).map((share) => [
      share.user,
      {
        amount: String(share.amount ?? ''),
        percentage: String(share.percentage ?? ''),
        sharesStr: String(share.shares ?? ''),
      },
    ]))
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedGroup = groups.find((g) => g.id === groupId) || defaultGroup;
  const groupMembers: GroupMember[] = selectedGroup?.members || [];
  const numericAmount = parseFloat(amount) || 0;

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleShareChange = (memberId: string, field: 'amount' | 'percentage' | 'sharesStr', value: string) => {
    setShares((prev) => ({
      ...prev,
      [memberId]: {
        amount: field === 'amount' ? value : prev[memberId]?.amount || '',
        percentage: field === 'percentage' ? value : prev[memberId]?.percentage || '',
        sharesStr: field === 'sharesStr' ? value : prev[memberId]?.sharesStr || '',
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Title is required'); return; }
    if (!amount || numericAmount <= 0) { setError('Amount must be greater than 0'); return; }
    if (!groupId) { setError('Please select a group'); return; }
    if (!paidBy) { setError('Please select who paid'); return; }
    if (selectedParticipants.length === 0) { setError('Select at least one participant'); return; }

    if (splitType === 'percentage') {
      const values = selectedParticipants.map((pId) => shares[pId]?.percentage);
      if (values.some((value) => value === undefined || value.trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0)) {
        setError('Enter a valid non-negative percentage for every participant'); return;
      }
      const total = values.reduce((sum, value) => sum + Number(value), 0);
      if (Math.abs(total - 100) > 0.01) { setError('Percentages must add up to 100%'); return; }
    }
    if (splitType === 'custom') {
      const values = selectedParticipants.map((pId) => shares[pId]?.amount);
      if (values.some((value) => value === undefined || value.trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0)) {
        setError('Enter a valid non-negative amount for every participant'); return;
      }
      const total = values.reduce((sum, value) => sum + Number(value), 0);
      if (Math.abs(total - numericAmount) > 0.01) { setError(`Custom amounts must add up to ${formatCurrency(numericAmount)}`); return; }
    }
    if (splitType === 'shares') {
      const values = selectedParticipants.map((pId) => shares[pId]?.sharesStr);
      if (values.some((value) => value === undefined || value.trim() === '' || !Number.isFinite(Number(value)) || Number(value) <= 0)) {
        setError('Enter a positive share value for every participant'); return;
      }
      const total = values.reduce((sum, value) => sum + Number(value), 0);
      if (total <= 0) { setError('Total shares must be greater than 0'); return; }
    }

    const individualShares = selectedParticipants.map((pId) => ({
      user: pId,
      amount: Number(shares[pId]?.amount || 0),
      percentage: Number(shares[pId]?.percentage || 0),
      shares: Number(shares[pId]?.sharesStr || 0),
    }));

    setSubmitting(true);
    try {
      await onSubmit({
        groupId,
        title: title.trim(),
        amount: numericAmount,
        category,
        paidBy,
        participants: selectedParticipants,
        splitType,
        individualShares,
        notes: notes.trim(),
        date,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{submitLabel}</h2>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Group */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Group</label>
            <select value={groupId} onChange={(e) => {
              setGroupId(e.target.value);
              const g = groups.find((gr) => gr.id === e.target.value);
              if (g) {
                setSelectedParticipants(g.members.map((m) => m.id));
                setPaidBy(user?.id || '');
              }
            }} className="input-field">
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Title + Amount */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dinner at restaurant" className="input-field" autoFocus />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input-field pl-7" />
              </div>
            </div>
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Paid by</label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="input-field">
              {groupMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}{m.id === user?.id ? ' (You)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Split Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Split type</label>
            <div className="grid grid-cols-4 gap-2">
              {SPLIT_TYPES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setSplitType(st.value)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                    splitType === st.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Participants {splitType === 'equal' && `(${selectedParticipants.length} selected)`}
            </label>
            <div className="space-y-1 rounded-lg border border-slate-200 p-2">
              {groupMembers.map((m) => {
                const isSelected = selectedParticipants.includes(m.id);
                const totalCents = Math.round(numericAmount * 100);
                const baseCents = selectedParticipants.length > 0
                  ? Math.floor(totalCents / selectedParticipants.length)
                  : 0;
                const remainder = totalCents - baseCents * selectedParticipants.length;
                const participantIndex = selectedParticipants.indexOf(m.id);
                const equalCents = baseCents + (participantIndex >= 0 && participantIndex < remainder ? 1 : 0);
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                        {getInitials(`${m.firstName} ${m.lastName}`)}
                      </div>
                      <span className="text-sm text-slate-700">{m.firstName} {m.lastName}{m.id === user?.id ? ' (You)' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && splitType === 'equal' && (
                        <span className="text-xs font-medium text-slate-500">{formatCurrency(equalCents / 100)}</span>
                      )}
                      {isSelected && splitType === 'custom' && (
                        <div className="relative w-20">
                          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                          <input
                            type="number" step="0.01" min="0"
                            value={shares[m.id]?.amount || ''}
                            onChange={(e) => handleShareChange(m.id, 'amount', e.target.value)}
                            className="rounded-md border border-slate-200 py-1 pl-5 pr-2 text-xs"
                            placeholder="0.00"
                          />
                        </div>
                      )}
                      {isSelected && splitType === 'percentage' && (
                        <div className="relative w-16">
                          <input
                            type="number" step="0.01" min="0" max="100"
                            value={shares[m.id]?.percentage || ''}
                            onChange={(e) => handleShareChange(m.id, 'percentage', e.target.value)}
                            className="rounded-md border border-slate-200 py-1 pl-2 pr-5 text-xs"
                            placeholder="0"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                        </div>
                      )}
                      {isSelected && splitType === 'shares' && (
                        <input
                          type="number" step="0.01" min="0"
                          value={shares[m.id]?.sharesStr || ''}
                          onChange={(e) => handleShareChange(m.id, 'sharesStr', e.target.value)}
                          className="w-16 rounded-md border border-slate-200 py-1 px-2 text-xs"
                          placeholder="0"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => toggleParticipant(m.id)}
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded border transition-all',
                          isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-slate-300 bg-white'
                        )}
                      >
                        {isSelected && <span className="text-xs">✓</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Add any notes about this expense..." className="input-field resize-none" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <LoadingSpinner size="sm" /> : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
