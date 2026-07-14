import { create } from "zustand";

interface NotificationStore {
  newListingNotifications: boolean;
  expoPushToken: string | null;
  setNewListingNotifications: (value: boolean) => void;
  setExpoPushToken: (token: string | null) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  newListingNotifications: false,
  expoPushToken: null,
  setNewListingNotifications: (value) => set({ newListingNotifications: value }),
  setExpoPushToken: (token) => set({ expoPushToken: token }),
}));
