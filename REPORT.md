# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 2 — Campus Study Rooms & Labs Booking App  
**Team / Student Name:** Nguyen Hoang Long  
**Submission Date:** 05/10/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Nguyen Hoang Long — Student ID: 23IT.B119 — Role: Solo Developer (Frontend Mobile, Backend Cloud, CI/CD Pipeline) — Contribution: 100%
* **📲 Direct Android APK Download:** https://github.com/TieuLong07/campus-room-booking/releases/download/v1.0.0/CampusRoomBooking-v1.0.0.apk
* **📦 GitHub Release Page:** https://github.com/TieuLong07/campus-room-booking/releases/tag/v1.0.0
* **💻 GitHub Repository:** https://github.com/TieuLong07/campus-room-booking
* **⚡ Live Cloud Backend (Supabase):** https://qnkfsqvddyizmfdyfybv.supabase.co
* **🎥 Video Demo (Optional):** — (link submitted separately if applicable)

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | Room Search & Multi-Parameter Filter Chips | ✅ Complete | Live search by room code and room name. Horizontal cascading filter chips (Building, Room Type, Seating Capacity) with quick reset action. Controlled entirely via Zustand `filterStore` with zero redundant re-renders. |
| 2 | 60fps FlatList Feed with Room Cards | ✅ Complete | High-performance FlatList feed: fixed item layout calculation (`getItemLayout` with `TOTAL_ROOM_ITEM_HEIGHT = 148px`), `React.memo` isolation for `RoomCard`, `windowSize={5}`, `maxToRenderPerBatch={8}`, `removeClippedSubviews={true}`. Fluid spring touch feedback via `react-native-reanimated`. |
| 3 | Time-Slot Selector with Conflict Prevention | ✅ Complete | 7 standard university time-slots (Tiết 1-2 to Ca tối). Dual-layer conflict prevention: (1) Client-side disabled state and polling invalidation; (2) Server-side PostgreSQL engine trigger (`check_booking_conflict()`) guaranteeing ACID-level serialization and throwing `409 Conflict` on concurrent overlaps (`startA < endB AND endA > startB`). |
| 4 | Strongly Typed Navigation (Stack + Tabs) | ✅ Complete | React Navigation 7. `RootStackParamList` (`MainTabs`, `RoomDetail: { roomId: string }`) and `MainTabParamList` (`Explore`, `MyBookings`). 100% strictly typed with `RouteProp` and `BottomTabNavigationProp`. Configured web URL linking mapping. |
| 5 | State Separation (Zustand + TanStack Query) | ✅ Complete | Strict boundary enforcement: **Zustand** manages client-only UI state (`filterStore`, `bookingDraftStore`, `uiStore`, `authStore`); **TanStack Query v5** manages server cache, automated 15s background slot polling, and mutation query invalidation (`useRooms`, `useRoomSlots`, `useCreateBooking`, `useMyBookings`, `useCancelBooking`). |
| 6 | Cloud Authentication (Google OAuth) | ✅ Complete | Integrated `@supabase/supabase-js` with `expo-auth-session` and `expo-web-browser`. Deep link scheme `campusbooking://auth/callback`. Synchronizes authenticated user identity with booking records and filters personal bookings automatically. |
| 7 | Automated CI/CD APK Build Pipeline | ✅ Complete | GitHub Actions workflow (`.github/workflows/build-apk.yml`) executing `expo prebuild`, Gradle `assembleDebug` on Ubuntu runners, and automatically releasing installable `CampusRoomBooking-v1.0.0.apk` assets to GitHub Releases. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

```
campus-room-booking/
├── .github/
│   └── workflows/
│       └── build-apk.yml               # Automated CI/CD Android APK build & GitHub Release
├── mobile/                             # React Native Expo Managed (SDK 57, TypeScript Strict)
│   ├── App.tsx                         # Root app entry: NavigationContainer, QueryClient, Toast
│   ├── app.json                        # App manifest, deep link scheme (campusbooking://)
│   ├── eas.json                        # EAS build configuration for Android APK
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts               # TanStack Query custom hooks & data adapters
│   │   │   └── supabase.ts             # Supabase Cloud Client with AsyncStorage persistence
│   │   ├── components/
│   │   │   ├── AnimatedToast.tsx       # Reanimated floating notification (Conflict, Success)
│   │   │   ├── FilterChips.tsx         # 3-tier horizontal pill selector
│   │   │   ├── RoomCard.tsx            # Memoized 60fps card with Reanimated tactile spring
│   │   │   ├── TimeSlotPicker.tsx      # Interactive slot selector with conflict disabled state
│   │   │   └── UserAuthHeader.tsx      # Google OAuth profile / login header
│   │   ├── navigation/
│   │   │   └── index.tsx               # React Navigation 7 (NativeStack + BottomTabs)
│   │   ├── screens/
│   │   │   ├── ExploreScreen.tsx       # Room feed, search bar, filter chips, 60fps FlatList
│   │   │   ├── RoomDetailScreen.tsx    # Room specs, date selector, slot picker, dock CTA
│   │   │   └── MyBookingsScreen.tsx    # Ticket-style personal booking records & cancel action
│   │   ├── stores/
│   │   │   ├── authStore.ts            # Zustand Google OAuth session management
│   │   │   ├── bookingDraftStore.ts    # Zustand draft reservation state
│   │   │   ├── filterStore.ts          # Zustand query, building, type, capacity filters
│   │   │   └── uiStore.ts              # Zustand transient toast triggers
│   │   └── types/
│   │       └── index.ts                # Strict TypeScript interfaces, enums, navigation params
│   └── tsconfig.json                   # Strict TypeScript compiler configuration
├── server/                             # Node.js + Express + Prisma + SQLite (Local Fallback)
│   ├── prisma/
│   │   ├── schema.prisma               # Prisma Room and Booking models
│   │   └── seed.ts                     # Seed script for 10 campus rooms
│   ├── src/
│   │   ├── controllers.ts              # Conflict prevention transaction & REST endpoints
│   │   ├── db.ts                       # Prisma client instance
│   │   ├── routes.ts                   # Express router
│   │   └── index.ts                    # Server bootstrap
│   └── test-conflict.ts                # Runnable assert-based unit test for 6 conflict cases
├── supabase/
│   └── schema.sql                      # Production PostgreSQL schema, RLS, and Trigger function
├── PLAN.md                             # Comprehensive project implementation roadmap
├── README.md                           # Quick start guide & release badges
└── REPORT.md                           # Formal Technical Report
```

### State Management & Data Flow Architecture
```
[User Action] 
      │
      ├── UI/Filter/Draft Action ──> [Zustand Stores] 
      │                                (filterStore, bookingDraftStore, uiStore, authStore)
      │                                      │
      │                                      ▼
      │                                Re-renders only subscribed leaf components
      │
      └── Server Fetch/Mutation  ──> [TanStack Query v5]
                                             │
                                             ├── Cache Layer (2-min staleTime, 15s poll)
                                             ▼
                                     [Supabase Cloud Client]
                                             │
                                             ▼ (PostgreSQL Engine Trigger)
                                     [Atomic Conflict Check]
                                             ├── PASS: 201 Created ──> Invalidate queries ──> Toast Success
                                             └── FAIL: 409 Conflict ──> Auto-refetch slots ──> AnimatedToast Error
```

### Conflict Prevention & Exception Handling Strategies
* **Database Engine Atomicity:** Rather than relying purely on client-side state (which is prone to stale race conditions), conflict verification is enforced at the database layer via PostgreSQL PL/pgSQL Trigger `check_booking_conflict()` and Prisma serializable transaction. Overlapping intervals (`start_time < new.end_time AND end_time > new.start_time`) throw an explicit `SLOT_CONFLICT` error.
* **Optimistic Error Trapping:** When an HTTP `409 Conflict` is returned, the app catches it immediately, triggers `refetchSlots()` to refresh the UI with the latest booking data, clears the conflicting draft slot, and displays an animated floating notification via `AnimatedToast`.
* **Zero UI-Thread Layout Jitter:** In `RoomCard`, layout entrance animations (`FadeInDown`) and touch scale animations (`useAnimatedStyle`) are separated into nested `Animated.View` hierarchies, preventing property overwrite warnings on the native UI thread.

---

## 4. EMPIRICAL EVIDENCE & TEST VERIFICATION

| Verification Item | Command / Methodology | Expected Output | Actual Output | Status |
|---|---|---|---|:---:|
| **Mobile TypeScript Strict** | `cd mobile && npx tsc --noEmit` | 0 errors | `Exit code: 0` | ✅ PASS |
| **Server TypeScript Strict** | `cd server && npx tsc --noEmit` | 0 errors | `Exit code: 0` | ✅ PASS |
| **PostgreSQL Conflict Trigger** | 2 concurrent POST requests with overlapping slot | 1st succeeds, 2nd throws `SLOT_CONFLICT` | `{"code":"P0001","message":"SLOT_CONFLICT:..."}` | ✅ PASS |
| **Unit Test Suite** | `npm --prefix server run test:conflict` | 6/6 overlap scenarios validated | `TẤT CẢ CHECK CONFLICT PREVENTION ĐÃ ĐẠT 100%!` | ✅ PASS |
| **Android APK Build** | GitHub Actions Workflow on `ubuntu-latest` | Standalone installable APK artifact | `CampusRoomBooking-v1.0.0.apk (199.28 MB)` | ✅ PASS |

### Screenshot Evidences

**Screenshot 1 — Explore Feed & 3-Tier Filter Chips**  
*Giao diện danh sách phòng học với phong cách Zinc Monochrome tối giản, chip lọc Toà nhà / Loại phòng / Sức chứa, và thanh tìm kiếm tức thì.*

**Screenshot 2 — Room Detail & Time-Slot Matrix**  
*Màn hình chi tiết phòng học với lưới chọn khung giờ chuẩn campus, chỉ báo trạng thái trực quan (Khả dụng / Đang chọn / Đã đặt).*

**Screenshot 3 — Conflict Prevention Animated Toast**  
*Thông báo hoạt hoạ `AnimatedToast` xuất hiện khi phát hiện xung đột lịch đặt phòng (HTTP 409 Conflict).*

**Screenshot 4 — My Bookings Ticket View**  
*Giao diện thẻ vé điện tử (Ticket Metaphor) hiển thị thông tin ngày giờ, mã phòng, và nút huỷ lịch đặt.*

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### Challenge 1: Distributed Race Conditions in Concurrent Double-Booking Prevention
**Problem:** In a multi-user campus booking application, multiple students can select the same study room slot simultaneously. Client-side checks alone are fundamentally vulnerable to network race conditions (Time-of-Check to Time-of-Use bug), where both clients see an available slot and submit reservations within milliseconds of each other.

**Resolution:** Implemented a defense-in-depth architecture:
1. **Database-Level Atomic Enforcement:** Implemented a PostgreSQL `BEFORE INSERT OR UPDATE` trigger (`check_booking_conflict()`) directly inside Supabase. Any incoming booking whose interval overlaps with an existing confirmed booking (`start_time < new.end_time AND end_time > new.start_time`) is aborted by the database engine with an uncatchable transaction rollback.
2. **Local Dual-Mode Fallback:** For local development, an identical serialization check was built inside Prisma's interactive transaction (`prisma.$transaction`) in Express.
3. **Automated Unit Verification:** Authored `server/test-conflict.ts` covering 6 mathematical edge cases (exact match, head overlap, tail overlap, complete enclosure, adjacent predecessor, adjacent successor). All 6 cases passed with 100% assertion accuracy.

### Challenge 2: Achieving 60fps in React Native FlatList while Supporting Reanimated Spring Feedback
**Problem:** Applying layout entrance animations (`FadeInDown`) alongside interactive tactile touch animations (`withSpring` scaling on press) onto a single `Animated.View` inside FlatList items caused runtime performance degradation and triggered Reanimated console warnings: `[Reanimated] Property [transform] may be overwritten by a layout animation`. Furthermore, unoptimized FlatLists frequently drop frames during rapid scrolling due to asynchronous layout measurements.

**Resolution:**
1. **Fixed Memory Layout (`getItemLayout`):** Pre-calculated the exact item height (`ROOM_CARD_HEIGHT = 138px` + `MARGIN = 10px` = `148px`). FlatList computes the scroll position mathematically without invoking dynamic `onLayout` measure passes.
2. **Component Isolation:** Wrapped `RoomCard` in `React.memo` so changes in search query or filter chips only update active components without triggering unnecessary re-renders across the entire virtualized list.
3. **Decoupled Animation Hierarchy:** Separated the outer layout animation wrapper (`<Animated.View entering={FadeInDown}>`) from the inner touch scale responder (`<Animated.View style={animatedStyle}>`), completely resolving the UI-thread property collision and guaranteeing smooth 60fps rendering.

### Challenge 3: Cross-Platform Google OAuth Deep Linking in Expo Managed Workflow
**Problem:** Google OAuth requires different redirect mechanisms across Web and native mobile platforms. On Web, standard browser redirect works, but on native Android/iOS, standard redirects fail because the app operates inside a sandboxed environment requiring custom URI scheme interception (`campusbooking://`).

**Resolution:**
1. **Scheme Declaration:** Configured `"scheme": "campusbooking"` inside `mobile/app.json`.
2. **Dynamic Platform Divergence:** In `src/stores/authStore.ts`, utilized `makeRedirectUri({ scheme: "campusbooking", path: "auth/callback" })` combined with `WebBrowser.openAuthSessionAsync()` on native mobile, while leveraging standard window origin on Web.
3. **Token Extraction:** Parsed the callback URL fragment hash on session completion to extract `access_token` and `refresh_token`, persisting the authenticated session into `AsyncStorage` via Supabase client.
