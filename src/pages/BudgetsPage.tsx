import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Plus, WalletCards } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/context/ToastContext';

interface Budget { id: number; name: string; type: string; limit: number; used: number }
const initialBudgets: Budget[] = [
  { id: 1, name: 'Monthly spending', type: 'Monthly', limit: 2400, used: 1468.5 },
  { id: 2, name: 'Home & utilities', type: 'Category', limit: 850, used: 712 },
];

export default function BudgetsPage() {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('smart-expense-budgets');
    return saved ? JSON.parse(saved) : initialBudgets;
  });
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: '', type: 'Category', limit: '' });
  const save = (next: Budget[]) => { setBudgets(next); localStorage.setItem('smart-expense-budgets', JSON.stringify(next)); };
  const total = useMemo(() => budgets.reduce((sum, item) => sum + item.limit, 0), [budgets]);
  const used = useMemo(() => budgets.reduce((sum, item) => sum + item.used, 0), [budgets]);

  return <div className="animate-in space-y-8">
    <PageHeader title="Budgets" description="Set guardrails for the spending that matters most." action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="h-4 w-4" />New budget</button>} />
    <div className="grid gap-4 sm:grid-cols-3">
      {[['Total budget', `$${total.toLocaleString()}`, 'Across all active limits'], ['Allocated', `${Math.round((used / total) * 100)}%`, 'Of your planned spend'], ['Remaining', `$${Math.max(0, total - used).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Available this period']].map(([label, value, hint]) => <div className="card p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div>)}
    </div>
    {budgets.length === 0 ? <EmptyState icon={WalletCards} title="No budgets yet" description="Create a monthly, category, or group budget to make spending more intentional." action={<button className="btn-primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Create budget</button>} /> : <div className="grid gap-4 lg:grid-cols-2">{budgets.map((budget) => { const percentage = Math.round((budget.used / budget.limit) * 100); const over = percentage >= 100; const warning = percentage >= 80; return <div className="card p-6" key={budget.id}><div className="flex items-start justify-between"><div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{budget.type}</span><h2 className="mt-3 font-semibold">{budget.name}</h2></div>{over || warning ? <AlertTriangle className={`h-5 w-5 ${over ? 'text-rose-500' : 'text-amber-500'}`} /> : <Check className="h-5 w-5 text-emerald-500" />}</div><div className="mt-6 flex items-end justify-between"><p className="text-sm text-slate-500">Used <span className="font-semibold text-slate-900">${budget.used.toFixed(2)}</span></p><p className="text-sm text-slate-500"><span className="font-bold text-slate-900">{percentage}%</span> of ${budget.limit.toFixed(2)}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${over ? 'bg-rose-500' : warning ? 'bg-amber-400' : 'bg-primary-500'}`} style={{ width: `${Math.min(100, percentage)}%` }} /></div><p className={`mt-3 text-xs ${over ? 'text-rose-600' : warning ? 'text-amber-600' : 'text-slate-500'}`}>{over ? 'You have exceeded this budget.' : warning ? 'Approaching your budget limit.' : `$${(budget.limit - budget.used).toFixed(2)} remaining`}</p></div> })}</div>}
    {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={(event) => { event.preventDefault(); const next = [...budgets, { id: Date.now(), name: draft.name || 'Untitled budget', type: draft.type, limit: Number(draft.limit), used: 0 }]; save(next); setShowForm(false); setDraft({ name: '', type: 'Category', limit: '' }); toast('Budget created'); }} className="card w-full max-w-md p-6"><h2 className="text-lg font-semibold">Create a budget</h2><div className="mt-5 space-y-4"><input required autoFocus className="input-field" placeholder="e.g. Dining out" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /><select className="input-field" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}><option>Monthly</option><option>Category</option><option>Group</option></select><input required min="1" type="number" className="input-field" placeholder="Limit" value={draft.limit} onChange={(e) => setDraft({ ...draft, limit: e.target.value })} /></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn-primary">Create budget</button></div></form></div>}
  </div>;
}
