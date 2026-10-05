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
