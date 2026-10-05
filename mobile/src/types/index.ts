export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: "STUDY_ROOM" | "LAB" | "MEETING";
  amenities: string[];
  imageUrl: string;
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  isBooked: boolean;
  bookingId: string | null;
  bookedBy: string | null;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  room?: Room;
}

export type RootStackParamList = {
  MainTabs: undefined;
  RoomDetail: { roomId: string };
};

export type MainTabParamList = {
  Explore: undefined;
  MyBookings: undefined;
};

export const ROOM_TYPE_LABELS: Record<string, string> = {
  STUDY_ROOM: "Phòng tự học",
  LAB: "Lab thực hành",
  MEETING: "Seminar & Họp",
};

export const AMENITY_LABELS: Record<string, string> = {
  AC: "Điều hoà không khí",
  PROJECTOR: "Máy chiếu",
  WHITEBOARD: "Bảng viết",
  HIGH_SPEC_PC: "Dàn PC cấu hình cao",
  MAC_MINI: "Dàn Mac Mini",
  POWER_OUTLETS: "Ổ cắm điện",
  WIFI: "Wifi tốc độ cao",
  SOUNDPROOF: "Cách âm tiêu chuẩn",
  SOUND_SYSTEM: "Hệ thống âm thanh",
  CISCO_RACKS: "Tủ mạng Cisco",
  LAN: "Cổng mạng LAN",
  TV_MONITOR: "Màn hình TV 65 inch",
  CAMERA_LIGHTS: "Camera & Đèn trợ sáng",
};

export const CAMPUS_SLOTS = [
  { id: "slot-1", startTime: "07:00", endTime: "08:30", label: "Tiết 1-2 (07:00 - 08:30)" },
  { id: "slot-2", startTime: "08:45", endTime: "10:15", label: "Tiết 3-4 (08:45 - 10:15)" },
  { id: "slot-3", startTime: "10:30", endTime: "12:00", label: "Tiết 5-6 (10:30 - 12:00)" },
  { id: "slot-4", startTime: "12:30", endTime: "14:00", label: "Tiết 7-8 (12:30 - 14:00)" },
  { id: "slot-5", startTime: "14:15", endTime: "15:45", label: "Tiết 9-10 (14:15 - 15:45)" },
  { id: "slot-6", startTime: "16:00", endTime: "17:30", label: "Tiết 11-12 (16:00 - 17:30)" },
  { id: "slot-7", startTime: "18:00", endTime: "20:00", label: "Tối (18:00 - 20:00)" },
];
