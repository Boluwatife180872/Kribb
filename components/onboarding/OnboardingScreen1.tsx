import { Image, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Props {
  fontsLoaded: boolean;
  onAdvance: () => void;
}

export default function OnboardingScreen1({ fontsLoaded, onAdvance }: Props) {
  const { width, height } = useWindowDimensions();

  return (
    <View className="flex-1 bg-white">
      <Image
        source={require("../../assets/images/house1.jpg")}
        style={{ width, height }}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.65)"]}
        locations={[0.45, 1]}
        style={{ position: "absolute", bottom: 0, width, height: height * 0.5 }}
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

      <TouchableOpacity
        onPress={onAdvance}
        activeOpacity={1}
        style={{ position: "absolute", bottom: 70, alignSelf: "center" }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(255,255,255,0.2)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 20, lineHeight: 22 }}>→</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}
