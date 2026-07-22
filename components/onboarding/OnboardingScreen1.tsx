import { useEffect } from "react";
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from "react-native-reanimated";

interface Props {
  fontsLoaded: boolean;
  onAdvance: () => void;
}

export default function OnboardingScreen1({ fontsLoaded, onAdvance }: Props) {
  const { width, height } = useWindowDimensions();
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withTiming(8, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bounce.value }],
  }));

  return (
    <View className="flex-1 bg-white">
      <Image
        source={require("../../assets/images/house1.jpg")}
        style={{ position: "absolute", top: 0, left: 0, width, height }}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.65)"]}
        locations={[0.45, 1]}
        style={{ position: "absolute", bottom: 0, left: 0, width, height: height * 0.5 }}
      />

      <Animated.View
        entering={FadeInDown.duration(800).delay(400)}
        style={{ position: "absolute", bottom: 140, left: 28, right: 28 }}
      >
        <Text
          style={{
            fontFamily: fontsLoaded ? "JosefinSans_700Bold" : undefined,
            fontSize: 34,
            color: "#fff",
            lineHeight: 40,
            letterSpacing: -0.5,
          }}
        >
          Discover Your{'\n'}Next Home
        </Text>
        <Text
          style={{
            fontFamily: fontsLoaded ? "JosefinSans_400Regular" : undefined,
            fontSize: 16,
            color: "rgba(255,255,255,0.8)",
            marginTop: 10,
            lineHeight: 22,
          }}
        >
          Browse curated properties and find the perfect place to call home.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(800).delay(900)}
        style={[{ position: "absolute", bottom: 70, alignSelf: "center" }, arrowStyle]}
      >
        <TouchableOpacity onPress={onAdvance} activeOpacity={0.7}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}
