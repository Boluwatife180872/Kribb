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
import { useTheme } from "../../../lib/theme";
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
  const { colors } = useTheme();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.replace("/(root)/(tabs)/profile")}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}>
            Notifications
          </Text>
        </View>
      </View>

      <View className="px-5 mt-4">
        <TouchableOpacity
          onPress={handleToggle}
          disabled={registering}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 16, borderRadius: 16 }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 16 }}>
              New Listing Alerts
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
              Get notified when a new property is listed
            </Text>
          </View>
          <View
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              justifyContent: "center",
              paddingHorizontal: 2,
              backgroundColor: newListingNotifications ? colors.primary : colors.border,
              opacity: registering ? 0.5 : 1,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#fff",
                alignSelf: newListingNotifications ? "flex-end" : "flex-start",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </View>
        </TouchableOpacity>

        {expoPushToken && (
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Notifications are enabled
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
