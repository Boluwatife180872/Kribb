import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationStore {
  newListingNotifications: boolean;
  expoPushToken: string | null;
  setNewListingNotifications: (value: boolean) => void;
  setExpoPushToken: (token: string | null) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      newListingNotifications: false,
      expoPushToken: null,
      setNewListingNotifications: (value) => set({ newListingNotifications: value }),
      setExpoPushToken: (token) => set({ expoPushToken: token }),
    }),
    {
      name: "kribb-notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
