# Deployment Guide for chat.inquiry.institute

## Overview

Simple static HTML chat interface that reads faculty from URL parameter:
- `http://chat.inquiry.institute?faculty=plato` → chats with a.plato
- `http://chat.inquiry.institute?faculty=kant` → chats with a.kant

## Deployment Options

### Option 1: GitHub Pages (Easiest)

1. **Enable GitHub Pages**:
   - Go to: https://github.com/InquiryInstitute/chat/settings/pages
   - Source: Deploy from a branch
   - Branch: `main` / `public` folder
   - Save

2. **Update DNS**:
   ```bash
   # Point chat.inquiry.institute to GitHub Pages
   # GitHub Pages will provide a CNAME or A record
   ```

3. **Add CNAME file** (if needed):
   ```bash
   echo "chat.inquiry.institute" > public/CNAME
   ```

### Option 2: Netlify

1. **Connect repository**:
   - Go to: https://app.netlify.com
   - New site from Git → Connect to GitHub
   - Select `InquiryInstitute/chat`

2. **Build settings**:
   - Build command: (leave empty)
   - Publish directory: `public`

3. **Custom domain**:
   - Add domain: `chat.inquiry.institute`
   - Update DNS to point to Netlify

### Option 3: Vercel

1. **Deploy**:
   ```bash
   cd ~/GitHub/chat
   npx vercel --prod
   ```

2. **Configure domain**:
   - Add `chat.inquiry.institute` in Vercel dashboard
   - Update DNS records

### Option 4: Static Server (GCP/AWS)

1. **Upload `public/` directory** to static hosting
2. **Configure DNS** to point to server
3. **Set up HTTPS** (Let's Encrypt)

## DNS Setup

Once deployed, update Route 53:

```bash
# Get your hosting provider's IP or CNAME target
# Then run:
cd ~/GitHub/chat
export SERVER_IP=your.hosting.ip
# OR for CNAME:
export CNAME_TARGET=your-hosting-provider.netlify.app

./scripts/setup-dns.sh
```

Or manually:

```bash
# For A record (IP address)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "chat.inquiry.institute",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "YOUR_IP"}]
      }
    }]
  }'

# For CNAME (hosting provider)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "chat.inquiry.institute",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "your-hosting-provider.netlify.app"}]
      }
    }]
  }'
```

## Testing

After deployment:

1. **Test URL parameter**:
   ```
   http://chat.inquiry.institute?faculty=plato
   http://chat.inquiry.institute?faculty=kant
   ```

2. **Verify faculty mapping**:
   - Type "plato" → should show "Plato" badge
   - Send a message → should respond as Plato

3. **Test API connection**:
   - Check browser console for errors
   - Verify requests go to chat-api or llm-gateway

## Environment Variables

The HTML file has the Supabase anon key hardcoded. For production, consider:

1. **Using environment variables** (if using a build process)
2. **Or** keeping it as-is (anon key is safe to expose)

## Next Steps

1. ✅ Chat interface created
2. ⏳ Deploy to hosting provider
3. ⏳ Set up DNS (chat.inquiry.institute)
4. ⏳ Test with various faculty members
5. ⏳ Deploy chat-api Edge Function (for better faculty support)
