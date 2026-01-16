# Inquiry Institute Chat

Element Web interface for chatting with faculty members via Matrix.

## Quick Access

Visit: **https://chat.inquiry.institute**

This redirects to Element Web pre-configured to connect to `matrix.inquiry.institute`.

## How It Works

1. **Visit chat.inquiry.institute** → Redirects to Element Web
2. **Log in** with your Matrix account
3. **Join or create a room** for chatting
4. **Faculty bots** can join the room and respond to messages

## Faculty Bots

Faculty members are available as Matrix bots:
- `@a.plato:inquiry.institute`
- `@a.kant:inquiry.institute`
- `@a.nietzsche:inquiry.institute`
- `@a.einstein:inquiry.institute`
- And many more...

## Creating a Chat Room

### Via Element Web

1. Visit https://chat.inquiry.institute
2. Log in
3. Click "+" to create a new room
4. Name it "Inquiry Institute Chat" (or any name)
5. Make it public or invite specific users
6. Invite faculty bots to join

### Via Matrix API

See `ELEMENT_SETUP.md` for API examples.

## Deployment

✅ **Deployed on GitHub Pages**: https://inquiryinstitute.github.io/chat/

The site redirects to Element Web with Matrix server pre-configured.

## DNS

✅ **DNS Configured**: `chat.inquiry.institute` → GitHub Pages (CNAME)

## Files

- `public/index.html` - Redirect page to Element Web
- `public/config.json` - Element configuration (for custom build)
- `ELEMENT_SETUP.md` - Detailed setup instructions

## Customization

To build a custom Element Web:

1. Clone Element Web: `git clone https://github.com/vector-im/element-web.git`
2. Copy `public/config.json` to `element-web/config.json`
3. Build: `npm install && npm run build`
4. Deploy `webapp/` to GitHub Pages

## Next Steps

1. ✅ Element Web redirect configured
2. ✅ GitHub Pages deployed
3. ✅ DNS configured
4. ⏳ Create Matrix room for chat
5. ⏳ Invite faculty bots to room
6. ⏳ Test faculty bot responses

## Documentation

- **Setup Guide**: `ELEMENT_SETUP.md`
- **Matrix Server**: https://matrix.inquiry.institute
- **Element Web**: https://app.element.io
