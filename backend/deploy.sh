#!/bin/bash

# エラーが発生したら即座に終了
set -e

# プロジェクトIDを設定
PROJECT_ID="techpro-official-site"
REGION="asia-northeast1"
SERVICE_NAME="techpro-form-api"

# プロジェクトの設定
echo "Setting project..."
gcloud config set project $PROJECT_ID

# イメージのビルド
echo "Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --region global

# Cloud Runへのデプロイ
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="FORM_SS_ID=1Q8rwAR7praYZxLO2ATcOQi6V7VDZ1i8AUjVsSPbuQ7Y,ZAIKO_SS_ID=10uAVMY4vih_AaGHoWIp4q3J0FXDXTppBa7LHD198CgA"

echo "Deployment completed successfully!" 