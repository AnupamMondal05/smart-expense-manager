import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, X, AlertCircle, ArrowRight, Calendar } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SkeletonCard } from '@/components/Skeleton';
import { groupService, type Group } from '@/services/groupService';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, getInitials } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function GroupsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const data = await groupService.getGroups();
      setGroups(data);
    } catch {
      // handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newGroupName.trim()) {
      setCreateError('Group name is required');
      return;
    }
    setIsCreating(true);
    try {
      const group = await groupService.createGroup(newGroupName);
      setGroups((prev) => [group, ...prev]);
      setShowCreateModal(false);
      setNewGroupName('');
      navigate(`/groups/${group.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setCreateError(error.response?.data?.message || 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Groups"
        description="Manage your expense groups for trips, apartments, and more."
        action={
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Create group
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create a group to start tracking shared expenses with friends, roommates, or travel companions."
          action={
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Create your first group
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const isOwner = group.owner.id === user?.id;
            return (
              <button
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="card p-5 text-left transition-all hover:shadow-md hover:border-primary-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  {isOwner && (
                    <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                      Owner
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{group.name}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4 text-slate-400" />
                    {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDate(group.createdAt)}
                  </div>
                </div>

                {/* Member avatars */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((m) => (
                      <div
                        key={m.id}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-xs font-semibold text-primary-700"
                        title={`${m.firstName} ${m.lastName}`}
                      >
                        {getInitials(`${m.firstName} ${m.lastName}`)}
                      </div>
                    ))}
                    {group.members.length > 4 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold text-slate-500">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Create group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Group name</label>
                <input
                  type="text"
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => {
                    setNewGroupName(e.target.value);
                    if (createError) setCreateError('');
                  }}
                  placeholder="e.g. Weekend Trip, Apartment 4B, etc."
                  className={cn('input-field', createError && 'border-red-400 focus:border-red-400 focus:ring-red-400/20')}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating} className="btn-primary">
                  {isCreating ? <LoadingSpinner size="sm" /> : 'Create group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
