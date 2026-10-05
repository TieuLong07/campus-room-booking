import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Room } from "../types";

export const ROOM_CARD_HEIGHT = 136;
export const ROOM_CARD_MARGIN_BOTTOM = 12;
export const TOTAL_ROOM_ITEM_HEIGHT = ROOM_CARD_HEIGHT + ROOM_CARD_MARGIN_BOTTOM;

interface RoomCardProps {
  room: Room;
  onPress: (roomId: string) => void;
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  STUDY_ROOM: { label: "Tự học", bg: "#dbeafe", color: "#1d4ed8" },
  LAB: { label: "Lab", bg: "#fef3c7", color: "#b45309" },
  MEETING: { label: "Hội thảo", bg: "#ede9fe", color: "#6d28d9" },
};

const AMENITY_LABELS: Record<string, string> = {
  AC: "Điều hoà",
  PROJECTOR: "Máy chiếu",
  WHITEBOARD: "Bảng viết",
  HIGH_SPEC_PC: "PC cấu hình cao",
  MAC_MINI: "Mac Mini",
  POWER_OUTLETS: "Ổ cắm",
  WIFI: "Wifi",
  SOUNDPROOF: "Cách âm",
  SOUND_SYSTEM: "Âm thanh",
};

export const RoomCard: React.FC<RoomCardProps> = React.memo(({ room, onPress }) => {
  const typeBadge = TYPE_CONFIG[room.type] || {
    label: room.type,
    bg: "#f1f5f9",
    color: "#475569",
  };

  const amenitiesPreview = room.amenities
    .slice(0, 3)
    .map((a) => AMENITY_LABELS[a] || a)
    .join(" • ");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(room.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: room.imageUrl }} style={styles.thumbnail} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.codeText}>{room.code}</Text>
          <View style={[styles.badge, { backgroundColor: typeBadge.bg }]}>
            <Text style={[styles.badgeText, { color: typeBadge.color }]}>
              {typeBadge.label}
            </Text>
          </View>
        </View>

        <Text style={styles.nameText} numberOfLines={1}>
          {room.name}
        </Text>

        <Text style={styles.locationText}>
          {room.building} - Tầng {room.floor} | Sức chứa: {room.capacity} người
        </Text>

        <Text style={styles.amenitiesText} numberOfLines={1}>
          {amenitiesPreview}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    height: ROOM_CARD_HEIGHT,
    marginBottom: ROOM_CARD_MARGIN_BOTTOM,
    marginHorizontal: 16,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnail: {
    width: 110,
    height: "100%",
    backgroundColor: "#cbd5e1",
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  nameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  locationText: {
    fontSize: 11,
    color: "#64748b",
  },
  amenitiesText: {
    fontSize: 11,
    color: "#94a3b8",
  },
});
