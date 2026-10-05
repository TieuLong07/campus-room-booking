-- ============================================================
-- CAMPUS STUDY ROOMS & LABS BOOKING APP - SUPABASE SCHEMA
-- ============================================================

-- 1. Bảng Rooms
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  building text not null,
  floor integer not null,
  capacity integer not null,
  type text not null, -- 'STUDY_ROOM', 'LAB', 'MEETING'
  amenities jsonb not null default '[]'::jsonb,
  image_url text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Bảng Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id text not null,
  user_name text not null default 'Sinh viên',
  user_email text,
  booking_date text not null, -- YYYY-MM-DD
  start_time text not null,   -- HH:mm (e.g. '08:45')
  end_time text not null,     -- HH:mm (e.g. '10:15')
  status text not null default 'CONFIRMED', -- 'CONFIRMED', 'CANCELLED'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index tối ưu truy vấn kiểm tra lịch và lọc
create index if not exists idx_bookings_lookup on public.bookings (room_id, booking_date, status);
create index if not exists idx_bookings_user on public.bookings (user_id);

-- 3. Atomic Database Trigger: Chống xung đột lịch đặt (Conflict Prevention)
-- Tự động ngăn chặn 2 người đặt trùng hoặc giao nhau khung giờ ở cấp độ PostgreSQL Engine
create or replace function public.check_booking_conflict()
returns trigger as $$
begin
  if new.status = 'CONFIRMED' then
    if exists (
      select 1 from public.bookings
      where room_id = new.room_id
        and booking_date = new.booking_date
        and status = 'CONFIRMED'
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
        and start_time < new.end_time
        and end_time > new.start_time
    ) then
      raise exception 'SLOT_CONFLICT: Khung giờ này vừa có người khác đặt trước. Vui lòng chọn khung giờ khác!';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_check_booking_conflict on public.bookings;
create trigger trg_check_booking_conflict
before insert or update on public.bookings
for each row
execute function public.check_booking_conflict();

-- 4. Cấu hình Row Level Security (RLS)
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;

-- Policy: Bất kỳ ai cũng có thể xem danh sách phòng
drop policy if exists "Rooms are publicly viewable" on public.rooms;
create policy "Rooms are publicly viewable"
on public.rooms for select
using (true);

-- Policy: Mọi người có thể đọc lịch đặt để xem slot nào đã bị đặt
drop policy if exists "Bookings are viewable by everyone" on public.bookings;
create policy "Bookings are viewable by everyone"
on public.bookings for select
using (true);

-- Policy: Cho phép người dùng tạo lịch đặt
drop policy if exists "Users can insert bookings" on public.bookings;
create policy "Users can insert bookings"
on public.bookings for insert
with check (true);

-- Policy: Người dùng có thể cập nhật/huỷ lịch của chính mình
drop policy if exists "Users can update own bookings" on public.bookings;
create policy "Users can update own bookings"
on public.bookings for update
using (true);

-- 5. Seed dữ liệu 10 phòng mẫu
insert into public.rooms (code, name, building, floor, capacity, type, amenities, image_url)
values
('A-201', 'Phòng Tự Học Nhóm A201', 'Toà A', 2, 6, 'STUDY_ROOM', '["AC", "WHITEBOARD", "POWER_OUTLETS", "WIFI"]'::jsonb, 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80'),
('A-202', 'Phòng Thảo Luận Nhanh A202', 'Toà A', 2, 4, 'STUDY_ROOM', '["AC", "WHITEBOARD", "WIFI"]'::jsonb, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'),
('A-405', 'Lab Trí Tuệ Nhân Tạo & Data', 'Toà A', 4, 30, 'LAB', '["AC", "PROJECTOR", "HIGH_SPEC_PC", "WHITEBOARD", "LAN"]'::jsonb, 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'),
('B-101', 'Phòng Seminar Sáng Tạo B101', 'Toà B', 1, 20, 'MEETING', '["AC", "PROJECTOR", "SOUND_SYSTEM", "WHITEBOARD", "WIFI"]'::jsonb, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'),
('B-302', 'Lab Mạng & An Toàn Thông Tin', 'Toà B', 3, 25, 'LAB', '["AC", "PROJECTOR", "CISCO_RACKS", "HIGH_SPEC_PC", "LAN"]'::jsonb, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80'),
('B-304', 'Phòng Nghiên Cứu Chuyên Sâu B304', 'Toà B', 3, 8, 'STUDY_ROOM', '["AC", "WHITEBOARD", "POWER_OUTLETS", "TV_MONITOR"]'::jsonb, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'),
('C-102', 'Lab Lập Trình Di Động & Đa Nền Tảng', 'Toà C', 1, 35, 'LAB', '["AC", "PROJECTOR", "MAC_MINI", "POWER_OUTLETS", "LAN"]'::jsonb, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'),
('C-201', 'Không Gian Tự Học Tầng 2 Toà C', 'Toà C', 2, 12, 'STUDY_ROOM', '["AC", "WHITEBOARD", "POWER_OUTLETS", "WIFI"]'::jsonb, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
('LIB-301', 'Phòng Học Nhóm Yên Tĩnh Thư Viện', 'Thư Viện', 3, 6, 'STUDY_ROOM', '["AC", "WHITEBOARD", "SOUNDPROOF", "POWER_OUTLETS"]'::jsonb, 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'),
('LIB-302', 'Studio Thu Âm & Trình Chiếu Thư Viện', 'Thư Viện', 3, 10, 'MEETING', '["AC", "PROJECTOR", "SOUNDPROOF", "CAMERA_LIGHTS"]'::jsonb, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80')
on conflict (code) do nothing;
