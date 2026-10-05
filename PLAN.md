# Plan A-Z: Campus Room & Lab Booking App (Mini-Project 2)

## 1. Kiến trúc Tổng thể

```
D:\2026WORK\CrossPlatform\campus-room-booking\
├── mobile/                   # React Native (Expo Managed, TS strict)
│   ├── src/
│   │   ├── api/              # TanStack Query hooks & Axios client
│   │   ├── components/       # UI Components (FilterChips, RoomCard, SlotPicker)
│   │   ├── navigation/       # React Navigation 7 (Tabs + Stacks)
│   │   ├── screens/          # ExploreScreen, RoomDetailScreen, MyBookingsScreen
│   │   ├── stores/           # Zustand stores (useFilterStore, useBookingDraftStore)
│   │   └── types/            # TypeScript interfaces/types
├── server/                   # Node.js + Express + Prisma (SQLite)
│   ├── prisma/
│   │   ├── schema.prisma     # SQLite Schema
│   │   └── seed.ts           # Seed dữ liệu phòng, toà nhà, khung giờ
│   ├── src/
│   │   ├── controllers/      # Room & Booking controllers
│   │   ├── routes/           # REST API routes
│   │   └── index.ts          # Server entrypoint
└── PLAN.md
```

---

## 2. Thiết kế Backend & Database (Node.js + Express + Prisma SQLite)

### Schema (Prisma)
- **Room**: `id`, `name`, `code`, `building`, `floor`, `capacity`, `type` (`STUDY_ROOM`, `LAB`, `MEETING`), `amenities` (JSON: AC, Projector, Whiteboard, PCs), `imageUrl`, `isActive`.
- **Booking**: `id`, `roomId`, `userId` (mock "SV1024"), `bookingDate` (YYYY-MM-DD), `startTime` (HH:mm), `endTime` (HH:mm), `status` (`CONFIRMED`, `CANCELLED`), `createdAt`.

### REST API Endpoints
1. `GET /api/rooms`
   - Query: `search`, `building`, `minCapacity`, `type`, `amenities`.
   - Trả về: Danh sách rooms có thông tin tổng quan.
2. `GET /api/rooms/:id`
   - Chi tiết phòng + danh sách thiết bị.
3. `GET /api/rooms/:id/slots?date=YYYY-MM-DD`
   - Danh sách các slot trong ngày (ví dụ 07:00 - 18:00, mỗi slot 1h hoặc 2h).
   - Flag: `isBooked: boolean`, `isAvailable: boolean`.
4. `POST /api/bookings`
   - Body: `{ roomId, userId: "SV1024", date, startTime, endTime }`.
   - **Xử lý Conflict Prevention tại Backend**:
     - Prisma Transaction: Kiểm tra xem tồn tại booking nào của `roomId` trong cùng `date` mà `status = 'CONFIRMED'` và `(startTime < newEndTime AND endTime > newStartTime)`.
     - Nếu trùng: Trả lỗi `409 Conflict` kèm thông báo slot đã được đặt.
     - Nếu không trùng: Insert booking, commit transaction.
5. `GET /api/bookings/my?userId=SV1024`
   - Danh sách lịch đặt của sinh viên hiện tại.
6. `POST /api/bookings/:id/cancel`
   - Huỷ lịch đặt phòng.

---

## 3. Thiết kế Frontend Mobile (React Native + Expo)

### Công nghệ & Thư viện
- **React Navigation 7**:
  - `RootStack`:
    - `MainTabs`:
      - `ExploreTab` (Danh sách phòng, tìm kiếm, bộ lọc).
      - `MyBookingsTab` (Lịch đặt cá nhân).
    - `RoomDetail`: Thông tin phòng, ảnh, chọn ngày/giờ.
    - `BookingConfirmModal`: Xác nhận đặt phòng & kết quả.
- **State Management**:
  - **Zustand (Client State)**:
    - `useFilterStore`: `searchQuery`, `building`, `minCapacity`, `roomType`, `selectedAmenities`, `resetFilters()`.
    - `useBookingDraftStore`: `selectedRoom`, `selectedDate`, `selectedSlot`.
  - **TanStack Query (Server State)**:
    - `useRooms(filters)`: Cache & debounce search.
    - `useRoomSlots(roomId, date)`: Refresh slot theo ngày.
    - `useCreateBooking()`: Mutation với `onSuccess` invalidate cache slots và myBookings.

### Yêu cầu Kỹ thuật Trọng tâm

#### 1. FlatList Feed 60fps (Mượt mà)
- `getItemLayout`: Định nghĩa trước chiều cao cố định cho card phòng để FlatList không phải tính dynamic layout.
- `React.memo` cho `RoomCard`: Tránh re-render toàn bộ danh sách khi filter chip thay đổi state nội bộ.
- Config FlatList chuẩn hiệu năng cao:
  - `windowSize = 5`
  - `maxToRenderPerBatch = 8`
  - `initialNumToRender = 6`
  - `removeClippedSubviews = true`
- Tách `renderItem` và `keyExtractor` ra ngoài component scope (hoặc `useCallback`).

#### 2. Multi-parameter Filter Chips
- Horizontal `ScrollView` / `FlatList` chứa các chip: Toà nhà (A, B, C), Sức chứa (2-4, 5-10, 10+), Loại phòng (Lab / Study Room), Tiện ích (Máy chiếu, Điều hoà, Ổ cắm).
- Tích hợp debounce (300ms) trên input Search để không spam API.

#### 3. Time-Slot Selector & Conflict Prevention
- Giao diện Grid các slot giờ trực quan:
  - Xanh: Còn trống (Available).
  - Xám gạch chéo: Đã có người đặt (Booked - Disabled touch).
  - Vàng / Cam: Đang chọn (Selected).
- Client-side validation: Chặn bấm nút "Xác nhận đặt" nếu slot đã `isBooked`.
- Optimistic UI hoặc immediate refetch khi mutation hoàn tất. Bắt mã lỗi `409 Conflict` để toast cảnh báo người dùng "Phòng vừa được sinh viên khác đặt, vui lòng chọn slot khác".

---

## 4. Lộ trình Triển khai (Roadmap)

### Giai đoạn 1: Khởi tạo & Backend Core (Hôm nay)
1. Setup cấu trúc Monorepo (`mobile/`, `server/`).
2. Server: Cài Express, Prisma, TypeScript, SQLite.
3. Tạo Prisma schema (Room, Booking) và script seed dữ liệu mẫu sinh động (15+ phòng học, lab AI, lab Mạng, phòng tự học thư viện).
4. Viết logic Conflict Prevention Transaction trong controller `createBooking`.
5. Test API cục bộ qua curl/script.

### Giai đoạn 2: Mobile App Base & Navigation 7 + Zustand (Trọng tâm tuần tới)
1. Khởi tạo Expo app (TypeScript strict mode).
2. Cài đặt React Navigation 7 (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`).
3. Dựng khung Tabs (Explore, My Bookings) và Stack (Room Detail).
4. Cài đặt Zustand: Tạo `useFilterStore` và kết nối với Search Bar + Filter Chips.

### Giai đoạn 3: TanStack Query & Tối ưu 60fps Feed
1. Setup `@tanstack/react-query` và Axios client trỏ về backend local (hỗ trợ cả Expo Go trên LAN IP / localhost).
2. Xây dựng component `RoomCard` tối ưu `React.memo` + `getItemLayout`.
3. Test benchmark cuộn FlatList đạt 60fps mượt mà.

### Giai đoạn 4: Time-Slot Selector, Conflict Prevention & Polish
1. Component `TimeSlotGrid` hiển thị trạng thái realtime.
2. Viết flow Đặt phòng -> Xác nhận -> Invalidate Query -> Cập nhật sang tab "My Bookings".
3. Xử lý kịch bản Edge Case: 2 thiết bị cùng bấm đặt 1 slot cùng giây (Backend transaction rollback và bắn 409).
4. Review tổng thể mã nguồn theo tiêu chuẩn TypeScript strict.
