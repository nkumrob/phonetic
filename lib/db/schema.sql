-- Turso (libSQL/SQLite) schema for natophonetic.com
-- Apply with: npm run db:init  (uses TURSO_DATABASE_URL from .env.local)

create table if not exists reviews (
  id text primary key,
  name text not null,
  email text,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  comment text not null,
  date text not null,
  verified integer not null default 0,
  approved integer not null default 0,
  helpful integer not null default 0,
  location text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create index if not exists idx_reviews_approved_date on reviews (approved, date desc);

create table if not exists tool_usage (
  id text primary key,
  tool_name text not null,
  model text,
  input_tokens integer,
  output_tokens integer,
  latency_ms integer,
  session_hash text,
  time_saved_bucket text check (time_saved_bucket in ('<1', '1-5', '5-15', '15+')),
  created_at text not null default (datetime('now'))
);

create index if not exists idx_tool_usage_tool_created on tool_usage (tool_name, created_at desc);
