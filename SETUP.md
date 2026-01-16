# LibreChat Setup Guide

Complete guide to set up LibreChat for Inquiry Institute with persona selection.

## Prerequisites

1. **Docker** and **Docker Compose** installed
2. **AWS CLI** configured (for DNS setup)
3. **Supabase Anon Key** (get from Supabase dashboard)

## Step 1: Environment Setup

```bash
cd ~/GitHub/chat
cp .env.example .env
```

Edit `.env` and add:

```bash
SUPABASE_ANON_KEY=your_supabase_anon_key_here
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

## Step 2: Get Supabase Anon Key

1. Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/api
2. Copy the **anon/public** key
3. Add it to `.env` as `SUPABASE_ANON_KEY`

## Step 3: Start LibreChat

```bash
docker-compose up -d
```

Check logs:
```bash
docker-compose logs -f librechat
```

LibreChat should be available at: http://localhost:3080

## Step 4: Configure Persona Selection

LibreChat is configured to use the Supabase llm-gateway. The persona is passed via:
- Request header: `x-persona`
- Request body: `persona` parameter

### Testing Persona Selection

1. Open LibreChat at http://localhost:3080
2. In the chat, you can reference personas:
   - Type "plato" and it will map to "a.plato"
   - Type "kant" and it will map to "a.kant"
   - Type "nietzsche" and it will map to "a.nietzsche"

The persona mapper (`persona-mapper.js`) handles the conversion automatically.

## Step 5: DNS Setup (Production)

### Option 1: Using the Script

```bash
# Set your server IP
export SERVER_IP=your.server.ip.address
./scripts/setup-dns.sh
```

### Option 2: Manual AWS Route 53

1. Go to: https://console.aws.amazon.com/route53/v2/hostedzones#ListRecordSets/Z053032935YKZE3M0E0D1
2. Click **"Create record"**
3. Configure:
   - **Record name**: `chat`
   - **Record type**: `A`
   - **Value**: Your server IP
   - **TTL**: `300`
4. Click **"Create records"**

### Option 3: Using AWS CLI

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "chat.inquiry.institute",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "YOUR_SERVER_IP"}]
      }
    }]
  }'
```

## Step 6: Configure Reverse Proxy (Production)

For HTTPS, set up nginx or traefik:

### Nginx Example

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

Then set up SSL with Let's Encrypt:
```bash
certbot --nginx -d chat.inquiry.institute
```

## Verification

1. **Local**: http://localhost:3080 should show LibreChat
2. **DNS**: `dig chat.inquiry.institute` should resolve to your IP
3. **HTTPS**: https://chat.inquiry.institute should work (after SSL setup)

## Troubleshooting

### LibreChat won't start

```bash
# Check logs
docker-compose logs librechat

# Check if port 3080 is in use
lsof -i :3080

# Restart
docker-compose restart librechat
```

### Can't connect to llm-gateway

1. Verify `SUPABASE_ANON_KEY` in `.env`
2. Check Supabase Edge Function is deployed:
   ```bash
   curl -X POST https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/llm-gateway \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "test"}]}'
   ```

### Persona not working

1. Check persona is in `persona-mapper.js`
2. Verify persona is sent in request (check browser network tab)
3. Review llm-gateway logs in Supabase dashboard

## Next Steps

- [ ] Set up HTTPS with Let's Encrypt
- [ ] Configure authentication (if needed)
- [ ] Add more personas to `persona-mapper.js`
- [ ] Set up monitoring/logging
- [ ] Configure backups for LibreChat data
