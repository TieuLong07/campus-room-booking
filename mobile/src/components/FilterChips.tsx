import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useFilterStore } from "../stores/filterStore";
import { Feather } from "@expo/vector-icons";

const BUILDINGS = [
  { label: "Tất cả toà", value: "ALL" },
  { label: "Toà A", value: "Toà A" },
  { label: "Toà B", value: "Toà B" },
  { label: "Toà C", value: "Toà C" },
  { label: "Thư Viện", value: "Thư Viện" },
];

const ROOM_TYPES = [
  { label: "Tất cả loại", value: "ALL" },
  { label: "Phòng tự học", value: "STUDY_ROOM" },
  { label: "Lab máy tính", value: "LAB" },
  { label: "Seminar & Họp", value: "MEETING" },
];

const CAPACITIES = [
  { label: "Bất kỳ quy mô", value: 0 },
  { label: "Từ 4 chỗ", value: 4 },
  { label: "Từ 10 chỗ", value: 10 },
  { label: "Từ 20 chỗ", value: 20 },
];

export const FilterChips: React.FC = () => {
  const {
    selectedBuilding,
    setSelectedBuilding,
    selectedType,
    setSelectedType,
    minCapacity,
    setMinCapacity,
    resetFilters,
  } = useFilterStore();

  const isFiltered =
    selectedBuilding !== "ALL" || selectedType !== "ALL" || minCapacity > 0;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>BỘ LỌC KHÔNG GIAN</Text>
        {isFiltered && (
          <TouchableOpacity
            onPress={resetFilters}
            style={styles.resetBtn}
            activeOpacity={0.7}
          >
            <Feather name="rotate-ccw" size={11} color="#71717a" />
            <Text style={styles.resetText}>Đặt lại</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {/* Buildings */}
        {BUILDINGS.map((b) => {
          const isSelected = selectedBuilding === b.value;
          return (
            <TouchableOpacity
              key={`b-${b.value}`}
              onPress={() => setSelectedBuilding(b.value)}
              style={[styles.pill, isSelected && styles.pillActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        {/* Room Types */}
        {ROOM_TYPES.map((t) => {
          const isSelected = selectedType === t.value;
          return (
            <TouchableOpacity
              key={`t-${t.value}`}
              onPress={() => setSelectedType(t.value)}
              style={[styles.pill, isSelected && styles.pillActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        {/* Capacity */}
        {CAPACITIES.map((c) => {
          const isSelected = minCapacity === c.value;
          return (
            <TouchableOpacity
              key={`c-${c.value}`}
              onPress={() => setMinCapacity(c.value)}
              style={[styles.pill, isSelected && styles.pillActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
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
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
    paddingTop: 8,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#a1a1aa",
    letterSpacing: 0.8,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resetText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
  },
  scrollRow: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "#e4e4e7",
    marginHorizontal: 4,
  },
  pill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: "#f4f4f5",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  pillActive: {
    backgroundColor: "#09090b",
    borderColor: "#09090b",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#52525b",
  },
  pillTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
