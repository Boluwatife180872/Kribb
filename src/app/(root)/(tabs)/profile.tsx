import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../../../../store/userStore";
import { useTheme } from "../../../../lib/theme";

export default function Profile() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const isAdmin = useUserStore((state) => state.isAdmin);
  const [isUpdating, setIsUpdating] = useState(false);
  const { colors, isDark, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfileImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to update your profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      setIsUpdating(true);

      const base64Image = result.assets[0].base64;
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      await user?.setProfileImage({ file: dataUrl });

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile image:", error);
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View className="items-center py-8">
        <View>
          <Image
            source={{ uri: user?.imageUrl }}
            className="w-24 h-24 rounded-full mb-4"
          />
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            disabled={isUpdating}
            style={{ backgroundColor: colors.primary }}
            className="absolute bottom-3 right-0 rounded-full p-2"
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="camera" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={{ color: colors.text }} className="text-xl font-bold">
          {user.firstName} {user.lastName}
        </Text>
        <Text style={{ color: colors.textMuted }} className="mt-1">
          {user.emailAddresses[0].emailAddress}
        </Text>
      </View>

      <View className="px-6 gap-2">
        <MenuItem
          icon="heart-outline"
          label="Saved Properties"
          onPress={() => router.push("/(root)/(tabs)/saved")}
          colors={colors}
        />
        {isAdmin && (
          <MenuItem
            icon="shield-checkmark-outline"
            label="Manage Listings"
            onPress={() => router.push("/(root)/admin")}
            colors={colors}
          />
        )}
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => router.push("/(root)/notifications")}
          colors={colors}
        />
        <MenuItem
          icon={isDark ? "moon-outline" : "sunny-outline"}
          label="Dark Mode"
          colors={colors}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#D1D5DB", true: colors.primary }}
              thumbColor="#fff"
            />
          }
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() =>
            Linking.openURL(
              "mailto:bolu.onukwu@gmail.com?subject=Help%20%26%20Support%20-%20Kribb%20App",
            )
          }
          colors={colors}
        />
      </View>

      <View className="px-6 mt-auto mb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: colors.dangerLight,
            borderColor: colors.dangerLight,
          }}
          className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={{ color: colors.danger }} className="font-semibold text-base">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  colors,
  rightElement,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  colors: any;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{ backgroundColor: colors.surface }}
      className="flex-row items-center gap-4 px-4 py-4 rounded-2xl"
    >
      <Ionicons name={icon} size={22} color={colors.textMuted} />
      <Text style={{ color: colors.textSecondary }} className="flex-1 font-medium text-base">
        {label}
      </Text>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={colors.border} />}
    </TouchableOpacity>
  );
}
