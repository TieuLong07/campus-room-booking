import { create } from "zustand";
import { TimeSlot } from "../types";

interface BookingDraftState {
  roomId: string | null;
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  setDraftRoom: (roomId: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: TimeSlot | null) => void;
  clearDraft: () => void;
}

const getTodayString = () => new Date().toISOString().split("T")[0];

export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  roomId: null,
  selectedDate: getTodayString(),
  selectedSlot: null,

  setDraftRoom: (roomId) => set({ roomId, selectedSlot: null }),
  setSelectedDate: (selectedDate) => set({ selectedDate, selectedSlot: null }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  clearDraft: () =>
    set({
      roomId: null,
      selectedDate: getTodayString(),
      selectedSlot: null,
    }),
}));
