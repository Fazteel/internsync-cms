import api from "../lib/axios";

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/api/v1/notifications');
    return response.data.data;
  },

  markAsRead: async (id: number) => {
    const response = await api.post(`/api/v1/notifications/${id}/read`);
    return response.data;
  }
};