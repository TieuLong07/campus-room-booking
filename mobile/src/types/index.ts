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
