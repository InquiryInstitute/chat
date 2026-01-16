#!/bin/bash
# Setup DNS for chat.inquiry.institute using AWS Route 53

set -e

HOSTED_ZONE_ID="Z053032935YKZE3M0E0D1"  # From ROUTE53_SUMMARY.md
DOMAIN="chat.inquiry.institute"

# Get server IP (you can override with SERVER_IP env var)
SERVER_IP="${SERVER_IP:-}"

if [ -z "$SERVER_IP" ]; then
  echo "Error: SERVER_IP environment variable not set"
  echo "Usage: SERVER_IP=your.server.ip ./scripts/setup-dns.sh"
  exit 1
fi

echo "Setting up DNS for $DOMAIN..."
echo "Target IP: $SERVER_IP"
echo "Hosted Zone: $HOSTED_ZONE_ID"

# Check if record already exists
EXISTING=$(aws route53 list-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --query "ResourceRecordSets[?Name=='${DOMAIN}.']" \
  --output json 2>/dev/null || echo "[]")

if [ "$EXISTING" != "[]" ]; then
  echo "⚠️  DNS record already exists for $DOMAIN"
  echo "Existing record:"
  echo "$EXISTING" | jq '.'
  read -p "Do you want to update it? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

# Create/update DNS record
CHANGE_BATCH=$(cat <<EOF
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "${DOMAIN}",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{"Value": "${SERVER_IP}"}]
    }
  }]
}
EOF
)

echo "$CHANGE_BATCH" > /tmp/route53-change.json

CHANGE_ID=$(aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file:///tmp/route53-change.json \
  --query 'ChangeInfo.Id' \
  --output text | sed 's|/change/||')

echo "✅ DNS change submitted!"
echo "Change ID: $CHANGE_ID"
echo ""
echo "Waiting for DNS propagation (this may take a few minutes)..."
aws route53 wait resource-record-sets-changed --id "$CHANGE_ID"

echo ""
echo "✅ DNS record created/updated!"
echo "Domain: $DOMAIN"
echo "IP: $SERVER_IP"
echo ""
echo "DNS propagation typically takes 5-10 minutes."
echo "Test with: dig $DOMAIN"

rm -f /tmp/route53-change.json
