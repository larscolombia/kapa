#!/bin/bash
# Test report 14 API with authentication

# Get admin token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

echo "Testing report 14 enrichment..."
curl -s -X GET "http://localhost:3000/api/ilv/reports/14" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys, json; data = json.load(sys.stdin); fields = data.get('fields', []); [print(f\"{f['key']}: {f.get('value')} -> {f.get('value_display')}\") for f in fields if f['key'] in ['cliente', 'proyecto', 'empresa_pertenece', 'empresa_genera_reporte']]"
