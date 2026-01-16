# Inquiry Institute Chat

Simple chat interface for Inquiry Institute faculty personas.

## Quick Start

### Option 1: Direct URL (Recommended)

Open in browser with faculty parameter:
```
http://chat.inquiry.institute?faculty=plato
http://chat.inquiry.institute?faculty=kant
http://chat.inquiry.institute?faculty=nietzsche
```

The interface will automatically:
- Read the `faculty` parameter from the URL
- Map short names to full slugs ("plato" → "a.plato")
- Pass the faculty to the chat API
- Update the URL when you change faculty

### Option 2: Local Development

1. Serve the `public/index.html` file:
   ```bash
   # Using Python
   cd public
   python3 -m http.server 8000
   
   # Or using Node.js
   npx serve public
   ```

2. Open: http://localhost:8000?faculty=plato

## Features

✅ **URL-based faculty selection** - `?faculty=plato`  
✅ **Automatic persona mapping** - "plato" → "a.plato"  
✅ **Simple, clean UI** - No complex setup needed  
✅ **Works with chat-api or llm-gateway** - Automatic fallback  
✅ **Real-time chat** - Streaming responses  

## Faculty Names

You can use short names or full slugs:
- `?faculty=plato` or `?faculty=a.plato`
- `?faculty=kant` or `?faculty=a.kant`
- `?faculty=nietzsche` or `?faculty=a.nietzsche`
- `?faculty=einstein` or `?faculty=a.einstein`
- And many more...

## Deployment

### Static Hosting (GitHub Pages, Netlify, Vercel)

1. Deploy the `public/` directory
2. Point `chat.inquiry.institute` DNS to your hosting
3. Done! Users can use `?faculty=plato` in the URL

### Docker (with LibreChat)

See `docker-compose.yml` for LibreChat setup.

## API Endpoints

The chat interface uses:
1. **chat-api** (preferred): `/functions/v1/chat-api/v1/chat/completions`
2. **llm-gateway** (fallback): `/functions/v1/llm-gateway/v1/chat/completions`

Both endpoints support the `x-faculty` or `x-persona` header.

## Customization

Edit `public/index.html` to:
- Change styling
- Add more faculty mappings
- Modify the UI layout
- Add features

## Architecture

```
User Browser
  ↓
index.html (reads ?faculty=plato from URL)
  ↓
chat-api Edge Function (or llm-gateway)
  ↓
OpenRouter API
  ↓
GPT-OSS-120B Model
```
