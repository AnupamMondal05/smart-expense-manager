import { useEffect, useState } from 'react';
import { HandCoins, ArrowRight, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import { groupService } from '@/services/groupService';
import { settlementService, type SettlementRecord, type SettlementSuggestion } from '@/services/settlementService';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/format';

export default function SettlementsPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SettlementSuggestion[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  const loadSettlements = async () => {
    const groupList = await groupService.getGroups();
    const results = await Promise.all(groupList.map((group) =>
      settlementService.getGroupSettlements(group.id, group.name)
    ));
    const records = results.flatMap((result) => result.settlements);
    setSettlements(records);
    const completed = new Set(
      records.filter((record) => record.status !== 'pending')
        .map((record) => `${record.groupId}:${record.from.id}:${record.to.id}:${record.amount}`)
    );
    setSuggestions(results.flatMap((result) => result.suggestions)
      .filter((suggestion) => !completed.has(
        `${suggestion.groupId}:${suggestion.from.id}:${suggestion.to.id}:${suggestion.amount}`
      )));
  };

  useEffect(() => {
    loadSettlements().catch(() => setSuggestions([])).finally(() => setLoading(false));
  }, []);

  const markAsPaid = async (suggestion: SettlementSuggestion) => {
    setActionId(`${suggestion.groupId}:${suggestion.from.id}:${suggestion.to.id}`);
    try {
      const created = await settlementService.createSettlement(
        suggestion.groupId, suggestion.from.id, suggestion.to.id, suggestion.amount
      );
      await settlementService.settleSettlement(created._id || created.id);
      await loadSettlements();
    } finally {
      setActionId('');
    }
  };

  const owed = suggestions.filter((item) => item.to.id === user?.id);
  const owe = suggestions.filter((item) => item.from.id === user?.id);

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlements"
        description="View and manage pending settlements across all groups."
      />
      {suggestions.length === 0 && settlements.filter((item) => item.status === 'settled').length === 0 ? (
        <EmptyState icon={HandCoins} title="No pending settlements" description="When you have outstanding balances, settlement suggestions will appear here to help you settle up with fewer transactions." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SettlementList title="You Owe" items={owe} action={markAsPaid} actionId={actionId} />
            <SettlementList title="You Are Owed" items={owed} />
          </div>
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900">Suggested Settlements</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {suggestions.map((item) => (
                <div key={`${item.groupId}:${item.from.id}:${item.to.id}`} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{item.from.firstName} {item.from.lastName}</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{item.to.firstName} {item.to.lastName}</span>
                    <span className="text-slate-500">({item.groupName})</span>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.amount, 'INR')}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SettlementList({
  title, items, action, actionId,
}: {
  title: string;
  items: SettlementSuggestion[];
  action?: (item: SettlementSuggestion) => void;
  actionId?: string;
}) {
  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {items.length === 0 && <p className="py-4 text-sm text-slate-400">Nothing here.</p>}
        {items.map((item) => {
          const id = `${item.groupId}:${item.from.id}:${item.to.id}`;
          return (
            <div key={id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {title === 'You Owe' ? 'Pay' : 'From'} {title === 'You Owe'
                    ? `${item.to.firstName} ${item.to.lastName}`
                    : `${item.from.firstName} ${item.from.lastName}`}
                  <span className="mx-1 text-slate-400">·</span>{item.groupName}
                </p>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(item.amount, 'INR')}</p>
              </div>
              {action && (
                <button onClick={() => action(item)} disabled={actionId === id} className="btn-secondary">
                  {actionId === id ? <LoadingSpinner size="sm" /> : <Check className="h-4 w-4" />}
                  Mark as Paid
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
