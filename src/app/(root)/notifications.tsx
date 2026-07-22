import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useAuth } from "@clerk/expo";
import { useSupabase } from "../../../hooks/useSupabase";
import { useNotificationStore } from "../../../store/notificationStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const {
    newListingNotifications,
    expoPushToken,
    setNewListingNotifications,
    setExpoPushToken,
  } = useNotificationStore();
  const [registering, setRegistering] = useState(false);

  const handleToggle = async () => {
    if (!newListingNotifications) {
      await registerForPushNotifications();
    } else {
      await disableNotifications();
    }
  };

  const disableNotifications = async () => {
    if (userId) {
      await authSupabase.from("push_tokens").delete().eq("user_id", userId);
    }
    setExpoPushToken(null);
    setNewListingNotifications(false);
  };

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      Alert.alert("Physical Device Required", "Push notifications need a physical device.");
      return;
    }

    setRegistering(true);

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Permission Denied", "Enable notifications in Settings to receive alerts.");
        setRegistering(false);
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      //console.log("Expo Push Token:", tokenData.data);

      if (userId) {
        await authSupabase.from("push_tokens").upsert(
          { user_id: userId, token: tokenData.data },
          { onConflict: "user_id" },
        );
      }

      setExpoPushToken(tokenData.data);
      setNewListingNotifications(true);
    } catch (error) {
      console.error("Push registration error:", error);
      Alert.alert("Error", "Failed to register for notifications.");
    } finally {
      setRegistering(false);
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">
            Notifications
          </Text>
        </View>
      </View>

      <View className="px-5 mt-4">
        <TouchableOpacity
          onPress={handleToggle}
          disabled={registering}
          className="flex-row items-center justify-between bg-gray-50 px-4 py-4 rounded-2xl"
        >
          <View className="flex-1 mr-3">
            <Text className="text-gray-700 font-semibold text-base">
              New Listing Alerts
            </Text>
            <Text className="text-gray-400 text-sm mt-0.5">
              Get notified when a new property is listed
            </Text>
          </View>
          <View
            className={`w-12 h-7 rounded-full justify-center px-0.5 ${
              newListingNotifications ? "bg-teal-700" : "bg-gray-300"
            } ${registering ? "opacity-50" : ""}`}
          >
            <View
              className={`w-6 h-6 rounded-full bg-white shadow-sm ${
                newListingNotifications ? "self-end" : "self-start"
              }`}
            />
          </View>
        </TouchableOpacity>

        {expoPushToken && (
          <Text className="text-gray-400 text-xs mt-3 text-center">
            Notifications are enabled
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
