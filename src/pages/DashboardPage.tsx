import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, HandCoins, Receipt, TrendingUp, Users, WalletCards } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService, type DashboardData } from '@/services/analyticsService';

const money = (value: number) => `$${Number(value || 0).toFixed(2)}`;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => { analyticsService.getDashboard().then(setData).catch(() => setData(null)); }, []);
  const stats = data?.stats;

  return (
    <div className="animate-in space-y-8">
      <PageHeader title={`Good evening${user?.firstName ? `, ${user.firstName}` : ''}`} description="Here’s the latest snapshot of your shared finances." action={<button onClick={() => navigate('/expenses')} className="btn-primary"><Receipt className="h-4 w-4" />Add expense</button>} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total spending', value: money(stats?.totalSpending || 0), icon: Receipt, color: 'text-primary-600 bg-primary-100' },
          { label: 'You owe', value: money(stats?.youOwe || 0), icon: HandCoins, color: 'text-amber-600 bg-amber-100' },
          { label: 'You are owed', value: money(stats?.youAreOwed || 0), icon: TrendingUp, color: 'text-green-600 bg-green-100' },
          { label: 'Active groups', value: stats?.activeGroups || 0, icon: Users, color: 'text-blue-600 bg-blue-100' },
        ].map((stat) => <div key={stat.label} className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}><stat.icon className="h-5 w-5" /></div><ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary-500" /></div><p className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p><p className="mt-1 text-sm text-slate-500">{stat.label}</p></div>)}
      </div>
      <div className="card flex flex-col justify-between gap-5 overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-cyan-500 p-6 text-white sm:flex-row sm:items-center">
        <div><p className="text-sm font-medium text-primary-100">Stay ahead of your month</p><h2 className="mt-1 text-xl font-bold">Keep every shared expense in one place.</h2><p className="mt-2 max-w-xl text-sm text-primary-100">Invite your roommates or travel crew, split fairly, and settle up without the spreadsheet.</p></div>
        <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/15 p-3"><WalletCards className="h-6 w-6" /><div><p className="text-xs text-primary-100">Monthly budget</p><p className="font-semibold">Set your limit <span className="ml-1">→</span></p></div></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2"><h2 className="text-base font-semibold text-slate-900">Recent expenses</h2>{data?.recentExpenses?.length ? <div className="mt-4 divide-y divide-slate-100">{data.recentExpenses.map((expense) => <div key={expense._id} className="flex items-center justify-between py-3"><div><p className="text-sm font-medium text-slate-800">{expense.title}</p><p className="text-xs text-slate-500">{expense.group?.name} · {expense.category}</p></div><span className="text-sm font-semibold text-slate-900">{money(expense.amount)}</span></div>)}</div> : <EmptyState icon={Receipt} title="No recent expenses" description="Your latest expenses will appear here." />}</div>
        <div className="space-y-6">
          <div className="card p-6"><h2 className="text-base font-semibold text-slate-900">Category spending</h2>{data?.categorySpending?.length ? <div className="mt-4 space-y-3">{data.categorySpending.map((item) => <div key={item.name} className="flex justify-between text-sm"><span className="text-slate-600">{item.name}</span><span className="font-medium text-slate-900">{money(item.amount)}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No category data yet.</p>}</div>
          <div className="card p-6"><h2 className="text-base font-semibold text-slate-900">Recent settlements</h2>{data?.recentSettlements?.length ? <div className="mt-4 space-y-3">{data.recentSettlements.slice(0, 4).map((item) => <div key={item._id} className="flex justify-between text-sm"><span className="text-slate-600">{item.from?.firstName} → {item.to?.firstName}</span><span className="font-medium text-slate-900">{money(item.amount)}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No settlements yet.</p>}</div>
        </div>
      </div>
    </div>
  );
}
