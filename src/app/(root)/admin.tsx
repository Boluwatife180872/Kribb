import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../lib/theme";
import { useSupabase } from "../../../hooks/useSupabase";
import { useUserStore } from "../../../store/userStore";
import { Property } from "../../../types";
import { formatPrice } from "../../../lib/utils";

export default function Admin() {
  const { colors } = useTheme();
  const router = useRouter();
  const authSupabase = useSupabase();
  const isAdmin = useUserStore((state) => state.isAdmin);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/(root)/(tabs)");
      return;
    }
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data } = await authSupabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProperties(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };

  const handleDelete = (property: Property) => {
    Alert.alert("Delete Property", `Delete "${property.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await authSupabase.from("properties").delete().eq("id", property.id);
          setProperties((prev) => prev.filter((p) => p.id !== property.id));
        },
      },
    ]);
  };

  const handleMarkSold = (property: Property) => {
    Alert.alert("Mark as Sold", `Mark "${property.title}" as sold?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Sold",
        onPress: async () => {
          await authSupabase
            .from("properties")
            .update({ is_sold: true })
            .eq("id", property.id);
          setProperties((prev) =>
            prev.map((p) =>
              p.id === property.id ? { ...p, is_sold: true } : p,
            ),
          );
        },
      },
    ]);
  };

  const handleEdit = (property: Property) => {
    router.push({
      pathname: "/(root)/property/edit/[id]",
      params: { id: property.id },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Property }) => (
    <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight, marginBottom: 16, overflow: "hidden" }}>
      <Image
        source={{ uri: item.images[0] }}
        style={{ width: "100%", height: 192 }}
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-2">
          {item.is_sold && (
            <View style={{ backgroundColor: colors.dangerLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
              <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "600" }}>Sold</Text>
            </View>
          )}
          {item.is_featured && (
            <View style={{ backgroundColor: "#FFFBEB", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
              <Text style={{ color: "#D97706", fontSize: 12, fontWeight: "600" }}>
                Featured
              </Text>
            </View>
          )}
          <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
              {item.type}
            </Text>
          </View>
        </View>
        <Text
          style={{ fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 4 }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={{ color: colors.primary, fontWeight: "bold", marginBottom: 12 }}>
          {formatPrice(item.price)}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>
          {item.address}, {item.city}
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: colors.primaryLight, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.primaryLight }}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 13 }}>Edit</Text>
          </TouchableOpacity>
          {!item.is_sold && (
            <TouchableOpacity
              onPress={() => handleMarkSold(item)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#FFFBEB", paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#FDE68A" }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#D97706"
              />
              <Text style={{ color: "#D97706", fontWeight: "600", fontSize: 13 }}>
                Sold
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: colors.dangerLight, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.dangerLight }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: "600", fontSize: 13 }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.replace("/(root)/(tabs)/profile")}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text, flex: 1 }}>
            Manage Listings
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            {properties.length} total
          </Text>
        </View>
      </View>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Ionicons name="home-outline" size={48} color={colors.border} />
            <Text style={{ color: colors.textMuted, marginTop: 16 }}>No listings yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
