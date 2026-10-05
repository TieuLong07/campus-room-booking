import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useRooms } from "../api/client";
import { useFilterStore } from "../stores/filterStore";
import { FilterChips } from "../components/FilterChips";
import {
  RoomCard,
  TOTAL_ROOM_ITEM_HEIGHT,
} from "../components/RoomCard";
import { Room, RootStackParamList } from "../types";

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    searchQuery,
    setSearchQuery,
    selectedBuilding,
    selectedType,
    minCapacity,
    resetFilters,
  } = useFilterStore();

  const filterParams = useMemo(
    () => ({
      search: searchQuery,
      building: selectedBuilding,
      type: selectedType,
      minCapacity: minCapacity > 0 ? minCapacity : undefined,
    }),
    [searchQuery, selectedBuilding, selectedType, minCapacity]
  );

  const {
    data: rooms = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useRooms(filterParams);

  const handleRoomPress = useCallback(
    (roomId: string) => {
      navigation.navigate("RoomDetail", { roomId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Room; index: number }) => (
      <RoomCard room={item} index={index} onPress={handleRoomPress} />
    ),
    [handleRoomPress]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Room> | null | undefined, index: number) => ({
      length: TOTAL_ROOM_ITEM_HEIGHT,
      offset: TOTAL_ROOM_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#71717a" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã phòng hoặc tên (vd: A-201, AI, Mac)..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
              <Feather name="x" size={15} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <FilterChips />

      {/* Subheader status */}
      {!isLoading && !error && (
        <View style={styles.countBar}>
          <Text style={styles.countText}>
            Hiển thị {rooms.length} không gian khả dụng
          </Text>
        </View>
      )}

      {/* Content Feed */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#09090b" />
          <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không thể kết nối máy chủ.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Thử tải lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
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
              <Feather name="inbox" size={32} color="#a1a1aa" />
              <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
              <Text style={styles.emptySubtitle}>
                Thử thay đổi từ khoá hoặc điều chỉnh lại các tiêu chí bộ lọc.
              </Text>
              <TouchableOpacity
                onPress={resetFilters}
                style={styles.emptyResetBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyResetText}>Đặt lại bộ lọc</Text>
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
  },
  searchBox: {
    height: 40,
    backgroundColor: "#f4f4f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#09090b",
    paddingVertical: 0,
  },
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
    letterSpacing: -0.1,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 84, // Tránh bị thanh bottom tab che mất thẻ cuối
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#71717a",
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#09090b",
  },
  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
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
    maxWidth: 260,
  },
  emptyResetBtn: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#ffffff",
  },
  emptyResetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#09090b",
  },
});
