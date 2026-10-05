import axios from "axios";
import { Platform } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Room, TimeSlot, Booking } from "../types";

// Thay đổi LAN_IP nếu chạy Expo Go trên điện thoại thật
const LAN_IP = "192.168.1.3"; 
export const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:5000/api",
  ios: "http://localhost:5000/api",
  web: "http://localhost:5000/api",
  default: `http://${LAN_IP}:5000/api`,
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const useRooms = (filters: {
  search?: string;
  building?: string;
  type?: string;
  minCapacity?: number;
}) => {
  return useQuery<Room[]>({
    queryKey: ["rooms", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.building && filters.building !== "ALL") params.building = filters.building;
      if (filters.type && filters.type !== "ALL") params.type = filters.type;
      if (filters.minCapacity && filters.minCapacity > 0) params.minCapacity = filters.minCapacity;

      const res = await api.get("/rooms", { params });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 phút cache
  });
};

export const useRoom = (roomId: string) => {
  return useQuery<Room>({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const res = await api.get(`/rooms/${roomId}`);
      return res.data.data;
    },
    enabled: !!roomId,
  });
};

export const useRoomSlots = (roomId: string, date: string) => {
  return useQuery<{ slots: TimeSlot[]; date: string; roomId: string }>({
    queryKey: ["slots", roomId, date],
    queryFn: async () => {
      const res = await api.get(`/rooms/${roomId}/slots`, {
        params: { date },
      });
      return res.data;
    },
    enabled: !!roomId && !!date,
    refetchInterval: 15000, // Cập nhật realtime mỗi 15s để bắt slot mới bị đặt
  });
};

export interface CreateBookingPayload {
  roomId: string;
  userId: string;
  userName?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const res = await api.post("/bookings", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate slots của phòng đó và danh sách booking của sinh viên
      queryClient.invalidateQueries({
        queryKey: ["slots", variables.roomId, variables.bookingDate],
      });
      queryClient.invalidateQueries({
        queryKey: ["myBookings"],
      });
    },
  });
};

export const useMyBookings = (userId: string = "SV1024") => {
  return useQuery<Booking[]>({
    queryKey: ["myBookings", userId],
    queryFn: async () => {
      const res = await api.get("/bookings/my", { params: { userId } });
      return res.data.data;
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
};
