# tabitomo 設計書

## アプリの目的

グループで「行きたい場所」を持ち寄り、旅行の計画づくりをスムーズにする Web アプリ。

---

## 基本方針

### Walica（ワリカ）に準拠
- **ログイン不要**：URL を知っていれば誰でも参加できる
- **URL 共有モデル**：グループ名でルームを作成 → URL を LINE 等でシェア → 全員が編集可能
- **リアルタイム同期は不要**：リロードすれば反映される設計で十分
- **シンプル・モバイルファースト**：余計な機能を増やさず、核心的なユースケースに絞る

### UX は Microsoft Todo に準拠
- チェックボックス：円形、完了時にアニメーション
- 削除ボタン：ホバー時フェードイン（デスクトップ）／常時薄く表示（モバイル）
- トランジション：滑らかに
- 入力欄は下部固定

---

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 16（App Router） |
| スタイリング | Tailwind CSS |
| アイコン | Lucide React |
| データベース | Supabase（PostgreSQL） |
| ホスティング | Vercel |
| 言語 | TypeScript |

---

## データベース設計

### rooms テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | 主キー（自動生成） |
| slug | text | URL に使用するグループ名ベースの識別子 |
| name | text | グループ名（表示用） |
| created_at | timestamptz | 作成日時 |

### items テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | 主キー（自動生成） |
| room_id | uuid | 所属するルームの ID（外部キー） |
| title | text | 場所名（最大 50 文字） |
| season | text | 季節タグ（spring/summer/autumn/winter/undecided） |
| memo | text | メモ欄（現在 UI 未実装、DB のみ存在） |
| is_done | boolean | 「行った」かどうか |
| done_at | timestamptz | 「行った」に変更した日時 |
| created_at | timestamptz | 追加日時 |

---

## URL 設計

| パス | 役割 |
|------|------|
| `/` | トップページ（グループ名入力 → ルーム作成） |
| `/created?slug=xxx&name=yyy` | ルーム作成完了ページ（URL 共有） |
| `/rooms/[slug]` | ルームページ（行きたい場所一覧・追加） |

### スラグ生成ルール
- グループ名をそのままスラグとして使用
- スペースはハイフン（`-`）に変換
- 同名が既に存在する場合は末尾に `-2`, `-3` と付加
- 日本語はそのまま使用（URL エンコードで対応）

---

## API 設計

### POST /api/rooms
ルームを作成する。

**リクエスト**
```json
{ "name": "大学の友達" }
```

**レスポンス**
```json
{ "slug": "大学の友達", "name": "大学の友達" }
```

---

### POST /api/items
アイテムを追加する。

**リクエスト**
```json
{ "room_id": "uuid", "title": "鎌倉でカフェ巡り", "season": "spring" }
```

**レスポンス**
```json
{ "id": "uuid", "title": "鎌倉でカフェ巡り", "season": "spring", "is_done": false, ... }
```

---

### PATCH /api/items/[id]
アイテムを更新する（完了/未完了の切り替え）。

**リクエスト**
```json
{ "is_done": true }
```

---

### DELETE /api/items/[id]
アイテムを削除する。レスポンスは 204 No Content。

---

## コンポーネント設計

```
app/
├── page.tsx              # トップページ（ルーム作成フォーム）
├── created/page.tsx      # ルーム作成完了ページ
├── rooms/[slug]/page.tsx # ルームページ（サーバーコンポーネント）
└── not-found.tsx         # 404 ページ

components/
├── ItemList.tsx          # ルームの状態管理・リスト表示（RoomView）
├── ItemCard.tsx          # アイテム1件の表示
├── AddItemForm.tsx       # アイテム追加フォーム
├── ShareButton.tsx       # URL 共有ボタン
└── SeasonBadge.tsx       # 季節タグバッジ
```

### 状態管理の考え方
- サーバーコンポーネント（`rooms/[slug]/page.tsx`）でルームとアイテムを初期取得
- クライアントコンポーネント（`ItemList.tsx`）で以降の状態を管理
- グローバルな状態管理ライブラリは不使用（useState のみ）

---

## パフォーマンス設計

### 楽観的更新（Optimistic Update）
全ての書き込み操作でサーバーのレスポンスを待たずに UI を先に更新する。

| 操作 | 楽観的更新 | 失敗時の処理 |
|------|-----------|-------------|
| アイテム追加 | 仮 ID でリストに即表示 | 仮アイテムを削除・エラー表示 |
| 完了/未完了 | 即座に状態変更 | 元の状態に戻す |
| 削除 | 即座にリストから除去 | 元のアイテムを復元 |

---

## モバイル対応

### iOS Safari のズーム防止
iOS Safari はフォントサイズ 16px 未満の入力欄をタップすると自動ズームする仕様がある。

**対策（二重）：**
1. `globals.css` で `input, select, textarea { font-size: max(16px, 1em); }` を強制適用
2. `autoFocus` を使わない（ページロード時のズーム誘発を防止）

### セーフエリア対応
iPhone のホームインジケーター（ジェスチャーバー）と重ならないよう、入力欄の底に `env(safe-area-inset-bottom)` を適用。ホームインジケーターのない端末では余白 0。

```css
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## OGP 設計

LINE や X でシェアしたときにプレビューが正しく表示されるよう設定。

| ページ | OGP タイトル | OGP 画像 |
|--------|-------------|---------|
| トップ | `tabitomo` | アプリ名＋アイコン＋タグライン |
| ルーム | `グループ名 \| tabitomo` | グループ名（大）＋「の行きたい場所リスト」 |

OGP 画像は Next.js の `ImageResponse`（Satori ベース）で動的生成。Lucide のアイコンは SVG パスをインライン記述して使用（Satori は React コンポーネントの一部機能を未サポートのため）。

---

## Supabase 接続

**サーバーサイド専用：** `lib/supabase.ts` は `service_role` キーを使用し、API ルートとサーバーコンポーネントからのみインポートする。クライアントには露出しない。

```typescript
// サーバーサイド専用（クライアントで import しないこと）
export const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
```

---

## デプロイフロー

```
ローカルで開発・修正
↓
git commit
↓
git push（GitHub）
↓
Vercel が自動でビルド・デプロイ
↓
https://tabitomo.vercel.app に反映
```

環境変数は Vercel のプロジェクト設定に登録済み（`.env.local` には置かない）：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
