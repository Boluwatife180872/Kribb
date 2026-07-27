import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterModal from "../../../../components/FilterModal";
import PropertyCard from "../../../../components/PropertyCard";
import { useTheme } from "../../../../lib/theme";
import { supabase } from "../../../../lib/supabase";
import { formatPrice } from "../../../../lib/utils";
import { useFilterStore } from "../../../../store/filterStore";
import { Property } from "../../../../types";

export default function Search() {
  const { colors } = useTheme();
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilters(true);
    }
  }, [openFilters]);

  const {
    search,
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setSearch,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
  } = useFilterStore();

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  useEffect(() => {
    fetchResults();
  }, [search, type, bedrooms, minPrice, maxPrice]);

  const fetchResults = async () => {
    setLoading(true);

    let query = supabase.from("properties").select("*");

    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (bedrooms) {
      query = query.eq("bedrooms", bedrooms);
    }

    if (minPrice) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice) {
      query = query.lte("price", maxPrice);
    }

    const { data } = await query.order("created_at", { ascending: false });

    setResults(data ?? []);
    setLoading(false);
  };

  // 2:37:00

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text, marginBottom: 16 }}>
          Find Property
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.inputBg,
              borderRadius: 16,
              paddingHorizontal: 16,
              gap: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, color: colors.text }}
              placeholder="Search by title or city..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: activeFilterCount > 0 ? colors.primary : colors.card,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? "#fff" : colors.textSecondary}
            />
            {activeFilterCount > 0 && (
              <View style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, backgroundColor: colors.danger, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold" }}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        {activeFilterCount > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {type && (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, gap: 4 }}>
                <Text style={{ color: colors.primaryDark, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
                  {type}
                </Text>
                <TouchableOpacity onPress={() => setType(null)}>
                  <Ionicons name="close" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {bedrooms !== null && (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, gap: 4 }}>
                <Ionicons name="bed-outline" size={11} color={colors.primary} />
                <Text style={{ color: colors.primaryDark, fontSize: 12, fontWeight: "600" }}>
                  {bedrooms === 4
                    ? "4+ beds"
                    : `${bedrooms} bed${bedrooms > 1 ? "s" : ""}`}
                </Text>
                <TouchableOpacity onPress={() => setBedrooms(null)}>
                  <Ionicons name="close" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, gap: 4 }}>
                <Text style={{ color: colors.primaryDark, fontSize: 12, fontWeight: "600" }}>
                  {minPrice && maxPrice
                    ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                    : minPrice
                      ? `From ${formatPrice(minPrice)}`
                      : `Up to ${formatPrice(maxPrice!)}`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                >
                  <Ionicons name="close" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      {/* Results */}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PropertyCard property={item} />}
        ListHeaderComponent={
          <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>
            {loading ? "Searching..." : `${results.length} properties found`}
          </Text>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <Ionicons name="search-outline" size={48} color={colors.border} />
              <Text style={{ color: colors.textMuted, marginTop: 16, fontSize: 16 }}>
                No properties found
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                Try a different search or adjust filters
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={colors.primary} style={{ paddingVertical: 80 }} />
          )
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}
