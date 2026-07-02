import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <SafeAreaView>
      <Text>Profile</Text>

      <TouchableOpacity className="w-full bg-blue-600 py-4 rounded-xl items-center mt-3 mb-4" onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
