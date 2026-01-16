#!/bin/bash
# Deploy LibreChat to GCP Cloud Run

set -e

PROJECT_ID="inquiry-institute"
REGION="us-central1"
SERVICE_NAME="librechat"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying LibreChat to GCP Cloud Run..."

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run: gcloud auth login"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Create Dockerfile for Cloud Run
cat > Dockerfile << 'EOF'
FROM ghcr.io/danny-avila/librechat:latest

# Environment variables will be set via Cloud Run
ENV PORT=8080
EXPOSE 8080
EOF

# Build and push image
echo "📦 Building Docker image..."
gcloud builds submit --tag $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."

# Get secrets from .env
source .env

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "DATABASE_URI=sqlite:///data/librechat.db" \
  --set-env-vars "APP_TITLE=Inquiry Institute Chat" \
  --set-env-vars "APP_DOMAIN=chat.inquiry.institute" \
  --set-env-vars "ALLOW_REGISTRATION=false" \
  --set-env-vars "ALLOW_SOCIAL_LOGIN=false" \
  --set-env-vars "OPENAI_API_KEY=${SUPABASE_ANON_KEY}" \
  --set-env-vars "OPENAI_BASE_URL=https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/chat-api/v1" \
  --set-env-vars "DEFAULT_MODEL=openai/gpt-oss-120b" \
  --set-env-vars "JWT_SECRET=${JWT_SECRET}" \
  --set-env-vars "JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}" \
  --set-env-vars "FILE_UPLOAD_SIZE_LIMIT=10" \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ LibreChat deployed!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "Next steps:"
echo "1. Update DNS to point chat.inquiry.institute to this service"
echo "2. Visit: $SERVICE_URL"
