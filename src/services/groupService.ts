import api from './api';

export interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  owner: GroupMember;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface GroupBalance {
  user: GroupMember;
  totalPaid: number;
  totalShare: number;
  netBalance: number;
}

export interface GroupBalanceSummary {
  totalPaid: number;
  totalShare: number;
  isBalanced: boolean;
}

export const groupService = {
  getGroups: async (): Promise<Group[]> => {
    const { data } = await api.get('/groups');
    return data.groups;
  },

  getGroup: async (id: string): Promise<Group> => {
    const { data } = await api.get(`/groups/${id}`);
    return data.group;
  },

  createGroup: async (name: string): Promise<Group> => {
    const { data } = await api.post('/groups', { name });
    return data.group;
  },

  updateGroup: async (id: string, name: string): Promise<Group> => {
    const { data } = await api.put(`/groups/${id}`, { name });
    return data.group;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}`);
  },

  addMember: async (groupId: string, email: string): Promise<Group> => {
    const { data } = await api.post(`/groups/${groupId}/members`, { email });
    return data.group;
  },

  removeMember: async (groupId: string, userId: string): Promise<Group> => {
    const { data } = await api.delete(`/groups/${groupId}/members/${userId}`);
    return data.group;
  },

  searchUsers: async (email: string): Promise<SearchResult[]> => {
    const { data } = await api.get('/groups/search', { params: { email } });
    return data.users;
  },

  getGroupBalances: async (groupId: string): Promise<{ balances: GroupBalance[]; summary: GroupBalanceSummary }> => {
    const { data } = await api.get(`/groups/${groupId}/balances`);
    return { balances: data.balances, summary: data.summary };
  },
};
