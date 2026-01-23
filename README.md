# Techpro Form
顧客からの内見申込、買付、CA提出を受け付けるフォーム用Webアプリケーション。
提出された情報のDB登録やメール・LINE通知などを行います。

## 目次
[機能](#機能)
[技術スタック](#技術スタック)
[開発・管理用リンク](#開発・管理用リンク)
[前提条件](#前提条件)
[クイックスタート](#クイックスタート)
[主要機能詳細](#主要機能詳細)
[プロジェクト構造](#プロジェクト構造)
[トラブルシューティング](#トラブルシューティング)

## 機能
- **買付フォーム**: 在庫物件に対する買付提出
- **内見フォーム**: 在庫物件に対する内見申込の提出
- **CAフォーム**: 対象物件を選択してCAへの同意提出
※詳細は[主要機能詳細](#主要機能詳細)を参照

## 技術スタック
- **フロントエンド**: Next.js
    - **言語**: TypeScript
    - **UIフレームワーク**: Tailwind CSS
- **バックエンド**: Google Apps Script
- **データベース**: Google Cloud SQL (PostgreSQL)
- **インフラ/ホスティング**: Firebase Hosting

## 開発・管理用リンク
- **デプロイ済みURL**: https://techpro-form.web.app/
- **バックエンド (GAS)**: [テクプロフォームバックエンドAPI](https://script.google.com/...)
- **DB管理コンソール**: [Cloud SQL インスタンス](https://console.cloud.google.com/...)
- **ホスティング管理**: [Firebase Console](https://console.firebase.google.com/...)

## 前提条件
- Node.js
- Firebase SDK

## クイックスタート
### セットアップ
```bash
# リポジトリをクローン
git clone <リポジトリURL>
cd techpro-form/frontend/

# パッケージをインストール
npm install
```

### 開発サーバー起動
```bash
npm run dev
```

### デプロイ
```bash
# ビルドを実行
npm run build

# Firebaseにログイン
firebase login --reauth

# Firebaseにデプロイ
firebase deploy
```

## 主要機能詳細
### 買付フォーム
`/kaitsuke`
- バックエンドのGAS APIを呼び出して、在庫物件のリストを取得する
- ユーザーは必要項目を入力、対象物件を上記で取得したリスト内から選択する
- 送信ボタンを押すと確認モーダルが出現する
- 確認モーダルで送信ボタンを押すと、バックエンドのGAS APIを呼び出す
- GAS APIは、CloudSQLへの登録・顧客へのお礼メール配信・LINE WORKS通知を行う

### 内見フォーム
`/naiken`
- バックエンドのGAS APIを呼び出して、在庫物件のリストを取得する
- ユーザーは必要項目を入力、対象物件を上記で取得したリスト内から選択する
    - 選択した物件が「内見NG」「内見不可」の場合、申込不可となる
    - 選択した物件が「内見準備中」の場合、申込は可能だが日時の選択が不可となる
- 送信ボタンを押すと確認モーダルが出現する
- 確認モーダルで送信ボタンを押すと、バックエンドのGAS APIを呼び出す
- GAS APIは、CloudSQLへの登録・顧客への受付完了メール配信を行う

### CAフォーム
`/ca`
- バックエンドのGAS APIを呼び出して、在庫物件のリストを取得する
- ユーザーは必要項目を入力、対象物件を上記で取得したリスト内から選択する
- 送信ボタンを押すと確認モーダルが出現する
- 確認モーダルで送信ボタンを押すと、バックエンドのGAS APIを呼び出す
- GAS APIは、CloudSQLへの登録・顧客への受付完了メール配信を行う

### CA条項ページ
`/ca-articles`
- CA条項を表示する
- CAフォームにはこのページのリンクが付いている

## プロジェクト構造
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

## トラブルシューティング
| 問題 | 解決方法 |
| --- | --- |
| 在庫物件が表示されない | コンソールログを確認する。GAS APIエラーの可能性が高い。 |
