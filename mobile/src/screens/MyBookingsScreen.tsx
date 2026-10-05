import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useMyBookings, useCancelBooking } from "../api/client";
import { Booking } from "../types";

export const MyBookingsScreen: React.FC = () => {
  const { data: bookings = [], isLoading, isRefetching, refetch } = useMyBookings();
  const cancelMutation = useCancelBooking();

  const handleCancel = (booking: Booking) => {
    Alert.alert(
      "Xác nhận huỷ lịch",
      `Bạn có chắc chắn muốn huỷ lịch đặt phòng ${booking.room?.name || ""} ngày ${booking.bookingDate} (${booking.startTime} - ${booking.endTime}) không?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Huỷ lịch",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(booking.id);
              Alert.alert("Thành công", "Đã huỷ lịch đặt phòng.");
            } catch (err: any) {
              Alert.alert("Lỗi", err.response?.data?.message || "Không thể huỷ lịch");
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isCancelled = item.status === "CANCELLED";

    return (
      <View style={[styles.card, isCancelled && styles.cardCancelled]}>
        <View style={styles.cardHeader}>
          <Text style={styles.roomCode}>{item.room?.code || "Phòng"}</Text>
          <View
            style={[
              styles.statusBadge,
              isCancelled ? styles.statusBadgeCancelled : styles.statusBadgeConfirmed,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCancelled ? styles.statusTextCancelled : styles.statusTextConfirmed,
              ]}
            >
              {isCancelled ? "Đã huỷ" : "Đã xác nhận"}
            </Text>
          </View>
        </View>

        <Text style={styles.roomName}>{item.room?.name || "Phòng học cơ sở"}</Text>
        <Text style={styles.detailText}>
          Ngày: {item.bookingDate} | Giờ: {item.startTime} - {item.endTime}
        </Text>
        <Text style={styles.subDetailText}>
          {item.room?.building} • Tầng {item.room?.floor}
        </Text>

        {!isCancelled && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Huỷ lịch này</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải lịch đặt phòng...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Chưa có lịch đặt phòng nào</Text>
              <Text style={styles.emptySubtitle}>
                Chuyển qua tab "Khám phá" để chọn phòng và khung giờ phù hợp
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardCancelled: {
    backgroundColor: "#f8fafc",
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeConfirmed: {
    backgroundColor: "#dcfce7",
  },
  statusBadgeCancelled: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusTextConfirmed: {
    color: "#15803d",
  },
  statusTextCancelled: {
    color: "#b91c1c",
  },
  roomName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2563eb",
    marginTop: 6,
  },
  subDetailText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fca5a5",
    backgroundColor: "#fff1f2",
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#b91c1c",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },
});
