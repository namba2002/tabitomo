# tabitomo

みんなで行きたい場所を共有できるWebアプリです。

URLを共有するだけで、ログイン不要で誰でも行きたい場所を追加・チェックできます。

## 技術構成

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL)
- **Vercel** (デプロイ先)

---

## セットアップ手順

### 1. Supabaseプロジェクトを作成

1. [supabase.com](https://supabase.com) にアクセスしてアカウントを作成
2. 「New project」からプロジェクトを作成
3. プロジェクトURLとAPI Keyを控えておく

### 2. データベースにテーブルを作成

Supabaseダッシュボード > **SQL Editor** を開き、以下のSQLを実行してください。

```sql
-- ルームテーブル
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  created_at timestamptz not null default now()
);

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

create index if not exists items_room_id_idx on items(room_id);

alter table rooms disable row level security;
alter table items disable row level security;
```

> `supabase/schema.sql` にも同じSQLが保存されています。

### 3. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成し、値を設定してください。

```bash
cp .env.example .env.local
```

`.env.local` を編集：

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**環境変数の確認場所：**  
Supabaseダッシュボード > Settings > API

- `SUPABASE_URL` → Project URL
- `SUPABASE_SERVICE_ROLE_KEY` → `service_role` key（⚠️ 外部に公開しないこと）

### 4. 依存パッケージをインストール

```bash
npm install
```

### 5. ローカルで起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## Vercelデプロイ手順

### 1. GitHubにプッシュ

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourname/tabitomo.git
git push -u origin main
```

### 2. Vercelにデプロイ

1. [vercel.com](https://vercel.com) にアクセス
2. 「New Project」からGitHubリポジトリを選択
3. 環境変数を設定（重要）

### 3. Vercelの環境変数設定

Vercelダッシュボード > プロジェクト > **Settings** > **Environment Variables** に以下を追加：

| 変数名 | 値 |
|---|---|
| `SUPABASE_URL` | SupabaseのProject URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseのservice_role key |

> ⚠️ **重要**: `NEXT_PUBLIC_` プレフィックスを**つけないこと**。クライアントに公開されてしまいます。

### 4. デプロイ実行

環境変数を保存するとVercelが自動でデプロイを開始します。

---

## ディレクトリ構成

```
tabitomo/
├── app/
│   ├── page.tsx                    # トップ画面（ルーム作成）
│   ├── created/
│   │   └── page.tsx                # URL発行完了画面
│   ├── rooms/
│   │   └── [slug]/
│   │       └── page.tsx            # メインのリスト画面
│   ├── api/
│   │   ├── rooms/
│   │   │   └── route.ts            # ルーム作成API
│   │   └── items/
│   │       ├── route.ts            # アイテム追加API
│   │       └── [id]/
│   │           └── route.ts        # アイテム更新API（完了チェック）
│   ├── not-found.tsx               # 404ページ
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── SeasonBadge.tsx             # 季節ラベルコンポーネント
│   ├── ItemCard.tsx                # アイテムカードコンポーネント
│   ├── AddItemForm.tsx             # 入力フォームコンポーネント
│   └── ItemList.tsx                # リスト + RoomView（state管理）
├── lib/
│   ├── supabase.ts                 # Supabaseクライアント（サーバー専用）
│   ├── slug.ts                     # slug生成ユーティリティ
│   └── time.ts                     # 時刻フォーマットユーティリティ
├── types/
│   └── index.ts                    # 型定義
├── supabase/
│   └── schema.sql                  # データベーススキーマ
├── .env.example                    # 環境変数テンプレート
└── README.md
```

---

## 動作確認方法

1. `http://localhost:3000` を開く
2. 「ルームを作成する」ボタンをクリック
3. URL発行完了画面でURLをコピー
4. 「ルームを開く」ボタンをクリック
5. 季節を選んで行きたい場所を入力し「追加」ボタンをクリック
6. 追加した場所がリロードなしで一覧に表示されることを確認
7. チェックボタンを押して「行った場所」に移動することを確認
8. 「行った場所」のチェックを押して「行きたい場所」に戻ることを確認
9. コピーしたURLを別のブラウザで開き、同じリストが表示されることを確認

---

## 今後追加予定の機能（MVP未実装）

- リアルタイム同期（Supabase Realtime）
- 削除・編集
- 並び替え（ドラッグ&ドロップ）
- 季節フィルター
- コメント・メモ欄
- 行きたい場所のURL添付
- パスワード保護
- OGP設定
