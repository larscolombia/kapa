# Módulo Reports - Implementación Backend

## Arquitectura
- Ubicación: `backend/src/modules/reports/` con `ReportsModule`, `ReportsController` y `ReportsService`.
- `ReportsModule` registra `DocumentStateAudit` y `Document` vía `TypeOrmModule.forFeature`, permitiendo consultas con relaciones anidadas.
- `ReportsService` encapsula la lógica de aggregación: reutiliza `getAuditReport` como base para métricas, SLA y exportes.
- Dependencias externas: librería `exceljs` (`ExcelJS.Workbook`) para construir el archivo `xlsx` en memoria.

## Endpoints / Servicios
- `GET /reports/audit` → Invoca `ReportsService.getAuditReport()`, retorna la lista cruda de auditorías con joins a documento, subcriterio, criterio, proyecto, contratista, cliente y usuario.
- `GET /reports/metrics` → Usa `getResponseTimeMetrics()` para sumar tiempos por documento y contar rechazos/resubmissions.
- `GET /reports/sla` → Llama `getSLAMetrics()` que a su vez se apoya en `getResponseTimeMetrics()` para calcular cumplimiento vs. brechas.
- `GET /reports/export/excel` → Ejecuta `generateExcelReport()`, arma tres hojas (Resumen, Detalle, Timeline) y envía el buffer como respuesta binaria.

## Flujos Clave
- **Construcción de consulta base**: `getAuditReport()` arma un `QueryBuilder` con múltiples `LEFT JOIN` y filtros condicionales (`clientId`, `contractorId`, `projectId`, rango de fechas, estado) y ordena por `changed_at DESC`.
- **Cálculo de métricas por documento**: `getResponseTimeMetrics()` itera sobre las auditorías agrupándolas en un `Map` por `document_id`, acumulando `time_in_previous_state_hours`, resubmissions y marcando primera/última revisión.
- **Reporte Excel**: `generateExcelReport()` obtiene métricas agregadas, construye la hoja “Resumen General” (totales y promedios), la hoja “Detalle por Documento” (cliente, proyecto, contratista, tiempos) y la hoja “Timeline Completo” con cada evento traducido a español usando `translateState()`.
- **Cálculo SLA**: `getSLAMetrics()` fija `SLA_HOURS = 24` y clasifica documentos según el total de horas en estado `submitted`, retornando porcentaje de cumplimiento y lista de documentos fuera de SLA.

## Seguridad y Permisos
- Actualmente los endpoints no están protegidos por `JwtAuthGuard`; cualquier cliente autenticado en el gateway puede consumirlos si conoce la ruta.
- No existe verificación del permiso `reports_management` en el backend; la restricción vive solo en el frontend.
- Los filtros no validan pertenencia del usuario al cliente/proyecto solicitado, por lo que un usuario con acceso puede consultar información cruzada.

## Integraciones
- Datos fuente provienen de `DocumentStateAudit` (auditoría de cambios) y `Document` (estado actual, relaciones con proyecto, contratista, criterio, empleado).
- Se exige que otros módulos actualicen `time_in_previous_state_hours` para que las métricas sean precisas.
- Exportes Excel se consumen directamente desde el frontend (Quasar) usando `api.get('/reports/export/excel')` con manejo manual de blobs.
- Catálogos (clientes, proyectos, contratistas) se cargan desde otros módulos para alimentar filtros en la interfaz.

## Pruebas
- No se encontraron pruebas unitarias ni e2e específicas para este módulo.
- Pruebas recomendadas: validar filtrado de `getAuditReport`, agregaciones de `getResponseTimeMetrics` (casos con/ sin rechazos), clasificación de SLA y correcta generación del Excel (estructura de hojas, encabezados, totales).
- Considerar pruebas de carga puntuales sobre `/reports/export/excel` para asegurar tiempos aceptables con grandes volúmenes de auditorías.

