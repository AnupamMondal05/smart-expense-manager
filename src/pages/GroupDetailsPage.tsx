import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, Receipt, HandCoins, TrendingUp, UserPlus, X, Trash2,
  AlertCircle, Crown, Mail, Check, Plus, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExpenseForm, { CATEGORY_COLORS, type ExpenseFormValues } from '@/components/ExpenseForm';
import { groupService, type Group, type SearchResult, type GroupBalance } from '@/services/groupService';
import { expenseService, type Expense } from '@/services/expenseService';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatCurrency, getInitials } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function GroupDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [balances, setBalances] = useState<GroupBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (groupId: string) => {
    setIsLoading(true);
    try {
      const grp = await groupService.getGroup(groupId);
      setGroup(grp);
    } catch {
      navigate('/groups');
      return;
    } finally {
      setIsLoading(false);
    }
    // Load expenses and balances separately so a failure doesn't prevent the group page from showing
    const [expensesResult, summaryResult, balancesResult] = await Promise.allSettled([
      expenseService.getGroupExpenses(groupId),
      expenseService.getGroupSummary(groupId),
      groupService.getGroupBalances(groupId),
    ]);

    if (expensesResult.status === 'fulfilled') setExpenses(expensesResult.value);
    if (summaryResult.status === 'fulfilled') setExpenseTotal(summaryResult.value.total);
    if (balancesResult.status === 'fulfilled') setBalances(balancesResult.value.balances);
    if (
      expensesResult.status === 'rejected' ||
      summaryResult.status === 'rejected' ||
      balancesResult.status === 'rejected'
    ) {
      const failed = [expensesResult, summaryResult, balancesResult]
        .find((result) => result.status === 'rejected');
      const reason = failed?.status === 'rejected'
        ? failed.reason as { response?: { data?: { message?: string } }; message?: string }
        : undefined;
      const message = reason?.response?.data?.message || reason?.message || '';
      setActionError(message || 'Some group data could not be loaded. Please refresh and try again.');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const results = await groupService.searchUsers(query);
      const memberIds = group?.members.map((m) => m.id) || [];
      setSearchResults(results.filter((r) => !memberIds.includes(r.id)));
    } catch { setSearchResults([]); } finally { setIsSearching(false); }
  };

  const handleAddMember = async (email: string) => {
    if (!id) return;
    setActionError(''); setActionLoading(true);
    try {
      const updated = await groupService.addMember(id, email);
      setGroup(updated); setSearchQuery(''); setSearchResults([]); setShowAddMember(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || 'Failed to add member');
    } finally { setActionLoading(false); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    setActionError(''); setActionLoading(true);
    try {
      const updated = await groupService.removeMember(id, userId);
      setGroup(updated);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || 'Failed to remove member');
    } finally { setActionLoading(false); }
  };

  const handleDeleteGroup = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await groupService.deleteGroup(id);
      navigate('/groups');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || 'Failed to delete group');
      setShowDeleteConfirm(false);
    } finally { setActionLoading(false); }
  };

  const handleCreateExpense = async (values: ExpenseFormValues) => {
    const expense = await expenseService.createExpense(values);
    setExpenses((prev) => [expense, ...prev]);
    setExpenseTotal((prev) => Math.round((prev + expense.amount) * 100) / 100);
    setShowExpenseForm(false);
    // Reload balances after creating an expense
    if (id) {
      try {
        const balancesData = await groupService.getGroupBalances(id);
        setBalances(balancesData.balances);
      } catch { /* balances will refresh on next page load */ }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!group) return null;

  const isOwner = group.owner.id === user?.id;

  return (
    <div className="space-y-6">
      <Link to="/groups" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to groups
      </Link>

      <PageHeader
        title={group.name}
        description={`Created ${formatDate(group.createdAt)}`}
        action={
          isOwner ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-300">
              <Trash2 className="h-4 w-4" />
              Delete group
            </button>
          ) : undefined
        }
      />

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <Users className="h-5 w-5 text-primary-600" />
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">{group.members.length}</p>
          <p className="text-sm text-slate-500">Members</p>
        </div>
        <div className="card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <Receipt className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">{formatCurrency(expenseTotal)}</p>
          <p className="text-sm text-slate-500">Total expenses</p>
        </div>
        <div className="card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <HandCoins className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">{expenses.length}</p>
          <p className="text-sm text-slate-500">Expenses recorded</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Members + Expenses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Members */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Members</h2>
              <button onClick={() => setShowAddMember(true)} className="btn-ghost text-primary-600 hover:bg-primary-50">
                <UserPlus className="h-4 w-4" />
                Add member
              </button>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {group.members.map((member) => {
                const memberIsOwner = member.id === group.owner.id;
                const isSelf = member.id === user?.id;
                return (
                  <div key={member.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        {getInitials(`${member.firstName} ${member.lastName}`)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{member.firstName} {member.lastName}</p>
                          {memberIsOwner && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                              <Crown className="h-3 w-3" />Owner
                            </span>
                          )}
                          {isSelf && !memberIsOwner && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">You</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    {!memberIsOwner && (isOwner || isSelf) && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={actionLoading}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title={isSelf ? 'Leave group' : 'Remove member'}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expenses */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Expenses</h2>
              <button onClick={() => setShowExpenseForm(true)} className="btn-ghost text-primary-600 hover:bg-primary-50">
                <Plus className="h-4 w-4" />
                Add expense
              </button>
            </div>
            {expenses.length === 0 ? (
              <p className="mt-4 py-8 text-center text-sm text-slate-400">No expenses yet. Add one to start tracking.</p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => navigate(`/expenses/${exp.id}`)}
                    className="flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-slate-50 -mx-2 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
                        <Receipt className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{exp.title}</p>
                        <div className="flex items-center gap-2">
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other)}>
                            {exp.category}
                          </span>
                          <span className="text-xs text-slate-400">{formatDate(exp.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(exp.amount)}</p>
                      <p className="text-xs text-slate-400">{exp.paidBy.firstName} {exp.paidBy.lastName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900">Group info</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Owner</span>
                <span className="font-medium text-slate-900">{group.owner.firstName} {group.owner.lastName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Members</span>
                <span className="font-medium text-slate-900">{group.members.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Expenses</span>
                <span className="font-medium text-slate-900">{expenses.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-medium text-slate-900">{formatCurrency(expenseTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">{formatDate(group.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">Balances</h2>
            </div>
            {balances.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No balances to show yet. Add an expense to see who owes what.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {balances.map((b) => {
                  const isSelf = b.user.id === user?.id;
                  const isPositive = b.netBalance > 0.01;
                  const isNegative = b.netBalance < -0.01;
                  const isSettled = !isPositive && !isNegative;
                  return (
                    <div key={b.user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                          {getInitials(`${b.user.firstName} ${b.user.lastName}`)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {b.user.firstName} {b.user.lastName}
                            {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-400">
                            Paid {formatCurrency(b.totalPaid)} · Share {formatCurrency(b.totalShare)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isSettled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            <Minus className="h-3 w-3" />
                            Settled
                          </span>
                        ) : isPositive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <ArrowUpRight className="h-3 w-3" />
                            Gets {formatCurrency(Math.abs(b.netBalance))}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <ArrowDownRight className="h-3 w-3" />
                            Owes {formatCurrency(Math.abs(b.netBalance))}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/settlements" className="mt-4 block border-t border-slate-100 pt-3 text-xs font-medium text-primary-600 hover:text-primary-700">
              View suggested settlements
            </Link>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAddMember(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Add member</h2>
              <button onClick={() => { setShowAddMember(false); setSearchQuery(''); setSearchResults([]); setActionError(''); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {actionError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{actionError}</span>
              </div>
            )}
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Search by email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" autoFocus value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Enter email address" className="input-field pl-10" />
              </div>
              <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
                {isSearching && <div className="flex items-center justify-center py-4"><LoadingSpinner size="sm" /></div>}
                {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <div className="py-4 text-center text-sm text-slate-400">No users found. Ask them to sign up first.</div>
                )}
                {searchResults.map((result) => (
                  <button key={result.id} onClick={() => handleAddMember(result.email)} disabled={actionLoading} className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-slate-50 disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">{getInitials(`${result.firstName} ${result.lastName}`)}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{result.firstName} {result.lastName}</p>
                        <p className="text-xs text-slate-500">{result.email}</p>
                      </div>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600"><Check className="h-4 w-4" /></div>
                  </button>
                ))}
              </div>
              {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <button onClick={() => handleAddMember(searchQuery.trim())} disabled={actionLoading} className="btn-secondary w-full">
                    <Mail className="h-4 w-4" />Add "{searchQuery.trim()}"
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expense Form */}
      {showExpenseForm && group && (
        <ExpenseForm
          groups={[group]}
          defaultGroup={group}
          onSubmit={handleCreateExpense}
          onCancel={() => setShowExpenseForm(false)}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100"><Trash2 className="h-5 w-5 text-red-600" /></div>
              <h2 className="text-lg font-semibold text-slate-900">Delete group</h2>
            </div>
            <p className="mt-4 text-sm text-slate-600">Are you sure you want to delete <span className="font-semibold text-slate-900">{group.name}</span>? This action cannot be undone. All group data will be permanently removed.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleDeleteGroup} disabled={actionLoading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50">
                {actionLoading ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                Delete group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
