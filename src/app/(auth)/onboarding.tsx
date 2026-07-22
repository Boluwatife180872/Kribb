import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, JosefinSans_400Regular, JosefinSans_700Bold } from "@expo-google-fonts/josefin-sans";
import OnboardingContainer from "../../../components/onboarding/OnboardingContainer";

export default function OnboardingScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    JosefinSans_400Regular,
    JosefinSans_700Bold,
  });

  const handleSkip = () => {
    router.replace("/sign-up");
  };

  const handleGetStarted = () => {
    router.replace("/sign-up");
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="small" color="#0F766E" />
      </View>
    );
  }

  return (
    <OnboardingContainer
      onSkip={handleSkip}
      onGetStarted={handleGetStarted}
      fontsLoaded={fontsLoaded}
    />
  );
}
