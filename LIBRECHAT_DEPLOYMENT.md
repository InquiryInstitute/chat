# LibreChat Deployment Guide

## Option 1: GCP Cloud Run (Recommended)

### Prerequisites

1. **GCP Project**: `inquiry-institute`
2. **gcloud CLI**: Installed and authenticated
3. **Environment file**: `.env` with secrets

### Deploy

```bash
cd ~/GitHub/chat
./deploy-librechat.sh
```

This will:
1. Build Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Provide service URL

### Update DNS

After deployment, get the service URL and update Route 53:

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe librechat --region us-central1 --format 'value(status.url)')
echo "Service URL: $SERVICE_URL"

# Extract domain (e.g., librechat-xxxxx-uc.a.run.app)
DOMAIN=$(echo $SERVICE_URL | sed 's|https://||')

# Update DNS to CNAME
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"chat.inquiry.institute\",
        \"Type\": \"CNAME\",
        \"TTL\": 300,
        \"ResourceRecords\": [{\"Value\": \"${DOMAIN}\"}]
      }
    }]
  }"
```

## Option 2: Docker Compose (Local/Server)

### Prerequisites

- Docker and Docker Compose installed
- Server with public IP

### Deploy

```bash
cd ~/GitHub/chat

# Create .env file (if not exists)
cp .env.example .env
# Edit .env and add SUPABASE_ANON_KEY

# Generate JWT secrets
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f librechat
```

LibreChat will be available at: `http://your-server-ip:3080`

### Update DNS

Point `chat.inquiry.institute` to your server IP:

```bash
export SERVER_IP=your.server.ip.address
./scripts/setup-dns.sh
```

### Reverse Proxy (Nginx)

For HTTPS, set up Nginx:

```nginx
server {
    listen 80;
    server_name chat.inquiry.institute;
    
    location / {
        proxy_pass http://localhost:3080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then set up SSL:
```bash
certbot --nginx -d chat.inquiry.institute
```

## Option 3: Railway / Render

### Railway

1. Connect GitHub repo
2. Set environment variables from `.env`
3. Deploy
4. Update DNS to Railway domain

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Set environment variables
4. Deploy
5. Update DNS

## Configuration

### Environment Variables

Required:
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh secret

Optional:
- `OPENAI_BASE_URL` - Default: chat-api endpoint
- `DEFAULT_MODEL` - Default: openai/gpt-oss-120b
- `APP_DOMAIN` - Default: chat.inquiry.institute

### Faculty Parameter

LibreChat needs to be configured to pass the faculty parameter. Options:

1. **Custom LibreChat build** - Modify LibreChat to include faculty selector
2. **Proxy middleware** - Use persona-proxy.js to extract faculty from messages
3. **URL parameter** - Modify LibreChat to read from URL (requires code changes)

## Testing

After deployment:

1. Visit the service URL
2. Create an account (if registration enabled)
3. Start a chat
4. Verify it connects to chat-api

## Troubleshooting

### LibreChat won't start

- Check logs: `docker-compose logs librechat`
- Verify environment variables are set
- Check port 3080 is available

### Can't connect to API

- Verify `SUPABASE_ANON_KEY` is correct
- Check `OPENAI_BASE_URL` points to correct endpoint
- Test API directly: `curl -X POST $OPENAI_BASE_URL/chat/completions ...`

### Faculty parameter not working

- LibreChat needs custom configuration to pass faculty
- Consider using the simple HTML interface instead
- Or modify LibreChat source code

## Next Steps

1. ✅ Deploy LibreChat
2. ⏳ Configure faculty parameter passing
3. ⏳ Set up DNS
4. ⏳ Test with various faculty members
