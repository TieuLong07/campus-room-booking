import { Router } from "express";
import {
  getRooms,
  getRoomById,
  getRoomSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
} from "./controllers";

export const apiRouter = Router();

apiRouter.get("/rooms", getRooms);
apiRouter.get("/rooms/:id", getRoomById);
apiRouter.get("/rooms/:id/slots", getRoomSlots);
apiRouter.post("/bookings", createBooking);
apiRouter.get("/bookings/my", getMyBookings);
apiRouter.post("/bookings/:id/cancel", cancelBooking);
