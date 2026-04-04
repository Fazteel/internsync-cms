import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: AppNotification[];
  hasUnread: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  hasUnread: false,

  fetchNotifications: async () => {
    try {
      const data = await notificationService.getNotifications();
      set({ 
        notifications: data,
        hasUnread: data.some((n: AppNotification) => !n.is_read)
      });
    } catch (error) {
      console.error("Gagal mendapatkan notifikasi:", error);
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      
      const updatedNotifications = get().notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      );

      set({ 
        notifications: updatedNotifications,
        hasUnread: updatedNotifications.some(n => !n.is_read)
      });
    } catch (error) {
      console.error("Gagal mengubah status notifikasi:", error);
    }
  }
}));