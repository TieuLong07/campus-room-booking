import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { useRoom, useRoomSlots, useCreateBooking } from "../api/client";
import { TimeSlotPicker } from "../components/TimeSlotPicker";
import { RootStackParamList, TimeSlot } from "../types";

type RoomDetailRouteProp = RouteProp<RootStackParamList, "RoomDetail">;

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<RoomDetailRouteProp>();
  const navigation = useNavigation();
  const { roomId } = route.params;

  // Ngày đặt: Mặc định là ngày hôm nay dạng YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);
  const dayAfterStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const { data: room, isLoading: isLoadingRoom } = useRoom(roomId);
  const { data: slotData, isLoading: isLoadingSlots, refetch: refetchSlots } = useRoomSlots(
    roomId,
    selectedDate
  );

  const bookingMutation = useCreateBooking();

  const handleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert("Thông báo", "Vui lòng chọn một khung giờ khả dụng");
      return;
    }

    try {
      await bookingMutation.mutateAsync({
        roomId,
        userId: "SV1024",
        userName: "Nguyễn Hoàng Long (SV1024)",
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      Alert.alert(
        "Đặt phòng thành công",
        `Đã đặt ${room?.name} vào khung giờ ${selectedSlot.startTime} - ${selectedSlot.endTime} ngày ${selectedDate}`,
        [
          {
            text: "Xem lịch của tôi",
            onPress: () => {
              navigation.goBack();
            },
          },
          { text: "Đóng", style: "cancel" },
        ]
      );
      setSelectedSlot(null);
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert(
          "Xung đột lịch đặt",
          err.response?.data?.message ||
            "Khung giờ này vừa bị sinh viên khác đặt trước. Vui lòng chọn khung giờ khác!"
        );
        refetchSlots();
        setSelectedSlot(null);
      } else {
        Alert.alert("Lỗi", err.response?.data?.message || "Không thể hoàn tất đặt phòng");
      }
    }
  };

  if (isLoadingRoom || !room) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: room.imageUrl }} style={styles.bannerImage} />

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <Text style={styles.codeText}>{room.code}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{room.type}</Text>
            </View>
          </View>

          <Text style={styles.title}>{room.name}</Text>
          <Text style={styles.subtitle}>
            {room.building} • Tầng {room.floor} • Sức chứa tối đa: {room.capacity} sinh viên
          </Text>

          {/* Tiện ích */}
          <Text style={styles.sectionTitle}>Trang thiết bị & Tiện ích</Text>
          <View style={styles.amenitiesContainer}>
            {room.amenities.map((item, idx) => (
              <View key={idx} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Chọn ngày */}
          <Text style={styles.sectionTitle}>Chọn ngày đặt</Text>
          <View style={styles.dateSelector}>
            {[
              { label: "Hôm nay", value: todayStr },
              { label: "Ngày mai", value: tomorrowStr },
              { label: "Ngày kia", value: dayAfterStr },
            ].map((d) => {
              const isSelected = selectedDate === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.dateButton, isSelected && styles.dateButtonActive]}
                  onPress={() => {
                    setSelectedDate(d.value);
                    setSelectedSlot(null);
                  }}
                >
                  <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>
                    {d.label}
                  </Text>
                  <Text style={[styles.dateSubText, isSelected && styles.dateSubTextActive]}>
                    {d.value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Chọn slot với Conflict Prevention */}
          <View style={styles.slotHeaderRow}>
            <Text style={styles.sectionTitle}>Khung giờ trong ngày</Text>
            <TouchableOpacity onPress={() => refetchSlots()}>
              <Text style={styles.refreshText}>Làm mới slot</Text>
            </TouchableOpacity>
          </View>

          {isLoadingSlots ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 20 }} />
          ) : (
            <TimeSlotPicker
              slots={slotData?.slots || []}
              selectedSlotId={selectedSlot?.id || null}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          )}
        </View>
      </ScrollView>

      {/* Booking Action Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Khung giờ đã chọn:</Text>
          <Text style={styles.footerValue}>
            {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "Chưa chọn"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedSlot || bookingMutation.isPending) && styles.bookButtonDisabled,
          ]}
          disabled={!selectedSlot || bookingMutation.isPending}
          onPress={handleBooking}
        >
          {bookingMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.bookButtonText}>Xác nhận đặt phòng</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#cbd5e1",
  },
  content: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  typeBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: "#0369a1",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 20,
    marginBottom: 10,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 12,
    color: "#475569",
  },
  dateSelector: {
    flexDirection: "row",
    gap: 8,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  dateButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  dateTextActive: {
    color: "#2563eb",
  },
  dateSubText: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  dateSubTextActive: {
    color: "#3b82f6",
  },
  slotHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  footerValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  bookButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
