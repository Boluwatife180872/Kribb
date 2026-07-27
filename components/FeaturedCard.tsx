import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../lib/theme";
import { formatPrice } from "../lib/utils";
import { Property } from "../types";

function FeaturedCardComponent({ property }: { property: Property }) {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const fallbackImg = isDark
    ? require("../assets/images/main-plazly-black1.png")
    : require("../assets/images/main-plazly.png");

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Featured property: ${property.title}, ${property.address}, ${property.city}, price ${formatPrice(property.price)}`}
      className="w-72 mr-4 rounded-3xl"
      style={{
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        opacity: property.is_sold ? 0.5 : 1,
      }}
      onPress={() => router.push(`/(root)/property/${property.id}`)}
    >
      <View className="rounded-3xl overflow-hidden w-full" style={{ backgroundColor: colors.card }}>
        <Image
          source={
            property.images.length > 0
              ? property.images[0]
              : fallbackImg
          }
          style={{ width: "100%", height: 176 }}
          contentFit="cover"
          transition={200}
        />

        {/* Badge */}

        <View style={{ backgroundColor: colors.card + "E6" }} className="absolute top-3 left-3 px-3 py-1 rounded-full">
          <Text className="text-xs font-semibold capitalize" style={{ color: colors.primary }}>
            {property.type}
          </Text>
        </View>

        {property.is_sold && (
          <View style={{ backgroundColor: colors.danger }} className="absolute top-3 right-3 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-white">Sold</Text>
          </View>
        )}

        {/* info */}
        <View className="p-4">
          <Text
            className="text-base font-bold mb-1"
            numberOfLines={1}
            style={{ color: colors.text }}
          >
            {property.title}
          </Text>

          <View className="flex-row items-center gap-1 mb-3">
            <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
            <Text className="text-sm" numberOfLines={1} style={{ color: colors.textSecondary, fontWeight: "500" }}>
              {property.address}, {property.city}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text style={{ color: colors.primary }} className="font-bold text-base">
              {formatPrice(property.price)}
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <Ionicons name="bed-outline" size={13} color={colors.textMuted} />
                <Text className="text-xs" style={{ color: colors.textMuted }}>{property.bedrooms}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="water-outline" size={13} color={colors.textMuted} />
                <Text className="text-xs" style={{ color: colors.textMuted }}>
                  {property.bathrooms}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(FeaturedCardComponent);
