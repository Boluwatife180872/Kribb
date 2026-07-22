import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

interface Props {
  fontsLoaded: boolean;
  onGetStarted: () => void;
}

const features = [
  {
    icon: "search-outline" as const,
    label: "Discover Rentals",
    desc: "Explore curated properties with detailed insights and virtual tours.",
  },
  {
    icon: "heart-outline" as const,
    label: "Save & Compare",
    desc: "Curate your favorites and make confident decisions.",
  },
  {
    icon: "add-circle-outline" as const,
    label: "List Properties",
    desc: "Own a property? Reach thousands of potential tenants.",
  },
];

export default function OnboardingScreen2({ fontsLoaded, onGetStarted }: Props) {
  return (
    <View className="flex-1 bg-white justify-center px-8">
      <Animated.View
        entering={FadeInUp.duration(600).delay(200)}
        style={{ marginBottom: 48 }}
      >
        <Text
          style={{
            fontFamily: fontsLoaded ? "JosefinSans_700Bold" : undefined,
            fontSize: 28,
            color: "#134E4A",
            lineHeight: 34,
            letterSpacing: -0.3,
          }}
        >
          Everything you need
        </Text>
        <Text
          style={{
            fontFamily: fontsLoaded ? "JosefinSans_400Regular" : undefined,
            fontSize: 15,
            color: "#6B7280",
            marginTop: 8,
            lineHeight: 21,
          }}
        >
          Renting or listing — we&apos;ve got you covered.
        </Text>
      </Animated.View>

      <View style={{ gap: 28 }}>
        {features.map((item, index) => (
          <Animated.View
            key={item.label}
            entering={FadeInUp.duration(600).delay(400 + index * 150)}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#F0FDFA",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name={item.icon} size={22} color="#0F766E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: fontsLoaded ? "JosefinSans_700Bold" : undefined,
                  fontSize: 16,
                  color: "#111827",
                  marginBottom: 2,
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  fontFamily: fontsLoaded ? "JosefinSans_400Regular" : undefined,
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 19,
                }}
              >
                {item.desc}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(900)}
        style={{ marginTop: 52 }}
      >
        <TouchableOpacity
          onPress={onGetStarted}
          activeOpacity={0.85}
          className="items-center"
          style={{
            backgroundColor: "#0F766E",
            paddingVertical: 17,
            borderRadius: 14,
            shadowColor: "#0F766E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text
            style={{
              fontFamily: fontsLoaded ? "JosefinSans_700Bold" : undefined,
              fontSize: 17,
              color: "#fff",
              letterSpacing: 0.3,
            }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
