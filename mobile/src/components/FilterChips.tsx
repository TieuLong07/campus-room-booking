import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useFilterStore } from "../stores/filterStore";

const BUILDINGS = [
  { label: "Tất cả toà", value: "ALL" },
  { label: "Toà A", value: "Toà A" },
  { label: "Toà B", value: "Toà B" },
  { label: "Toà C", value: "Toà C" },
  { label: "Thư Viện", value: "Thư Viện" },
];

const ROOM_TYPES = [
  { label: "Mọi loại phòng", value: "ALL" },
  { label: "Tự học", value: "STUDY_ROOM" },
  { label: "Lab máy tính", value: "LAB" },
  { label: "Seminar / Họp", value: "MEETING" },
];

const CAPACITIES = [
  { label: "Sức chứa: Bất kỳ", value: 0 },
  { label: "4+ người", value: 4 },
  { label: "10+ người", value: 10 },
  { label: "20+ người", value: 20 },
];

export const FilterChips: React.FC = () => {
  const {
    selectedBuilding,
    setSelectedBuilding,
    selectedType,
    setSelectedType,
    minCapacity,
    setMinCapacity,
  } = useFilterStore();

  return (
    <View style={styles.container}>
      {/* Row 1: Building Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {BUILDINGS.map((b) => {
          const isSelected = selectedBuilding === b.value;
          return (
            <TouchableOpacity
              key={b.value}
              onPress={() => setSelectedBuilding(b.value)}
              style={[styles.chip, isSelected && styles.chipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Row 2: Room Type Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {ROOM_TYPES.map((t) => {
          const isSelected = selectedType === t.value;
          return (
            <TouchableOpacity
              key={t.value}
              onPress={() => setSelectedType(t.value)}
              style={[styles.chip, isSelected && styles.chipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Row 3: Capacity Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {CAPACITIES.map((c) => {
          const isSelected = minCapacity === c.value;
          return (
            <TouchableOpacity
              key={c.value}
              onPress={() => setMinCapacity(c.value)}
              style={[styles.chip, isSelected && styles.chipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
