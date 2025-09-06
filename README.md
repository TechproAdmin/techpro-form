# TechPro Form

不動産投資案件の内見申込・買付申込フォームを管理するWebアプリケーション

## プロジェクト構成

```
.
└── frontend/          # Next.jsフロントエンド
    ├── src/           # ソースコード
    │   ├── app/       # Next.js App Router
    │   ├── components/ # React コンポーネント
    │   ├── api.ts     # Google Apps Script API連携
    │   ├── types.ts   # TypeScript型定義
    │   └── utils.ts   # ユーティリティ関数
    ├── public/        # 静的ファイル
    └── package.json   # 依存関係
```

## 機能

- **物件検索・選択**: 案件管理番号や住所での物件検索
- **買付申込フォーム** (`/kaitsuke`): 買付条件の入力と送信
- **内見申込フォーム** (`/naiken`): 内見希望日の入力と免許証・名刺のアップロード
- **CAフォーム** (`/ca`): CA（秘密保持契約）の申込
- **秘密保持誓約ページ** (`/ca-articles`): 秘密保持契約の詳細条項
- **Google Spreadsheet連携**: 物件データの取得とフォーム送信

## 技術スタック

### フロントエンド
- **Next.js 15.3.2** - React フレームワーク
- **TypeScript 5** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **Firebase Hosting** - デプロイ先

### バックエンド
- **Google Apps Script (GAS)** - サーバーサイド処理
- **Google Spreadsheet API** - データ管理

## セットアップ

### 前提条件
- Node.js (v18以上)
- Google Apps Script プロジェクト
- Google Spreadsheet の設定

### フロントエンドのセットアップ

```bash
cd frontend
npm install
npm run dev
```

### 環境変数の設定

#### Google Apps Script API URL
- `GAS_API_URL`: Google Apps Script の Web App URL
  - 現在の設定: `https://script.google.com/macros/s/AKfycbwHBRUlauSxej0E5Xbg7oVRiZO3tLVYbTKdM1LIr2vITaPVTDQGq0E3K9UQ7txZUM6X/exec`

## デプロイ

### フロントエンド（Firebase Hosting）

```bash
cd frontend
npm run build
npm run export
firebase deploy
```

## API 仕様

### Google Apps Script エンドポイント

#### 在庫一覧取得
- **Action**: `fetch`
- **Method**: `POST`
- **Response**: 物件データの配列

#### 買付申込フォーム送信
- **Action**: `kaitsuke`
- **Method**: `POST`
- **Data**: 買付申込情報

#### 内見申込フォーム送信
- **Action**: `naiken`
- **Method**: `POST`
- **Data**: 内見申込情報（画像ファイル含む）

#### CAフォーム送信
- **Action**: `ca`
- **Method**: `POST`
- **Data**: CA申込情報

## 開発者向け情報

### ローカル開発

```bash
cd frontend
npm run dev
```

### デバッグ
- フロントエンド: `http://localhost:3000`

### プロジェクト構造

```
frontend/src/
├── app/
│   ├── page.tsx              # ホームページ
│   ├── kaitsuke/page.tsx     # 買付申込フォーム
│   ├── naiken/page.tsx       # 内見申込フォーム
│   ├── ca/page.tsx           # CAフォーム
│   └── ca-articles/page.tsx  # 秘密保持誓約
├── components/
│   ├── KaitsukeConfirmModal.tsx
│   ├── KaitsukeCompleteModal.tsx
│   ├── NaikenConfirmModal.tsx
│   ├── NaikenCompleteModal.tsx
│   ├── CAConfirmModal.tsx
│   └── CACompleteModal.tsx
├── api.ts                    # GAS API連携
├── types.ts                  # TypeScript型定義
└── utils.ts                  # ユーティリティ関数
```
