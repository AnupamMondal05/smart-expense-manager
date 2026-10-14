import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Plus, Search, ArrowRight, Calendar, Download, FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Skeleton';
import ExpenseForm, { CATEGORY_COLORS, type ExpenseFormValues } from '@/components/ExpenseForm';
import { expenseService, type Expense } from '@/services/expenseService';
import { groupService, type Group } from '@/services/groupService';
import { formatDate, formatCurrency, getInitials } from '@/utils/format';
import { cn } from '@/utils/cn';

const CATEGORIES = ['All', 'Food', 'Rent', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Education', 'Shopping', 'Medical', 'Other'];

export default function ExpensesPage() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const exportCsv = () => {
    const rows = [['Group', 'Expense', 'Category', 'Amount', 'Paid by', 'Date'], ...filtered.map((expense) => [expense.group?.name || '', expense.title, expense.category, expense.amount.toFixed(2), `${expense.paidBy.firstName} ${expense.paidBy.lastName}`, formatDate(expense.date)])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'smart-expenses.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [expData, groupData] = await Promise.all([
        expenseService.getExpenses(),
        groupService.getGroups(),
      ]);
      setExpenses(expData);
      setGroups(groupData);
    } catch {
      // handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (values: ExpenseFormValues) => {
    const expense = await expenseService.createExpense(values);
    setExpenses((prev) => [expense, ...prev]);
    setShowForm(false);
  };

  const filtered = useMemo(() => {
    let result = [...expenses];
    if (search.trim()) {
      result = result.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (categoryFilter !== 'All') {
      result = result.filter((e) => e.category === categoryFilter);
    }
    if (groupFilter !== 'All') {
      result = result.filter((e) => e.group?.id === groupFilter);
    }
    result.sort((a, b) => {
      const cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortOrder === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [expenses, search, categoryFilter, groupFilter, sortOrder]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and manage all your shared expenses."
        action={<div className="flex flex-wrap gap-2"><button onClick={exportCsv} disabled={!filtered.length} className="btn-secondary"><Download className="h-4 w-4" />Export CSV</button><button onClick={() => window.print()} disabled={!filtered.length} className="btn-secondary"><FileText className="h-4 w-4" />Print PDF</button><button onClick={() => setShowForm(true)} disabled={groups.length === 0} className="btn-primary"><Plus className="h-4 w-4" />Add expense</button></div>}
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className="input-field pl-10"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
          </select>
          <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="input-field">
            <option value="All">All groups</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')} className="input-field">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={expenses.length === 0 ? "No expenses yet" : "No matching expenses"}
          description={expenses.length === 0 ? "Add an expense to start tracking who owes what across your groups." : "Try adjusting your search or filters."}
          action={expenses.length === 0 && groups.length > 0 ? (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Add your first expense
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((expense) => (
            <button
              key={expense.id}
              onClick={() => navigate(`/expenses/${expense.id}`)}
              className="card p-5 text-left transition-all hover:shadow-md hover:border-primary-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100">
                  <Receipt className="h-5 w-5 text-primary-600" />
                </div>
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other)}>
                  {expense.category}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{expense.title}</h3>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                  {getInitials(`${expense.paidBy.firstName} ${expense.paidBy.lastName}`)}
                </div>
                <span>Paid by {expense.paidBy.firstName} {expense.paidBy.lastName}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(expense.date)}
                </div>
                {expense.group?.name && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{expense.group.name}</span>
                )}
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <ExpenseForm
          groups={groups}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
