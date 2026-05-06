-- ── Site Page Views ──────────────────────────────────────────────────────────
-- เพิ่ม column page_views ใน profiles และ function สำหรับนับยอดเข้าชมทั้งหมด

alter table public.profiles
  add column if not exists page_views bigint not null default 0;

-- Function: นับยอดเข้าชม +1 แล้วคืนค่าใหม่กลับมา
create or replace function public.increment_site_page_views()
returns bigint
language plpgsql
security definer
as $$
declare
  new_count bigint;
begin
  update public.profiles
  set page_views = page_views + 1
  returning page_views into new_count;
  return new_count;
end;
$$;

-- อนุญาตให้ผู้เยี่ยมชม (anon) เรียก function ได้
grant execute on function public.increment_site_page_views() to anon;
grant execute on function public.increment_site_page_views() to authenticated;
