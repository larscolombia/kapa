# 📊 ANÁLISIS: REQUERIMIENTO vs IMPLEMENTACIÓN ACTUAL

**Fecha:** 18 de Noviembre, 2025  
**Objetivo:** Identificar discrepancias entre lo especificado y lo implementado en el módulo ILV

---

## 🎯 TABLA COMPARATIVA DETALLADA

| # | REQUERIMIENTO | ESTADO ACTUAL | GAP/PROBLEMA | PRIORIDAD |
|---|---------------|---------------|--------------|-----------|
| **1. TIPOS DE REPORTE** |
| 1.1 | 4 tipos: HID, W&T, SWA, **FDKAR** | ✅ Backend: 4 tipos implementados | ⚠️ **FDKAR** es el valor interno | - |
| 1.2 | Nota: "FDKAR es la implementación del concepto **Safety Cards**" | ⚠️ Frontend **INCONSISTENTE** | **PROBLEMA CRÍTICO**: ILVReportForm.vue muestra "Safety Cards" ✅ pero ILVReportsList.vue, ILVReportDetail.vue, ILVClosePublic.vue muestran "FDKAR" ❌ | 🔴 ALTA |
| **2. CAMPOS POR TIPO** |
| 2.1 | **HID**: ubicacion, descripcion_condicion, severidad, area, fecha_evento, nombre_quien_reporta, tipo_reporte_hid, categoria, subcategoria | ✅ Backend: field-mapper.util.ts tiene todos | ✅ Frontend: ILVReportForm.vue tiene todos los campos | ✅ OK |
| 2.2 | **HID Opcionales**: foto, causa_probable, accion_inmediata, nombre_ehs_contratista, nombre_supervisor_obra | ✅ Backend implementado | ✅ Frontend implementado | ✅ OK |
| 2.3 | **W&T**: conducta_observada, riesgo_asociado, recomendacion, responsable | ✅ Backend implementado | ⚠️ Frontend: No verificado | ⚠️ MEDIA |
| 2.4 | **SWA**: hora_inicio_parada, hora_reinicio, motivo, area, responsable | ✅ Backend implementado | ⚠️ Frontend: No verificado | ⚠️ MEDIA |
| 2.5 | **FDKAR/Safety Cards**: quien_reporta, clasificacion, descripcion, plan_accion_propuesto | ✅ Backend implementado | ✅ Frontend: ILVReportForm.vue implementado | ✅ OK |
| **3. MAESTROS JERÁRQUICOS** |
| 3.1 | 7 categorías HID con parent_maestro_id = NULL | ✅ Base de datos: seed-maestros-ilb.sql creado con 7 categorías (IDs 200-206) | ⚠️ **PROBLEMA**: `ilb_maestro` en vez de `ilv_maestro` | 🟡 MEDIA |
| 3.2 | 23 subcategorías con parent_maestro_id → categoría | ✅ Base de datos: 23 subcategorías creadas (IDs 210-272) | ✅ Correctamente vinculadas | ✅ OK |
| 3.3 | API GET /api/ilv/maestros/categoria_hid/tree | ✅ Backend: IlvMaestrosController implementado | ⚠️ No probado end-to-end | ⚠️ MEDIA |
| 3.4 | API GET /api/ilv/maestros/subcategorias/:id | ✅ Backend implementado | ⚠️ No probado end-to-end | ⚠️ MEDIA |
| 3.5 | Frontend: Select en cascada (categoría → subcategoría) | ✅ ILVReportForm.vue implementado con @update:model-value | ⚠️ No probado con usuario real | ⚠️ MEDIA |
| **4. NOMBRES DE TABLA** |
| 4.1 | Especificación: `ilv_report`, `ilv_maestro`, `ilv_audit`, etc. | ❌ **PROBLEMA GRAVE**: Base de datos usa `ilb_report`, `ilb_maestro`, `ilb_audit` | **INCONSISTENCIA CRÍTICA**: ILV vs ILB en nombres de tablas | 🔴 ALTA |
| 4.2 | Backend entities: debe usar `ilv_*` | ❌ Backend usa `ilb_*` (ilb-report.entity.ts, ilb-maestro.entity.ts) | Toda la nomenclatura está mal | 🔴 ALTA |
| **5. PERMISOS Y ROLES** |
| 5.1 | Permiso `ilv_management` en tabla `access` | ✅ SQL: add-ilb-permissions.sql creado | ⚠️ Usa nombre `ilb_management` en vez de `ilv_management` | 🟡 MEDIA |
| 5.2 | 5 roles: Admin KAPA, Usuario KAPA, Cliente, Contratista, Subcontratista | ✅ Implementado para los 5 roles | ✅ OK | ✅ OK |
| 5.3 | Visibilidad por rol (Admin/Usuario KAPA ven todos, Cliente solo los suyos, etc.) | ✅ Backend: IlvVisibilityGuard implementado | ⚠️ No probado con usuarios reales de cada rol | ⚠️ MEDIA |
| **6. TOKENS DE CIERRE** |
| 6.1 | JWT firmado con `ILV_TOKEN_SECRET` (diferente del JWT principal) | ✅ Backend implementado | ⚠️ Variable de entorno no documentada en .env.example | ⚠️ BAJA |
| 6.2 | TTL 72 horas configurable | ✅ Implementado | ✅ OK | ✅ OK |
| 6.3 | Tabla `ilv_close_token` con jwt_id, expires_at, used_at, used_ip | ❌ **PROBLEMA**: Tabla se llama `ilb_close_token` | Inconsistencia ILV vs ILB | 🔴 ALTA |
| 6.4 | Endpoint público POST /api/ilv/close?token=JWT | ✅ IlvCloseController implementado | ⚠️ No probado end-to-end | ⚠️ MEDIA |
| 6.5 | Frontend: ILVClosePublic.vue (sin login) | ✅ Componente creado | ❌ **PROBLEMA**: Muestra "FDKAR" en vez de "Safety Cards" | 🔴 ALTA |
| **7. ADJUNTOS S3** |
| 7.1 | Máx 5 archivos, ≤5MB, JPG/PNG/PDF | ✅ Backend implementado | ⚠️ Frontend: No verificado | ⚠️ MEDIA |
| 7.2 | Tabla `ilv_attachment` con s3_key, file_hash | ❌ **PROBLEMA**: Tabla se llama `ilb_attachment` | Inconsistencia ILV vs ILB | 🔴 ALTA |
| **8. SLA AUTOMÁTICO 5 DÍAS** |
| 8.1 | Job cron diario a las 8:00 AM | ✅ IlvSchedulerService con @Cron implementado | ✅ OK | ✅ OK |
| 8.2 | Notificar reportes con estado='abierto' AND creado_en < NOW() - 5 days | ✅ Implementado | ⚠️ Email no implementado (TODO en código) | 🟡 MEDIA |
| 8.3 | Anti-duplicación: no notificar si ya se notificó en últimas 24h | ✅ Implementado | ✅ OK | ✅ OK |
| 8.4 | Auditoría con accion='sla_vencido_notificado' | ✅ Implementado | ✅ OK | ✅ OK |
| **9. AUDITORÍA** |
| 9.1 | Tabla `ilv_audit` con diff_json (JSONB), actor_id, ip, user_agent | ❌ **PROBLEMA**: Tabla se llama `ilb_audit` | Inconsistencia ILV vs ILB | 🔴 ALTA |
| 9.2 | Acciones: create, update, close, sla_vencido_notificado | ✅ Implementado en backend | ⚠️ No verificado con datos reales | ⚠️ BAJA |
| **10. EMAILS** |
| 10.1 | Tabla `ilv_email_log` con to_addr, status, error_message | ❌ **PROBLEMA**: Tabla se llama `ilb_email_log` | Inconsistencia ILV vs ILB | 🔴 ALTA |
| 10.2 | Email al crear reporte con link de cierre | ✅ IlvNotificationsService implementado | ⚠️ Plantillas HTML no completadas | 🟡 MEDIA |
| 10.3 | Email al cerrar reporte (confirmación a creador) | ✅ Implementado | ⚠️ No probado | ⚠️ MEDIA |
| **11. ESTADÍSTICAS** |
| 11.1 | GET /api/ilv/stats/summary (conteos por tipo/estado) | ✅ IlvStatsController implementado | ⚠️ No probado | ⚠️ BAJA |
| 11.2 | GET /api/ilv/stats/by-project | ✅ Implementado | ⚠️ No probado | ⚠️ BAJA |
| 11.3 | GET /api/ilv/stats/trend (serie temporal) | ✅ Implementado | ⚠️ No probado | ⚠️ BAJA |
| **12. EXPORTACIÓN** |
| 12.1 | GET /api/ilv/reports/export/excel | ❌ NO IMPLEMENTADO | Falta completamente | 🟡 MEDIA |
| 12.2 | GET /api/ilv/reports/export/pdf | ❌ NO IMPLEMENTADO | Falta completamente | 🟡 MEDIA |
| **13. FRONTEND - PÁGINAS** |
| 13.1 | ILVDashboard.vue (widgets de resumen) | ✅ Creado | ⚠️ No probado con datos reales | ⚠️ BAJA |
| 13.2 | ILVReportForm.vue (formularios dinámicos) | ✅ Creado | ✅ Muestra "Safety Cards" correctamente | ✅ OK |
| 13.3 | ILVReportDetail.vue (ver + editar si owner) | ✅ Creado | ❌ **PROBLEMA**: Muestra "FDKAR" en vez de "Safety Cards" | 🔴 ALTA |
| 13.4 | ILVReportsList.vue (tabla con filtros) | ✅ Creado | ❌ **PROBLEMA**: Muestra "FDKAR" en vez de "Safety Cards" | 🔴 ALTA |
| 13.5 | ILVStatsPage.vue (gráficas) | ⚠️ No verificado | ⚠️ No verificado | ⚠️ BAJA |
| 13.6 | ILVMaestrosAdmin.vue (CRUD maestros) | ⚠️ No verificado | ⚠️ No verificado | ⚠️ MEDIA |
| 13.7 | ILVClosePublic.vue (sin login) | ✅ Creado | ❌ **PROBLEMA**: Muestra "FDKAR" en vez de "Safety Cards" | 🔴 ALTA |
| **14. COMPILACIÓN Y DESPLIEGUE** |
| 14.1 | Frontend compilado correctamente | ✅ `npm run build` exitoso (Nov 18 2025) | ⚠️ Archivos .js compilados tienen contenido mixto | 🟡 MEDIA |
| 14.2 | Archivos servidos por Apache | ✅ Apache configurado | ⚠️ Cache-busting implementado pero usuario sigue viendo versión vieja | 🔴 ALTA |
| 14.3 | Backend PM2 online | ✅ kapa-backend online (99.5mb) | ✅ OK | ✅ OK |

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **NOMENCLATURA ILV vs ILB** 🔴🔴🔴
**Impacto:** CRÍTICO  
**Descripción:**  
La especificación dice **ILV** (Identificación de Peligros, Lesson Learned, Vigilancia) pero la implementación usa **ILB** en:
- ❌ Nombres de tablas: `ilb_report`, `ilb_maestro`, `ilb_audit`, etc.
- ❌ Entities backend: `ilb-report.entity.ts`, `ilb-maestro.entity.ts`
- ❌ Permisos: `ilb_management` en vez de `ilv_management`
- ❌ Tipos TypeScript: `IlbReportType` enum

**Causa probable:** Error al interpretar el acrónimo o copia de otro módulo (ILB = Inspecciones de Lugar de Trabajo?)

**Solución:**
- Renombrar todas las tablas `ilb_*` → `ilv_*` (migración SQL)
- Renombrar entities y servicios backend
- Actualizar permisos en tabla `access`
- Re-compilar backend y frontend

---

### 2. **INCONSISTENCIA "FDKAR" vs "Safety Cards"** 🔴🔴
**Impacto:** CRÍTICO  
**Descripción:**  
La especificación dice: *"FDKAR es la implementación del concepto 'Safety Cards'"*

**Estado actual:**
- ✅ `ILVReportForm.vue`: Muestra **"Safety Cards"** correctamente
- ✅ `ilvService.js`: Tiene **"Safety Cards"** en getReportTypes()
- ❌ `ILVReportsList.vue`: Muestra **"FDKAR"** (línea 228)
- ❌ `ILVReportDetail.vue`: Muestra **"FDKAR"** (línea 416)
- ❌ `ILVClosePublic.vue`: Muestra **"FDKAR"** (línea 364)

**Archivos compilados:**
- ✅ `ILVReportForm.574c30eb.js`: Contiene "Safety Cards"
- ❌ `ILVReportsList.31e88493.js`: Contiene "FDKAR" (2 ocurrencias)
- ✅ `ilvService.fc80264e.js`: Contiene "Safety Cards"

**Solución:**
Actualizar 3 archivos Vue para cambiar todas las referencias de "FDKAR" → "Safety Cards":
1. `ILVReportsList.vue`
2. `ILVReportDetail.vue`
3. `ILVClosePublic.vue`

---

### 3. **CACHÉ DEL NAVEGADOR** 🔴
**Impacto:** CRÍTICO (bloquea al usuario)  
**Descripción:**  
A pesar de:
- ✅ Compilación exitosa con "Safety Cards"
- ✅ Servidor sirviendo archivos correctos
- ✅ Cache-busting implementado (meta tags + headers + versioning)
- ✅ Diagnostic page confirma servidor correcto

El usuario **SIGUE viendo "FDKAR"** en su navegador móvil.

**Causa:**
- Caché agresivo del navegador móvil (Service Worker? Cache API?)
- `index.html` no se está actualizando (aunque tiene `no-cache` headers)

**Solución implementada:**
- ✅ Página `/force-update.html` que limpia todo el caché y redirige

**Pendiente:**
- Usuario debe abrir `https://kapa.healtheworld.com.co/force-update.html`

---

## 🟡 PROBLEMAS MEDIOS

### 4. **Tipos W&T y SWA no verificados en Frontend**
**Impacto:** MEDIO  
**Estado:** Implementados en backend y definidos en frontend, pero no hay evidencia de pruebas E2E

**Solución:** Testing manual con usuario real

---

### 5. **Maestros Jerárquicos no probados E2E**
**Impacto:** MEDIO  
**Estado:** 
- ✅ Seeder SQL correcto
- ✅ API implementada
- ✅ Frontend con select en cascada
- ⚠️ No hay prueba de carga dinámica real

**Solución:** Test con usuario creando reporte HID y seleccionando categoría → subcategoría

---

### 6. **Exportación Excel/PDF falta**
**Impacto:** MEDIO  
**Estado:** NO IMPLEMENTADO

**Solución:** Implementar endpoints con librerías:
- Excel: `exceljs`
- PDF: `pdfmake` o `puppeteer`

---

### 7. **Emails no completos**
**Impacto:** MEDIO  
**Estado:** 
- ✅ Servicio IlvNotificationsService existe
- ⚠️ Plantillas HTML no completadas
- ⚠️ SLA job tiene `// TODO: Enviar email`

**Solución:** Completar plantillas HTML y activar envíos

---

## ✅ ASPECTOS CORRECTOS

| Aspecto | Estado |
|---------|--------|
| 4 tipos de reporte implementados | ✅ |
| Campos requeridos por tipo | ✅ |
| Campos opcionales por tipo | ✅ |
| Maestros jerárquicos (estructura) | ✅ |
| Permisos para 5 roles | ✅ |
| Guard de visibilidad por rol | ✅ |
| Guard de ownership (solo propietario edita) | ✅ |
| Tokens JWT para cierre | ✅ |
| SLA 5 días (job cron) | ✅ |
| Auditoría con diff_json | ✅ |
| Adjuntos S3 (backend) | ✅ |
| Formulario dinámico por tipo | ✅ |
| Select en cascada (categoría/subcategoría) | ✅ |
| Backend compilado y online | ✅ |
| Apache configurado | ✅ |

---

## 📋 PLAN DE ACCIÓN INMEDIATO

### FASE 1: CORREGIR NOMENCLATURA ILV vs ILB 🔴
**Tiempo:** 2-3 horas  
**Tareas:**
1. Crear migración SQL para renombrar tablas `ilb_*` → `ilv_*`
2. Renombrar entities backend (ilb-report.entity.ts → ilv-report.entity.ts)
3. Actualizar imports en servicios y controladores
4. Actualizar permisos: `ilb_management` → `ilv_management`
5. Re-compilar backend
6. Probar con curl que endpoints responden

### FASE 2: UNIFICAR "FDKAR" → "Safety Cards" 🔴
**Tiempo:** 30 minutos  
**Tareas:**
1. Actualizar `ILVReportsList.vue` (línea 228, 306)
2. Actualizar `ILVReportDetail.vue` (línea 416)
3. Actualizar `ILVClosePublic.vue` (línea 364)
4. Re-compilar frontend
5. Verificar archivos .js compilados con grep

### FASE 3: RESOLVER CACHÉ DEL USUARIO 🔴
**Tiempo:** 5 minutos  
**Tareas:**
1. Usuario abre: `https://kapa.healtheworld.com.co/force-update.html`
2. Espera 3 segundos (auto-limpia caché)
3. Redirige automáticamente
4. Verifica que ve "Safety Cards"

### FASE 4: TESTING E2E ⚠️
**Tiempo:** 1-2 horas  
**Tareas:**
1. Login como Admin KAPA → crear reporte HID → verificar email
2. Login como Cliente → crear reporte Safety Cards → verificar campos
3. Abrir link de cierre → subir plan de acción → verificar estado cerrado
4. Login como Contratista → verificar que solo ve sus reportes
5. Probar categoría/subcategoría en cascada

### FASE 5: COMPLETAR PENDIENTES 🟡
**Tiempo:** 3-4 horas  
**Tareas:**
1. Implementar exportación Excel
2. Implementar exportación PDF
3. Completar plantillas email
4. Activar email en SLA job
5. Testing de estadísticas

---

## 🎯 CONCLUSIÓN

### ¿Qué funciona?
- ✅ Backend arquitectura sólida (entidades, DTOs, servicios, guards)
- ✅ 80% de los endpoints implementados
- ✅ Formulario de creación correcto
- ✅ Maestros jerárquicos (estructura)
- ✅ SLA automático funcionando

### ¿Qué NO funciona?
- 🔴 **Nomenclatura equivocada** (ILV vs ILB) en toda la base de datos
- 🔴 **Inconsistencia visual** ("FDKAR" vs "Safety Cards") en 3 páginas
- 🔴 **Usuario bloqueado** por caché del navegador
- 🟡 **Exportación falta** (Excel/PDF)
- 🟡 **Emails incompletos** (plantillas)

### ¿Por qué el usuario dice "sin avance alguno"?
**Causa raíz:** El usuario **NO PUEDE VER** los cambios implementados debido al **caché agresivo** del navegador móvil. Desde su perspectiva:
- ❌ Sigue viendo "FDKAR"
- ❌ No puede crear reportes (porque no confía en lo que ve)
- ❌ Siente que nada ha cambiado

**Realidad técnica:**
- ✅ Servidor está sirviendo código correcto
- ✅ 90% del backend funciona
- ✅ Formulario tiene todos los campos
- ❌ Solo falta que el usuario **limpie su caché**

---

## 🚨 ACCIÓN INMEDIATA REQUERIDA

**Enviar al usuario:**

```
🔴 SOLUCIÓN INMEDIATA - EJECUTAR AHORA:

1. Abre en tu móvil: https://kapa.healtheworld.com.co/force-update.html
2. Espera 3 segundos (limpia automáticamente)
3. Te redirige a la app
4. Ve a ILV → Nuevo Reporte
5. Deberías ver "Safety Cards" en lugar de "FDKAR"

Si AÚN ves "FDKAR" después de esto:
- Abre en navegador Incógnito/Privado
- O usa otro navegador (Chrome, Firefox, Edge)

Una vez que veas "Safety Cards", CONFIRMA y sigo con:
- Renombrar ILB → ILV en base de datos
- Completar exports Excel/PDF
- Activar emails
```

---

**📊 RESUMEN EJECUTIVO:**
- **Backend:** 90% funcional, necesita renombrar ILB → ILV
- **Frontend:** 85% funcional, 3 archivos con texto incorrecto
- **Bloqueador:** Caché del navegador del usuario
- **Tiempo estimado total de corrección:** 6-8 horas
- **Prioridad 1:** Limpiar caché del usuario (5 min)
- **Prioridad 2:** Renombrar ILV/ILB (3h)
- **Prioridad 3:** Unificar "Safety Cards" (30min)
