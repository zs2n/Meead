-- ============================================================
-- ميعاد — إضافات النمو: رسائل التواصل، النشرة، الحد من السبام، ترتيب "الأحدث"
-- آمن لإعادة التشغيل (idempotent).
-- ============================================================

-- ---------- رسائل "تواصل معنا" ----------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 80),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone      text check (char_length(phone) <= 20),
  topic      text not null default 'general' check (topic in ('general', 'office', 'complaint', 'partnership')),
  message    text not null check (char_length(message) between 10 and 2000),
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (handled, created_at desc);

-- ---------- مشتركو النشرة ----------
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source     text not null default 'footer',
  created_at timestamptz not null default now()
);
create unique index if not exists subscribers_email_key on public.subscribers (lower(email));

-- ---------- الحد من تكرار الطلبات (سبام) ----------
create table if not exists public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  count        int not null default 1,
  primary key (key, window_start)
);

-- يسجّل محاولة ويعيد true إن كانت ضمن الحد المسموح خلال النافذة الزمنية.
create or replace function public.hit_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count  int;
begin
  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set count = public.rate_limits.count + 1
  returning count into v_count;

  -- تنظيف خفيف للسجلات القديمة
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_count <= p_max;
end $$;

revoke execute on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;

-- ---------- الصلاحيات ----------
alter table public.contact_messages enable row level security;
alter table public.subscribers      enable row level security;
alter table public.rate_limits      enable row level security;

revoke all on public.contact_messages, public.subscribers, public.rate_limits from anon;
revoke all on public.rate_limits from authenticated;

-- القراءة والإدارة للمدير فقط؛ الكتابة من الخادم فقط (service role).
drop policy if exists contact_messages_admin on public.contact_messages;
create policy contact_messages_admin on public.contact_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists subscribers_admin on public.subscribers;
create policy subscribers_admin on public.subscribers for select to authenticated
  using (public.is_admin());

-- ---------- ترتيب "الأحدث" في البحث ----------
-- إضافة created_at في نهاية أعمدة العرض (مسموح مع create or replace).
create or replace view public.office_listing with (security_invoker = true) as
select
  o.id,
  o.slug,
  o.name,
  o.description,
  o.address,
  o.status,
  o.city_id,
  c.slug    as city_slug,
  c.name_ar as city_name,
  coalesce(sp.slugs, '{}') as specialty_slugs,
  coalesce(sp.names, '{}') as specialty_names,
  coalesce(rs.rating_avg, 0)   as rating_avg,
  coalesce(rs.rating_count, 0) as rating_count,
  o.created_at
from public.offices o
join public.cities c on c.id = o.city_id
left join lateral (
  select array_agg(s.slug order by s.sort_order) as slugs,
         array_agg(s.name_ar order by s.sort_order) as names
  from public.office_specialties os
  join public.specialties s on s.id = os.specialty_id
  where os.office_id = o.id
) sp on true
left join lateral (
  select round(avg(r.rating)::numeric, 1)::float8 as rating_avg,
         count(*)::int as rating_count
  from public.reviews r
  where r.office_id = o.id and r.status = 'approved'
) rs on true;

notify pgrst, 'reload schema';
