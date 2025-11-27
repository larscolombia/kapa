# 🧪 Guía Completa de Tests E2E - Creación de Reportes ILV

## 📋 Configuración Inicial

### 1. Actualizar Credenciales

**IMPORTANTE:** Edita `e2e/test-config.ts` con credenciales reales:

```typescript
user: {
  email: 'admin@kapa.com',        // ← CAMBIAR
  password: 'tu_password_aqui'    // ← CAMBIAR
}
```

### 2. Verificar Requisitos

Antes de ejecutar, verifica que existan:

✅ Al menos 1 proyecto activo  
✅ Al menos 1 contratista en ese proyecto  
✅ Maestros configurados: severidad, área, riesgo, tipo_hid, categoria_hid, motivo_swa, clasificacion_fdkar  
✅ Categorías y subcategorías HID jerárquicas  
✅ Backend corriendo (`pm2 list` → kapa-backend online)  
✅ Frontend compilado y accesible  

## 🚀 Ejecución de Tests

### Opción 1: Script Secuencial (RECOMENDADO)

```bash
cd /var/www/kapa.healtheworld.com.co
./e2e/run-tests.sh
```

Ejecuta los 10 tests uno por uno con resumen final.

### Opción 2: Test Específico

```bash
# Solo HID
npx playwright test e2e/tests/ilv-create-reports.spec.ts -g "HID"

# Solo W&T
npx playwright test e2e/tests/ilv-create-reports.spec.ts -g "W&T"

# Solo SWA
npx playwright test e2e/tests/ilv-create-reports.spec.ts -g "SWA"

# Solo Safety Cards
npx playwright test e2e/tests/ilv-create-reports.spec.ts -g "Safety Cards"

# Solo verificación (no crea datos)
npx playwright test e2e/tests/ilv-create-reports.spec.ts -g "Verificar campos"
```

### Opción 3: Con Interfaz Gráfica

```bash
npx playwright test e2e/tests/ilv-create-reports.spec.ts --ui
```

### Opción 4: Ver Navegador (Debug)

```bash
npx playwright test e2e/tests/ilv-create-reports.spec.ts --headed --slowmo=500
```

## 📊 Tests Incluidos (10 total)

### Verificación de Campos (4 tests - NO crean datos)

1. **HID - Verificar campos requeridos**
   - 9 campos requeridos visibles
   - 5 campos opcionales visibles

2. **W&T - Verificar campos requeridos**
   - 5 campos requeridos visibles
   - 2 campos opcionales visibles

3. **SWA - Verificar campos requeridos**
   - 9 campos requeridos visibles
   - 1 campo opcional visible

4. **Safety Cards - Verificar campos**
   - 3 campos requeridos visibles
   - 1 campo opcional visible
   - `plan_accion_propuesto` NO visible en creación ✓

### Creación Completa (4 tests - CREAN datos reales)

5. **HID - Crear reporte completo**
   - Completa todos los campos
   - Prueba jerarquía categoría-subcategoría
   - Screenshot: `e2e/screenshots/hid-form-filled.png`

6. **W&T - Crear reporte completo**
   - Completa todos los campos
   - Screenshot: `e2e/screenshots/wt-form-filled.png`

7. **SWA - Crear reporte completo**
   - Completa todos los campos incluyendo horas
   - Screenshot: `e2e/screenshots/swa-form-filled.png`

8. **Safety Cards - Crear reporte completo**
   - Completa todos los campos
   - Screenshot: `e2e/screenshots/safety-cards-form-filled.png`

### Validaciones (2 tests)

9. **Validación de campos requeridos**
   - Intenta enviar formulario vacío
   - Verifica que NO se permita

10. **Jerarquía Categoría-Subcategoría**
    - Subcategoría deshabilitada inicialmente ✓
    - Se habilita al seleccionar categoría ✓
    - Carga opciones dinámicamente ✓

## ✅ Campos Verificados por Tipo

### HID (18 campos totales)
**Requeridos (9):**
- ✓ Nombre Quien Reporta
- ✓ Ubicación
- ✓ Tipo de Reporte HID
- ✓ Categoría (jerárquico)
- ✓ Subcategoría (hijo jerárquico)
- ✓ Fecha del Evento
- ✓ Severidad
- ✓ Área
- ✓ Descripción de la Condición

**Opcionales (5):**
- ✓ Causa Probable
- ✓ Acción Inmediata
- ✓ Nombre EHS Contratista
- ✓ Nombre Supervisor de Obra
- ✓ Observación

### W&T (11 campos totales)
**Requeridos (5):**
- ✓ Nombre Quien Reporta
- ✓ Descripción de la Conversación Sostenida
- ✓ Riesgo Asociado
- ✓ Plan de Acción Generado o Compromisos
- ✓ Responsable

**Opcionales (2):**
- ✓ Testigo
- ✓ Observación

### SWA (17 campos totales)
**Requeridos (9):**
- ✓ Nombre Quien Reporta
- ✓ Nombre EHS del Contratista
- ✓ Nombre Supervisor Obra del Contratista
- ✓ Descripción de Hallazgo
- ✓ Tipo de SWA
- ✓ Hora de Inicio de la Detención
- ✓ Hora de Reinicio de la Actividad
- ✓ Área
- ✓ Responsable

**Opcionales (1):**
- ✓ Observación

### Safety Cards (10 campos totales)
**Requeridos en creación (3):**
- ✓ Quién Reporta
- ✓ Tipo de Tarjeta
- ✓ Descripción de Hallazgo

**Opcionales (1):**
- ✓ Observación

**Requeridos en cierre (4):**
- Plan de Acción Propuesto
- Descripción de Cierre
- Evidencia de Cierre
- Fecha de Implantación

## 📸 Resultados

### Screenshots Generados
```
e2e/screenshots/
├── hid-form-filled.png
├── wt-form-filled.png
├── swa-form-filled.png
└── safety-cards-form-filled.png
```

### Reportes
```bash
# Generar reporte HTML
npx playwright test e2e/tests/ilv-create-reports.spec.ts --reporter=html

# Ver reporte
npx playwright show-report
```

## 🐛 Debugging

### Logs Detallados
```bash
DEBUG=pw:api npx playwright test e2e/tests/ilv-create-reports.spec.ts -g "HID"
```

### Trace de Tests Fallidos
```bash
npx playwright test e2e/tests/ilv-create-reports.spec.ts --trace on
npx playwright show-trace trace.zip
```

### Inspector Interactivo
```bash
npx playwright test e2e/tests/ilv-create-reports.spec.ts --debug
```

## 🔍 Verificaciones Automáticas

Los tests verifican:

1. ✓ **Navegación:** Login → Dashboard → Formulario
2. ✓ **Carga de maestros:** Options en selects
3. ✓ **Carga de proyectos:** Proyectos disponibles
4. ✓ **Carga de contratistas:** Por proyecto
5. ✓ **Jerarquía dinámica:** Subcategorías según categoría
6. ✓ **Validaciones:** Campos requeridos
7. ✓ **Notificaciones:** Éxito al crear
8. ✓ **Redirección:** A lista después de crear
9. ✓ **Captura de errores:** Console y page errors
10. ✓ **Screenshots:** De formularios completados

## ⚠️ Advertencias

1. **Los tests 5-8 crean datos reales en la BD**
   - Cada ejecución completa inserta 4 reportes
   - Busca "(Test E2E)" en nombre del reportante

2. **Requiere datos previos:**
   - Si no hay proyectos, los tests fallarán
   - Si no hay maestros, los selects estarán vacíos

3. **Timeouts:**
   - Ajusta en `e2e/test-config.ts` si es necesario
   - Servidores lentos necesitan más tiempo

## 📞 Solución de Problemas

### "Cannot find projects"
```bash
# Verificar proyectos del usuario
psql -d kapa -c "SELECT * FROM project LIMIT 5;"
```

### "Subcategorías no se cargan"
```bash
# Verificar maestros jerárquicos
psql -d kapa -c "SELECT * FROM ilv_maestro WHERE tipo='categoria_hid';"
psql -d kapa -c "SELECT * FROM ilv_maestro WHERE parent_maestro_id IS NOT NULL LIMIT 5;"
```

### "Login fails"
- Verifica credenciales en `e2e/test-config.ts`
- Verifica selectores de email/password
- Prueba login manual primero

### "Test timeout"
- Aumenta timeout en `playwright.config.ts`: `timeout: 60000`
- Verifica que backend responda: `curl https://kapa.healtheworld.com.co/api/health`

### "Button not found"
- Verifica que el botón exista: visita la URL manualmente
- Revisa logs de consola del navegador
- Ejecuta con `--headed` para ver el navegador

## 🎯 Próximos Tests a Implementar

- [ ] Tests de edición de reportes
- [ ] Tests de cierre vía token público
- [ ] Tests de filtros avanzados
- [ ] Tests de exportación Excel/PDF
- [ ] Tests de permisos por rol
- [ ] Tests de adjuntos (upload)
- [ ] Tests de auditoría

---

**Última actualización:** 20 de Noviembre, 2025  
**Tests totales:** 10  
**Cobertura:** Creación de los 4 tipos de reporte + validaciones + jerarquía
