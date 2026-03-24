#!/bin/bash

BASE_URL="http://localhost:3000"
COOKIE_JAR="cookies.txt"

echo "== 1. Register user =="
curl -s -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser3","email":"testuser3@example.com","password":"testpassword"}'
echo -e "\n"

echo "== 2. Login user =="
curl -s -c $COOKIE_JAR -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser3","password":"testpassword"}'
echo -e "\n"

echo "== 3. Get current user (me) =="
curl -s -b $COOKIE_JAR "$BASE_URL/api/me"
echo -e "\n"

echo "== 4. Logout user =="
curl -s -b $COOKIE_JAR -X POST "$BASE_URL/api/logout"
echo -e "\n"

echo "== Done =="
