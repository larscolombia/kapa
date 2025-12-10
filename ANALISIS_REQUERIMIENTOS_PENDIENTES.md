# Análisis de Requerimientos Pendientes - Sistema KAPA

## Fecha: 10 de Diciembre 2025

---

## 📊 RESUMEN EJECUTIVO

| # | Requerimiento | Estado | Comentarios |
|---|--------------|--------|-------------|
| 1 | Maestro de Plantillas de Correo | ❌ NO EXISTE | Fase 2 - No implementado |
| 2 | Logs de Notificación | ✅ EXISTE | Tabla `ilv_email_log` implementada |
| 3 | Reportes PDF/Excel Parametrizables | ⚠️ PARCIAL | Solo Excel implementado, PDF falta |
| 4 | Parámetro días orden abierta | ⚠️ PARCIAL | Hardcoded (5 días), no configurable en UI |
| 5.A | Subcategoría HID muestra padre | ✅ EXISTE | Campo `aplica_a_tipo` funcional |
| 5.B | Maestro Motivo SWA | ✅ EXISTE | `motivo_swa` implementado con 6 valores |
| 5.C | Clasificación FDKAR | ✅ EXISTE | `clasificacion_fdkar` con 5 valores FDKAR |
| 5.D | Área | ✅ EXISTE | `area` con 5 valores |
| 5.E | Causa | ✅ EXISTE | `causa` con 6 valores |
| 5.F | Severidad | ✅ EXISTE | `severidad` con 4 valores |
| 5.G | Riesgo | ✅ EXISTE | `riesgo` con 8 valores |
| 5.H | Tipo HID | ⚠️ PARCIAL | Registrado en config, sin datos seed |
| 5.I | Tipo HSE | ⚠️ PARCIAL | Registrado en config, sin datos seed |

---

## 📝 DETALLE POR REQUERIMIENTO

---

### 1. ❌ MAESTRO DE PLANTILLAS DE CORREO (FASE 2)

**Requerimiento:**
> Debe haber un maestro de plantillas de correo en el cual se pueda indicar qué plantilla utilizar para las aperturas, cierres y recordatorios de ILV e Inspecciones, así como Notificaciones y Envío de Reportes.

**Estado Actual:** NO IMPLEMENTADO

**Lo que existe:**
- Plantillas de correo están **hardcodeadas** en el código TypeScript
- Ubicación: `backend/src/common/services/notification.service.ts`
- No hay tabla de base de datos para gestionar plantillas
- No hay interfaz de usuario para administrar plantillas

**Plantillas actualmente hardcodeadas:**
1. Creación de reporte (ILV/Inspecciones)
2. Cierre de reporte
3. Recordatorio de SLA vencido

**Qué falta para completar:**
```
□ Crear tabla: email_template (template_id, nombre, tipo, asunto, cuerpo_html, variables, activo)
□ CRUD de plantillas en SystemConfig
□ Selector de plantilla por tipo de evento
□ Variables dinámicas: {{nombre}}, {{proyecto}}, {{fecha}}, etc.
□ Preview de plantilla antes de guardar
□ Soporte para ILV: apertura, cierre, recordatorio
□ Soporte para Inspecciones: apertura, cierre, recordatorio
□ Soporte para Notificaciones generales
□ Soporte para Envío de Reportes
```

**Prioridad:** MEDIA (marcado como Fase 2)

---

### 2. ✅ LOGS DE NOTIFICACIÓN

**Requerimiento:**
> Registro de cada correo enviado, estado (enviado, entregado, fallido) y fecha.

**Estado Actual:** IMPLEMENTADO ✅

**Evidencia:**
- Tabla: `ilv_email_log`
- Entity: `backend/src/database/entities/ilv-email-log.entity.ts`

**Estructura de la tabla:**
```sql
CREATE TABLE ilv_email_log (
  log_id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES ilv_report(report_id),
  to_addr VARCHAR(255) NOT NULL,      -- Destinatario
  subject VARCHAR(500) NOT NULL,       -- Asunto
  payload TEXT,                        -- Contenido
  status VARCHAR(50) DEFAULT 'pending', -- Estado: pending, sent, failed
  error_message TEXT,                  -- Mensaje de error si falla
  created_at TIMESTAMP DEFAULT NOW(),  -- Fecha de creación
  sent_at TIMESTAMP                    -- Fecha de envío
);
```

**Pendiente menor:**
- No hay interfaz visual para consultar los logs (solo acceso directo a BD)
- Considerar crear vista de administración de logs de correo

---

### 3. ⚠️ REPORTES PARAMETRIZABLES (PARCIAL)

**Requerimiento:**
> Generación de reportes en PDF y Excel con campos predefinidos: Cliente, Proyecto, Empresa, Área, Tipo de Hallazgo, Clasificación, Categoría, Subcategoría, Descripción, Estado, Fechas de carga y cierre, Tiempo de resolución, cumplimiento.

**Estado Actual:**

| Formato | Estado | Ubicación |
|---------|--------|-----------|
| Excel | ✅ Implementado | `GET /reports/export/excel` |
| PDF | ❌ No implementado | - |

**Campos en Excel actual:**
- ✅ Cliente
- ✅ Proyecto
- ✅ Contratista (Empresa)
- ⚠️ Área (no incluido en reporte actual)
- ⚠️ Tipo de Hallazgo (no incluido)
- ⚠️ Clasificación (no incluido)
- ⚠️ Categoría (no incluido)
- ⚠️ Subcategoría (no incluido)
- ✅ Descripción (parcial, en timeline)
- ✅ Estado
- ✅ Fecha de carga
- ✅ Fecha de revisión
- ✅ Tiempo de revisión
- ✅ Cumplimiento SLA

**Qué falta:**
```
□ Implementar exportación PDF (librería: pdfmake o puppeteer)
□ Agregar campos faltantes al reporte Excel
□ Crear endpoint específico para ILV con todos los campos
□ Selector de campos a incluir en el reporte
```

---

### 4. ⚠️ PARÁMETRO TIEMPO DÍAS ORDEN ABIERTA (PARCIAL)

**Requerimiento:**
> Dentro de Parámetros del sistema falta la opción de tiempo en días permitido para que una orden esté abierta.

**Estado Actual:** HARDCODEADO

**Evidencia en código:**
```typescript
// backend/src/modules/ilv/services/ilv-scheduler.service.ts
// Calcular fecha límite (5 días atrás)
const cincoDiasAtras = new Date();
cincoDiasAtras.setDate(cincoDiasAtras.getDate() - 5);
```

```typescript
// backend/src/modules/reports/reports.service.ts
const SLA_HOURS = 24; // Hardcoded
```

**Qué falta:**
```
□ Crear tabla: system_parameters (key, value, description)
□ Parámetro: sla_days_ilv (default: 5)
□ Parámetro: sla_days_inspeccion (default: 5)
□ Parámetro: sla_hours_revision (default: 24)
□ UI en SystemConfig para editar estos valores
□ Cargar parámetros dinámicamente en schedulers y reportes
```

---

### 5. ARCHIVOS MAESTROS ILV

---

#### 5.A ✅ Subcategoría HID muestra categoría padre

**Requerimiento:**
> El maestro de Subcategoría no muestra la categoría padre que se debe asociar.

**Estado:** IMPLEMENTADO ✅

**Evidencia:**
- Frontend: `SystemConfigIlvMaestros.vue` línea 175-183
- Campo `aplica_a_tipo` usado para vincular subcategorías con categorías padre
- Selector "Aplica a (categoría padre)" visible al crear/editar subcategorías

```vue
<!-- Campo para subcategorías -->
<q-select
  v-if="showAplicaATipo"
  v-model="form.aplica_a_tipo"
  :options="padresOptions"
  label="Aplica a (categoría padre)"
  ...
/>
```

---

#### 5.B ✅ Maestro Motivo SWA

**Requerimiento:**
> El Maestro Motivo SWA no existe como opción en el sistema.

**Estado:** IMPLEMENTADO ✅

**Evidencia:**
- Tipo: `motivo_swa`
- Ubicación: `backend/seed-maestros-ilb.sql`
- Configuración: `system-config.service.ts`

**Valores disponibles (6):**
| Clave | Valor |
|-------|-------|
| peligro_inminente | Peligro inminente |
| condicion_critica | Condición crítica de seguridad |
| falta_permisos | Falta de permisos de trabajo |
| personal_no_calificado | Personal no calificado |
| equipo_defectuoso | Equipo defectuoso |
| clima_adverso | Condiciones climáticas adversas |

**Acceso:** Sistema → Configuración → Maestros ILV → Motivo SWA

---

#### 5.C ✅ Clasificación FDKAR

**Requerimiento:**
> ILV: Clasificación FDKAR no existe como opción en el sistema.

**Estado:** IMPLEMENTADO ✅

**Evidencia:**
- Tipo: `clasificacion_fdkar`
- Ubicación: `backend/seed-maestros-ilb.sql`

**Valores disponibles (5):**
| Clave | Valor |
|-------|-------|
| find | Find (Encontrado) |
| develop | Develop (Desarrollado) |
| kill | Kill (Eliminado) |
| act | Act (Actuado) |
| recognize | Recognize (Reconocido) |

---

#### 5.D ✅ Área

**Requerimiento:**
> ILV: AREA no existe como opción en el sistema.

**Estado:** IMPLEMENTADO ✅

**Evidencia:**
- Tipo: `area`
- Ubicación: `backend/seed-maestros-ilb.sql`

**Valores disponibles (5):**
| Clave | Valor |
|-------|-------|
| construccion | Construcción |
| mantenimiento | Mantenimiento |
| operaciones | Operaciones |
| logistica | Logística |
| administrativa | Administrativa |

---

#### 5.E ✅ Causa

**Requerimiento:**
> ILV: CAUSA no existe como opción en el sistema.

**Estado:** IMPLEMENTADO ✅

**Evidencia:**
- Tipo: `causa`
- Ubicación: `backend/seed-maestros-ilb.sql`

**Valores disponibles (6):**
| Clave | Valor |
|-------|-------|
| condicion_insegura | Condición insegura |
| acto_inseguro | Acto inseguro |
| falta_epp | Falta de EPP |
| maquinaria_defectuosa | Maquinaria defectuosa |
| falta_señalizacion | Falta de señalización |
| orden_limpieza | Orden y limpieza |

---

#### 5.F ✅ Severidad

**Requerimiento:**
> ILV: SEVERIDAD no existe como opción en el sistema.

**Estado:** IMPLEMENTADO ✅

**Evidencia:**
- Tipo: `severidad`
- Ubicación: `backend/seed-maestros-ilb.sql`

**Valores disponibles (4):**
| Clave | Valor |
|-------|-------|
| baja | Baja |
| media | Media |
| alta | Alta |
| critica | Crítica |

---

#### 5.G ✅ Riesgo

**Requerimiento:**
> ILV: RIESGO no existe como opción en el sistema.

**Estado:** IMPLEMENTADO ✅

**Evidencia:**
- Tipo: `riesgo`
- Ubicación: `backend/seed-maestros-ilb.sql`

**Valores disponibles (8):**
| Clave | Valor |
|-------|-------|
| caida_altura | Caída de altura |
| atrapamiento | Atrapamiento |
| golpe_objeto | Golpe por objeto |
| electrico | Eléctrico |
| incendio | Incendio |
| ergonomico | Ergonómico |
| quimico | Químico |
| biologico | Biológico |

---

#### 5.H ⚠️ Tipo HID (PARCIAL)

**Requerimiento:**
> ILV: TIPO HID no existe como opción en el sistema.

**Estado:** PARCIALMENTE IMPLEMENTADO

**Lo que existe:**
- ✅ Configuración definida en `system-config.service.ts`:
  ```typescript
  tipo_hid: { label: 'Tipo HID', descripcion: 'Tipos HID adicionales', formularios: ['HID'] }
  ```
- ✅ Tipo registrado en DTO de validación
- ❌ NO hay datos seed en `seed-maestros-ilb.sql`

**Acción requerida:**
```sql
-- Agregar al seed-maestros-ilb.sql
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('tipo_hid', 'condicion', 'Condición', true, 1, 'hazard_id'),
('tipo_hid', 'comportamiento', 'Comportamiento', true, 2, 'hazard_id'),
('tipo_hid', 'casi_accidente', 'Casi Accidente', true, 3, 'hazard_id');
```

---

#### 5.I ⚠️ Tipo HSE (PARCIAL)

**Requerimiento:**
> ILV: TIPO HSE no existe como opción en el sistema.

**Estado:** PARCIALMENTE IMPLEMENTADO

**Lo que existe:**
- ✅ Configuración definida en `system-config.service.ts`:
  ```typescript
  tipo_hse: { label: 'Tipo HSE', descripcion: 'Tipos HSE', formularios: ['Varios'] }
  ```
- ✅ Tipo registrado en DTO de validación
- ❌ NO hay datos seed en `seed-maestros-ilb.sql`

**Acción requerida:**
```sql
-- Agregar al seed-maestros-ilb.sql
INSERT INTO ilv_maestro (tipo, clave, valor, activo, orden, aplica_a_tipo) VALUES
('tipo_hse', 'seguridad', 'Seguridad', true, 1, NULL),
('tipo_hse', 'salud', 'Salud', true, 2, NULL),
('tipo_hse', 'ambiente', 'Ambiente', true, 3, NULL);
```

---

## 📋 ACCIONES PRIORITARIAS

### Alta Prioridad
1. ⬜ Agregar datos seed para `tipo_hid` y `tipo_hse`
2. ⬜ Implementar parámetros de sistema configurables (días SLA)
3. ⬜ Completar campos faltantes en reporte Excel

### Media Prioridad
4. ⬜ Implementar exportación PDF
5. ⬜ Crear vista de administración de logs de correo
6. ⬜ Maestro de plantillas de correo (Fase 2)

### Baja Prioridad
7. ⬜ Selector de campos para reportes personalizados

---

## 📍 UBICACIÓN DE ARCHIVOS RELEVANTES

| Componente | Ubicación |
|------------|-----------|
| Maestros ILV (seed) | `backend/seed-maestros-ilb.sql` |
| Configuración maestros | `backend/src/modules/system-config/system-config.service.ts` |
| Logs de email | `backend/src/database/entities/ilv-email-log.entity.ts` |
| Servicio notificaciones | `backend/src/common/services/notification.service.ts` |
| Scheduler ILV | `backend/src/modules/ilv/services/ilv-scheduler.service.ts` |
| Reportes Service | `backend/src/modules/reports/reports.service.ts` |
| UI Maestros ILV | `frontend/src/pages/SystemConfigIlvMaestros.vue` |
| UI Config Sistema | `frontend/src/pages/SystemConfigPage.vue` |

---

**Documento generado:** 10 de Diciembre 2025
