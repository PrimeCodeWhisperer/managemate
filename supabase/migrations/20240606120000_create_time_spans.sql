create table if not exists time_spans (
  id serial primary key,
  name text not null,
  start_time time not null,
  end_time time not null
);
