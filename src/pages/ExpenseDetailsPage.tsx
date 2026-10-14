import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Receipt, Trash2, Pencil, AlertCircle, Calendar, Tag, Users, X,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExpenseForm, { CATEGORY_COLORS, type ExpenseFormValues } from '@/components/ExpenseForm';
import { expenseService, type Expense } from '@/services/expenseService';
import { groupService, type Group } from '@/services/groupService';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatCurrency, getInitials } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function ExpenseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) loadExpense(id);
    groupService.getGroups().then(setGroups).catch(() => {});
  }, [id]);

  const loadExpense = async (expenseId: string) => {
    setIsLoading(true);
    try {
      const data = await expenseService.getExpense(expenseId);
      setExpense(data);
    } catch {
      navigate('/expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const canEdit = expense && (expense.createdBy.id === user?.id);

  const handleUpdate = async (values: ExpenseFormValues) => {
    if (!id) return;
    const updated = await expenseService.updateExpense(id, values);
    setExpense(updated);
    setShowEdit(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await expenseService.deleteExpense(id);
      navigate('/expenses');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || 'Failed to delete expense');
      setShowDeleteConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!expense) return null;

  return (
    <div className="space-y-6">
      <Link to="/expenses" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to expenses
      </Link>

      <PageHeader
        title={expense.title}
        description={formatCurrency(expense.amount)}
        action={
          canEdit ? (
            <div className="flex gap-2">
              <button onClick={() => setShowEdit(true)} className="btn-secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-300">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : undefined
        }
      />

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details card */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900">Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
                  <Tag className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Category</p>
                  <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other)}>
                    {expense.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(expense.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
                  <Receipt className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Paid by</p>
                  <p className="text-sm font-medium text-slate-900">{expense.paidBy.firstName} {expense.paidBy.lastName}</p>
                </div>
              </div>
              {expense.group?.name && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Users className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Group</p>
                    <Link to={`/groups/${expense.group.id}`} className="text-sm font-medium text-primary-600 hover:underline">{expense.group.name}</Link>
                  </div>
                </div>
              )}
            </div>
            {expense.notes && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400">Notes</p>
                <p className="mt-1 text-sm text-slate-700">{expense.notes}</p>
              </div>
            )}
          </div>

          {/* Individual shares */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Individual shares</h2>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 capitalize">{expense.splitType} split</span>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {expense.individualShares.map((share, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                      {getInitials(`${share.user.firstName} ${share.user.lastName}`)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{share.user.firstName} {share.user.lastName}</p>
                      {share.user.id === expense.paidBy.id && (
                        <p className="text-xs text-primary-600">Paid</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(share.amount)}</p>
                    {expense.splitType === 'percentage' && <p className="text-xs text-slate-400">{share.percentage}%</p>}
                    {expense.splitType === 'shares' && <p className="text-xs text-slate-400">{share.shares} shares</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(expense.amount)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900">Participants</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {expense.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1.5 pr-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                    {getInitials(`${p.firstName} ${p.lastName}`)}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{p.firstName} {p.lastName}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900">Created by</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {getInitials(`${expense.createdBy.firstName} ${expense.createdBy.lastName}`)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{expense.createdBy.firstName} {expense.createdBy.lastName}</p>
                <p className="text-xs text-slate-500">{formatDate(expense.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && expense && (
        <ExpenseForm
          groups={groups}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          initial={{
            groupId: expense.group?.id,
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            paidBy: expense.paidBy.id,
            participants: expense.participants.map((p) => p.id),
            splitType: expense.splitType,
            individualShares: expense.individualShares.map((s) => ({
              user: s.user.id, amount: s.amount, percentage: s.percentage, shares: s.shares,
            })),
            notes: expense.notes,
            date: expense.date.slice(0, 10),
          }}
          submitLabel="Save changes"
        />
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Delete expense</h2>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{expense.title}</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
              >
                {actionLoading ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
