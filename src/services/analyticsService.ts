import api from './api';

export interface AnalyticsData {
  totalSpending: number;
  spendingByCategory: { name: string; amount: number }[];
  monthlySpending: { name: string; amount: number }[];
  spendingTrend: { name: string; amount: number }[];
  groupSpending: { name: string; amount: number }[];
}

export interface DashboardExpense { _id: string; title: string; amount: number; category: string; group?: { name: string } }
export interface DashboardSettlement { _id: string; amount: number; from?: { firstName: string }; to?: { firstName: string } }
export interface DashboardData {
  stats: { totalSpending: number; youOwe: number; youAreOwed: number; activeGroups: number };
  recentExpenses: DashboardExpense[];
  recentSettlements: DashboardSettlement[];
  categorySpending: { name: string; amount: number }[];
}

export const analyticsService = {
  getAnalytics: async (params: { range: string; start?: string; end?: string }) => {
    const { data } = await api.get<AnalyticsData>('/analytics', { params });
    return data;
  },
  getDashboard: async () => {
    const { data } = await api.get<DashboardData>('/analytics/dashboard');
    return data;
  },
};
