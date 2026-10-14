import api from './api';
import type { GroupMember } from './groupService';

export interface SettlementSuggestion {
  groupId: string;
  groupName: string;
  from: GroupMember;
  to: GroupMember;
  amount: number;
}

export interface SettlementRecord extends SettlementSuggestion {
  id: string;
  _id?: string;
  status: 'pending' | 'settled' | 'cancelled';
  settledAt: string | null;
  createdAt: string;
}

function user(value: GroupMember & { _id?: string }): GroupMember {
  return { ...value, id: value.id || value._id || '' };
}

function normalizeRecord(record: SettlementRecord & { _id?: string }, groupId: string, groupName: string): SettlementRecord {
  return {
    ...record,
    id: record.id || record._id || '',
    groupId,
    groupName,
    from: user(record.from),
    to: user(record.to),
  };
}

export const settlementService = {
  getGroupSettlements: async (groupId: string, groupName: string) => {
    const { data } = await api.get(`/groups/${groupId}/settlements`);
    const suggestions = (data.suggestions || []).map((suggestion: SettlementSuggestion) => ({
      ...suggestion,
      groupId,
      groupName,
      from: user(suggestion.from),
      to: user(suggestion.to),
    }));
    const settlements = (data.settlements || []).map((record: SettlementRecord) =>
      normalizeRecord(record, groupId, groupName)
    );
    return { suggestions, settlements };
  },

  createSettlement: async (groupId: string, from: string, to: string, amount: number) => {
    const { data } = await api.post('/settlements', { group: groupId, from, to, amount });
    return data.settlement as SettlementRecord;
  },

  settleSettlement: async (id: string) => {
    const { data } = await api.put(`/settlements/${id}/settle`);
    return data.settlement as SettlementRecord;
  },
};
