import assert from "node:assert";
import { prisma } from "./src/db";

async function runSelfCheck() {
  console.log("--- BẮT ĐẦU TEST LOGIC CONFLICT PREVENTION ---");

  // 1. Lấy 1 phòng test
  const room = await prisma.room.findFirst({ where: { code: "A-201" } });
  assert(room, "Phải tìm thấy phòng A-201");

  const testDate = "2026-10-15";
  const testUserId = "SV1024";

  // Dọn dẹp test cũ nếu có
  await prisma.booking.deleteMany({
    where: { roomId: room.id, bookingDate: testDate },
  });

  // 2. Tạo Booking 1: 08:45 - 10:15
  const b1 = await prisma.booking.create({
    data: {
      roomId: room.id,
      userId: testUserId,
      userName: "Tiểu Long",
      bookingDate: testDate,
      startTime: "08:45",
      endTime: "10:15",
      status: "CONFIRMED",
    },
  });
  assert(b1.id, "Booking 1 tạo thành công");
  console.log("✓ Tạo Booking 1 (08:45 - 10:15) thành công");

  // Helper check conflict
  async function attemptBooking(start: string, end: string) {
    const overlapping = await prisma.booking.findMany({
      where: {
        roomId: room!.id,
        bookingDate: testDate,
        status: "CONFIRMED",
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    return overlapping.length > 0;
  }

  // 3. Test trùng hoàn toàn: 08:45 - 10:15
  const isConflictExact = await attemptBooking("08:45", "10:15");
  assert.strictEqual(isConflictExact, true, "Trùng khớp chính xác phải bị chặn");
  console.log("✓ Test Trùng chính xác: BỊ CHẶN (PASS)");

  // 4. Test giao nhau phần đầu: 08:00 - 09:00 (giao nhau 08:45-09:00)
  const isConflictOverlapStart = await attemptBooking("08:00", "09:00");
  assert.strictEqual(isConflictOverlapStart, true, "Giao nhau phần đầu phải bị chặn");
  console.log("✓ Test Giao nhau phần đầu: BỊ CHẶN (PASS)");

  // 5. Test giao nhau phần đuôi: 10:00 - 11:30 (giao nhau 10:00-10:15)
  const isConflictOverlapEnd = await attemptBooking("10:00", "11:30");
  assert.strictEqual(isConflictOverlapEnd, true, "Giao nhau phần đuôi phải bị chặn");
  console.log("✓ Test Giao nhau phần đuôi: BỊ CHẶN (PASS)");

  // 6. Test nằm trọn bên trong: 09:00 - 09:30
  const isConflictInside = await attemptBooking("09:00", "09:30");
  assert.strictEqual(isConflictInside, true, "Nằm bên trong phải bị chặn");
  console.log("✓ Test Nằm trọn bên trong: BỊ CHẶN (PASS)");

  // 7. Test khung giờ liền kề KHÔNG trùng: 07:00 - 08:45
  const isConflictAdjacentBefore = await attemptBooking("07:00", "08:45");
  assert.strictEqual(isConflictAdjacentBefore, false, "Khung giờ trước liền kề không bị trùng");
  console.log("✓ Test Liền kề trước (07:00 - 08:45): HỢP LỆ (PASS)");

  // 8. Test khung giờ sau liền kề KHÔNG trùng: 10:15 - 11:45
  const isConflictAdjacentAfter = await attemptBooking("10:15", "11:45");
  assert.strictEqual(isConflictAdjacentAfter, false, "Khung giờ sau liền kề không bị trùng");
  console.log("✓ Test Liền kề sau (10:15 - 11:45): HỢP LỆ (PASS)");

  // Dọn dẹp dữ liệu test
  await prisma.booking.deleteMany({
    where: { roomId: room.id, bookingDate: testDate },
  });

  console.log("\n TẤT CẢ CHECK CONFLICT PREVENTION ĐÃ ĐẠT 100%!");
}

runSelfCheck()
  .catch((err) => {
    console.error("Test thất bại:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
