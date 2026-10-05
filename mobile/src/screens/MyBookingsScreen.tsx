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
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMyBookings, useCancelBooking } from "../api/client";
import { useUIStore } from "../stores/uiStore";
import { Booking, MainTabParamList, ROOM_TYPE_LABELS } from "../types";

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { data: bookings = [], isLoading, isRefetching, refetch } = useMyBookings();
  const cancelMutation = useCancelBooking();
  const showToast = useUIStore((s) => s.showToast);

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
              showToast("Đã huỷ lịch", `Lịch phòng ${booking.room?.code} đã được giải phóng.`, "info");
            } catch (err: any) {
              showToast("Lỗi", err.response?.data?.message || "Không thể huỷ lịch", "error");
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item, index }: { item: Booking; index: number }) => {
    const isCancelled = item.status === "CANCELLED";
    const typeLabel = ROOM_TYPE_LABELS[item.room?.type || ""] || item.room?.type || "Phòng học";

    return (
      <Animated.View
        entering={FadeInDown.duration(300).delay(Math.min(index * 40, 280)).springify()}
        style={[styles.ticketCard, isCancelled && styles.cardCancelled]}
      >
        {/* Ticket Header */}
        <View style={styles.cardHeader}>
          <View style={styles.codeGroup}>
            <Text style={[styles.roomCode, isCancelled && styles.textMuted]}>
              {item.room?.code || "PHÒNG"}
            </Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeLabel}</Text>
            </View>
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

        {/* Perforated Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
        </View>

        {/* Ticket Meta Details without nested box */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>NGÀY ĐẶT</Text>
            <View style={styles.metaValRow}>
              <Feather name="calendar" size={12} color="#71717a" />
              <Text style={styles.metaValue}>{item.bookingDate}</Text>
            </View>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>KHUNG GIỜ</Text>
            <View style={styles.metaValRow}>
              <Feather name="clock" size={12} color="#71717a" />
              <Text style={styles.metaValueBold}>
                {item.startTime} - {item.endTime}
              </Text>
            </View>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>VỊ TRÍ</Text>
            <Text style={styles.metaValue}>
              {item.room?.building} • T{item.room?.floor}
            </Text>
          </View>
        </View>

        {!isCancelled && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item)}
              activeOpacity={0.7}
            >
              <Feather name="x" size={12} color="#71717a" />
              <Text style={styles.cancelBtnText}>Huỷ lịch này</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
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
    paddingBottom: 84, // Tránh bị thanh bottom tab che mất thẻ cuối
    gap: 12,
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
  ticketCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  cardCancelled: {
    backgroundColor: "#fafafa",
    borderColor: "#e4e4e7",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roomCode: {
    fontSize: 16,
    fontWeight: "800",
    color: "#09090b",
    letterSpacing: -0.3,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#f4f4f5",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#52525b",
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
    color: "#18181b",
    marginTop: 4,
    letterSpacing: -0.1,
  },
  textMuted: {
    color: "#71717a",
  },
  dividerRow: {
    marginVertical: 10,
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  metaCol: {
    gap: 3,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#a1a1aa",
    letterSpacing: 0.5,
  },
  metaValRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaValue: {
    fontSize: 11,
    color: "#52525b",
    fontWeight: "500",
  },
  metaValueBold: {
    fontSize: 11,
    fontWeight: "700",
    color: "#09090b",
  },
  actionRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
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
