import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSavedProperty } from "../../../../hooks/useSavedProperty";
import { useSupabase } from "../../../../hooks/useSupabase";
import { useTheme } from "../../../../lib/theme";
import { supabase } from "../../../../lib/supabase";
import { formatPrice } from "../../../../lib/utils";
import { useUserStore } from "../../../../store/userStore";
import { Property } from "../../../../types";

import ImageViewing from "react-native-image-viewing";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");

const ADMIN_PHONE = "+2347085115454";

export default function PropertyDetails() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const router = useRouter();
  const isAdmin = useUserStore((state) => state.isAdmin);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const authSupabase = useSupabase();
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(id ?? "");

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();
    setProperty(data);
    setLoading(false);
  };

  const handleContact = () => {
    const message = `Hi! I'm interested in the property: ${property?.title}`;
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(
      message,
    )}`;
    Linking.openURL(url);
  };

  const handleDelete = () => {
    Alert.alert("Delete Property", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await authSupabase.from("properties").delete().eq("id", id);
          router.replace("/(root)/(tabs)");
        },
      },
    ]);
  };

  const handleMarkSold = () => {
    Alert.alert("Mark as Sold", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Sold",
        onPress: async () => {
          await authSupabase
            .from("properties")
            .update({ is_sold: true })
            .eq("id", id);
          setProperty((prev) => (prev ? { ...prev, is_sold: true } : prev));
        },
      },
    ]);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>Property not found</Text>
      </View>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    property.longitude - 0.003
  }%2C${property.latitude - 0.003}%2C${property.longitude + 0.003}%2C${
    property.latitude + 0.003
  }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`;

  const isLongDesc = (property.description?.length ?? 0) > 150;
  const displayDesc =
    expanded || !isLongDesc
      ? property.description
      : property.description?.slice(0, 150) + "...";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {/* Image Carousel */}
          <View style={{ opacity: property.is_sold ? 0.5 : 1 }}>
            <FlatList
              data={property.images}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                  <Image
                    source={{ uri: item }}
                    style={{ width, height: 300 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          </View>

          {/* Image count badge */}
          <View style={{ position: "absolute", bottom: 12, right: 16, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "500" }}>
              {activeIndex + 1}/{property.images.length}
            </Text>
          </View>

          <SafeAreaView style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
            <View className="flex-row items-center justify-between px-4 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ width: 40, height: 40, backgroundColor: colors.card, borderRadius: 20, alignItems: "center", justifyContent: "center", elevation: 3 }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleSave}
                disabled={saveLoading}
                style={{ width: 40, height: 40, backgroundColor: colors.card, borderRadius: 20, alignItems: "center", justifyContent: "center", elevation: 3 }}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={20}
                  color={isSaved ? colors.danger : colors.text}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View
          className="px-5 pt-5 pb-24"
          style={{ opacity: property.is_sold ? 0.6 : 1 }}
        >
          {/* Badges */}
          <View className="flex-row gap-2 mb-3 flex-wrap">
            <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
                {property.type}
              </Text>
            </View>
            {property.is_featured && (
              <View style={{ backgroundColor: "#FFFBEB", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: "#D97706", fontSize: 12, fontWeight: "600" }}>
                  ⭐ Featured
                </Text>
              </View>
            )}
            {property.is_sold && (
              <View style={{ backgroundColor: colors.dangerLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "600" }}>Sold</Text>
              </View>
            )}
          </View>

          {/* Title + Price */}
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text, marginBottom: 4 }}>
            {property.title}
          </Text>
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
            {formatPrice(property.price)}
          </Text>

          {/* Specs Row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <SpecItem
              colors={colors}
              icon="bed-outline"
              label="Beds"
              value={`${property.bedrooms}`}
            />
            <SpecItem
              colors={colors}
              icon="water-outline"
              label="Baths"
              value={`${property.bathrooms}`}
            />
            <SpecItem
              colors={colors}
              icon="expand-outline"
              label="Area"
              value={`${property.area_sqft} ft²`}
            />
            <SpecItem colors={colors} icon="home-outline" label="Type" value={property.type} />
          </View>

          {/* Description */}
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 8 }}>
            Description
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 24, marginBottom: 4 }}>
            {displayDesc}
          </Text>
          {isLongDesc && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "500", marginBottom: 20 }}>
                {expanded ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          <View className="mb-5" />

          {/* Location */}
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 8 }}>
            Location
          </Text>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: "500", flex: 1 }}>
              {property.address}, {property.city}
            </Text>
          </View>

          {/* Web View (waiting for build to finish) */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(root)/property/map",
                params: {
                  latitude: property.latitude,
                  longitude: property.longitude,
                  title: property.title,
                  address: `${property.address}, ${property.city}`,
                },
              })
            }
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden mb-6"
            style={{ height: 200 }}
          >
            <WebView
              source={{ uri: mapUrl }}
              style={{ flex: 1 }}
              scrollEnabled={false}
              pointerEvents="none"
            />
            <View style={{ position: "absolute", bottom: 12, right: 12, backgroundColor: colors.card + "E6", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="expand-outline" size={12} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "500" }}>
                Tap to expand
              </Text>
            </View>
          </TouchableOpacity>

          {/* Contact Button */}
          <TouchableOpacity
            onPress={handleContact}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#16A34A", paddingVertical: 16, borderRadius: 16, marginBottom: 16 }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              Contact Agent
            </Text>
          </TouchableOpacity>

          {/* Admin Actions */}
          {isAdmin && (
            <View className="flex-row gap-3">
              {!property.is_sold && (
                <TouchableOpacity
                  onPress={handleMarkSold}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FFFBEB", paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: "#FDE68A" }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#D97706"
                  />
                  <Text style={{ color: "#D97706", fontWeight: "600" }}>
                    Mark Sold
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleDelete}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.dangerLight, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.dangerLight }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={{ color: colors.danger, fontWeight: "600" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Viewer */}
      <ImageViewing
        images={property.images.map((uri) => ({ uri }))}
        imageIndex={activeIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        HeaderComponent={() => (
          <View className="px-5" style={{ alignItems: "flex-end", paddingTop: 80 }}>
            <TouchableOpacity
              onPress={() => setImageViewerVisible(false)}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "#00000077" }}
            >
              <Text style={{ color: "#fff", fontSize: 20, textAlign: "center" }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

function SpecItem({
  colors,
  icon,
  label,
  value,
}: {
  colors: any;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="items-center gap-1">
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 13 }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}
