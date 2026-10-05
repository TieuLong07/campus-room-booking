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
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useMyBookings, useCancelBooking } from "../api/client";
import { Booking } from "../types";

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { data: bookings = [], isLoading, isRefetching, refetch } = useMyBookings();
  const cancelMutation = useCancelBooking();

  const handleCancel = (booking: Booking) => {
    Alert.alert(
      "Huỷ lịch đặt phòng",
      `Bạn có chắc chắn muốn huỷ lịch phòng ${booking.room?.code || ""} ngày ${booking.bookingDate} (${booking.startTime} - ${booking.endTime})?`,
      [
        { text: "Đóng", style: "cancel" },
        {
          text: "Xác nhận huỷ",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(booking.id);
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
          <View style={styles.codeGroup}>
            <Text style={[styles.roomCode, isCancelled && styles.textMuted]}>
              {item.room?.code || "PHÒNG"}
            </Text>
            <Text style={styles.roomType}>{item.room?.type || "STUDY"}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isCancelled ? styles.statusBadgeCancelled : styles.statusBadgeConfirmed,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isCancelled ? styles.dotCancelled : styles.dotConfirmed,
              ]}
            />
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

        <Text style={[styles.roomName, isCancelled && styles.textMuted]}>
          {item.room?.name || "Không gian campus"}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={12} color="#71717a" />
            <Text style={styles.infoText}>{item.bookingDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="clock" size={12} color="#71717a" />
            <Text style={styles.infoTextBold}>
              {item.startTime} - {item.endTime}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.locationText}>
            {item.room?.building}, Tầng {item.room?.floor}
          </Text>

          {!isCancelled && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item)}
              activeOpacity={0.7}
            >
              <Feather name="x" size={12} color="#71717a" />
              <Text style={styles.cancelBtnText}>Huỷ lịch</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#09090b" />
          <Text style={styles.loadingText}>Đang tải lịch đặt...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#09090b"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={32} color="#a1a1aa" />
              <Text style={styles.emptyTitle}>Chưa có lịch đặt phòng</Text>
              <Text style={styles.emptySubtitle}>
                Chọn phòng và khung giờ trống để đăng ký sử dụng không gian.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Explore")}
                style={styles.emptyExploreBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyExploreText}>Khám phá phòng học</Text>
              </TouchableOpacity>
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
    backgroundColor: "#fafafa",
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#71717a",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  cardCancelled: {
    backgroundColor: "#fcfcfc",
    borderColor: "#f4f4f5",
    opacity: 0.65,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeGroup: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  roomCode: {
    fontSize: 16,
    fontWeight: "800",
    color: "#09090b",
    letterSpacing: -0.3,
  },
  roomType: {
    fontSize: 10,
    fontWeight: "600",
    color: "#a1a1aa",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  statusBadgeConfirmed: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statusBadgeCancelled: {
    backgroundColor: "#f4f4f5",
    borderColor: "#e4e4e7",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotConfirmed: {
    backgroundColor: "#16a34a",
  },
  dotCancelled: {
    backgroundColor: "#a1a1aa",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  statusTextConfirmed: {
    color: "#16a34a",
  },
  statusTextCancelled: {
    color: "#71717a",
  },
  roomName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#27272a",
    marginTop: 4,
    letterSpacing: -0.1,
  },
  textMuted: {
    color: "#71717a",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontSize: 12,
    color: "#52525b",
  },
  infoTextBold: {
    fontSize: 12,
    fontWeight: "600",
    color: "#09090b",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  locationText: {
    fontSize: 11,
    color: "#71717a",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#ffffff",
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#18181b",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 250,
  },
  emptyExploreBtn: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#09090b",
  },
  emptyExploreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
});
