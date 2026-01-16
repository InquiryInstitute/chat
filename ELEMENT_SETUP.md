# Element Web Setup for chat.inquiry.institute

Element Web is now configured to redirect to the hosted Element Web client, pre-configured to connect to `matrix.inquiry.institute`.

## How It Works

1. User visits: `http://chat.inquiry.institute`
2. Redirects to: Element Web with Matrix server pre-configured
3. User can log in and join Matrix rooms
4. Faculty bots can join the same rooms

## GitHub Pages Deployment

✅ **Deployed**: https://inquiryinstitute.github.io/chat/

The page redirects to Element Web with the Matrix server configuration.

## DNS Setup

Update Route 53 to point `chat.inquiry.institute` to GitHub Pages:

```bash
# Get GitHub Pages IPs (these are static)
GITHUB_PAGES_IPS="185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153"

# Or use CNAME to inquiryinstitute.github.io
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "chat.inquiry.institute",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "inquiryinstitute.github.io"}]
      }
    }]
  }'
```

## Creating a Chat Room

### Option 1: Via Element Web UI

1. Visit: https://chat.inquiry.institute
2. Log in to Matrix
3. Create a new room: "Inquiry Institute Chat"
4. Make it public or invite faculty bots

### Option 2: Via Matrix API

```bash
# Get access token first (via Element login)
ACCESS_TOKEN="your_matrix_access_token"
SERVER="https://matrix.inquiry.institute"

# Create room
curl -X POST "$SERVER/_matrix/client/v3/createRoom" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Inquiry Institute Chat",
    "topic": "Chat with faculty members",
    "preset": "public_chat",
    "room_version": "10"
  }'
```

## Adding Faculty Bots to Room

Faculty bots can join the room automatically. They're configured to respond to messages in Matrix rooms.

### Faculty Bot Matrix Users

Faculty bots are registered as:
- `@a.plato:inquiry.institute`
- `@a.kant:inquiry.institute`
- `@a.nietzsche:inquiry.institute`
- etc.

### Invite Bots to Room

```bash
ROOM_ID="!roomid:inquiry.institute"
BOT_USER="@a.plato:inquiry.institute"

curl -X POST "$SERVER/_matrix/client/v3/rooms/$ROOM_ID/invite" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$BOT_USER\"
  }"
```

## URL Parameters

You can also use URL parameters to join a specific room:

```
https://app.element.io/#/room/!roomid:inquiry.institute?defaultServerConfig={"m.homeserver":{"base_url":"https://matrix.inquiry.institute"}}
```

## Custom Element Build (Optional)

For a fully custom Element Web build:

1. Clone Element Web: `git clone https://github.com/vector-im/element-web.git`
2. Copy `config.json` to `element-web/config.json`
3. Build: `npm install && npm run build`
4. Deploy `webapp/` directory to GitHub Pages

## Testing

1. Visit: https://chat.inquiry.institute
2. Should redirect to Element Web
3. Log in with Matrix account
4. Create or join a room
5. Faculty bots should respond when mentioned

## Next Steps

1. ✅ Element Web redirect configured
2. ⏳ Set up DNS for chat.inquiry.institute
3. ⏳ Create Matrix room for chat
4. ⏳ Invite faculty bots to room
5. ⏳ Test faculty bot responses
