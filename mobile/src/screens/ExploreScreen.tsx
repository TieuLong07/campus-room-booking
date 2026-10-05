import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

  // 60fps Optimization: renderItem callback tách rời, memoized
  const renderItem = useCallback(
    ({ item }: { item: Room }) => (
      <RoomCard room={item} onPress={handleRoomPress} />
    ),
    [handleRoomPress]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  // 60fps Optimization: Fixed layout để FlatList không phải tính toán kích thước dynamic
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: TOTAL_ROOM_ITEM_HEIGHT,
      offset: TOTAL_ROOM_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm phòng theo tên hoặc mã (vd: A-201, Lab...)"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      {/* Multi-parameter Filter Chips */}
      <FilterChips />

      {/* Content Feed */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không thể kết nối máy chủ backend.</Text>
          <Text style={styles.retryText} onPress={() => refetch()}>
            Nhấn vào đây để thử lại
          </Text>
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
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
              <Text style={styles.emptySubtitle}>
                Thử đổi từ khoá tìm kiếm hoặc reset các bộ lọc
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
  },
  searchInput: {
    height: 42,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748b",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
  },
  retryText: {
    marginTop: 8,
    fontSize: 13,
    color: "#2563eb",
    textDecorationLine: "underline",
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
