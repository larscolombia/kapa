#!/bin/bash

# Script para ejecutar tests E2E de ILV uno por uno
# Muestra resultados detallados de cada test

echo "🧪 ILV E2E Tests - Creación de Reportes"
echo "========================================"
echo ""
echo "⚠️  ANTES DE CONTINUAR:"
echo "1. Actualiza las credenciales en: e2e/test-config.ts"
echo "2. Verifica que el servidor esté corriendo"
echo "3. Verifica que tengas proyectos y contratistas en la BD"
echo ""
read -p "¿Continuar? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Ejecución cancelada"
    exit 1
fi

echo ""
echo "🚀 Iniciando tests..."
echo ""

# Crear directorio para screenshots si no existe
mkdir -p e2e/screenshots

# Función para ejecutar un test individual
run_test() {
    local test_name="$1"
    local test_pattern="$2"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 Ejecutando: $test_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    npx playwright test e2e/tests/ilv-create-reports.spec.ts -g "$test_pattern" --reporter=list
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "✅ PASSED: $test_name"
    else
        echo "❌ FAILED: $test_name"
    fi
    
    echo ""
    sleep 2
    
    return $exit_code
}

# Contadores
total_tests=0
passed_tests=0
failed_tests=0

# Array de tests
declare -a tests=(
    "01. HID - Verificar campos requeridos:01. HID.*Verificar campos requeridos"
    "02. HID - Crear reporte completo:02. HID.*Completar todos los campos"
    "03. W&T - Verificar campos requeridos:03. W&T.*Verificar campos requeridos"
    "04. W&T - Crear reporte completo:04. W&T.*Completar y crear reporte"
    "05. SWA - Verificar campos requeridos:05. SWA.*Verificar campos requeridos"
    "06. SWA - Crear reporte completo:06. SWA.*Completar y crear reporte"
    "07. Safety Cards - Verificar campos:07. Safety Cards.*Verificar campos requeridos"
    "08. Safety Cards - Crear reporte:08. Safety Cards.*Completar y crear reporte"
    "09. Validación de campos requeridos:09. Validación de campos requeridos"
    "10. Jerarquía Categoría-Subcategoría:10. Jerarquía Categoría-Subcategoría"
)

# Ejecutar cada test
for test_info in "${tests[@]}"; do
    IFS=':' read -r test_name test_pattern <<< "$test_info"
    
    ((total_tests++))
    
    if run_test "$test_name" "$test_pattern"; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi
done

# Resumen final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE EJECUCIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total de tests:  $total_tests"
echo "✅ Passed:       $passed_tests"
echo "❌ Failed:       $failed_tests"
echo ""

if [ $failed_tests -eq 0 ]; then
    echo "🎉 ¡Todos los tests pasaron exitosamente!"
    exit 0
else
    echo "⚠️  Algunos tests fallaron. Revisa los logs arriba."
    exit 1
fi
