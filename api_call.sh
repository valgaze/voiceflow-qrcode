# For traversing API/tinkering
API_TOKEN=VF.api_token
USER_ID=session_id_here
PROJECT_ID=VF_projectID_here
VERSION_ID=production

# Modify payload (y)
PAYLOAD='{
  "type": "complete",
  "payload": {
    "key": "value",
    "key2": "value2"
  },
  "userID": "'$USER_ID'"
}'

URL="https://general-runtime.voiceflow.com/state/user/${USER_ID}/interact"

curl -X POST "$URL" \
-H "Content-Type: application/json" \
-H "Authorization: $API_TOKEN" \
-H "versionID: $VERSION_ID" \
-d "$PAYLOAD"
