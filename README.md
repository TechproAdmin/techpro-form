# TechPro Form

不動産投資案件の内見申込・買付申込フォームを管理するWebアプリケーション

## プロジェクト構成

```
.
├── frontend/          # Next.jsフロントエンド
│   ├── src/          # ソースコード
│   ├── public/       # 静的ファイル
│   └── ...
└── backend/          # Express.jsバックエンド
    ├── src/          # ソースコード
    ├── deploy.sh     # デプロイスクリプト
    └── ...
```

## 機能

- 在庫一覧の表示
- 内見可物件の一覧表示
- 内見申込フォーム
- 買付申込フォーム
- Google Spreadsheetとの連携

## 技術スタック

### フロントエンド
- Next.js
- TypeScript
- Tailwind CSS
- Firebase Hosting

### バックエンド
- Express.js
- TypeScript
- Google Sheets API
- Google Cloud Run

## セットアップ

### 前提条件
- Node.js (v18以上)
- Google Cloud SDK
- Google Cloud プロジェクト
- Google Spreadsheet APIの有効化
- サービスアカウントの作成と認証情報の設定

### フロントエンドのセットアップ

```bash
cd frontend
npm install
npm run dev
```

### バックエンドのセットアップ

```bash
cd backend
npm install
npm run dev
```

### 環境変数の設定

#### バックエンド
- `FORM_SS_ID`: フォーム管理用スプレッドシートID
- `ZAIKO_SS_ID`: 在庫管理用スプレッドシートID
- `credentials.json`: Google Cloud認証情報

## デプロイ

### フロントエンド（Firebase Hosting）

```bash
cd frontend
npm run build
firebase deploy
```

### バックエンド（Cloud Run）

```bash
cd backend
./deploy.sh
```

## API エンドポイント

### 在庫一覧取得
- `GET /fetch`
  - 全在庫物件の一覧を取得

### 内見可物件一覧取得
- `GET /fetch_naiken`
  - 内見可能な物件の一覧を取得

### 内見申込フォーム
- `POST /send_naiken`
  - 内見申込情報を送信

### 買付申込フォーム
- `POST /send_kaitsuke`
  - 買付申込情報を送信

## 開発者向け情報

### ローカル開発
1. バックエンドの起動
   ```bash
   cd backend
   npm run dev
   ```

2. フロントエンドの起動
   ```bash
   cd frontend
   npm run dev
   ```

### デバッグ
- バックエンド: `http://localhost:8080`
- フロントエンド: `http://localhost:3000`

## ライセンス

このプロジェクトは社内利用専用です。
