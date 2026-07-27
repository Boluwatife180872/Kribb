import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyCard from "../../../../components/PropertyCard";
import { useTheme } from "../../../../lib/theme";
import { useSupabase } from "../../../../hooks/useSupabase";
import { Property } from "../../../../types";

interface SavedProperty {
  id: string;
  property_id: string;
  properties: Property;
}

export default function Saved() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await authSupabase
      .from("saved_properties")
      .select("id, property_id, properties(*)")
      .eq("user_clerk_id", userId)
      .order("id", { ascending: false });

    setSaved((data as unknown as SavedProperty[]) ?? []);
    setLoading(false);
  }, [userId]);

  // Refresh every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved]),
  );

return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}>Saved</Text>
        {!loading && (
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
            {saved.length} {saved.length === 1 ? "property" : "properties"}{" "}
            saved
          </Text>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.properties}
              onUnsave={() =>
                setSaved((prev) => prev.filter((s) => s.id !== item.id))
              }
              showSave
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <View style={{ width: 80, height: 80, backgroundColor: colors.dangerLight, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Ionicons name="heart-outline" size={36} color={colors.danger} />
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
                No saved properties
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", paddingHorizontal: 32 }}>
                Tap the heart icon on any property to save it here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/search")}
                style={{ marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Browse Properties
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// 3:11:57
