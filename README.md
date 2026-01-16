# Inquiry Institute Chat

LibreChat frontend for Inquiry Institute, connected to our Supabase llm-gateway.

## Features

- ✅ LibreChat UI for chatting with faculty personas
- ✅ Connected to Supabase llm-gateway (OpenRouter GPT-OSS-120B)
- ✅ Persona selector: type "plato" and it automatically maps to "a.plato"
- ✅ Custom domain: chat.inquiry.institute

## Quick Start

### 1. Clone and Setup

```bash
cd ~/GitHub/chat
cp .env.example .env
# Edit .env and add your SUPABASE_ANON_KEY
```

### 2. Generate JWT Secrets

```bash
# Generate secure random strings for JWT secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

Add these to your `.env` file.

### 3. Start LibreChat with Persona Proxy

```bash
# Option 1: With persona proxy (recommended - handles persona mapping)
docker-compose -f docker-compose.proxy.yml up -d

# Option 2: Direct to llm-gateway (manual persona handling)
docker-compose up -d
```

LibreChat will be available at: http://localhost:3080

The persona proxy (if used) runs on port 3081 and automatically maps persona names.

## Configuration

### Environment Variables

- `SUPABASE_ANON_KEY` - Your Supabase anonymous key (required)
- `JWT_SECRET` - Secret for JWT token signing (required)
- `JWT_REFRESH_SECRET` - Secret for JWT refresh tokens (required)
- `APP_DOMAIN` - Domain for the app (default: chat.inquiry.institute)
- `DEFAULT_MODEL` - Default model to use (default: openai/gpt-oss-120b)

### Persona Selection

Users can type persona names in the chat, and they will be automatically mapped:
- "plato" → "a.plato"
- "kant" → "a.kant"
- "nietzsche" → "a.nietzsche"

The persona is sent to the llm-gateway via the `x-persona` header or `persona` parameter.

## DNS Setup

To set up chat.inquiry.institute:

```bash
# Run the DNS setup script
./scripts/setup-dns.sh
```

Or manually via AWS Route 53:
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

## Architecture

### With Persona Proxy (Recommended)

```
User Browser
  ↓
LibreChat (chat.inquiry.institute)
  ↓
Persona Proxy (port 3081) - Maps "plato" → "a.plato"
  ↓
Supabase llm-gateway Edge Function
  ↓
OpenRouter API
  ↓
GPT-OSS-120B Model
```

### Direct Connection

```
User Browser
  ↓
LibreChat (chat.inquiry.institute)
  ↓
Supabase llm-gateway Edge Function
  ↓
OpenRouter API
  ↓
GPT-OSS-120B Model
```

## Persona Mapping

The persona mapper (`persona-mapper.js`) handles:
- Short name → Full slug conversion ("plato" → "a.plato")
- Display name generation ("a.plato" → "Plato")
- Persona list for UI dropdowns

## Development

### Local Development

```bash
# Start services
docker-compose up

# View logs
docker-compose logs -f librechat

# Stop services
docker-compose down
```

### Custom Persona Mappings

Edit `persona-mapper.js` to add new persona mappings:

```javascript
const PERSONA_MAP = {
  'newpersona': 'a.newpersona',
  // ...
};
```

## Deployment

### Production Deployment

1. Set up environment variables on your hosting platform
2. Point DNS to your server IP
3. Run `docker-compose up -d`
4. Configure reverse proxy (nginx/traefik) for HTTPS

### Docker Compose Production

```bash
docker-compose -f docker-compose.yml up -d
```

## Troubleshooting

### LibreChat not connecting to llm-gateway

1. Check `SUPABASE_ANON_KEY` is set correctly
2. Verify `OPENAI_BASE_URL` points to the correct endpoint
3. Check Supabase Edge Function logs

### Persona not working

1. Verify persona is in `persona-mapper.js`
2. Check that persona is sent in request headers
3. Review llm-gateway logs for persona processing

## License

Part of Inquiry Institute infrastructure.
