# Chat API Setup

The `chat-api` Supabase Edge Function provides an OpenAI-compatible API endpoint with faculty/persona parameter support.

## Endpoint

```
https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/chat-api/v1/chat/completions
```

## Faculty Parameter

The API accepts a `faculty` parameter in multiple ways:

### 1. Via Header (Recommended)

```bash
curl -X POST https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/chat-api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-faculty: plato" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "What is justice?"}]
  }'
```

### 2. Via Request Body

```bash
curl -X POST https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/chat-api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "faculty": "plato",
    "messages": [{"role": "user", "content": "What is justice?"}]
  }'
```

### 3. Via Query Parameter

```bash
curl -X POST "https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/chat-api/v1/chat/completions?faculty=plato" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "What is justice?"}]
  }'
```

## Persona Mapping

The API automatically maps short names to full slugs:
- `"plato"` → `"a.plato"`
- `"kant"` → `"a.kant"`
- `"nietzsche"` → `"a.nietzsche"`
- etc.

You can also use full slugs directly:
- `"a.plato"` → `"a.plato"` (no change)

## Integration with LibreChat

### Option 1: Direct Integration (Recommended)

Update `docker-compose.yml`:

```yaml
environment:
  - OPENAI_API_KEY=${SUPABASE_ANON_KEY}
  - OPENAI_BASE_URL=https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/chat-api/v1
```

Then modify LibreChat to include faculty in requests (via custom header or body parameter).

### Option 2: With Persona Proxy

Keep using the persona-proxy for automatic persona extraction from chat messages, which then forwards to chat-api.

## Deployment

```bash
cd supabase/functions/chat-api
./deploy.sh
```

Or manually:

```bash
supabase functions deploy chat-api --project-ref xougqdomkoisrxdnagcj
```

## Testing

```bash
# Test without faculty
curl -X POST https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/chat-api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Test with faculty
curl -X POST https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/chat-api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "x-faculty: plato" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "What is justice?"}]
  }'
```

## Available Faculty

See `supabase/functions/chat-api/index.ts` for the full list. Common ones:
- `plato`, `aristotle`, `kant`, `nietzsche`, `hegel`
- `socrates`, `confucius`, `laozi`, `spinoza`
- `einstein`, `darwin`, `curie`, `turing`
- And many more...
