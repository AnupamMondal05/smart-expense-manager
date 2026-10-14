import api from './api';

export interface Notification {
  _id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  relatedGroup?: { _id: string; name: string } | null;
  relatedExpense?: { _id: string; title: string; amount: number } | null;
}

export const notificationService = {
  getAll: async () => {
    const { data } = await api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications');
    return data;
  },
  markRead: async (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: async () => api.put('/notifications/read-all'),
};
