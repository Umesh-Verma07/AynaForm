#!/bin/bash
# Usage: ./scripts/exportCSV.sh <formId> <token>
# Example: ./scripts/exportCSV.sh 64a1b2c3d4e5f6a7b8c9d0e1 <JWT_TOKEN>

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <formId> <token>"
  exit 1
fi

FORM_ID=$1
TOKEN=$2

curl -H "Authorization: Bearer $TOKEN" \
     -o "form_${FORM_ID}_responses.csv" \
     "http://localhost:5000/api/forms/${FORM_ID}/export" 