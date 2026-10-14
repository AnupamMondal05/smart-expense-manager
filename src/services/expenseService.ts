import api from './api';
import type { GroupMember } from './groupService';

export type SplitType = 'equal' | 'custom' | 'percentage' | 'shares';

export interface IndividualShare {
  user: GroupMember;
  amount: number;
  percentage: number;
  shares: number;
}

export interface Expense {
  id: string;
  group: { id: string; name: string };
  title: string;
  amount: number;
  category: string;
  paidBy: GroupMember;
  splitType: SplitType;
  participants: GroupMember[];
  individualShares: IndividualShare[];
  notes: string;
  date: string;
  createdBy: GroupMember;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  groupId: string;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  participants: string[];
  splitType: SplitType;
  individualShares: { user: string; amount: number; percentage: number; shares: number }[];
  notes?: string;
  date?: string;
}

export interface ExpenseSummary {
  total: number;
  count: number;
}

export const expenseService = {
  getExpenses: async (params?: {
    group?: string;
    category?: string;
    search?: string;
    sort?: 'asc' | 'desc';
  }): Promise<Expense[]> => {
    const { data } = await api.get('/expenses', { params });
    return data.expenses;
  },

  getExpense: async (id: string): Promise<Expense> => {
    const { data } = await api.get(`/expenses/${id}`);
    return data.expense;
  },

  createExpense: async (input: ExpenseInput): Promise<Expense> => {
    const { data } = await api.post('/expenses', input);
    return data.expense;
  },

  updateExpense: async (id: string, input: Partial<ExpenseInput>): Promise<Expense> => {
    const { data } = await api.put(`/expenses/${id}`, input);
    return data.expense;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },

  getGroupExpenses: async (groupId: string): Promise<Expense[]> => {
    const { data } = await api.get(`/groups/${groupId}/expenses`);
    return data.expenses;
  },

  getGroupSummary: async (groupId: string): Promise<ExpenseSummary> => {
    const { data } = await api.get(`/groups/${groupId}/expenses/summary`);
    return data.summary;
  },
};
