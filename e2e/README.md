# Configuración de Playwright E2E Tests

Este proyecto usa Playwright para tests end-to-end del módulo ILV.

## Instalación

```bash
npm install -D @playwright/test playwright
npx playwright install chromium
```

## Variables de Entorno

Crear archivo `.env` en la raíz con:

```bash
TEST_EMAIL=admin@test.com
TEST_PASSWORD=admin123
```

## Ejecutar Tests

```bash
# Todos los tests
npx playwright test

# Solo tests de ILV
npx playwright test ilv-reportes

# Con UI interactiva
npx playwright test --ui

# Ver reporte HTML
npx playwright show-report
```

## Tests Implementados

### ILV - Lista de Reportes
- ✅ Carga de página
- ✅ Botón "Nuevo Reporte" visible y habilitado
- ✅ Navegación al formulario
- ✅ Captura de errores de consola
- ✅ Filtros de búsqueda
- ✅ Tabla de reportes

### ILV - Formulario de Nuevo Reporte
- ✅ Carga directa via URL
- ✅ Muestra 4 tipos de reporte
- ✅ Campos dinámicos por tipo (HID, Safety Cards)

### ILV - Diagnóstico
- ✅ Identificación de errores de router
- ✅ Análisis de eventos click
- ✅ Sugerencias de solución

## Estructura

```
e2e/
├── tests/
│   └── ilv-reportes.spec.ts
playwright.config.ts
```

## Bug Encontrado y Corregido

**Error:** El botón "Nuevo Reporte" lanzaba error de router:
```
Error at fr (index.e4a02137.js:31:4375)
at Object.c [as resolve] (index.e4a02137.js:35:8098)
```

**Causa:** Nombre de ruta incorrecto
- **Incorrecto:** `@click="$router.push({ name: 'ilvReportForm' })"`
- **Correcto:** `@click="$router.push({ name: 'ilvNuevoReporte' })"`

**Archivo:** `frontend/src/pages/ILVReportsList.vue` línea 13

**Estado:** ✅ Corregido
