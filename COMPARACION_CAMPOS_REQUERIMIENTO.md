# 📋 COMPARACIÓN: REQUERIMIENTO vs IMPLEMENTACIÓN ACTUAL

**Fecha:** 20 de Noviembre, 2025  
**Objetivo:** Verificar que los campos implementados coincidan con el requerimiento del usuario

---

## ✅ CONFIRMACIÓN DE TIPOS DE REPORTE

| Tipo | Requerimiento | Implementado | Estado |
|------|---------------|--------------|--------|
| **HID** | ✅ Identificación de Peligros | ✅ `hazard_id` | ✅ CORRECTO |
| **W&T** | ✅ Walk & Talk | ✅ `wit` | ✅ CORRECTO |
| **SWA** | ✅ Stop Work Authority | ✅ `swa` | ✅ CORRECTO |
| **Safety Cards** | ✅ Safety Cards | ✅ `fdkar` (label: "Safety Cards") | ✅ CORRECTO |

**Nota:** El valor interno es `fdkar` pero el label visible es "Safety Cards" ✅

---

## 📊 COMPARACIÓN DETALLADA POR TIPO

### 1️⃣ HID (Identificación de Peligros)

| Campo Requerido | Implementado | Key en Backend | Estado |
|-----------------|--------------|----------------|--------|
| **Fecha** | ✅ | `fecha_evento` | ✅ OK |
| **Cliente (Centro de trabajo)** | ✅ | `cliente_id` (campo global) | ✅ OK |
| **Proyecto** | ✅ | `proyecto_id` (campo global) | ✅ OK |
| **Seleccione la empresa a la que pertenece** | ✅ | `empresa_id` (campo global) | ✅ OK |
| **Nombre de quien reporta** | ✅ | `nombre_quien_reporta` | ✅ OK |
| **Tipo de reporte** | ✅ | `tipo_reporte_hid` | ✅ OK |
| **Empresa a quien se le genera el reporte** | ✅ | `empresa_id` (mismo campo) | ✅ OK |
| **Nombre EHS del contratista** | ✅ | `nombre_ehs_contratista` | ✅ OK |
| **Nombre Supervisor obra del contratista** | ✅ | `nombre_supervisor_obra` | ✅ OK |
| **Tipo** | ✅ (duplicado?) | `tipo` es el tipo de reporte principal | ⚠️ Ver nota |
| **Categoría** | ✅ | `categoria` | ✅ OK |
| **Subcategoría** | ✅ | `subcategoria` | ✅ OK |
| **Descripción de hallazgo** (¿Qué pasó? ¿Dónde pasó? ¿Qué procedimiento se incumplió?) | ✅ | `descripcion_condicion` | ✅ OK |
| **Descripción de cierre** (¿Qué acciones se tomaron? ¿Qué acuerdos se generaron?) | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |
| **Registro Fotográfico del hallazgo** | ⚠️ | `foto` (opcional, no obligatorio) | ⚠️ Ver nota |
| **Estado** | ✅ | `estado` (campo global: abierto/cerrado) | ✅ OK |
| **Observación** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |

**Campos adicionales implementados (no en requerimiento):**
- `ubicacion` ✅ (útil)
- `severidad` ✅ (útil)
- `area` ✅ (útil)
- `causa_probable` (opcional)
- `accion_inmediata` (opcional)

**Notas HID:**
- ⚠️ "Tipo" parece redundante con "Tipo de reporte HID"
- 🔴 **Falta:** Campo de cierre `descripcion_cierre`
- 🔴 **Falta:** Campo `observacion`
- ⚠️ "Registro Fotográfico" está como opcional, ¿debería ser obligatorio?

---

### 2️⃣ W&T (Walk & Talk)

| Campo Requerido | Implementado | Key en Backend | Estado |
|-----------------|--------------|----------------|--------|
| **Fecha** | ✅ | `fecha_evento` o timestamp creación | ✅ OK |
| **Cliente (Centro de trabajo)** | ✅ | `cliente_id` (campo global) | ✅ OK |
| **Proyecto** | ✅ | `proyecto_id` (campo global) | ✅ OK |
| **Seleccione la empresa a la que pertenece** | ✅ | `empresa_id` (campo global) | ✅ OK |
| **Nombre de quien reporta** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |
| **Empresa a quien se le genera el reporte** | ✅ | `empresa_id` (mismo campo) | ✅ OK |
| **Tipo** | ✅ | `tipo` = 'wit' | ✅ OK |
| **Descripción de la conversación sostenida** | ✅ | `conducta_observada` | ⚠️ Naming diferente |
| **Describa el plan de acción generado o compromisos** | ✅ | `recomendacion` | ⚠️ Naming diferente |
| **Estado** | ✅ | `estado` (campo global) | ✅ OK |
| **Observación** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |

**Campos adicionales implementados:**
- `riesgo_asociado` (select, obligatorio) - **¿Es necesario?**
- `responsable` (text, obligatorio) - **¿Es necesario?**
- `testigo` (text, opcional) - **¿Es necesario?**

**Notas W&T:**
- 🔴 **Falta:** `nombre_quien_reporta`
- 🔴 **Falta:** `observacion`
- ⚠️ `conducta_observada` debería llamarse `descripcion_conversacion`
- ⚠️ `recomendacion` debería llamarse `plan_accion` o `compromisos`
- ❓ ¿Los campos `riesgo_asociado`, `responsable`, `testigo` son del requerimiento original o agregados?

---

### 3️⃣ SWA (Stop Work Authority)

| Campo Requerido | Implementado | Key en Backend | Estado |
|-----------------|--------------|----------------|--------|
| **Fecha** | ✅ | Timestamp creación | ✅ OK |
| **Cliente (Centro de trabajo)** | ✅ | `cliente_id` (campo global) | ✅ OK |
| **Proyecto** | ✅ | `proyecto_id` (campo global) | ✅ OK |
| **Seleccione la empresa a la que pertenece** | ✅ | `empresa_id` (campo global) | ✅ OK |
| **Nombre de quien reporta** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |
| **Empresa a quien se le genera el reporte** | ✅ | `empresa_id` | ✅ OK |
| **Nombre EHS del contratista** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |
| **Nombre Supervisor obra del contratista** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |
| **Tipo** | ✅ | `tipo` = 'swa' | ✅ OK |
| **Tipo de SWA** | ✅ | `motivo` | ⚠️ Naming diferente |
| **Hora de inicio de la detención** | ✅ | `hora_inicio_parada` | ✅ OK |
| **Hora de reinicio de la actividad** | ✅ | `hora_reinicio` | ✅ OK |
| **Descripción de hallazgo** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |
| **Descripción de cierre** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |
| **Estado** | ✅ | `estado` (campo global) | ✅ OK |
| **Observación** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |

**Campos adicionales implementados:**
- `area` (select, obligatorio)
- `responsable` (text, obligatorio)

**Notas SWA:**
- 🔴 **Falta:** `nombre_quien_reporta`
- 🔴 **Falta:** `nombre_ehs_contratista`
- 🔴 **Falta:** `nombre_supervisor_obra`
- 🔴 **Falta:** `descripcion_hallazgo`
- 🔴 **Falta:** `descripcion_cierre`
- 🔴 **Falta:** `observacion`
- ⚠️ `motivo` debería llamarse `tipo_swa`

---

### 4️⃣ Safety Cards

| Campo Requerido | Implementado | Key en Backend | Estado |
|-----------------|--------------|----------------|--------|
| **Fecha** | ✅ | Timestamp creación | ✅ OK |
| **Cliente (Centro de trabajo)** | ✅ | `cliente_id` (campo global) | ✅ OK |
| **Proyecto** | ✅ | `proyecto_id` (campo global) | ✅ OK |
| **Nombre de quien reporta** | ✅ | `quien_reporta` | ✅ OK |
| **Empresa a quien se le genera el reporte** | ✅ | `empresa_id` (campo global) | ✅ OK |
| **Tipo de tarjeta** | ✅ | `clasificacion` | ⚠️ Naming diferente |
| **Descripción de hallazgo** | ✅ | `descripcion` | ✅ OK |
| **Descripción de cierre** | ✅ | `plan_accion_propuesto` | ⚠️ Debería ser para cierre |
| **Estado** | ✅ | `estado` (campo global) | ✅ OK |
| **Observación** | ❌ | **NO IMPLEMENTADO** | 🔴 FALTA |

**Notas Safety Cards:**
- 🔴 **Falta:** `observacion`
- ⚠️ `clasificacion` debería llamarse `tipo_tarjeta`
- ⚠️ `plan_accion_propuesto` está en creación, pero "Descripción de cierre" debería llenarse AL CERRAR, no al crear

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Campo "Observación" falta en TODOS los tipos** 🔴
**Impacto:** CRÍTICO  
**Descripción:** El requerimiento pide un campo "Observación" en los 4 tipos de reporte, pero NO está implementado en ninguno.

**Solución:**
```typescript
// Agregar a todos los tipos en field-mapper.util.ts
optional: [..., 'observacion']
```

---

### 2. **Campo "Descripción de Cierre" falta en HID y SWA** 🔴
**Impacto:** CRÍTICO  
**Descripción:** El requerimiento pide "Descripción de cierre" con dos preguntas:
- ¿Qué acciones se tomaron?
- ¿Qué acuerdos se generaron?

Esto es **diferente** del campo de creación. Debería llenarse al **cerrar** el reporte.

**Estado actual:**
- ✅ Safety Cards: tiene `plan_accion_propuesto` (pero es al crear, no al cerrar)
- ❌ HID: NO tiene
- ❌ SWA: NO tiene
- ❌ W&T: NO tiene

**Solución:**
```typescript
// field-mapper.util.ts
[IlvReportType.HAZARD_ID]: {
  close_required: ['descripcion_cierre', 'evidencia_cierre']
}

[IlvReportType.SWA]: {
  close_required: ['descripcion_cierre']
}

[IlvReportType.WIT]: {
  close_required: ['descripcion_cierre']
}
```

---

### 3. **Nombres de quien reporta inconsistentes** 🟡
**Impacto:** MEDIO  
**Problema:**
- HID: tiene `nombre_quien_reporta` ✅
- W&T: **NO tiene** ❌
- SWA: **NO tiene** ❌
- Safety Cards: tiene `quien_reporta` ✅

**Solución:** Agregar `nombre_quien_reporta` a W&T y SWA

---

### 4. **Campos EHS y Supervisor faltan en SWA** 🟡
**Impacto:** MEDIO  
**Problema:** SWA requiere:
- `nombre_ehs_contratista` ❌
- `nombre_supervisor_obra` ❌

Pero solo HID los tiene.

**Solución:** Agregar estos campos a SWA

---

### 5. **Descripción de hallazgo falta en SWA** 🟡
**Impacto:** MEDIO  
**Problema:** SWA requiere "Descripción de hallazgo" con las 3 preguntas guía, pero no está implementado.

**Solución:** Agregar `descripcion_hallazgo` a SWA

---

### 6. **Naming inconsistente en varios campos** ⚠️
**Impacto:** BAJO (funcional pero confuso)

| Requerimiento | Implementado | Sugerencia |
|---------------|--------------|------------|
| "Tipo de tarjeta" | `clasificacion` | Renombrar a `tipo_tarjeta` |
| "Tipo de SWA" | `motivo` | Renombrar a `tipo_swa` |
| "Descripción de la conversación" | `conducta_observada` | Renombrar a `descripcion_conversacion` |
| "Plan de acción/compromisos" | `recomendacion` | Renombrar a `plan_accion` |

---

## 📋 RESUMEN DE CAMPOS FALTANTES

### **CRÍTICOS** (deben agregarse YA):

#### Todos los tipos:
- ❌ `observacion` (text, opcional)

#### HID:
- ❌ `descripcion_cierre` (textarea, requerido al cerrar)

#### W&T:
- ❌ `nombre_quien_reporta` (text, requerido)
- ❌ `descripcion_cierre` (textarea, requerido al cerrar)

#### SWA:
- ❌ `nombre_quien_reporta` (text, requerido)
- ❌ `nombre_ehs_contratista` (text, requerido)
- ❌ `nombre_supervisor_obra` (text, requerido)
- ❌ `descripcion_hallazgo` (textarea, requerido)
- ❌ `descripcion_cierre` (textarea, requerido al cerrar)

#### Safety Cards:
- ❌ `descripcion_cierre` (textarea, requerido al cerrar) - **Actualmente tiene `plan_accion_propuesto` que es diferente**

---

## 🎯 PLAN DE CORRECCIÓN INMEDIATA

### Fase 1: Agregar campos faltantes críticos (2-3 horas)

**1. Actualizar `field-mapper.util.ts`:**

```typescript
[IlvReportType.HAZARD_ID]: {
  required: [
    // ... existentes
  ],
  optional: [
    // ... existentes
    'observacion'  // NUEVO
  ],
  close_required: ['descripcion_cierre', 'evidencia_cierre']  // NUEVO
},

[IlvReportType.WIT]: {
  required: [
    'nombre_quien_reporta',  // NUEVO
    'conducta_observada',
    'riesgo_asociado',
    'recomendacion',
    'responsable'
  ],
  optional: ['testigo', 'adjuntos', 'observacion'],  // agregado observacion
  close_required: ['descripcion_cierre']  // NUEVO
},

[IlvReportType.SWA]: {
  required: [
    'nombre_quien_reporta',  // NUEVO
    'nombre_ehs_contratista',  // NUEVO
    'nombre_supervisor_obra',  // NUEVO
    'descripcion_hallazgo',  // NUEVO
    'hora_inicio_parada',
    'hora_reinicio',
    'motivo',
    'area',
    'responsable'
  ],
  optional: ['observacion'],  // NUEVO
  close_required: ['descripcion_cierre']  // NUEVO
},

[IlvReportType.FDKAR]: {
  required: [
    'quien_reporta',
    'clasificacion',
    'descripcion'
  ],
  optional: ['observacion'],  // NUEVO
  close_required: [
    'plan_accion_propuesto',  // MOVER de required a close_required
    'descripcion_cierre',  // NUEVO
    'evidencia_cierre',
    'fecha_implantacion'
  ]
}
```

**2. Actualizar `ILVReportForm.vue`:**

Agregar los nuevos campos en `fieldConfigs`:

```javascript
hazard_id: [
  // ... existentes
  { key: 'observacion', label: 'Observación', type: 'textarea', required: false }
],

wit: [
  { key: 'nombre_quien_reporta', label: 'Nombre Quien Reporta', type: 'text', required: true },
  // ... existentes
  { key: 'observacion', label: 'Observación', type: 'textarea', required: false }
],

swa: [
  { key: 'nombre_quien_reporta', label: 'Nombre Quien Reporta', type: 'text', required: true },
  { key: 'nombre_ehs_contratista', label: 'Nombre EHS Contratista', type: 'text', required: true },
  { key: 'nombre_supervisor_obra', label: 'Nombre Supervisor Obra', type: 'text', required: true },
  { key: 'descripcion_hallazgo', label: 'Descripción de Hallazgo (¿Qué pasó? ¿Dónde? ¿Qué procedimiento se incumplió?)', type: 'textarea', required: true },
  // ... existentes
  { key: 'observacion', label: 'Observación', type: 'textarea', required: false }
],

fdkar: [
  // ... existentes
  { key: 'observacion', label: 'Observación', type: 'textarea', required: false }
]
```

**3. Actualizar `ILVClosePublic.vue`:**

Agregar formulario de cierre con `descripcion_cierre` para todos los tipos.

---

### Fase 2: Renombrar campos (opcional, 1 hora)

Si quieres mantener consistencia con el naming del requerimiento:
- `clasificacion` → `tipo_tarjeta`
- `motivo` → `tipo_swa`
- `conducta_observada` → `descripcion_conversacion`
- `recomendacion` → `plan_accion`

---

## ✅ CONFIRMACIÓN FINAL

### Los 4 tipos de reporte son correctos:
- ✅ **HID** (Identificación de Peligros)
- ✅ **W&T** (Walk & Talk)
- ✅ **SWA** (Stop Work Authority)
- ✅ **Safety Cards**

### Pero faltan campos importantes:
- 🔴 **Observación** en todos
- 🔴 **Descripción de cierre** en todos (para flujo de cierre)
- 🔴 **Nombre quien reporta** en W&T y SWA
- 🔴 **EHS + Supervisor** en SWA
- 🔴 **Descripción hallazgo** en SWA

---

**¿Quieres que implemente las correcciones ahora?**
