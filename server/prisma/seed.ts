import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding campus room database...");

  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();

  const rooms = [
    {
      code: "A-201",
      name: "Phòng Tự Học Nhóm A201",
      building: "Toà A",
      floor: 2,
      capacity: 6,
      type: "STUDY_ROOM",
      amenities: JSON.stringify(["AC", "WHITEBOARD", "POWER_OUTLETS", "WIFI"]),
      imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "A-202",
      name: "Phòng Thảo Luận Nhanh A202",
      building: "Toà A",
      floor: 2,
      capacity: 4,
      type: "STUDY_ROOM",
      amenities: JSON.stringify(["AC", "WHITEBOARD", "WIFI"]),
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "A-405",
      name: "Lab Trí Tuệ Nhân Tạo & Data",
      building: "Toà A",
      floor: 4,
      capacity: 30,
      type: "LAB",
      amenities: JSON.stringify(["AC", "PROJECTOR", "HIGH_SPEC_PC", "WHITEBOARD", "LAN"]),
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "B-101",
      name: "Phòng Seminar Sáng Tạo B101",
      building: "Toà B",
      floor: 1,
      capacity: 20,
      type: "MEETING",
      amenities: JSON.stringify(["AC", "PROJECTOR", "SOUND_SYSTEM", "WHITEBOARD", "WIFI"]),
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "B-302",
      name: "Lab Mạng & An Toàn Thông Tin",
      building: "Toà B",
      floor: 3,
      capacity: 25,
      type: "LAB",
      amenities: JSON.stringify(["AC", "PROJECTOR", "CISCO_RACKS", "HIGH_SPEC_PC", "LAN"]),
      imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "B-304",
      name: "Phòng Nghiên Cứu Chuyên Sâu B304",
      building: "Toà B",
      floor: 3,
      capacity: 8,
      type: "STUDY_ROOM",
      amenities: JSON.stringify(["AC", "WHITEBOARD", "POWER_OUTLETS", "TV_MONITOR"]),
      imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "C-102",
      name: "Lab Lập Trình Di Động & Đa Nền Tảng",
      building: "Toà C",
      floor: 1,
      capacity: 35,
      type: "LAB",
      amenities: JSON.stringify(["AC", "PROJECTOR", "MAC_MINI", "POWER_OUTLETS", "LAN"]),
      imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "C-201",
      name: "Không Gian Tự Học Tầng 2 Toà C",
      building: "Toà C",
      floor: 2,
      capacity: 12,
      type: "STUDY_ROOM",
      amenities: JSON.stringify(["AC", "WHITEBOARD", "POWER_OUTLETS", "WIFI"]),
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "LIB-301",
      name: "Phòng Học Nhóm Yên Tĩnh Thư Viện",
      building: "Thư Viện",
      floor: 3,
      capacity: 6,
      type: "STUDY_ROOM",
      amenities: JSON.stringify(["AC", "WHITEBOARD", "SOUNDPROOF", "POWER_OUTLETS"]),
      imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "LIB-302",
      name: "Studio Thu Âm & Trình Chiếu Thư Viện",
      building: "Thư Viện",
      floor: 3,
      capacity: 10,
      type: "MEETING",
      amenities: JSON.stringify(["AC", "PROJECTOR", "SOUNDPROOF", "CAMERA_LIGHTS"]),
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    }
  ];

  for (const r of rooms) {
    await prisma.room.create({ data: r });
  }

  // Tạo sẵn 1 vài booking mẫu để test conflict
  const roomA201 = await prisma.room.findUnique({ where: { code: "A-201" } });
  if (roomA201) {
    const today = new Date().toISOString().split("T")[0];
    await prisma.booking.create({
      data: {
        roomId: roomA201.id,
        userId: "SV9999",
        userName: "Nguyễn Văn An",
        bookingDate: today,
        startTime: "09:00",
        endTime: "11:00",
        status: "CONFIRMED"
      }
    });
  }

  console.log("Seed completed successfully with 10 rooms and initial sample bookings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
