import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useSavedProperty } from "../hooks/useSavedProperty";
import { useTheme } from "../lib/theme";
import { formatPrice } from "../lib/utils";
import { Property } from "../types";

function PropertyCardComponent({
  property,
  onUnsave,
  showSave = false,
}: {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
}) {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const fallbackImg = isDark
    ? require("../assets/images/main-plazly-black1.png")
    : require("../assets/images/main-plazly.png");

  const { isSaved, saveLoading, toggleSave } = useSavedProperty(
    property.id,
    onUnsave,
  );

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Property: ${property.title}, ${property.city}, price ${formatPrice(property.price)}`}
      onPress={() => router.push(`/(root)/property/${property.id}`)}
      className="flex-row rounded-2xl mb-4 overflow-hidden"
      style={{
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        opacity: property.is_sold ? 0.5 : 1,
      }}
    >
      {/* Image */}
      <Image
        source={
          property.images.length > 0
            ? property.images[0]
            : fallbackImg
        }
        style={{ width: 112, height: 112 }}
        contentFit="cover"
        transition={200}
      />

      {/* Info */}
      <View className="flex-1 p-3 justify-between">
        <View>
          <Text
            className="text-sm font-bold mb-1"
            numberOfLines={1}
            style={{ color: colors.text }}
          >
            {property.title}
          </Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text className="text-sm" numberOfLines={1} style={{ color: colors.textSecondary, fontWeight: "500" }}>
              {property.city}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.primary }} className="font-bold text-sm">
            {formatPrice(property.price)}
          </Text>
          {property.is_sold && (
            <View style={{ backgroundColor: colors.dangerLight }} className="px-2 py-0.5 rounded-full">
              <Text style={{ color: colors.danger }} className="text-xs font-semibold">Sold</Text>
            </View>
          )}
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={11} color={colors.textMuted} />
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {property.bedrooms} bd
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="expand-outline" size={11} color={colors.textMuted} />
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {property.area_sqft} ft²
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={isSaved ? "Remove from saved" : "Save property"}
        onPress={toggleSave}
        disabled={saveLoading}
        className="w-10 items-center pt-3"
      >
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={18}
          color={isSaved ? colors.danger : colors.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default React.memo(PropertyCardComponent);
