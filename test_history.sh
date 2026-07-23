#!/bin/bash
# Login as admin to get token
RES=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"draulakh@gmail.com","password":"test"}' http://localhost:8080/api/v1/auth/admin/login)
TOKEN=$(echo $RES | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo "Login failed or no token"
    echo $RES
    exit 1
fi
echo "Token: $TOKEN"
curl -s -v -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/v1/admin/patients/history?email=paramjitkaur@gmail.com" > response.txt
echo ""
echo "Response saved to response.txt"
