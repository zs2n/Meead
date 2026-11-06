-- أنواع قضايا إضافية تحت الأحوال الشخصية
insert into public.specialties (parent_id, slug, name_ar, sort_order)
select s.id, v.slug, v.name_ar, v.sort_order
from public.specialties s,
(values
  ('dowry',     'المهر والشبكة',     7),
  ('paternity', 'النسب وإثباته',     8),
  ('bequest',   'الوصية',            9),
  ('annulment', 'الفسخ والتفريق',   10)
) as v(slug, name_ar, sort_order)
where s.slug = 'personal-status'
on conflict (slug) do nothing;

-- تخصص العمالية وأنواع قضاياه
insert into public.specialties (parent_id, slug, name_ar, sort_order)
values (null, 'labor', 'العمالية', 2)
on conflict (slug) do nothing;

insert into public.specialties (parent_id, slug, name_ar, sort_order)
select s.id, v.slug, v.name_ar, v.sort_order
from public.specialties s,
(values
  ('employment-contract', 'عقود العمل',                1),
  ('unfair-dismissal',    'الفصل التعسفي',             2),
  ('wages',               'الأجور والمستحقات',         3),
  ('end-of-service',      'مكافأة نهاية الخدمة',       4),
  ('leave',               'الإجازات',                  5),
  ('work-injury',         'إصابات العمل',              6)
) as v(slug, name_ar, sort_order)
where s.slug = 'labor'
on conflict (slug) do nothing;
