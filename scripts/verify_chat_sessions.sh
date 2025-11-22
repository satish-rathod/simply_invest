#!/bin/bash

PORT=5001
BASE_URL="http://localhost:$PORT/api"

# 1. Login to get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed. Response: $LOGIN_RESPONSE"
  exit 1
fi
echo "Login successful. Token received."

# 2. Create Session
echo -e "\n2. Creating Chat Session..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Session"}')

SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo "Session creation failed. Response: $SESSION_RESPONSE"
  exit 1
fi
echo "Session created. ID: $SESSION_ID"

# 3. Send Message (Test "price of nvidia" fix)
echo -e "\n3. Sending Message: 'what is the price of nvidia'..."
MESSAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/sessions/$SESSION_ID/message" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"what is the price of nvidia"}')

echo "Response: $MESSAGE_RESPONSE"

# 4. List Sessions
echo -e "\n4. Listing Sessions..."
curl -s -X GET "$BASE_URL/chat/sessions" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get Messages
echo -e "\n5. Getting Messages..."
curl -s -X GET "$BASE_URL/chat/sessions/$SESSION_ID/messages?limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 6. Delete Session
echo -e "\n6. Deleting Session..."
curl -s -X DELETE "$BASE_URL/chat/sessions/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\nDone."
