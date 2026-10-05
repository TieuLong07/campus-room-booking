import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Room } from "../types";
import { Feather } from "@expo/vector-icons";

export const ROOM_CARD_HEIGHT = 138;
export const ROOM_CARD_MARGIN_BOTTOM = 10;
export const TOTAL_ROOM_ITEM_HEIGHT = ROOM_CARD_HEIGHT + ROOM_CARD_MARGIN_BOTTOM;

interface RoomCardProps {
  room: Room;
  onPress: (roomId: string) => void;
}

const TYPE_CONFIG: Record<string, { label: string; border: string; bg: string; text: string }> = {
  STUDY_ROOM: { label: "Tự học", border: "#e4e4e7", bg: "#f4f4f5", text: "#27272a" },
  LAB: { label: "Lab thực hành", border: "#e4e4e7", bg: "#f4f4f5", text: "#09090b" },
  MEETING: { label: "Seminar & Họp", border: "#e4e4e7", bg: "#f4f4f5", text: "#27272a" },
};

const AMENITY_LABELS: Record<string, string> = {
  AC: "Điều hoà",
  PROJECTOR: "Máy chiếu",
  WHITEBOARD: "Bảng viết",
  HIGH_SPEC_PC: "PC cao cấp",
  MAC_MINI: "Mac Mini",
  POWER_OUTLETS: "Ổ cắm",
  WIFI: "Wifi",
  SOUNDPROOF: "Cách âm",
  SOUND_SYSTEM: "Âm thanh",
};

export const RoomCard: React.FC<RoomCardProps> = React.memo(({ room, onPress }) => {
  const typeBadge = TYPE_CONFIG[room.type] || {
    label: room.type,
    border: "#e4e4e7",
    bg: "#f4f4f5",
    text: "#52525b",
  };

  const amenitiesPreview = room.amenities
    .slice(0, 3)
    .map((a) => AMENITY_LABELS[a] || a)
    .join(" / ");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(room.id)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: room.imageUrl }} style={styles.thumbnail} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.codeText}>{room.code}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: typeBadge.bg, borderColor: typeBadge.border },
            ]}
          >
            <Text style={[styles.badgeText, { color: typeBadge.text }]}>
              {typeBadge.label}
            </Text>
          </View>
        </View>

        <Text style={styles.nameText} numberOfLines={1}>
          {room.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.locationText}>
            {room.building}, Tầng {room.floor}
          </Text>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.capacityWrapper}>
            <Feather name="users" size={11} color="#71717a" />
            <Text style={styles.capacityText}>{room.capacity} chỗ</Text>
          </View>
        </View>

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
    borderRadius: 9,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  thumbnail: {
    width: 114,
    height: "100%",
    backgroundColor: "#f4f4f5",
  },
  content: {
    flex: 1,
    padding: 12,
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
    color: "#09090b",
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#18181b",
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 11,
    color: "#71717a",
  },
  dotSeparator: {
    fontSize: 10,
    color: "#d4d4d8",
  },
  capacityWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  capacityText: {
    fontSize: 11,
    color: "#71717a",
    fontWeight: "500",
  },
  amenitiesText: {
    fontSize: 11,
    color: "#a1a1aa",
  },
});
