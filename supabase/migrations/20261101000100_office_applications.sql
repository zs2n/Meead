-- ============================================================
-- طلبات تسجيل المكاتب + تخزين الرخص
-- ============================================================

-- ---------- تجاوز حماية الحالة من داخل دوال النظام فقط ----------
-- الدوال الموثوقة (security definer) تضبط هذا المتغير داخل المعاملة نفسها.
create or replace function public.guard_office_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_admin()
     or auth.uid() is null
     or current_setting('meead.bypass_guard', true) = 'on' then
    return new;
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

create or replace function public.license_change_requires_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.license_number is distinct from old.license_number
     or new.license_doc_path is distinct from old.license_doc_path then
    perform set_config('meead.bypass_guard', 'on', true);
    update public.offices
       set status = 'pending', reviewed_at = null, reviewed_by = null
     where id = new.office_id and status in ('approved', 'rejected');
  end if;
  return new;
end $$;

-- ---------- حفظ طلب المكتب / تعديل ملفه (معاملة واحدة) ----------
-- إن لم يكن للمستخدم مكتب: يُنشأ طلب جديد بحالة "قيد المراجعة".
-- إن كان مرفوضاً: التعديل يعيد تقديم الطلب.
-- تغيير رقم الرخصة أو صورتها يعيد المكتب المعتمد للمراجعة (عبر الـ trigger).
create function public.save_my_office(p jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid    uuid := auth.uid();
  v_office public.offices%rowtype;
  v_id     uuid;
  v_city   smallint;
  v_count  int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  perform set_config('meead.bypass_guard', 'on', true);

  select id into v_city from public.cities where slug = p ->> 'city' and is_active;
  if v_city is null then raise exception 'invalid_city'; end if;

  select * into v_office from public.offices where owner_id = v_uid limit 1;

  if not found then
    insert into public.offices (owner_id, slug, name, description, city_id, address, status)
    values (
      v_uid,
      'office-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
      p ->> 'name',
      nullif(p ->> 'description', ''),
      v_city,
      nullif(p ->> 'address', ''),
      'pending'
    )
    returning id into v_id;

    update public.profiles
       set role = 'office',
           full_name = coalesce(full_name, nullif(p ->> 'contact_name', ''))
     where id = v_uid and role = 'user';
  else
    v_id := v_office.id;
    if v_office.status = 'suspended' then raise exception 'office_suspended'; end if;

    update public.offices set
      name             = p ->> 'name',
      description      = nullif(p ->> 'description', ''),
      city_id          = v_city,
      address          = nullif(p ->> 'address', ''),
      status           = case when status = 'rejected' then 'pending'::public.office_status else status end,
      rejection_reason = case when status = 'rejected' then null else rejection_reason end
    where id = v_id;
  end if;

  insert into public.office_private (office_id, phone, whatsapp, email, license_number, license_doc_path)
  values (
    v_id,
    nullif(p ->> 'phone', ''),
    nullif(p ->> 'whatsapp', ''),
    nullif(p ->> 'email', ''),
    nullif(p ->> 'license_number', ''),
    nullif(p ->> 'license_doc_path', '')
  )
  on conflict (office_id) do update set
    phone            = excluded.phone,
    whatsapp         = excluded.whatsapp,
    email            = excluded.email,
    license_number   = excluded.license_number,
    license_doc_path = coalesce(excluded.license_doc_path, public.office_private.license_doc_path);

  -- أنواع القضايا (أبناء التخصص الرئيسي فقط)
  delete from public.office_specialties where office_id = v_id;
  insert into public.office_specialties (office_id, specialty_id)
  select v_id, s.id
  from public.specialties s
  where s.is_active and s.parent_id is not null
    and s.slug in (select jsonb_array_elements_text(coalesce(p -> 'specialties', '[]'::jsonb)));
  get diagnostics v_count = row_count;
  if v_count = 0 then raise exception 'specialty_required'; end if;

  -- ساعات العمل
  delete from public.office_hours where office_id = v_id;
  insert into public.office_hours (office_id, weekday, opens_at, closes_at, is_closed)
  select v_id, h.weekday, case when h.is_closed then null else h.opens_at end,
         case when h.is_closed then null else h.closes_at end, h.is_closed
  from jsonb_to_recordset(coalesce(p -> 'hours', '[]'::jsonb))
       as h(weekday smallint, opens_at time, closes_at time, is_closed boolean);

  return v_id;
end $$;

revoke execute on function public.save_my_office(jsonb) from public, anon;
grant execute on function public.save_my_office(jsonb) to authenticated;

-- ---------- تخزين صور الرخص (خاص: لا وصول إلا عبر الخادم) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('licenses', 'licenses', false, 5242880, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
