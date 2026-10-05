import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TimeSlot } from "../types";

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
            activeOpacity={0.7}
            style={[
              styles.slotCard,
              isBooked && styles.slotBooked,
              isSelected && styles.slotSelected,
            ]}
          >
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
            </View>

            <View style={styles.statusRow}>
              <Text
                style={[
                  styles.statusBadge,
                  isBooked ? styles.statusBadgeBooked : styles.statusBadgeAvailable,
                  isSelected && styles.statusBadgeSelected,
                ]}
              >
                {isBooked ? "Đã có người đặt" : isSelected ? "Đang chọn" : "Còn trống"}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 8,
  },
  slotCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotBooked: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
    opacity: 0.65,
  },
  slotSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },
  timeRow: {
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  textBooked: {
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  textSelected: {
    color: "#ffffff",
  },
  statusRow: {
    marginLeft: 8,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  statusBadgeAvailable: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  statusBadgeBooked: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  statusBadgeSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
  },
});
