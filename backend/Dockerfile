# Dockerfile
FROM node:18

WORKDIR /app
COPY . .

# 依存関係のインストール
RUN npm install

# TypeScript をビルド
RUN npm run build

# アプリケーションを起動
CMD ["npm", "start"]
