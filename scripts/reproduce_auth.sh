#!/bin/bash

PORT=5001
BASE_URL="http://localhost:$PORT/api/auth"

echo "1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}')

echo "Response: $REGISTER_RESPONSE"

if [[ $REGISTER_RESPONSE == *"token"* ]]; then
  echo "Registration Successful"
else
  echo "Registration Failed"
fi

echo -e "\n2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

echo "Response: $LOGIN_RESPONSE"

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
  echo "Login Successful"
else
  echo "Login Failed"
fi
