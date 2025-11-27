# Módulo Reports - Resumen Ejecutivo

> El módulo Reports concentra la analítica operativa de auditoría documental, entregando métricas de tiempo de respuesta, cumplimiento de SLA y exportes masivos para seguimiento ejecutivo.

## Objetivo
- Consolidar la trazabilidad de cambios de estado de documentos en vistas accionables para los equipos de calidad y cumplimiento.
- Exponer indicadores de desempeño (tiempos, rechazos, cumplimiento SLA) con filtros por cliente, proyecto y contratista.
- Facilitar la descarga de reportes en Excel que sirvan como evidencia y soporte para auditorías externas.

## Alcance
- Consulta de métricas agregadas de auditoría y tiempos de revisión por documento.
- Visualización del historial cronológico (timeline) de cada documento con responsable, comentarios y duración en cada estado.
- Exportación a Excel de resumen, detalle y timeline completo utilizando los filtros aplicados en la interfaz.
- Fuera de alcance: generación de reportes PDF, automatización de envíos programados, dashboards en tiempo real o alertas proactivas.

## KPIs y Métricas
- Porcentaje de documentos dentro del SLA de revisión (objetivo actual: 24 horas).
- Tiempo promedio de respuesta desde la primera carga hasta la aprobación o rechazo final.
- Número de rechazos por documento y ratio de documentos con re-trabajo sobre el total analizado.
- Latencia promedio de los endpoints `/reports/metrics`, `/reports/sla` y `/reports/export/excel` bajo filtros típicos.

## Dependencias
- Módulo Documents: genera los registros en `document_state_audit` y mantiene el estado vigente de cada documento.
- Catálogos de Clients, Projects y Contractors para poblar filtros en la UI.
- Autenticación JWT del módulo Auth para acceder al menú “Reportes de Auditoría” (permiso `reports_management`).
- Librería `ExcelJS` en backend para la construcción de archivos `.xlsx`.

## Consideraciones Técnicas
- Las métricas dependen del campo `time_in_previous_state_hours`; si no se calcula en cada transición los indicadores se degradan.
- Endpoints actuales no aplican `JwtAuthGuard` ni validación de permisos; la protección ocurre solo en el frontend.
- Consultas intensivas: `getAuditReport` ejecuta múltiples `LEFT JOIN` y ordena por `changed_at`; se debe monitorear performance con grandes volúmenes.
- Sin caching ni paginación en la API; la tabla timeline puede crecer rápidamente al exportar.

