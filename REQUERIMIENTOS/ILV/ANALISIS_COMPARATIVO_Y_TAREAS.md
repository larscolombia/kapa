# 📋 MÓDULO ILV - Análisis Comparativo y Plan de Tareas

**Fecha:** 13 de Noviembre, 2025  
**Autor:** Análisis técnico del sistema implementado  
**Objetivo:** Comparar requerimientos originales vs. implementación actual y definir tareas pendientes

---

## 📊 TABLA COMPARATIVA COMPLETA

| # | Funcionalidad/Requisito | Estado | Implementación Actual | Gap/Notas |
|---|-------------------------|--------|----------------------|-----------|
| **0. ACTORES Y CONCEPTOS** | | | | |
| Definición de actores (Usuario KAPA, Contratista, Admin) | ✅ | 5 roles en BD con permisos | Completo |
| Entidades clave (Reporte, Cliente, Centro, Proyecto, etc.) | ✅ | 7 tablas relacionadas | Completo |
| **CU-ILV-01: REGISTRAR REPORTE** | | | | |
| Formulario dinámico por tipo | ⚠️ | Backend completo, frontend básico | Falta renderizado dinámico avanzado |
| Tipos: HID, W&T, SWA, Safety Cards | ⚠️ | hazard_id, wit, swa, **fdkar** | FDKAR en lugar de Safety Cards |
| Validación campos obligatorios | ✅ | FieldMapper.util + DTOs | Completo |
| Validación fechas no futuras | ✅ | IlvValidators.validateBusinessRules | Completo |
| Carga hasta 5 adjuntos (≤5MB, JPG/PNG/PDF) | ❌ | Entidad creada, sin upload S3 | **CRÍTICO: Implementar upload** |
| Previsualización antes de guardar | ❌ | No existe | Añadir modal preview |
| Maestros como listas desplegables | ✅ | getMaestros() implementado | Completo |
| **CU-ILV-01.A: HID (Hazard ID)** | | | | |
| Fecha | ✅ | Campo dinámico soportado | OK |
| Cliente (Centro de trabajo) | ✅ | cliente_id + maestros | OK |
| Proyecto | ✅ | proyecto_id FK | OK |
| Empresa a la que pertenece (reportante) | ⚠️ | No hay campo específico | Usar creado_por.empresa |
| Nombre de quien reporta | ⚠️ | Solo user_id | Añadir campo nombre_reportante |
| Tipo de reporte HID | ⚠️ | Maestro genérico | Crear maestro tipo_hid |
| Empresa a quien se le genera (contratista) | ✅ | empresa_id FK | OK |
| Nombre EHS del contratista | ❌ | No existe | **Añadir campo** |
| Nombre Supervisor obra contratista | ❌ | No existe | **Añadir campo** |
| Tipo (seguridad/salud/medio ambiente/inocuidad/daño propiedad) | ⚠️ | Maestro genérico 'area' | Renombrar/crear maestro tipo_hse |
| Categoría (trabajos en alturas, caliente, etc.) | ⚠️ | Maestros básicos | **Ampliar catálogo** |
| Subcategoría (caídas, derrumbe, golpes, etc.) | ❌ | No implementado | **Crear maestro jerárquico** |
| Descripción hallazgo (qué/dónde/procedimiento) | ✅ | Campos dinámicos | OK con 3 subcampos |
| Estado (Abierto/Cerrado) | ✅ | Campo estado con constraint | OK |
| Descripción cierre | ✅ | Campo al cerrar | OK |
| Registro fotográfico (máx 5) | ❌ | BD lista, sin S3 | **CRÍTICO** |
| Observación | ✅ | Campo opcional | OK |
| **CU-ILV-01.B: W&T (Walk & Talk)** | | | | |
| Tipo W&T | ✅ | tipo='wit' | OK |
| Fecha | ✅ | Campo dinámico | OK |
| Cliente (Centro de trabajo) | ✅ | cliente_id | OK |
| Proyecto | ✅ | proyecto_id | OK |
| Empresa a la que pertenece | ⚠️ | Usar creado_por | Inferir de usuario |
| Nombre quien reporta | ⚠️ | Solo user_id | Añadir campo |
| Empresa a quien se genera | ✅ | empresa_id | OK |
| Tipo (seguridad/salud/medio ambiente/inocuidad) | ✅ | Maestro | OK |
| Descripción conversación sostenida | ✅ | Campo dinámico | OK |
| Plan de acción / compromisos | ✅ | Campo dinámico | OK |
| Estado | ✅ | estado='abierto' default | OK |
| **CU-ILV-01.C: SWA (Stop Work Authority)** | | | | |
| Tipo SWA | ✅ | tipo='swa' | OK |
| Campos básicos (fecha, cliente, proyecto, etc.) | ✅ | Implementados | OK |
| Tipo SWA | ✅ | Maestro motivo_swa | OK |
| Hora inicio detención | ✅ | Campo + validación | OK |
| Hora reinicio actividad | ✅ | Con validación >= inicio | OK |
| Descripción hallazgo | ✅ | Campo dinámico | OK |
| Descripción cierre | ✅ | Al cerrar | OK |
| **CU-ILV-01.D: SAFETY CARDS** | | | | |
| Tipo Safety Cards | ❌ | Se implementó FDKAR | **DECISIÓN: Mapear o añadir** |
| Tipo de tarjeta (verde/amarilla/roja) | ❌ | No existe | **Crear maestro tipo_tarjeta** |
| Campos específicos | ❌ | FDKAR tiene otros campos | **Redefinir o separar** |
| **CU-ILV-02: EDITAR REPORTE** | | | | |
| Edición solo por creador | ✅ | IlvOwnershipGuard | OK |
| Solo si estado = Abierto | ✅ | Validación en service | OK |
| Historial de cambios | ✅ | ilv_audit con diff_json | OK |
| Frontend edición | ⚠️ | Básico | Mejorar UX |
| **CU-ILV-03: ADJUNTAR EVIDENCIAS** | | | | |
| Subir archivos | ❌ | Estructura BD, sin S3 | **CRÍTICO: Implementar** |
| Máx 5 archivos | ❌ | Sin validación | Añadir al DTO/service |
| Tamaño ≤5MB | ❌ | Sin validación | Middleware multer |
| Formatos JPG/PNG/PDF | ❌ | Sin validación | Validar MIME type |
| Ver miniaturas/preview | ❌ | No implementado | Frontend componente |
| Eliminar adjuntos | ❌ | DELETE endpoint falta | Añadir endpoint |
| **CU-ILV-04: CERRAR REPORTE** | | | | |
| Cierre por creador/contratista | ✅ | Método close() | OK |
| Descripción cierre obligatoria | ✅ | CloseIlvReportDto validación | OK |
| Cambio estado a Cerrado | ✅ | Actualiza estado + fecha | OK |
| Registro historial | ✅ | ilv_audit | OK |
| SLA 5 días | ⚠️ | Calculable, sin job | **Implementar cron** |
| **CU-ILV-05: NOTIFICAR CONTRATISTA** | | | | |
| Email al crear | ✅ | sendReportCreatedEmail() | OK |
| Enlace con token JWT | ✅ | generateCloseToken() | OK con JWT_SECRET |
| Datos reporte en email | ⚠️ | Plantilla básica | **Enriquecer HTML** |
| **CU-ILV-06: CONTRATISTA CARGA PLAN** | | | | |
| Acceso vía enlace sin login | ⚠️ | Backend OK, frontend stub | **CRÍTICO: Completar frontend** |
| Validación token JWT | ✅ | IlvTokenGuard | OK |
| Formulario cierre | ❌ | ILVClosePublic.vue placeholder | **URGENTE** |
| Subir evidencias | ❌ | Depende de CU-03 | Tras implementar S3 |
| **CU-ILV-07: SLA VENCIDO (>5 días)** | | | | |
| Proceso automático diario | ❌ | No hay cron/job | **Implementar scheduler** |
| Cálculo días transcurridos | ✅ | Posible con query | Query lista |
| Notificación email automática | ❌ | Lógica no existe | Tras implementar job |
| Flag SLA vencido | ⚠️ | No persistido, calculable | Añadir campo opcional |
| **CU-ILV-08: ADMINISTRAR MAESTROS** | | | | |
| CRUD maestros | ✅ | IlvMaestrosController | OK |
| 39 maestros iniciales | ✅ | Seeded | OK |
| Maestros jerárquicos (Categoría→Subcategoría) | ❌ | Flat, sin jerarquía | **Añadir parent_id** |
| Validación uso antes eliminar | ✅ | checkUsage() | OK |
| Frontend admin | ✅ | ILVMaestrosAdmin.vue | OK básico |
| Orden drag & drop | ❌ | Campo orden existe, sin UI | Opcional |
| **CU-ILV-09: BANDEJA CON FILTROS** | | | | |
| Lista reportes | ✅ | GET /api/ilv/reports | OK |
| Filtros múltiples | ✅ | FilterIlvReportDto | OK |
| Paginación | ✅ | page/limit | OK |
| Ordenamiento columnas | ⚠️ | Solo por fecha DESC | Añadir sort dinámico |
| Filtrado por rol (visibilidad) | ✅ | IlvVisibilityGuard | OK |
| Frontend lista | ✅ | ILVReportsList.vue | OK |
| Acciones rápidas (ver/editar/cerrar) | ⚠️ | Básico | Mejorar botones |
| **CU-ILV-10: VER DETALLE** | | | | |
| Vista completa reporte | ✅ | GET /reports/:id | OK |
| Datos + campos dinámicos | ✅ | Relations eager | OK |
| Adjuntos con preview | ❌ | Sin S3 | Pendiente |
| Historial cambios | ✅ | ilv_audit query | OK |
| Frontend detalle | ✅ | ILVReportDetail.vue | OK |
| **CU-ILV-11: ESTADÍSTICAS** | | | | |
| Por cliente/centro | ✅ | IlvStatsService | OK |
| Por proyecto | ✅ | /stats/by-project | OK |
| Por contratista | ⚠️ | Filtrable, sin endpoint | Añadir agregación |
| Por tipo reporte | ✅ | summary | OK |
| Abiertos vs Cerrados | ✅ | Contadores | OK |
| Filtros fechas | ✅ | Parámetros soportados | OK |
| Gráficos frontend | ⚠️ | Datos OK, sin charts | **Añadir ApexCharts** |
| Exportación Excel/PDF | ✅ | Endpoints implementados | OK |
| Frontend stats | ✅ | ILVStatsPage.vue | OK básico |
| **INFRAESTRUCTURA** | | | | |
| Sistema de tokens | ✅ | **Reutiliza JWT_SECRET** | ✅ Sin duplicación |
| Variables .env | ⚠️ | Usa JWT_SECRET fallback | Documentar |
| Base datos (7 tablas) | ✅ | Migración ejecutada | OK |
| Índices optimizados | ✅ | 12+ índices | OK |
| Permisos RBAC | ✅ | 5 roles configurados | OK |
| AWS S3 configuración | ✅ | Credenciales en .env | Listo para usar |

---

## 🔴 FUNCIONALIDADES CRÍTICAS FALTANTES

### 1. **Upload de Adjuntos a S3** ⚠️ ALTA PRIORIDAD
- **Estado:** Estructura BD completa, pero sin implementación real
- **Impacto:** Bloqueante para registro fotográfico de hallazgos
- **Componentes afectados:** ILV HID, SWA, Safety Cards
- **Archivos involucrados:**
  - Backend: `ilv-reports.service.ts` (método uploadAttachment)
  - Backend: `ilv-attachments.controller.ts` (nuevo)
  - Frontend: `ILVReportForm.vue` (componente upload)

### 2. **Página Pública de Cierre (Sin Login)** ⚠️ ALTA PRIORIDAD
- **Estado:** Backend funcional, frontend es placeholder
- **Impacto:** Bloqueante para cierre por contratistas vía email
- **Archivo:** `frontend/src/pages/ILVClosePublic.vue`
- **Requisitos:**
  - Validar token desde query param
  - Formulario sin autenticación
  - Subir evidencias cierre
  - Mensaje confirmación

### 3. **Job Automático SLA 5 Días** 🔶 MEDIA PRIORIDAD
- **Estado:** No implementado
- **Impacto:** Alertas automáticas no funcionan
- **Solución:** Implementar con NestJS @Cron

### 4. **Safety Cards vs FDKAR** 🔶 MEDIA PRIORIDAD
- **Estado:** Se implementó FDKAR en lugar de Safety Cards
- **Decisión requerida:**
  - Opción A: Renombrar FDKAR → Safety Cards
  - Opción B: Añadir Safety Cards como 5to tipo
  - Opción C: Documentar que FDKAR reemplaza Safety Cards

### 5. **Maestros Jerárquicos (Categoría → Subcategoría)** 🟡 BAJA PRIORIDAD
- **Estado:** Maestros flat, sin parent_id
- **Impacto:** HID requiere Categoría → Subcategoría
- **Solución:** Añadir campo parent_maestro_id

---

## 📝 LISTA DE TAREAS COMPLETA

### 🔴 **FASE 1: FUNCIONALIDADES CRÍTICAS (Semana 1)**

#### T1.1: Implementar Upload de Adjuntos S3
```markdown
- [ ] Backend: Crear IlvAttachmentsController
  - [ ] POST /api/ilv/reports/:id/attachments (upload)
  - [ ] DELETE /api/ilv/reports/:id/attachments/:aid
  - [ ] GET /api/ilv/reports/:id/attachments/:aid/download
- [ ] Backend: Servicio upload S3
  - [ ] Validar MIME type (JPG/PNG/PDF)
  - [ ] Validar tamaño ≤5MB
  - [ ] Validar máximo 5 archivos por reporte
  - [ ] Generar hash SHA256 para deduplicación
  - [ ] Subir a AWS_BUCKET_NAME configurado
- [ ] Backend: Integrar en IlvReportsService.create()
- [ ] Frontend: Componente FileUploader.vue
  - [ ] Drag & drop
  - [ ] Preview miniaturas
  - [ ] Progress bar
  - [ ] Validación cliente
- [ ] Frontend: Integrar en ILVReportForm.vue
- [ ] Frontend: Integrar en ILVReportDetail.vue (ver adjuntos)
- [ ] Testing: Subir JPG/PNG/PDF válidos
- [ ] Testing: Validar rechazo archivo >5MB
- [ ] Testing: Validar máximo 5 archivos
```

#### T1.2: Completar ILVClosePublic.vue (Sin Login)
```markdown
- [ ] Frontend: Diseñar layout público (sin MainLayout)
- [ ] Frontend: Validar token desde $route.query.token
- [ ] Frontend: Mostrar datos reporte (readonly)
- [ ] Frontend: Formulario cierre:
  - [ ] Campo plan_accion (textarea obligatorio)
  - [ ] Campo evidencia_cierre (texto o file si T1.1 listo)
  - [ ] Botón "Cerrar Reporte"
- [ ] Frontend: Manejo errores (token expirado, usado, inválido)
- [ ] Frontend: Página éxito/confirmación
- [ ] Backend: Verificar POST /api/ilv/close funciona
- [ ] Testing E2E: Flujo completo desde email
```

#### T1.3: Decidir Safety Cards vs FDKAR
```markdown
- [ ] Reunión stakeholders: ¿Mantener FDKAR o migrar a Safety Cards?
- [ ] Opción A: Renombrar FDKAR
  - [ ] Actualizar enum: fdkar → safety_cards
  - [ ] Actualizar maestros
  - [ ] Actualizar FieldMapper config
  - [ ] Migración BD: UPDATE ilv_report SET tipo='safety_cards' WHERE tipo='fdkar'
- [ ] Opción B: Añadir Safety Cards como 5to tipo
  - [ ] Crear config Safety Cards en FieldMapper
  - [ ] Añadir maestros tipo_tarjeta (verde/amarilla/roja)
  - [ ] Documentar diferencia FDKAR vs Safety Cards
- [ ] Opción C: Solo documentar
  - [ ] Actualizar README explicando FDKAR = Safety Cards del Excel
```

### 🔶 **FASE 2: CAMPOS Y MAESTROS (Semana 2)**

#### T2.1: Completar Campos Específicos HID
```markdown
- [ ] Añadir campos a FieldMapper HAZARD_ID:
  - [ ] nombre_quien_reporta (string, required)
  - [ ] empresa_reportante (inferir de user o select)
  - [ ] nombre_ehs_contratista (string, optional)
  - [ ] nombre_supervisor_obra (string, optional)
  - [ ] tipo_reporte_hid (maestro, required)
- [ ] Crear maestros nuevos:
  - [ ] tipo_hid: 'HID Inert Smith', 'HID Preventivo', etc.
  - [ ] tipo_hse: 'Seguridad', 'Salud', 'Medio Ambiente', 'Inocuidad', 'Daño Propiedad'
- [ ] Migrar maestros existentes 'area' → 'tipo_hse' si aplica
- [ ] Actualizar frontend ILVReportForm renderizado dinámico
```

#### T2.2: Implementar Maestros Jerárquicos
```markdown
- [ ] Backend: Añadir campo parent_maestro_id a ilv_maestro
  - [ ] Migración: ALTER TABLE ilv_maestro ADD COLUMN parent_maestro_id INT REFERENCES ilv_maestro(maestro_id)
- [ ] Backend: Actualizar IlvMaestrosService
  - [ ] getMaestrosTree(tipo) → retorna árbol
  - [ ] getSubcategorias(categoriaId)
- [ ] Backend: Seed categorías + subcategorías HID
  - [ ] Categoría: Trabajos en Alturas
    - Subcategoría: Caídas a distinto nivel
    - Subcategoría: Golpes por caída de objetos
  - [ ] Categoría: Trabajos en Caliente
    - Subcategoría: Incendio
    - Subcategoría: Explosión
  - [ ] (Completar del Excel original)
- [ ] Frontend: Select en cascada Categoría → Subcategoría
- [ ] Frontend: ILVMaestrosAdmin árbol editable
```

#### T2.3: Campos W&T y SWA Completos
```markdown
- [ ] W&T: Validar todos los campos del requerimiento original
- [ ] SWA: Añadir campos faltantes si hay
- [ ] Actualizar validators para nuevos campos
```

### 🟡 **FASE 3: NOTIFICACIONES Y SLA (Semana 3)**

#### T3.1: Job Automático SLA 5 Días
```markdown
- [ ] Backend: Instalar @nestjs/schedule si no está
- [ ] Backend: Crear IlvSchedulerService
  - [ ] @Cron('0 8 * * *') // Diario 8am
  - [ ] checkSlaVencido()
    - Query: reportes abiertos con creado_en < NOW() - 5 days
    - Enviar emails a contratista + creador + admin
    - Registrar en ilv_audit
- [ ] Backend: Integrar en IlvModule
- [ ] Opcional: Añadir campo sla_notificado_at para no duplicar emails
- [ ] Testing: Simular fecha pasada y ejecutar manualmente
```

#### T3.2: Enriquecer Plantillas Email
```markdown
- [ ] Diseñar HTML templates profesionales
- [ ] Email creación reporte:
  - [ ] Logo KAPA
  - [ ] Resumen visual del hallazgo
  - [ ] Tabla con todos los campos
  - [ ] Botón CTA destacado "Cargar Cierre"
  - [ ] Footer con datos contacto
- [ ] Email cierre confirmación:
  - [ ] Confirmar acciones realizadas
  - [ ] Link a detalle del reporte
- [ ] Email SLA vencido:
  - [ ] Alerta visual roja
  - [ ] Días transcurridos
  - [ ] Urgencia de cierre
```

### 🟢 **FASE 4: UX Y ESTADÍSTICAS (Semana 4)**

#### T4.1: Mejorar Frontend Formularios
```markdown
- [ ] ILVReportForm: Renderizado dinámico avanzado
  - [ ] Mostrar/ocultar campos según tipo seleccionado
  - [ ] Validación tiempo real con mensajes
  - [ ] Stepper multi-paso (Tipo → Datos → Evidencias → Preview)
- [ ] ILVReportForm: Modal previsualización
  - [ ] Ver todos los datos antes de guardar
  - [ ] Botón "Editar" / "Confirmar"
- [ ] ILVReportDetail: Timeline auditoría visual
- [ ] ILVReportsList: Acciones rápidas mejoradas
  - [ ] Iconos contextuales
  - [ ] Estado con chips coloreados
  - [ ] Filtros avanzados colapsables
```

#### T4.2: Gráficos Estadísticas
```markdown
- [ ] Instalar ApexCharts o Chart.js en frontend
- [ ] ILVStatsPage: Gráficos implementados
  - [ ] Gráfico torta: Reportes por tipo
  - [ ] Gráfico barras: Abiertos vs Cerrados por contratista
  - [ ] Gráfico línea: Tendencia temporal (últimos 30 días)
  - [ ] Tabla resumen con drill-down
- [ ] Dashboard: Widgets con métricas clave
  - [ ] Total reportes mes actual
  - [ ] SLA vencidos (badge rojo)
  - [ ] Tasa de cierre
```

#### T4.3: Ordenamiento Dinámico Bandeja
```markdown
- [ ] Backend: Añadir parámetro sort a FilterIlvReportDto
  - [ ] sort: 'fecha_asc' | 'fecha_desc' | 'estado' | 'cliente'
- [ ] Frontend: Hacer columnas ordenables (click header)
```

### 🔵 **FASE 5: TESTING Y DOCUMENTACIÓN (Semana 5)**

#### T5.1: Testing Backend
```markdown
- [ ] Unit tests: IlvReportsService
  - [ ] create() con campos válidos
  - [ ] create() con campos faltantes → error
  - [ ] update() por no-propietario → 403
  - [ ] close() con token usado → 401
- [ ] Unit tests: IlvValidators
  - [ ] validateRequiredFields()
  - [ ] validateBusinessRules() (hora_reinicio >= hora_inicio)
- [ ] Integration tests: Endpoints
  - [ ] POST /api/ilv/reports → 201
  - [ ] PUT /api/ilv/reports/:id (ownership)
  - [ ] POST /api/ilv/close (token válido)
- [ ] E2E tests: Flujo completo
  - [ ] Crear HID → Email enviado → Cerrar vía token → Verificar estado
```

#### T5.2: Testing Frontend (Cypress)
```markdown
- [ ] Login como Usuario KAPA
- [ ] Crear reporte HID completo
- [ ] Subir 3 archivos adjuntos
- [ ] Validar preview
- [ ] Guardar y verificar en lista
- [ ] Editar reporte (cambiar descripción)
- [ ] Verificar historial auditoría
- [ ] Simular cierre vía enlace público
- [ ] Verificar estadísticas actualizadas
```

#### T5.3: Documentación Final
```markdown
- [ ] README_ILV.md completo:
  - [ ] Arquitectura del módulo
  - [ ] Flujos de usuario
  - [ ] Endpoints API (con ejemplos curl)
  - [ ] Configuración variables entorno
  - [ ] Troubleshooting común
- [ ] Guía Usuario Final (PDF)
  - [ ] Cómo crear reportes
  - [ ] Cómo adjuntar evidencias
  - [ ] Cómo cerrar reportes
  - [ ] Screenshots
- [ ] Guía Administrador
  - [ ] Gestión maestros
  - [ ] Configuración SLA
  - [ ] Acceso estadísticas
- [ ] Actualizar MODULO_ILV_ESPECIFICACION.md con cambios finales
```

---

## 🎯 PRIORIZACIÓN RECOMENDADA

### Sprint 1 (Semana 1) - **CRÍTICO**
1. ✅ T1.1: Upload Adjuntos S3 (2-3 días)
2. ✅ T1.2: ILVClosePublic.vue completo (1-2 días)
3. ✅ T1.3: Decisión Safety Cards (0.5 días)

### Sprint 2 (Semana 2) - **IMPORTANTE**
4. T2.1: Campos específicos HID (2 días)
5. T2.2: Maestros jerárquicos (2 días)
6. T3.1: Job SLA automático (1 día)

### Sprint 3 (Semana 3) - **MEJORAS**
7. T3.2: Plantillas email (1 día)
8. T4.1: Mejorar UX formularios (2 días)
9. T4.2: Gráficos estadísticas (2 días)

### Sprint 4 (Semana 4) - **POLISH**
10. T4.3: Ordenamiento dinámico (0.5 días)
11. T5.1: Testing backend (2 días)
12. T5.2: Testing frontend (2 días)

### Sprint 5 (Semana 5) - **CIERRE**
13. T5.3: Documentación final (3 días)
14. Deploy a producción
15. Capacitación usuarios

---

## ⚙️ CONFIGURACIÓN ACTUAL vs. REQUERIDA

### Variables de Entorno (.env)

**✅ YA CONFIGURADAS:**
```bash
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES_IN=5000s
AWS_REGION=us-east-1
AWS_BUCKET_NAME=repositorio-documental-kapa
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
```

**📝 RECOMENDADAS (Opcionales):**
```bash
# ILV específicas (ya tienen fallback a JWT_SECRET)
ILV_TOKEN_TTL=259200  # 72 horas en segundos (ya hardcoded en service)
ILV_BASE_URL=https://kapa.healtheworld.com.co  # Para emails (ya usa URL_FRONT)

# SLA
ILV_SLA_DAYS=5  # Días para cierre (actualmente hardcoded)
ILV_SLA_CRON=0 8 * * *  # Cron expression para job

# Adjuntos
ILV_MAX_ATTACHMENTS=5
ILV_MAX_FILE_SIZE=5242880  # 5MB en bytes
ILV_ALLOWED_MIMES=image/jpeg,image/png,application/pdf
```

**✅ DECISIÓN: No añadir variables adicionales por ahora**
- El sistema ya reutiliza JWT_SECRET correctamente
- TTL y límites pueden quedarse hardcoded hasta que se requiera flexibilidad
- Simplifica configuración de producción

---

## 📊 MÉTRICAS DE COMPLETITUD

| Componente | Completitud | Comentario |
|------------|-------------|------------|
| **Backend API** | 95% | Solo falta upload S3 y job SLA |
| **Base de Datos** | 100% | Estructura completa |
| **Seguridad/Permisos** | 100% | RBAC funcional |
| **Frontend Core** | 70% | Páginas creadas, falta interactividad |
| **Frontend UX** | 50% | Funcional pero mejorable |
| **Notificaciones** | 80% | Emails básicos, falta SLA auto |
| **Adjuntos** | 20% | Solo estructura BD |
| **Estadísticas** | 85% | Backend completo, frontend básico |
| **Testing** | 10% | Solo validación manual |
| **Documentación** | 60% | Técnica OK, falta usuario final |

**PROMEDIO GENERAL: 73%** ✅

---

## 🚀 COMANDOS ÚTILES

```bash
# Verificar backend funcionando
pm2 status kapa-backend
pm2 logs kapa-backend --lines 50

# Verificar tablas ILV
psql -U admin -d kapa_db -c "\d ilv_*"

# Contar reportes
psql -U admin -d kapa_db -c "SELECT tipo, COUNT(*) FROM ilv_report GROUP BY tipo;"

# Ver maestros
psql -U admin -d kapa_db -c "SELECT tipo, COUNT(*) FROM ilv_maestro WHERE activo=TRUE GROUP BY tipo;"

# Testing manual endpoint
curl -X GET http://localhost:3001/api/ilv/maestros/severidad \
  -H "Authorization: Bearer YOUR_JWT"

# Ejecutar migración si hay cambios
psql -U admin -d kapa_db < backend/migrations/update_ilv_YYYYMMDD.sql
```

---

**Última actualización:** 13 de Noviembre, 2025  
**Próxima revisión:** Tras completar Sprint 1 (Fase Crítica)
