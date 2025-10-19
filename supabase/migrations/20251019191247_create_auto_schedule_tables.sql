create table if not exists auto_schedule_settings (
  settings_key text primary key,
  default_per_day integer not null default 2,
  updated_at timestamptz not null default now()
);

insert into auto_schedule_settings (settings_key, default_per_day)
values ('default', 2)
on conflict (settings_key) do nothing;
