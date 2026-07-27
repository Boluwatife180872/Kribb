import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FeaturedCard from "../../../../components/FeaturedCard";
import PropertyCard from "../../../../components/PropertyCard";
import { supabase } from "../../../../lib/supabase";
import { Property } from "../../../../types";
import { useTheme } from "../../../../lib/theme";

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, []),
  );

  const logoSrc = isDark
    ? require("../../../../assets/images/main-plazly-black1.png")
    : require("../../../../assets/images/main-plazly.png");

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: featuredData, error: featuredError } = await supabase
        .from("properties")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (featuredError) {
        console.error("Error fetching featured properties:", featuredError);
        throw featuredError;
      }

      const { data: recommendedData, error: recommendedError } = await supabase
        .from("properties")
        .select("*")
        .eq("is_featured", false)
        .order("created_at", { ascending: false });

      if (recommendedError) {
        console.error(
          "Error fetching recommended properties:",
          recommendedError,
        );
        throw recommendedError;
      }

      setFeatured(featuredData ?? []);
      setRecommended(recommendedData ?? []);
    } catch (err: any) {
      console.error("Failed to load properties:", err);
      setError("Failed to load properties. Please try again.");
      setFeatured([]);
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
              <Image
                source={logoSrc}
                style={{ width: 90, height: 36 }}
                resizeMode="contain"
              />
              <View className="items-end">
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  {(() => {
                    const h = new Date().getHours();
                    if (h < 12) return "Good morning";
                    if (h < 17) return "Good afternoon";
                    return "Good evening";
                  })()}
                </Text>
                <Text style={{ color: colors.text }} className="text-base font-bold">
                  {user?.firstName ?? "User"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/search")}
              className="mx-5 mb-6 flex-row items-center rounded-2xl px-4 py-3 gap-3"
              style={{
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted }} className="text-sm flex-1">
                Search properties, cities...
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(root)/(tabs)/search?openFilters=true")
                }
                style={{ backgroundColor: colors.primary }}
                className="w-8 h-8 rounded-xl items-center justify-center"
              >
                <Ionicons name="options-outline" size={15} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>

            <View className="mb-6">
              <Text style={{ color: colors.text }} className="text-lg font-bold px-5 mb-4">
                Featured
              </Text>

              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  className="py-10"
                />
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FeaturedCard property={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
                />
              )}
            </View>

            <Text style={{ color: colors.text }} className="text-lg font-bold px-5 mb-4">
              Recommended
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-10 px-5">
              <Text
                style={{ color: error ? colors.danger : colors.textMuted }}
                className="text-center"
              >
                {error ? error : "No properties found"}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
