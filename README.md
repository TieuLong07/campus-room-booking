# Campus Room & Lab Booking App (Mini-Project 2)

Ứng dụng di động đặt phòng tự học, phòng họp seminar và phòng lab thực hành trong khuôn viên trường đại học (Campus Room & Lab Booking).

---

## 1. Yêu cầu & Công nghệ (Tech Stack)

| Thành phần | Công nghệ được chọn | Chi tiết & Mục đích |
| :--- | :--- | :--- |
| **Framework** | **React Native + Expo (Managed SDK 57)** | Chuẩn hóa cross-platform, phát triển và chạy nhanh qua Expo Go. |
| **Language** | **TypeScript (Strict Mode)** | An toàn kiểu dữ liệu 100%, type checking chặt chẽ cho model Room, Slot, Booking. |
| **Navigation** | **React Navigation 7** | Stack (`@react-navigation/native-stack`) + Bottom Tabs (`@react-navigation/bottom-tabs`). |
| **State Management** | **Zustand** (Client State) | Quản lý query tìm kiếm, bộ lọc toà nhà, sức chứa, loại phòng. |
| **Server State** | **TanStack Query v5** | Caching API rooms/slots, tự động refetch slot realtime, optimistic invalidation. |
| **Backend** | **Node.js + Express 5 + TypeScript** | RESTful API hiệu năng cao, nhẹ, dễ mở rộng. |
| **Database** | **SQLite + Prisma ORM 6** | Cơ sở dữ liệu cục bộ file `dev.db`, không phụ thuộc cloud DB, hỗ trợ transactions. |

---

## 2. Tính năng chính (Key Features)

1. **Tìm kiếm & Bộ lọc linh hoạt (Multi-parameter Filter Chips)**:
   - Thanh tìm kiếm theo tên hoặc mã phòng (hỗ trợ auto-filter).
   - Chip bộ lọc 3 cấp:
     - Toà nhà: *Tất cả*, *Toà A*, *Toà B*, *Toà C*, *Thư Viện*.
     - Loại phòng: *Tất cả*, *Tự học (STUDY_ROOM)*, *Lab máy tính (LAB)*, *Seminar / Họp (MEETING)*.
     - Sức chứa: *Bất kỳ*, *4+ người*, *10+ người*, *20+ người*.
2. **60fps FlatList Feed với Room Cards**:
   - `getItemLayout` tính trước kích thước cố định (`148px`) loại bỏ layout recalculation.
   - `React.memo` cho `RoomCard` hạn chế triệt để re-render ngoài ý muốn.
   - Cấu hình chuẩn hiệu năng cao: `windowSize = 5`, `maxToRenderPerBatch = 8`, `removeClippedSubviews = true`.
3. **Time-Slot Selector & Conflict Prevention (Chống xung đột lịch đặt)**:
   - Lưới hiển thị khung giờ trực quan (Slot còn trống, Slot đang chọn, Slot đã bị đặt - disabled).
   - **Xử lý xung đột tại Backend (Serializable Transaction)**:
     - Kiểm tra khoảng giao nhau giữa hai khoảng thời gian: `startTime < existingEnd && endTime > existingStart`.
     - Nếu phát hiện trùng lịch đã xác nhận (`CONFIRMED`), backend huỷ transaction và trả mã `409 Conflict`.
     - Ứng dụng mobile bắt mã `409`, tự động refetch danh sách slot mới nhất và cảnh báo cho người dùng chọn khung giờ khác.
4. **Quản lý lịch đặt (My Bookings)**:
   - Theo dõi danh sách phòng đã đặt.
   - Huỷ lịch đặt phòng trực tiếp từ app.

---

## 3. Cấu trúc Thư mục

```
D:\2026WORK\CrossPlatform\campus-room-booking\
├── mobile/                        # Expo App
│   ├── src/
│   │   ├── api/client.ts          # TanStack Query Hooks & Axios instance
│   │   ├── components/            # FilterChips, RoomCard (memoized), TimeSlotPicker
│   │   ├── navigation/index.tsx   # React Navigation 7 Tabs & Stacks
│   │   ├── screens/               # ExploreScreen, RoomDetailScreen, MyBookingsScreen
│   │   ├── stores/filterStore.ts  # Zustand store (search, building, type, capacity)
│   │   └── types/index.ts         # TypeScript Interfaces
│   ├── App.tsx                    # QueryClient & Navigation Provider
│   └── package.json
├── server/                        # Express + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma          # Room & Booking Schema (SQLite)
│   │   └── seed.ts                # Dữ liệu 10 phòng học campus mẫu
│   ├── src/
│   │   ├── controllers.ts         # Logic API & Conflict Check Transaction
│   │   ├── routes.ts              # API Endpoints
│   │   ├── types.ts               # Danh sách slot giờ trường đại học
│   │   └── index.ts               # Express Server
│   ├── test-conflict.ts           # Runnable Assert Test cho Conflict Prevention
│   └── package.json
├── PLAN.md                        # Kế hoạch chi tiết từ A-Z
└── README.md
```

---

## 4. Hướng dẫn Khởi chạy (Quick Start)

### Bước 1: Chạy Backend & Seed Database
```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt dependencies (nếu chưa cài)
npm install

# Tạo database SQLite và seed dữ liệu phòng mẫu
npm run db:push
npm run db:seed

# Chạy server ở chế độ dev (Port 5000)
npm run dev
```

Kiểm tra test logic Conflict Prevention:
```bash
npm run test:conflict
```

### Bước 2: Chạy Ứng dụng Mobile
```bash
# Mở terminal mới, di chuyển vào mobile
cd mobile

# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi chạy Expo
npm run start
```
- Nhấn `a` để chạy trên Android Emulator.
- Nhấn `w` để chạy trên trình duyệt Web.
- Hoặc quét mã QR bằng app **Expo Go** trên điện thoại thật (lưu ý cấu hình IP máy tính trong `mobile/src/api/client.ts`).
