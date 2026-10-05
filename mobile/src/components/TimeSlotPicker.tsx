import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TimeSlot } from "../types";
import { Feather } from "@expo/vector-icons";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
}) => {
  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const isSelected = selectedSlotId === slot.id;
        const isBooked = slot.isBooked;

        return (
          <TouchableOpacity
            key={slot.id}
            disabled={isBooked}
            onPress={() => onSelectSlot(slot)}
            activeOpacity={0.8}
            style={[
              styles.slotCard,
              isBooked && styles.slotBooked,
              isSelected && styles.slotSelected,
            ]}
          >
            <View style={styles.infoCol}>
              <View style={styles.timeRow}>
                <Text
                  style={[
                    styles.timeText,
                    isBooked && styles.textBooked,
                    isSelected && styles.textSelected,
                  ]}
                >
                  {slot.startTime} - {slot.endTime}
                </Text>
                {isSelected && (
                  <Feather name="check" size={14} color="#ffffff" style={styles.checkIcon} />
                )}
              </View>
              <Text
                style={[
                  styles.slotLabel,
                  isBooked && styles.labelBooked,
                  isSelected && styles.labelSelected,
                ]}
              >
                {slot.label}
              </Text>
            </View>

            <View style={styles.statusCol}>
              <View
                style={[
                  styles.badge,
                  isBooked
                    ? styles.badgeBooked
                    : isSelected
                    ? styles.badgeSelected
                    : styles.badgeAvailable,
                ]}
              >
                {!isBooked && !isSelected && (
                  <View style={styles.statusDot} />
                )}
                <Text
                  style={[
                    styles.badgeText,
                    isBooked
                      ? styles.badgeTextBooked
                      : isSelected
                      ? styles.badgeTextSelected
                      : styles.badgeTextAvailable,
                  ]}
                >
                  {isBooked ? "Đã đặt" : isSelected ? "Đã chọn" : "Khả dụng"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 7,
  },
  slotCard: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotBooked: {
    backgroundColor: "#fafafa",
    borderColor: "#f4f4f5",
    opacity: 0.6,
  },
  slotSelected: {
    backgroundColor: "#09090b",
    borderColor: "#09090b",
  },
  infoCol: {
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#09090b",
    letterSpacing: -0.2,
  },
  checkIcon: {
    marginLeft: 2,
  },
  textBooked: {
    color: "#a1a1aa",
    textDecorationLine: "line-through",
  },
  textSelected: {
    color: "#ffffff",
  },
  slotLabel: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 2,
  },
  labelBooked: {
    color: "#a1a1aa",
  },
  labelSelected: {
    color: "#d4d4d8",
  },
  statusCol: {
    marginLeft: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  badgeAvailable: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  badgeBooked: {
    backgroundColor: "#f4f4f5",
    borderColor: "#e4e4e7",
  },
  badgeSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#16a34a",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  badgeTextAvailable: {
    color: "#16a34a",
  },
  badgeTextBooked: {
    color: "#71717a",
  },
  badgeTextSelected: {
    color: "#ffffff",
  },
});
