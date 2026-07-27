import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../lib/theme";

export function SkeletonItem() {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: "row",
          backgroundColor: colors.card,
          borderRadius: 16,
          marginBottom: 16,
          overflow: "hidden",
          padding: 12,
          gap: 12,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 12,
          backgroundColor: colors.skeleton,
        }}
      />
      <View style={{ flex: 1, justifyContent: "space-between", paddingVertical: 4 }}>
        <View
          style={{
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.skeleton,
            width: "80%",
            marginBottom: 8,
          }}
        />
        <View
          style={{
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.skeleton,
            width: "50%",
            marginBottom: 12,
          }}
        />
        <View
          style={{
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.skeleton,
            width: "40%",
          }}
        />
      </View>
    </Animated.View>
  );
}
