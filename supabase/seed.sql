-- ============================================================
-- بيانات تجريبية للتطوير فقط — جميع المكاتب والأرقام وهمية.
-- لا تُستخدم في بيئة الإنتاج.
-- ============================================================

insert into public.cities (slug, name_ar, sort_order) values
  ('dammam', 'الدمام', 1),
  ('khobar', 'الخبر', 2);

insert into public.specialties (slug, name_ar, sort_order) values
  ('personal-status', 'الأحوال الشخصية', 1);

insert into public.specialties (parent_id, slug, name_ar, sort_order)
select s.id, v.slug, v.name_ar, v.sort_order
from public.specialties s,
(values
  ('divorce',      'الطلاق والخلع',        1),
  ('custody',      'الحضانة والزيارة',     2),
  ('alimony',      'النفقة',               3),
  ('marriage',     'إثبات الزواج والعضل',  4),
  ('inheritance',  'التركات والمواريث',    5),
  ('guardianship', 'الولاية والوصاية',     6)
) as v(slug, name_ar, sort_order)
where s.slug = 'personal-status';

-- ---------- المكاتب التجريبية ----------
insert into public.offices (id, slug, name, description, city_id, address, status, reviewed_at) values
  ('11111111-1111-1111-1111-111111111101', 'demo-office-1', 'مكتب تجريبي للمحاماة (١)',
   'مكتب تجريبي يقدّم خدمات الترافع والصلح في قضايا الأحوال الشخصية، مع خبرة في قضايا الحضانة والنفقة. هذا وصف وهمي لأغراض العرض.',
   (select id from public.cities where slug = 'dammam'), 'حي تجريبي، الدمام', 'approved', now()),
  ('11111111-1111-1111-1111-111111111102', 'demo-office-2', 'مكتب تجريبي للمحاماة (٢)',
   'مكتب تجريبي متخصص في قضايا الطلاق والخلع وإثبات الزواج. يقدّم جلسة تعريفية أولى. وصف وهمي.',
   (select id from public.cities where slug = 'khobar'), 'شارع تجريبي، الخبر', 'approved', now()),
  ('11111111-1111-1111-1111-111111111103', 'demo-office-3', 'مكتب تجريبي للمحاماة (٣)',
   'مكتب تجريبي يعمل في قسمة التركات والمواريث وقضايا الولاية والوصاية. وصف وهمي.',
   (select id from public.cities where slug = 'dammam'), 'حي تجريبي آخر، الدمام', 'approved', now()),
  ('11111111-1111-1111-1111-111111111104', 'demo-office-4', 'مكتب تجريبي للمحاماة (٤)',
   'مكتب تجريبي جديد يقدّم خدمات الأحوال الشخصية بشكل عام. وصف وهمي.',
   (select id from public.cities where slug = 'khobar'), 'حي تجريبي، الخبر', 'approved', now()),
  -- مكتب لم يُعتمد بعد: يجب ألا يظهر في الموقع
  ('11111111-1111-1111-1111-111111111105', 'demo-office-pending', 'مكتب تجريبي بانتظار الاعتماد',
   'هذا المكتب لم يُعتمد بعد ولا يجب أن يظهر للزوار.',
   (select id from public.cities where slug = 'dammam'), 'الدمام', 'pending', null);

insert into public.office_private (office_id, phone, whatsapp, email, license_number) values
  ('11111111-1111-1111-1111-111111111101', '+966500000001', '+966500000001', 'office1@example.com', 'TEST-0001'),
  ('11111111-1111-1111-1111-111111111102', '+966500000002', '+966500000002', null,                  'TEST-0002'),
  ('11111111-1111-1111-1111-111111111103', '+966500000003', null,            'office3@example.com', 'TEST-0003'),
  ('11111111-1111-1111-1111-111111111104', null,            '+966500000004', 'office4@example.com', 'TEST-0004'),
  ('11111111-1111-1111-1111-111111111105', '+966500000005', '+966500000005', null,                  'TEST-0005');

insert into public.office_specialties (office_id, specialty_id)
select o.id::uuid, s.id
from (values
  ('11111111-1111-1111-1111-111111111101', 'custody'),
  ('11111111-1111-1111-1111-111111111101', 'alimony'),
  ('11111111-1111-1111-1111-111111111101', 'divorce'),
  ('11111111-1111-1111-1111-111111111102', 'divorce'),
  ('11111111-1111-1111-1111-111111111102', 'marriage'),
  ('11111111-1111-1111-1111-111111111103', 'inheritance'),
  ('11111111-1111-1111-1111-111111111103', 'guardianship'),
  ('11111111-1111-1111-1111-111111111104', 'divorce'),
  ('11111111-1111-1111-1111-111111111104', 'custody'),
  ('11111111-1111-1111-1111-111111111104', 'alimony'),
  ('11111111-1111-1111-1111-111111111104', 'inheritance'),
  ('11111111-1111-1111-1111-111111111105', 'divorce')
) as o(id, slug)
join public.specialties s on s.slug = o.slug;

-- ساعات العمل: الأحد–الخميس، والجمعة مغلق، والسبت حسب المكتب
insert into public.office_hours (office_id, weekday, opens_at, closes_at, is_closed)
select o.id, d.weekday,
       case when d.weekday in (5) or (d.weekday = 6 and o.id <> '11111111-1111-1111-1111-111111111102') then null else time '09:00' end,
       case when d.weekday in (5) or (d.weekday = 6 and o.id <> '11111111-1111-1111-1111-111111111102') then null else time '17:00' end,
       d.weekday = 5 or (d.weekday = 6 and o.id <> '11111111-1111-1111-1111-111111111102')
from public.offices o
cross join generate_series(0, 6) as d(weekday);

-- ---------- تواصل وتقييمات تجريبية ----------
insert into public.contact_events (id, office_id, method, created_at)
select ('22222222-2222-2222-2222-2222222222' || lpad(n::text, 2, '0'))::uuid,
       o.office_id::uuid, o.method::public.contact_method, now() - (n || ' days')::interval
from (values
  (1,  '11111111-1111-1111-1111-111111111101', 'whatsapp'),
  (2,  '11111111-1111-1111-1111-111111111101', 'call'),
  (3,  '11111111-1111-1111-1111-111111111101', 'whatsapp'),
  (4,  '11111111-1111-1111-1111-111111111102', 'call'),
  (5,  '11111111-1111-1111-1111-111111111102', 'whatsapp'),
  (6,  '11111111-1111-1111-1111-111111111103', 'email'),
  (7,  '11111111-1111-1111-1111-111111111101', 'whatsapp')
) as o(n, office_id, method);

insert into public.reviews (office_id, contact_event_id, reviewer_name, rating, comment, status, moderated_at, created_at)
values
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 'مستخدم تجريبي', 5,
   'تعليق تجريبي: تعامل راقٍ ووضوح في شرح الإجراءات.', 'approved', now(), now() - interval '1 day'),
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202', 'مستخدم تجريبي', 4,
   'تعليق تجريبي: رد سريع على واتساب.', 'approved', now(), now() - interval '2 days'),
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222203', null, 5,
   null, 'approved', now(), now() - interval '3 days'),
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222204', 'مستخدم تجريبي', 3,
   'تعليق تجريبي: جيد لكن المواعيد محدودة.', 'approved', now(), now() - interval '4 days'),
  ('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222206', 'مستخدم تجريبي', 4,
   'تعليق تجريبي: خبرة واضحة في قسمة التركات.', 'approved', now(), now() - interval '6 days'),
  -- تقييم بانتظار المراجعة: يجب ألا يظهر
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222207', 'غير معتمد', 1,
   'هذا التقييم بانتظار المراجعة ولا يجب أن يظهر.', 'pending', null, now());

-- ---------- حسابات تجريبية للتطوير المحلي فقط ----------
-- كلمة المرور لكليهما: Password123!
--   admin@example.com  → مدير المنصة
--   owner@example.com  → صاحب "مكتب تجريبي للمحاماة (١)"
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
select '00000000-0000-0000-0000-000000000000', u.id::uuid, 'authenticated', 'authenticated', u.email,
       extensions.crypt('Password123!', extensions.gen_salt('bf')), now(),
       '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', u.full_name),
       now(), now(), '', '', '', ''
from (values
  ('33333333-3333-3333-3333-333333333301', 'admin@example.com', 'مدير تجريبي'),
  ('33333333-3333-3333-3333-333333333302', 'owner@example.com', 'صاحب مكتب تجريبي')
) as u(id, email, full_name);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u
where u.id in ('33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333302');

update public.profiles set role = 'admin'  where id = '33333333-3333-3333-3333-333333333301';
update public.profiles set role = 'office' where id = '33333333-3333-3333-3333-333333333302';
update public.offices set owner_id = '33333333-3333-3333-3333-333333333302'
 where id = '11111111-1111-1111-1111-111111111101';
