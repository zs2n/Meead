-- ============================================================
-- ميعاد (Meead) — الهيكل الأساسي لقاعدة البيانات
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- الأنواع ----------
create type public.user_role      as enum ('user', 'office', 'admin');
create type public.office_status  as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.contact_method as enum ('whatsapp', 'call', 'email');
create type public.review_status  as enum ('pending', 'approved', 'rejected');

-- ---------- الملفات الشخصية ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        public.user_role not null default 'user',
  created_at  timestamptz not null default now()
);

-- ينشئ ملفاً شخصياً تلقائياً لكل مستخدم جديد
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'user');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- هل المستخدم الحالي مدير؟ (security definer لتجنّب تكرار RLS)
create function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- المدن والتخصصات ----------
create table public.cities (
  id         smallint generated always as identity primary key,
  slug       text not null unique,
  name_ar    text not null,
  is_active  boolean not null default true,
  sort_order smallint not null default 0
);

-- التخصص الرئيسي (parent_id = null) وأنواع القضايا تحته
create table public.specialties (
  id         smallint generated always as identity primary key,
  parent_id  smallint references public.specialties (id),
  slug       text not null unique,
  name_ar    text not null,
  is_active  boolean not null default true,
  sort_order smallint not null default 0
);

-- ---------- المكاتب (البيانات العامة) ----------
create table public.offices (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references public.profiles (id) on delete set null,
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name             text not null check (char_length(name) between 2 and 120),
  description      text check (char_length(description) <= 2000),
  city_id          smallint not null references public.cities (id),
  address          text check (char_length(address) <= 300),
  status           public.office_status not null default 'pending',
  reviewed_by      uuid references public.profiles (id) on delete set null,
  reviewed_at      timestamptz,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index offices_status_city_idx on public.offices (status, city_id);
create index offices_owner_idx on public.offices (owner_id);

-- ---------- بيانات المكتب الخاصة (تواصل + رخصة) ----------
-- منفصلة حتى لا تُكشف للزوار أبداً؛ التواصل يمر عبر مسار الخادم الذي يسجّل الحدث.
create table public.office_private (
  office_id        uuid primary key references public.offices (id) on delete cascade,
  phone            text check (phone ~ '^\+?[0-9]{8,15}$'),
  whatsapp         text check (whatsapp ~ '^\+?[0-9]{8,15}$'),
  email            text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  license_number   text,
  license_doc_path text,
  updated_at       timestamptz not null default now()
);

create table public.office_specialties (
  office_id    uuid not null references public.offices (id) on delete cascade,
  specialty_id smallint not null references public.specialties (id),
  primary key (office_id, specialty_id)
);
create index office_specialties_specialty_idx on public.office_specialties (specialty_id);

create table public.office_hours (
  office_id uuid not null references public.offices (id) on delete cascade,
  weekday   smallint not null check (weekday between 0 and 6), -- 0 = الأحد
  opens_at  time,
  closes_at time,
  is_closed boolean not null default false,
  primary key (office_id, weekday),
  check (is_closed or (opens_at is not null and closes_at is not null))
);

-- ---------- سجل التواصل (أساس نموذج الدفع) ----------
create table public.contact_events (
  id                uuid primary key default gen_random_uuid(),
  office_id         uuid not null references public.offices (id) on delete cascade,
  method            public.contact_method not null,
  user_id           uuid references public.profiles (id) on delete set null,
  visitor_id        uuid,
  review_token_hash text unique,
  created_at        timestamptz not null default now()
);
create index contact_events_office_idx on public.contact_events (office_id, created_at desc);

-- ---------- التقييمات ----------
create table public.reviews (
  id               uuid primary key default gen_random_uuid(),
  office_id        uuid not null references public.offices (id) on delete cascade,
  contact_event_id uuid not null unique references public.contact_events (id) on delete cascade,
  user_id          uuid references public.profiles (id) on delete set null,
  reviewer_name    text check (char_length(reviewer_name) <= 60),
  rating           smallint not null check (rating between 1 and 5),
  comment          text check (char_length(comment) <= 1000),
  status           public.review_status not null default 'pending',
  moderated_by     uuid references public.profiles (id) on delete set null,
  moderated_at     timestamptz,
  created_at       timestamptz not null default now()
);
create index reviews_office_status_idx on public.reviews (office_id, status);
create index reviews_status_idx on public.reviews (status, created_at);

-- ---------- updated_at تلقائي ----------
create function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger offices_touch before update on public.offices
  for each row execute function public.touch_updated_at();
create trigger office_private_touch before update on public.office_private
  for each row execute function public.touch_updated_at();

-- ---------- حماية حقول الاعتماد ----------
-- صاحب المكتب لا يستطيع تغيير حالة الاعتماد بنفسه.
create function public.guard_office_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new; -- المدير أو الخادم (service role)
  end if;
  if new.status is distinct from old.status
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.rejection_reason is distinct from old.rejection_reason
     or new.owner_id is distinct from old.owner_id then
    raise exception 'غير مسموح بتعديل حالة الاعتماد';
  end if;
  return new;
end $$;

create trigger offices_guard before update on public.offices
  for each row execute function public.guard_office_status();

-- تغيير رقم الرخصة يعيد المكتب لقائمة المراجعة.
create function public.license_change_requires_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.license_number is distinct from old.license_number
     or new.license_doc_path is distinct from old.license_doc_path then
    update public.offices
       set status = 'pending', reviewed_at = null, reviewed_by = null
     where id = new.office_id and status <> 'pending';
  end if;
  return new;
end $$;

create trigger office_private_license_review after update on public.office_private
  for each row execute function public.license_change_requires_review();

-- ---------- عرض بطاقات المكاتب (للبحث) ----------
-- security_invoker: يحترم RLS للمستخدم الذي يستعلم.
create view public.office_listing with (security_invoker = true) as
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
  coalesce(rs.rating_count, 0) as rating_count
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

-- وسائل التواصل المتاحة لمكتب معتمد (بدون كشف الأرقام)
create function public.office_contact_methods(p_office_id uuid)
returns table (has_whatsapp boolean, has_phone boolean, has_email boolean)
language sql stable security definer set search_path = '' as $$
  select p.whatsapp is not null, p.phone is not null, p.email is not null
  from public.office_private p
  join public.offices o on o.id = p.office_id
  where p.office_id = p_office_id and o.status = 'approved';
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.cities             enable row level security;
alter table public.specialties        enable row level security;
alter table public.offices            enable row level security;
alter table public.office_private     enable row level security;
alter table public.office_specialties enable row level security;
alter table public.office_hours       enable row level security;
alter table public.contact_events     enable row level security;
alter table public.reviews            enable row level security;

-- profiles: كل مستخدم يرى ملفه، والمدير يرى الكل. تعديل الدور للمدير فقط.
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_update_admin on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- cities / specialties: قراءة عامة للمفعّل، إدارة للمدير
create policy cities_read on public.cities for select using (is_active or public.is_admin());
create policy cities_admin on public.cities for all using (public.is_admin()) with check (public.is_admin());
create policy specialties_read on public.specialties for select using (is_active or public.is_admin());
create policy specialties_admin on public.specialties for all using (public.is_admin()) with check (public.is_admin());

-- offices: الزائر يرى المعتمد فقط؛ المالك يرى مكتبه؛ المدير يرى الكل
create policy offices_read on public.offices for select
  using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy offices_insert_owner on public.offices for insert to authenticated
  with check (owner_id = auth.uid() and status = 'pending');
create policy offices_update_owner on public.offices for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy offices_delete_admin on public.offices for delete using (public.is_admin());

-- office_private: المالك والمدير فقط — لا قراءة للزوار إطلاقاً
create policy office_private_owner on public.office_private for all to authenticated
  using (public.is_admin() or exists (select 1 from public.offices o where o.id = office_id and o.owner_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.offices o where o.id = office_id and o.owner_id = auth.uid()));

-- office_specialties / office_hours: قراءة تتبع ظهور المكتب، الكتابة للمالك والمدير
create policy office_specialties_read on public.office_specialties for select
  using (exists (select 1 from public.offices o where o.id = office_id));
create policy office_specialties_write on public.office_specialties for all to authenticated
  using (public.is_admin() or exists (select 1 from public.offices o where o.id = office_id and o.owner_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.offices o where o.id = office_id and o.owner_id = auth.uid()));

create policy office_hours_read on public.office_hours for select
  using (exists (select 1 from public.offices o where o.id = office_id));
create policy office_hours_write on public.office_hours for all to authenticated
  using (public.is_admin() or exists (select 1 from public.offices o where o.id = office_id and o.owner_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.offices o where o.id = office_id and o.owner_id = auth.uid()));

-- contact_events: الكتابة من الخادم فقط (service role). القراءة للمالك والمدير.
create policy contact_events_read on public.contact_events for select to authenticated
  using (public.is_admin() or exists (select 1 from public.offices o where o.id = office_id and o.owner_id = auth.uid()));

-- reviews: الزائر يرى المعتمد فقط؛ المالك يرى كل تقييمات مكتبه؛ المدير يعدّل الحالة.
-- الإرسال يتم من الخادم فقط بعد التحقق من رمز التقييم.
create policy reviews_read on public.reviews for select
  using (
    status = 'approved'
    or public.is_admin()
    or exists (select 1 from public.offices o where o.id = office_id and o.owner_id = auth.uid())
  );
create policy reviews_moderate on public.reviews for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- الصلاحيات: لا يملك الزائر إلا القراءة
revoke all on public.contact_events from anon;
revoke insert, update, delete on public.reviews from anon;
grant execute on function public.office_contact_methods(uuid) to anon, authenticated;
