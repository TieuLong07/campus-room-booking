import axios from "axios";
import { Platform } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Room, TimeSlot, Booking, CAMPUS_SLOTS } from "../types";
import { supabase, SUPABASE_URL } from "./supabase";

// Kiểm tra xem Supabase đã được cấu hình với URL thật chưa
export const isSupabaseConfigured = () => {
  return SUPABASE_URL && !SUPABASE_URL.includes("your-project.supabase.co");
};

// Cấu hình Express fallback khi chạy local
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
      // 1. Chạy qua Supabase Cloud
      if (isSupabaseConfigured()) {
        let query = supabase
          .from("rooms")
          .select("*")
          .eq("is_active", true)
          .order("code", { ascending: true });

        if (filters.search && filters.search.trim() !== "") {
          const q = filters.search.trim();
          query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
        }

        if (filters.building && filters.building !== "ALL") {
          query = query.eq("building", filters.building);
        }

        if (filters.type && filters.type !== "ALL") {
          query = query.eq("type", filters.type);
        }

        if (filters.minCapacity && filters.minCapacity > 0) {
          query = query.gte("capacity", filters.minCapacity);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((r: any) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          building: r.building,
          floor: r.floor,
          capacity: r.capacity,
          type: r.type,
          amenities: typeof r.amenities === "string" ? JSON.parse(r.amenities) : r.amenities,
          imageUrl: r.image_url,
          isActive: r.is_active,
        }));
      }

      // 2. Chạy qua Express Server Fallback
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.building && filters.building !== "ALL") params.building = filters.building;
      if (filters.type && filters.type !== "ALL") params.type = filters.type;
      if (filters.minCapacity && filters.minCapacity > 0) params.minCapacity = filters.minCapacity;

      const res = await api.get("/rooms", { params });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useRoom = (roomId: string) => {
  return useQuery<Room>({
    queryKey: ["room", roomId],
    queryFn: async () => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        if (error) throw error;
        return {
          id: data.id,
          code: data.code,
          name: data.name,
          building: data.building,
          floor: data.floor,
          capacity: data.capacity,
          type: data.type,
          amenities: typeof data.amenities === "string" ? JSON.parse(data.amenities) : data.amenities,
          imageUrl: data.image_url,
          isActive: data.is_active,
        };
      }

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
      if (isSupabaseConfigured()) {
        const { data: bookings, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("room_id", roomId)
          .eq("booking_date", date)
          .eq("status", "CONFIRMED");

        if (error) throw error;

        const slots = CAMPUS_SLOTS.map((slot) => {
          const matchedBooking = (bookings || []).find(
            (b: any) => slot.startTime < b.end_time && slot.endTime > b.start_time
          );

          return {
            ...slot,
            isBooked: !!matchedBooking,
            bookingId: matchedBooking ? matchedBooking.id : null,
            bookedBy: matchedBooking ? matchedBooking.user_name : null,
          };
        });

        return { slots, date, roomId };
      }

      const res = await api.get(`/rooms/${roomId}/slots`, {
        params: { date },
      });
      return res.data;
    },
    enabled: !!roomId && !!date,
    refetchInterval: 15000,
  });
};

export interface CreateBookingPayload {
  roomId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("bookings")
          .insert({
            room_id: payload.roomId,
            user_id: payload.userId,
            user_name: payload.userName || "Sinh viên",
            user_email: payload.userEmail || null,
            booking_date: payload.bookingDate,
            start_time: payload.startTime,
            end_time: payload.endTime,
            status: "CONFIRMED",
          })
          .select()
          .single();

        if (error) {
          // Bắt lỗi trigger xung đột từ PostgreSQL
          if (error.message.includes("SLOT_CONFLICT")) {
            const conflictErr: any = new Error("Khung giờ này vừa có người khác đặt trước. Vui lòng chọn khung giờ khác!");
            conflictErr.response = {
              status: 409,
              data: { message: "Khung giờ này vừa có người khác đặt trước. Vui lòng chọn khung giờ khác!" },
            };
            throw conflictErr;
          }
          throw error;
        }

        return data;
      }

      const res = await api.post("/bookings", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
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
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("bookings")
          .select("*, room:rooms(*)")
          .eq("user_id", userId)
          .order("booking_date", { ascending: false })
          .order("start_time", { ascending: false });

        if (error) throw error;

        return (data || []).map((b: any) => ({
          id: b.id,
          roomId: b.room_id,
          userId: b.user_id,
          userName: b.user_name,
          bookingDate: b.booking_date,
          startTime: b.start_time,
          endTime: b.end_time,
          status: b.status,
          createdAt: b.created_at,
          room: b.room
            ? {
                id: b.room.id,
                code: b.room.code,
                name: b.room.name,
                building: b.room.building,
                floor: b.room.floor,
                capacity: b.room.capacity,
                type: b.room.type,
                amenities:
                  typeof b.room.amenities === "string"
                    ? JSON.parse(b.room.amenities)
                    : b.room.amenities,
                imageUrl: b.room.image_url,
                isActive: b.room.is_active,
              }
            : undefined,
        }));
      }

      const res = await api.get("/bookings/my", { params: { userId } });
      return res.data.data;
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("bookings")
          .update({ status: "CANCELLED" })
          .eq("id", bookingId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      const res = await api.post(`/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
};
