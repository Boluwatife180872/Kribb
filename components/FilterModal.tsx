import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../lib/theme";
import { PropertyType, useFilterStore } from "../store/filterStore";

const TYPES: { label: string; value: PropertyType }[] = [
  { label: "All", value: null },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
];

const BEDS = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const PRICE_PRESETS = [
  { label: "Under ₦5M", min: null, max: 5000000 },
  { label: "₦5M – ₦10M", min: 5000000, max: 10000000 },
  { label: "₦10M – ₦20M", min: 10000000, max: 20000000 },
  { label: "Above ₦20M", min: 20000000, max: null },
];

export default function FilterModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const {
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  } = useFilterStore();

  const [localMin, setLocalMin] = useState(minPrice ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState(maxPrice ? String(maxPrice) : "");

  const activeCount = [type, bedrooms, minPrice, maxPrice].filter(
    (v) => v !== null,
  ).length;

  const handleApply = () => {
    setMinPrice(localMin ? Number(localMin) : null);
    setMaxPrice(localMax ? Number(localMax) : null);
    onClose();
  };

  const handleReset = () => {
    setLocalMin("");
    setLocalMax("");
    resetFilters();
    onClose();
  };

  const shadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent={Platform.OS === "android"}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 13 }}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 12 }}>
            Property Type
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {TYPES.map((item) => {
              const active = type === item.value;
              return (
                <TouchableOpacity
                  key={String(item.value)}
                  onPress={() => setType(item.value)}
                  style={[shadow, {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary : colors.card,
                  }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "#fff" : colors.textSecondary }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bedrooms */}
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 12 }}>
            Bedrooms
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
            {BEDS.map((item) => {
              const active = bedrooms === item.value;
              return (
                <TouchableOpacity
                  key={String(item.value)}
                  onPress={() => setBedrooms(item.value)}
                  style={[shadow, {
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary : colors.card,
                  }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: "bold", color: active ? "#fff" : colors.textSecondary }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 12 }}>
            Price Range (₦)
          </Text>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            {[
              {
                label: "Min Price",
                value: localMin,
                onChange: setLocalMin,
                placeholder: "0",
              },
              {
                label: "Max Price",
                value: localMax,
                onChange: setLocalMax,
                placeholder: "Any",
              },
            ].map(({ label, value, onChange, placeholder }) => (
              <View key={label} style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6, fontWeight: "500" }}>
                  {label}
                </Text>
                <View
                  style={[shadow, {
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.inputBg,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }]}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginRight: 4 }}>₦</Text>
                  <TextInput
                    style={{ flex: 1, paddingVertical: 12, color: colors.text }}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              </View>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            style={{ marginBottom: 24 }}
          >
            {PRICE_PRESETS.map((p) => {
              const active = minPrice === p.min && maxPrice === p.max;
              return (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => {
                    setLocalMin(p.min ? String(p.min) : "");
                    setLocalMax(p.max ? String(p.max) : "");
                    setMinPrice(p.min);
                    setMaxPrice(p.max);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primaryLight : colors.card,
                  }}
                >
                  <Text
                    style={{ fontSize: 12, fontWeight: "500", color: active ? colors.primary : colors.textMuted }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </ScrollView>

        {/* Apply Button */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 64, paddingTop: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
          <TouchableOpacity
            onPress={handleApply}
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
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              Apply Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
