#!/bin/bash

# Script para probar endpoints de la API directamente

API_URL="http://localhost:3000/api"
CLIENT_ID=2

echo "========================================="
echo "TEST: Endpoints de cliente Cogua (ID=2)"
echo "========================================="
echo ""

# Test 1: Obtener proyectos del cliente
echo "1️⃣ GET /clients/2/projects"
echo "---------------------------------------"
curl -s -X GET "${API_URL}/clients/${CLIENT_ID}/projects" \
  -H "Content-Type: application/json" | jq '.' 2>/dev/null || echo "Error: jq no instalado o respuesta inválida"
echo ""
echo ""

# Test 2: Obtener contratistas del cliente
echo "2️⃣ GET /clients/2/contractors"
echo "---------------------------------------"
curl -s -X GET "${API_URL}/clients/${CLIENT_ID}/contractors" \
  -H "Content-Type: application/json" | jq '.' 2>/dev/null || echo "Error: jq no instalado o respuesta inválida"
echo ""
echo ""

# Test 3: Verificar que no necesite auth (o si sí)
echo "3️⃣ Verificando si endpoint requiere autenticación..."
echo "---------------------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_URL}/clients/${CLIENT_ID}/projects")
echo "HTTP Status Code: ${HTTP_CODE}"

if [ "$HTTP_CODE" == "401" ]; then
    echo "⚠️  Endpoint requiere autenticación (JWT)"
elif [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Endpoint accesible sin autenticación"
else
    echo "❓ HTTP $HTTP_CODE - Verificar problema"
fi
echo ""
echo ""

echo "========================================="
echo "FIN DE PRUEBAS"
echo "========================================="
