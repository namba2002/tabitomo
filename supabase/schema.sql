-- tabitomo データベーススキーマ
-- Supabaseのダッシュボード > SQL Editor でこのファイルの内容を貼り付けて実行してください

-- ルームテーブル
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null default '',
  created_at timestamptz not null default now()
);

-- slugにインデックス
create index if not exists rooms_slug_idx on rooms(slug);

-- アイテムテーブル
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  title text not null check (char_length(title) <= 50),
  season text not null check (season in ('spring', 'summer', 'autumn', 'winter', 'undecided')),
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  done_at timestamptz
);

-- room_idにインデックス
create index if not exists items_room_id_idx on items(room_id);

-- RLS（Row Level Security）はservice role keyからのアクセスのため無効化
-- ※サーバーサイドのみからアクセスするため、クライアントから直接Supabaseにアクセスしない設計
alter table rooms disable row level security;
alter table items disable row level security;
