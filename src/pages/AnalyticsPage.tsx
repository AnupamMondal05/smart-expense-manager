import { useEffect, useState, type ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { analyticsService, type AnalyticsData } from '@/services/analyticsService';

const colors = ['#0ea5e9', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];
const money = (value: number) => `$${value.toFixed(2)}`;

export default function AnalyticsPage() {
  const [range, setRange] = useState('month');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [custom, setCustom] = useState({ start: '', end: '' });

  useEffect(() => {
    analyticsService.getAnalytics({ range, ...(range === 'custom' ? custom : {}) }).then(setData).catch(() => setData(null));
  }, [range, custom]);

  const chart = (title: string, content: ReactNode) => (
    <div className="card p-6"><h2 className="text-base font-semibold text-slate-900">{title}</h2><div className="mt-5 h-64">{content}</div></div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Explore your real spending patterns across groups and categories." />
      <div className="flex flex-wrap items-center gap-2">
        {['week', 'month', '3months', 'custom'].map((option) => (
          <button key={option} onClick={() => setRange(option)} className={`rounded-lg px-4 py-2 text-sm font-medium ${range === option ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
            {option === 'week' ? 'This week' : option === 'month' ? 'This month' : option === '3months' ? 'Last 3 months' : 'Custom range'}
          </button>
        ))}
        {range === 'custom' && <><input type="date" value={custom.start} onChange={(e) => setCustom({ ...custom, start: e.target.value })} className="input" /><input type="date" value={custom.end} onChange={(e) => setCustom({ ...custom, end: e.target.value })} className="input" /></>}
      </div>
      {!data || !data.totalSpending ? <EmptyState icon={BarChart3} title="No data to analyze yet" description="Add expenses to see real spending breakdowns and trends." /> : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {chart('Spending by Category', <ResponsiveContainer><PieChart><Pie data={data.spendingByCategory} dataKey="amount" nameKey="name" innerRadius={65} outerRadius={95} label>{data.spendingByCategory.map((entry, i) => <Cell key={entry.name} fill={colors[i % colors.length]} />)}</Pie><Tooltip formatter={(value) => money(Number(value))} /></PieChart></ResponsiveContainer>)}
          {chart('Monthly Spending', <ResponsiveContainer><BarChart data={data.monthlySpending}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => money(Number(value))} /><Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>)}
          {chart('Spending Trend', <ResponsiveContainer><LineChart data={data.spendingTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => money(Number(value))} /><Line type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>)}
          {chart('Group Spending', <ResponsiveContainer><BarChart data={data.groupSpending} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={90} /><Tooltip formatter={(value) => money(Number(value))} /><Bar dataKey="amount" fill="#8b5cf6" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>)}
        </div>
      )}
    </div>
  );
}
