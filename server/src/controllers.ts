import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { CAMPUS_SLOTS } from "./types";
import { z } from "zod";

export const getRooms = async (req: Request, res: Response) => {
  try {
    const { search, building, type, minCapacity } = req.query;

    const where: Prisma.RoomWhereInput = { isActive: true };

    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { code: { contains: q } },
      ];
    }

    if (building && typeof building === "string" && building !== "ALL") {
      where.building = building;
    }

    if (type && typeof type === "string" && type !== "ALL") {
      where.type = type;
    }

    if (minCapacity && !isNaN(Number(minCapacity))) {
      where.capacity = { gte: Number(minCapacity) };
    }

    const rooms = await prisma.room.findMany({
      where,
      orderBy: { code: "asc" },
    });

    const parsedRooms = rooms.map((r) => ({
      ...r,
      amenities: JSON.parse(r.amenities),
    }));

    res.json({ success: true, data: parsedRooms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    }

    res.json({
      success: true,
      data: {
        ...room,
        amenities: JSON.parse(room.amenities),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomSlots = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({ success: false, message: "Thiếu tham số ngày (YYYY-MM-DD)" });
    }

    // Lấy các booking đã xác nhận của phòng trong ngày đó
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: id,
        bookingDate: date,
        status: "CONFIRMED",
      },
    });

    // Map các slots tiêu chuẩn với trạng thái đã đặt hay chưa
    const slots = CAMPUS_SLOTS.map((slot) => {
      // Conflict check: slot.startTime < b.endTime && slot.endTime > b.startTime
      const matchedBooking = bookings.find(
        (b) => slot.startTime < b.endTime && slot.endTime > b.startTime
      );

      return {
        ...slot,
        isBooked: !!matchedBooking,
        bookingId: matchedBooking ? matchedBooking.id : null,
        bookedBy: matchedBooking ? matchedBooking.userName : null,
      };
    });

    res.json({
      success: true,
      date,
      roomId: id,
      slots,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBookingSchema = z.object({
  roomId: z.string().min(1, "Room ID không được để trống"),
  userId: z.string().min(1, "User ID không được để trống"),
  userName: z.string().optional().default("Sinh viên Đại học"),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày phải là YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng giờ phải là HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng giờ phải là HH:mm"),
});

export const createBooking = async (req: Request, res: Response) => {
  try {
    const validation = createBookingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
        errors: validation.error.format(),
      });
    }

    const { roomId, userId, userName, bookingDate, startTime, endTime } = validation.data;

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Giờ bắt đầu phải nhỏ hơn giờ kết thúc",
      });
    }

    // Transaction xử lý phòng tránh xung đột (Conflict Prevention)
    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: roomId },
      });

      if (!room || !room.isActive) {
        throw new Error("ROOM_NOT_AVAILABLE");
      }

      // Tìm booking trùng khung giờ: startA < endB && endA > startB
      const overlappingBookings = await tx.booking.findMany({
        where: {
          roomId,
          bookingDate,
          status: "CONFIRMED",
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (overlappingBookings.length > 0) {
        throw new Error("SLOT_CONFLICT");
      }

      // Tạo booking mới
      const newBooking = await tx.booking.create({
        data: {
          roomId,
          userId,
          userName,
          bookingDate,
          startTime,
          endTime,
          status: "CONFIRMED",
        },
        include: {
          room: true,
        },
      });

      return newBooking;
    });

    res.status(201).json({
      success: true,
      message: "Đặt phòng thành công!",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "SLOT_CONFLICT") {
      return res.status(409).json({
        success: false,
        code: "SLOT_CONFLICT",
        message: "Khung giờ này vừa có người khác đặt trước. Vui lòng chọn khung giờ khác!",
      });
    }

    if (error.message === "ROOM_NOT_AVAILABLE") {
      return res.status(404).json({
        success: false,
        message: "Phòng học hiện không khả dụng hoặc không tồn tại.",
      });
    }

    res.status(500).json({ success: false, message: error.message || "Lỗi máy chủ" });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const targetUserId = typeof userId === "string" ? userId : "SV1024";

    const bookings = await prisma.booking.findMany({
      where: {
        userId: targetUserId,
      },
      include: {
        room: true,
      },
      orderBy: [
        { bookingDate: "desc" },
        { startTime: "desc" },
      ],
    });

    const formatted = bookings.map((b) => ({
      ...b,
      room: {
        ...b.room,
        amenities: JSON.parse(b.room.amenities),
      },
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch đặt" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json({
      success: true,
      message: "Đã huỷ lịch đặt phòng thành công",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
