import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import OnboardingScreen1 from "./OnboardingScreen1";
import OnboardingScreen2 from "./OnboardingScreen2";

interface Props {
  onSkip: () => void;
  onGetStarted: () => void;
  fontsLoaded: boolean;
}

const SPRING_CONFIG = { damping: 22, stiffness: 130 };

export default function OnboardingContainer({ onSkip, onGetStarted, fontsLoaded }: Props) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);

  const translateX = useSharedValue(0);
  const sharedPage = useSharedValue(0);

  const goToPage = useCallback(
    (newPage: number) => {
      sharedPage.value = newPage;
      translateX.value = withSpring(-newPage * SCREEN_WIDTH, SPRING_CONFIG);
      setPage(newPage);
    },
    [SCREEN_WIDTH],
  );

  const advance = useCallback(() => {
    if (page < 1) goToPage(page + 1);
  }, [page, goToPage]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = -sharedPage.value * SCREEN_WIDTH + e.translationX;
    })
    .onEnd((e) => {
      const threshold = SCREEN_WIDTH * 0.18;
      if (e.translationX < -threshold && sharedPage.value < 1) {
        runOnJS(goToPage)(sharedPage.value + 1);
      } else if (e.translationX > threshold && sharedPage.value > 0) {
        runOnJS(goToPage)(sharedPage.value - 1);
      } else {
        translateX.value = withSpring(
          -sharedPage.value * SCREEN_WIDTH,
          SPRING_CONFIG,
        );
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (sharedPage.value === 0) {
      runOnJS(goToPage)(1);
    }
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isPage0 = page === 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TouchableOpacity
        onPress={onSkip}
        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
        style={{
          position: "absolute",
          top: insets.top + 12,
          right: 24,
          zIndex: 10,
        }}
      >
        <Text
          style={{
            fontFamily: fontsLoaded ? "JosefinSans_400Regular" : undefined,
            fontSize: 15,
            color: isPage0 ? "rgba(255,255,255,0.8)" : "#6B7280",
            letterSpacing: 0.3,
          }}
        >
          Skip
        </Text>
      </TouchableOpacity>

      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            { flexDirection: "row", width: SCREEN_WIDTH * 2, flex: 1 },
            animatedStyle,
          ]}
        >
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <OnboardingScreen1 fontsLoaded={fontsLoaded} onAdvance={advance} />
          </View>
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <OnboardingScreen2
              fontsLoaded={fontsLoaded}
              onGetStarted={onGetStarted}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      <View
        style={{
          position: "absolute",
          bottom: insets.bottom > 0 ? insets.bottom + 16 : 28,
          alignSelf: "center",
          flexDirection: "row",
          gap: 8,
        }}
      >
        <View
          style={{
            width: isPage0 ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isPage0
              ? "rgba(255,255,255,0.9)"
              : "#D1D5DB",
          }}
        />
        <View
          style={{
            width: !isPage0 ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: !isPage0
              ? "#0F766E"
              : "rgba(255,255,255,0.4)",
          }}
        />
      </View>
    </View>
  );
}
