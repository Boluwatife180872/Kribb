import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../../../lib/theme";
import { useSupabase } from "../../../../../hooks/useSupabase";
import { supabase } from "../../../../../lib/supabase";
import { useUserStore } from "../../../../../store/userStore";
import { Property } from "../../../../../types";

const TYPES = ["apartment", "house", "villa", "studio"] as const;
type PropertyType = (typeof TYPES)[number];

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

const sectionClass = "mb-5";

interface FormState {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  images: string[];
  localImages: string[];
}

export default function EditProperty() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const authSupabase = useSupabase();
  const isAdmin = useUserStore((state) => state.isAdmin);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    isFeatured: false,
    images: [],
    localImages: [],
  });

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/(root)/(tabs)");
      return;
    }
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setForm({
        title: data.title,
        description: data.description ?? "",
        price: String(data.price),
        type: data.type as PropertyType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        areaSqft: data.area_sqft ? String(data.area_sqft) : "",
        address: data.address,
        city: data.city,
        latitude: data.latitude ? String(data.latitude) : "",
        longitude: data.longitude ? String(data.longitude) : "",
        isFeatured: data.is_featured,
        images: data.images,
        localImages: data.images,
      });
    }
    setLoading(false);
  };

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 6 - form.images.length,
    });

    if (result.canceled) return;

    setUploadingImages(true);

    const uploadedUrls: string[] = [];
    const previewUris: string[] = [];

    for (const asset of result.assets) {
      try {
        const filename = `property_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.jpg`;

        const base64 = asset.base64!;
        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        const { error } = await authSupabase.storage
          .from("property-images")
          .upload(filename, buffer, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = authSupabase.storage
          .from("property-images")
          .getPublicUrl(filename);

        uploadedUrls.push(urlData.publicUrl);
        previewUris.push(asset.uri);
      } catch (err) {
        console.error("Upload error:", err);
        Alert.alert("Upload Failed", "One or more images failed to upload.");
      }
    }

    updateForm({
      images: [...form.images, ...uploadedUrls],
      localImages: [...form.localImages, ...previewUris],
    });
    setUploadingImages(false);
  };

  const handleRemoveImage = (index: number) => {
    updateForm({
      images: form.images.filter((_, i) => i !== index),
      localImages: form.localImages.filter((_, i) => i !== index),
    });
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to detect coordinates.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateForm({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
    } catch (err) {
      Alert.alert("Error", "Could not detect location. Enter manually.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim())
      return Alert.alert("Validation", "Title is required.");

    if (!form.price.trim())
      return Alert.alert("Validation", "Price is required.");

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < MIN_PRICE)
      return Alert.alert("Validation", "Price must be greater than ₦0.");
    if (priceNum > MAX_PRICE)
      return Alert.alert(
        "Validation",
        `Price cannot exceed ₦${MAX_PRICE.toLocaleString("en-NG")}.`,
      );

    if (!form.address.trim())
      return Alert.alert("Validation", "Address is required.");
    if (!form.city.trim())
      return Alert.alert("Validation", "City is required.");
    if (form.images.length === 0)
      return Alert.alert("Validation", "Please upload at least one image.");

    setSubmitting(true);

    const { error } = await authSupabase
      .from("properties")
      .update({
        title: form.title.trim(),
        description: form.description.trim(),
        price: priceNum,
        type: form.type,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
        address: form.address.trim(),
        city: form.city.trim(),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        images: form.images,
        is_featured: form.isFeatured,
      })
      .eq("id", id);

    setSubmitting(false);

    if (error) {
      Alert.alert("Error", "Failed to update property. Please try again.");
      console.error(error);
      return;
    }

    Alert.alert("Success!", "Property updated successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <KeyboardAvoidingView>
        <View className="flex-row items-center px-5 pt-4 pb-3 gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text, flex: 1 }}>
            Edit Property
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className={sectionClass}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>
              Photos{" "}
              <Text style={{ color: colors.textMuted, fontWeight: "400" }}>(up to 6)</Text>
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {form.localImages.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-2xl"
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View style={{ position: "absolute", top: 4, left: 4, backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 }}>
                      <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold" }}>
                        COVER
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    style={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, backgroundColor: colors.danger, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="close" size={11} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {form.localImages.length < 6 && (
                <TouchableOpacity
                  onPress={handlePickImages}
                  disabled={uploadingImages}
                  style={{ width: 96, height: 96, borderRadius: 16, backgroundColor: colors.card, borderWidth: 2, borderStyle: "dashed", borderColor: colors.border, alignItems: "center", justifyContent: "center" }}
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color={colors.textMuted}
                      />
                      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className={sectionClass}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>Title</Text>
            <TextInput
              style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
              placeholder="e.g. Modern 3BHK in Bandra"
              placeholderTextColor={colors.textMuted}
              value={form.title}
              onChangeText={(v) => updateForm({ title: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>Description</Text>
            <TextInput
              style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: colors.text, height: 96 }}
              placeholder="Describe the property..."
              placeholderTextColor={colors.textMuted}
              value={form.description}
              onChangeText={(v) => updateForm({ description: v })}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className={sectionClass}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>Price (₦)</Text>
            <TextInput
              style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
              placeholder="e.g. 5000000"
              placeholderTextColor={colors.textMuted}
              value={form.price}
              onChangeText={(v) => updateForm({ price: v })}
              keyboardType="numeric"
            />
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 6, marginLeft: 4 }}>
              Valid range: ₦1 – ₦{MAX_PRICE.toLocaleString("en-NG")}
            </Text>
          </View>

          <View className={sectionClass}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>Property Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((t) => {
                const active = form.type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => updateForm({ type: t })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : colors.card,
                    }}
                  >
                    <Text
                      style={{ fontSize: 13, fontWeight: "600", textTransform: "capitalize", color: active ? "#fff" : colors.textSecondary }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="flex-row gap-4 mb-5">
            <Counter
              colors={colors}
              label="Bedrooms"
              value={form.bedrooms}
              onChange={(v) => updateForm({ bedrooms: v })}
            />
            <Counter
              colors={colors}
              label="Bathrooms"
              value={form.bathrooms}
              onChange={(v) => updateForm({ bathrooms: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>Area (sq ft)</Text>
            <TextInput
              style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
              placeholder="e.g. 1200"
              placeholderTextColor={colors.textMuted}
              value={form.areaSqft}
              onChangeText={(v) => updateForm({ areaSqft: v })}
              keyboardType="numeric"
            />
          </View>

          <View className={sectionClass}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>Address</Text>
            <TextInput
              style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
              placeholder="Street address"
              placeholderTextColor={colors.textMuted}
              value={form.address}
              onChangeText={(v) => updateForm({ address: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>City</Text>
            <TextInput
              style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
              placeholder="e.g. Mumbai"
              placeholderTextColor={colors.textMuted}
              value={form.city}
              onChangeText={(v) => updateForm({ city: v })}
            />
          </View>

          <View className={sectionClass}>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 0 }}>Coordinates</Text>
              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="locate-outline" size={13} color={colors.primary} />
                )}
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>
                  {detectingLocation ? "Detecting..." : "Detect Location"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
                  placeholder="Latitude"
                  placeholderTextColor={colors.textMuted}
                  value={form.latitude}
                  onChangeText={(v) => updateForm({ latitude: v })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
                  placeholder="Longitude"
                  placeholderTextColor={colors.textMuted}
                  value={form.longitude}
                  onChangeText={(v) => updateForm({ longitude: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View className="gap-3 mb-5">
            <Toggle
              colors={colors}
              label="Featured Property"
              description="Show this in the Featured section on home"
              value={form.isFeatured}
              onChange={(v) => updateForm({ isFeatured: v })}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || uploadingImages}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              opacity: submitting || uploadingImages ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Counter = ({
  colors,
  label,
  value,
  onChange,
}: {
  colors: any;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <View className="flex-1">
    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 }}>{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: "hidden" }}>
      <TouchableOpacity
        onPress={() => onChange(Math.max(1, value - 1))}
        style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name="remove" size={18} color={colors.text} />
      </TouchableOpacity>
      <Text style={{ flex: 1, textAlign: "center", color: colors.text, fontWeight: "bold", fontSize: 16 }}>
        {value}
      </Text>
      <TouchableOpacity
        onPress={() => onChange(value + 1)}
        style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name="add" size={18} color={colors.text} />
      </TouchableOpacity>
    </View>
  </View>
);

const Toggle = ({
  colors,
  label,
  value,
  onChange,
  description,
}: {
  colors: any;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) => (
  <TouchableOpacity
    onPress={() => onChange(!value)}
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: value ? colors.primary : colors.border,
      backgroundColor: value ? colors.primaryLight : colors.card,
    }}
  >
    <View style={{ flex: 1, marginRight: 12 }}>
      <Text
        style={{ fontWeight: "600", color: value ? colors.primaryDark : colors.textSecondary }}
      >
        {label}
      </Text>
      {description && (
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{description}</Text>
      )}
    </View>
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: value ? colors.primary : colors.border,
        backgroundColor: value ? colors.primary : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {value && <Ionicons name="checkmark" size={14} color="white" />}
    </View>
  </TouchableOpacity>
);
