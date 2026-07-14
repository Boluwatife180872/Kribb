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
import { useSupabase } from "../../../hooks/useSupabase";
import { useUserStore } from "../../../store/userStore";
import { Property } from "../../../types";
import { formatPrice } from "../../../lib/utils";

export default function Admin() {
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Property }) => (
    <View className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
      <Image
        source={{ uri: item.images[0] }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-2">
          {item.is_sold && (
            <View className="bg-red-50 px-2 py-0.5 rounded-full">
              <Text className="text-red-500 text-xs font-semibold">Sold</Text>
            </View>
          )}
          {item.is_featured && (
            <View className="bg-amber-50 px-2 py-0.5 rounded-full">
              <Text className="text-amber-600 text-xs font-semibold">
                Featured
              </Text>
            </View>
          )}
          <View className="bg-blue-50 px-2 py-0.5 rounded-full">
            <Text className="text-blue-600 text-xs font-semibold capitalize">
              {item.type}
            </Text>
          </View>
        </View>
        <Text
          className="text-base font-bold text-gray-900 mb-1"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-blue-600 font-bold mb-3">
          {formatPrice(item.price)}
        </Text>
        <Text className="text-gray-400 text-xs mb-3">
          {item.address}, {item.city}
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="flex-1 flex-row items-center justify-center gap-1 bg-blue-50 py-3 rounded-xl border border-blue-100"
          >
            <Ionicons name="create-outline" size={16} color="#2563EB" />
            <Text className="text-blue-600 font-semibold text-sm">Edit</Text>
          </TouchableOpacity>
          {!item.is_sold && (
            <TouchableOpacity
              onPress={() => handleMarkSold(item)}
              className="flex-1 flex-row items-center justify-center gap-1 bg-amber-50 py-3 rounded-xl border border-amber-100"
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#D97706"
              />
              <Text className="text-amber-600 font-semibold text-sm">
                Sold
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            className="flex-1 flex-row items-center justify-center gap-1 bg-red-50 py-3 rounded-xl border border-red-100"
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text className="text-red-500 font-semibold text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            Manage Listings
          </Text>
          <Text className="text-gray-400 text-sm">
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
            <Ionicons name="home-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4">No listings yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
