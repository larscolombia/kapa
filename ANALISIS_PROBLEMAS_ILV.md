# 🔧 ANÁLISIS COMPLETO: Problemas Módulo ILV

**Fecha:** 18 de Noviembre, 2025  
**Estado:** Análisis en progreso  

---

## 📋 PROBLEMAS REPORTADOS

### 1. "No coincide el tipo de reporte con el Excel"
**Síntoma:** El formulario muestra tipos diferentes a los del Excel de referencia  
**Tipo:** Discrepancia de requerimientos

### 2. "El botón nuevo reporte no ejecuta (no crea nuevo reporte)"
**Síntoma:** Al hacer clic en el botón crear, no se envía la petición al backend  
**Tipo:** Error funcional crítico

---

## 🔍 ANÁLISIS PROBLEMA 1: Tipos de Reporte

### Excel de Referencia (Requerimiento Original)
Según el documento `REQUERIMIENTOS/ILV/README.md` línea 141:

| Esperado (Excel) | Implementado (Sistema) | Estado |
|------------------|------------------------|--------|
| **HID (Hazard ID)** | ✅ hazard_id | OK |
| **W&T (Walk & Talk)** | ✅ wit | OK |
| **SWA (Stop Work Authority)** | ✅ swa | OK |
| **Safety Cards** | ❌ fdkar | **DISCREPANCIA** |

**Conclusión:** El sistema implementó "FDKAR" cuando el Excel menciona "Safety Cards".

### Definición Actual en el Sistema

**Backend:** `/backend/src/modules/ilv/dto/create-ilv-report.dto.ts`
```typescript
export enum IlvReportType {
  HAZARD_ID = 'hazard_id',
  WIT = 'wit',
  SWA = 'swa',
  FDKAR = 'fdkar',  // ← Debería ser SAFETY_CARDS
}
```

**Frontend:** `/frontend/src/pages/ILVReportForm.vue` línea 248
```javascript
const reportTypes = [
  { value: 'hazard_id', label: 'Identificación de Peligros', icon: 'warning' },
  { value: 'wit', label: 'Walk & Talk', icon: 'directions_walk' },
  { value: 'swa', label: 'Stop Work Authority', icon: 'stop' },
  { value: 'fdkar', label: 'FDKAR', icon: 'find_in_page' }  // ← Debe decir "Safety Cards"
]
```

**Nota del diseñador original:**  
Según `MODULO_ILV_ESPECIFICACION.md` línea 7:
> "**Nota:** FDKAR es la implementación del concepto 'Safety Cards' en el sistema"

**Esto significa que FDKAR Y Safety Cards son el MISMO tipo**, solo que el label está mal en el frontend.

---

## 🔍 ANÁLISIS PROBLEMA 2: Botón No Crea Reporte

### Verificaciones Realizadas

#### 1. Código del Formulario ✅
- `ILVReportForm.vue` línea 218: Botón configurado correctamente
  ```vue
  <q-btn 
    type="submit" 
    label="Crear Reporte" 
    color="primary"
    :loading="loading"
    :disable="!reportForm.tipo"
  />
  ```
- `@submit="onSubmit"` presente en línea 13
- Método `onSubmit()` implementado (líneas 451-492)

#### 2. Servicio API ✅
- `ilvService.js`: Método `createReport()` correcto (líneas 4-11)
- Ruta: `POST /ilv/reports`
- Manejo de errores implementado

#### 3. Logs Backend ❌
- **No hay intentos de POST /ilv/reports** en los últimos logs
- Esto confirma que la petición **no está llegando al servidor**

### Posibles Causas

**Causa A:** Validación del formulario falla silenciosamente
- El `q-form` tiene validaciones `@submit`
- Si algún campo requerido falta, el submit no se ejecuta
- Posible campo faltante: `ubicacion`, `tipo`, `proyecto_id`, `empresa_id`

**Causa B:** Error de JavaScript en consola del navegador
- El método `onSubmit()` podría tener un error no capturado
- Necesitamos ver la consola del navegador (F12)

**Causa C:** Campos dinámicos no se están poblando correctamente
- El `reportForm.value.campos` podría estar vacío
- Los `dynamicFields` no se renderizan

**Causa D:** Error en importación async de `projectService`
- Líneas 396-397 usan `import('src/services/projectService')`
- Si falla, bloquea el submit

---

## ✅ SOLUCIONES PROPUESTAS

### Solución 1: Cambiar Label "FDKAR" → "Safety Cards"

**Objetivo:** Hacer que el formulario coincida con el Excel

**Cambios:**

#### Frontend: ILVReportForm.vue
```diff
const reportTypes = [
  { value: 'hazard_id', label: 'Identificación de Peligros', icon: 'warning' },
  { value: 'wit', label: 'Walk & Talk', icon: 'directions_walk' },
  { value: 'swa', label: 'Stop Work Authority', icon: 'stop' },
- { value: 'fdkar', label: 'FDKAR', icon: 'find_in_page' }
+ { value: 'fdkar', label: 'Safety Cards', icon: 'credit_card' }
]
```

**Nota:** El `value='fdkar'` se mantiene porque así está en el backend. Solo cambiamos el texto visible para el usuario.

#### Frontend: ilvService.js (línea 199)
```diff
getReportTypes() {
  return [
    { value: 'hazard_id', label: 'Identificación de Peligros', icon: 'warning' },
    { value: 'wit', label: 'Walk & Talk', icon: 'directions_walk' },
    { value: 'swa', label: 'Stop Work Authority', icon: 'stop' },
-   { value: 'fdkar', label: 'FDKAR', icon: 'find_in_page' }
+   { value: 'fdkar', label: 'Safety Cards', icon: 'credit_card' }
  ];
}
```

---

### Solución 2: Agregar Validación Debug y Logging

**Objetivo:** Identificar por qué el botón no funciona

#### Frontend: ILVReportForm.vue - Método onSubmit()
```diff
const onSubmit = async () => {
+ console.log('🚀 onSubmit iniciado')
+ console.log('📊 reportForm:', JSON.stringify(reportForm.value, null, 2))
+ 
  loading.value = true
  
  try {
+   console.log('🔧 Preparando campos...')
+   
    // Combinar campos básicos con campos dinámicos
    const allFields = [
      { key: 'titulo', value: String(reportForm.value.titulo) },
      { key: 'descripcion', value: String(reportForm.value.descripcion) },
      { key: 'ubicacion', value: String(reportForm.value.ubicacion) },
      ...Object.entries(reportForm.value.campos)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => ({
          key,
          value: String(value)
        }))
    ]
    
+   console.log('📋 allFields:', allFields)
+   
    const reportData = {
      tipo: reportForm.value.tipo,
      proyecto_id: reportForm.value.proyecto_id,
      cliente_id: reportForm.value.cliente_id,
      empresa_id: reportForm.value.empresa_id,
      fields: allFields
    }
    
+   console.log('📤 Enviando al backend:', reportData)
+   
    await ilvService.createReport(reportData)
    
+   console.log('✅ Reporte creado exitosamente')
+   
    $q.notify({
      type: 'positive',
      message: 'Reporte ILV creado exitosamente',
      position: 'top'
    })
    
    router.push({ name: 'ilvReportes' })
    
  } catch (error) {
+   console.error('❌ Error completo:', error)
+   console.error('❌ Error.response:', error.response)
+   console.error('❌ Error.message:', error.message)
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al crear el reporte',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
```

---

### Solución 3: Validar Campos Requeridos

**Problema potencial:** El formulario tiene campos `titulo` y `descripcion` que no existen en el backend.

#### Backend: field-mapper.util.ts

**Verificar que acepta campos "genéricos":**
```typescript
// HAZARD_ID no requiere 'titulo' ni 'descripcion'
// Solo requiere los campos específicos
required: [
  'ubicacion',  // ✅
  'descripcion_condicion',  // ✅ (NO 'descripcion')
  'severidad',  // ✅
  'area',  // ✅
  'fecha_evento',  // ✅
  'nombre_quien_reporta',  // ✅
  'tipo_reporte_hid',  // ✅
  'categoria',  // ✅
  'subcategoria'  // ✅
]
```

**PROBLEMA DETECTADO:** El formulario envía `titulo` y `descripcion` pero el backend espera `descripcion_condicion`.

#### Solución: Remover campos `titulo` y `descripcion` del formulario

**ILVReportForm.vue - Remover líneas 86-100:**
```diff
- <q-input
-   v-model="reportForm.titulo"
-   label="Título del Reporte *"
-   filled
-   :rules="[val => !!val || 'Título es requerido']"
- />
- 
- <q-input
-   v-model="reportForm.descripcion"
-   label="Descripción *"
-   type="textarea"
-   rows="3"
-   filled
-   :rules="[val => !!val || 'Descripción es requerida']"
- />
```

**ILVReportForm.vue - Remover de allFields (líneas 454-456):**
```diff
const allFields = [
- { key: 'titulo', value: String(reportForm.value.titulo) },
- { key: 'descripcion', value: String(reportForm.value.descripcion) },
- { key: 'ubicacion', value: String(reportForm.value.ubicacion) },
  ...Object.entries(reportForm.value.campos)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({
      key,
      value: String(value)
    }))
]
```

**Explicación:** Los campos dinámicos ya incluyen `descripcion_condicion` y `ubicacion`. No necesitamos duplicarlos como "campos básicos".

---

## 📝 PLAN DE CORRECCIÓN

### Fase 1: Corrección Inmediata (15 minutos)

1. ✅ **Cambiar label "FDKAR" → "Safety Cards"** en:
   - ILVReportForm.vue
   - ilvService.js

2. ✅ **Remover campos duplicados** del formulario:
   - Eliminar inputs `titulo` y `descripcion`
   - Eliminar de `allFields` en onSubmit()

3. ✅ **Agregar logging debug** en onSubmit()

4. ✅ **Compilar frontend** y probar

### Fase 2: Testing (Usuario)

1. **Limpiar cache** del navegador
2. **Abrir consola** del navegador (F12)
3. **Intentar crear reporte**
4. **Capturar logs**:
   - Consola del navegador
   - Network tab (petición HTTP)
5. **Reportar resultados**

---

## 🎯 RESULTADO ESPERADO

### Después de las correcciones:

**Formulario muestra:**
- ✅ Identificación de Peligros
- ✅ Walk & Talk
- ✅ Stop Work Authority
- ✅ **Safety Cards** (antes decía FDKAR)

**Flujo de creación:**
1. Usuario selecciona tipo "Safety Cards"
2. Usuario llena campos requeridos (sin `titulo`/`descripcion` genéricos)
3. Usuario hace clic en "Crear Reporte"
4. Consola muestra: `🚀 onSubmit iniciado`
5. Consola muestra: `📤 Enviando al backend: {...}`
6. Backend recibe POST /ilv/reports
7. Backend valida campos con field-mapper
8. Backend crea reporte en BD
9. Frontend muestra: "✅ Reporte creado exitosamente"
10. Redirige a lista de reportes

---

## 📊 LOGS ESPERADOS (Consola Navegador)

```
🚀 onSubmit iniciado
📊 reportForm: {
  "tipo": "fdkar",
  "proyecto_id": 1,
  "cliente_id": 2,
  "empresa_id": 3,
  "campos": {
    "quien_reporta": "Juan Pérez",
    "clasificacion": "123",
    "descripcion": "Descripción del incidente...",
    "plan_accion_propuesto": "Plan de acción..."
  }
}
🔧 Preparando campos...
📋 allFields: [
  { "key": "quien_reporta", "value": "Juan Pérez" },
  { "key": "clasificacion", "value": "123" },
  { "key": "descripcion", "value": "Descripción..." },
  { "key": "plan_accion_propuesto", "value": "Plan..." }
]
📤 Enviando al backend: {
  "tipo": "fdkar",
  "proyecto_id": 1,
  "cliente_id": 2,
  "empresa_id": 3,
  "fields": [...]
}
✅ Reporte creado exitosamente
```

---

**Estado:** Análisis completo - Listo para implementar correcciones  
**Próximo paso:** Aplicar cambios en el código
