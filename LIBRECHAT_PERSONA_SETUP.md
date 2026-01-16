# LibreChat Persona Selection Setup

This document explains how persona selection works in LibreChat.

## How It Works

### Option 1: Using Persona Proxy (Recommended)

The persona proxy (`persona-proxy.js`) automatically:
1. Intercepts requests from LibreChat
2. Extracts persona mentions from messages (e.g., "plato", "@plato", "persona: plato")
3. Maps short names to full slugs ("plato" → "a.plato")
4. Adds the persona to the request (via `x-persona` header or `persona` parameter)
5. Forwards to Supabase llm-gateway

**Usage in Chat:**
- Type "plato" in your message → automatically uses "a.plato" persona
- Type "@kant" → automatically uses "a.kant" persona
- Type "persona: nietzsche" → automatically uses "a.nietzsche" persona

### Option 2: Direct Configuration

If using `docker-compose.yml` (without proxy), you can:
1. Manually specify persona in system message
2. Use LibreChat's custom endpoint configuration
3. Add persona via request headers

## Persona Mapping

The `persona-mapper.js` file contains mappings:

```javascript
{
  'plato': 'a.plato',
  'kant': 'a.kant',
  'nietzsche': 'a.nietzsche',
  // ... more mappings
}
```

### Adding New Personas

Edit `persona-mapper.js`:

```javascript
const PERSONA_MAP = {
  // ... existing mappings
  'newpersona': 'a.newpersona',
};
```

Then restart the persona proxy:
```bash
docker-compose -f docker-compose.proxy.yml restart persona-proxy
```

## Testing Persona Selection

1. Start LibreChat with persona proxy:
   ```bash
   docker-compose -f docker-compose.proxy.yml up -d
   ```

2. Open LibreChat at http://localhost:3080

3. In a chat, try:
   - "plato, what is justice?"
   - "@kant, explain the categorical imperative"
   - "persona: nietzsche - what is the will to power?"

4. Check proxy logs to see persona mapping:
   ```bash
   docker-compose -f docker-compose.proxy.yml logs persona-proxy
   ```

## How Persona is Sent to llm-gateway

The persona proxy sends the persona in two ways:

1. **Request Header**: `x-persona: a.plato`
2. **Request Body**: `{ "persona": "a.plato", ... }`

The Supabase llm-gateway accepts both formats and uses the persona to:
- Build a system prompt: "You are a.plato. Stay in this persona consistently."
- Inject it into the conversation context

## Troubleshooting

### Persona not being detected

1. Check proxy logs:
   ```bash
   docker-compose -f docker-compose.proxy.yml logs persona-proxy
   ```

2. Verify persona is in `persona-mapper.js`

3. Check message format - try:
   - "plato" (simple)
   - "@plato" (mention)
   - "persona: plato" (explicit)

### Persona not working in llm-gateway

1. Verify llm-gateway is deployed:
   ```bash
   curl -X POST https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/llm-gateway \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -H "x-persona: a.plato" \
     -d '{"messages": [{"role": "user", "content": "test"}]}'
   ```

2. Check Supabase Edge Function logs for persona processing

3. Verify `SUPABASE_ANON_KEY` is set correctly
