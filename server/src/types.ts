export interface TimeSlotConfig {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  label: string;
}

export const CAMPUS_SLOTS: TimeSlotConfig[] = [
  { id: "slot-1", startTime: "07:00", endTime: "08:30", label: "Tiết 1-2 (07:00 - 08:30)" },
  { id: "slot-2", startTime: "08:45", endTime: "10:15", label: "Tiết 3-4 (08:45 - 10:15)" },
  { id: "slot-3", startTime: "10:30", endTime: "12:00", label: "Tiết 5-6 (10:30 - 12:00)" },
  { id: "slot-4", startTime: "12:30", endTime: "14:00", label: "Tiết 7-8 (12:30 - 14:00)" },
  { id: "slot-5", startTime: "14:15", endTime: "15:45", label: "Tiết 9-10 (14:15 - 15:45)" },
  { id: "slot-6", startTime: "16:00", endTime: "17:30", label: "Tiết 11-12 (16:00 - 17:30)" },
  { id: "slot-7", startTime: "18:00", endTime: "20:00", label: "Tối (18:00 - 20:00)" },
];
