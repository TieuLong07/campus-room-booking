import React, { useCallback } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { Room, ROOM_TYPE_LABELS, AMENITY_LABELS } from "../types";
import { Feather } from "@expo/vector-icons";

export const ROOM_CARD_HEIGHT = 138;
export const ROOM_CARD_MARGIN_BOTTOM = 10;
export const TOTAL_ROOM_ITEM_HEIGHT = ROOM_CARD_HEIGHT + ROOM_CARD_MARGIN_BOTTOM;

interface RoomCardProps {
  room: Room;
  index: number;
  onPress: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = React.memo(({ room, index, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.985, { damping: 15, stiffness: 250 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 250 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
    }),
    [scale]
  );

  const typeLabel = ROOM_TYPE_LABELS[room.type] || room.type;

  const amenitiesPreview = room.amenities
    .slice(0, 3)
    .map((a) => AMENITY_LABELS[a] || a)
    .join(" / ");

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(Math.min(index * 40, 280)).springify().damping(16)}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          style={styles.card}
          onPress={() => onPress(room.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Image source={{ uri: room.imageUrl }} style={styles.thumbnail} />

          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.codeText}>{room.code}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{typeLabel}</Text>
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
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    height: ROOM_CARD_HEIGHT,
    marginBottom: ROOM_CARD_MARGIN_BOTTOM,
    marginHorizontal: 16,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
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
    borderColor: "#e4e4e7",
    backgroundColor: "#f4f4f5",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#18181b",
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
    color: "#71717a", // WCAG AA 4.6:1 contrast against #ffffff
  },
});
