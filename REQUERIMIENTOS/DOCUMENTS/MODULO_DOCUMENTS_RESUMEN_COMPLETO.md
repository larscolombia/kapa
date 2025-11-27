# Módulo Documents - Resumen Ejecutivo

> El módulo Documents gobierna el repositorio documental de proyectos y contratistas, asegurando trazabilidad de cambios, cálculo de avance y notificaciones oportunas para mantener la operación de cumplimiento.

## Objetivo
- Centralizar el almacenamiento y versionamiento de documentos asociados a subcriterios de auditoría.
- Controlar el estado del documento (submitted, approved, rejected, not_applicable, for_adjustment) y reflejarlo en métricas de cumplimiento.
- Facilitar la interacción con contratistas y equipos internos mediante notificaciones y URLs seguras para consulta.

## Alcance
- Cargue, actualización y eliminación de documentos en S3 con registro de auditoría en `document_state_audit`.
- Generación de URLs firmadas para descarga o vista previa sin exponer el bucket.
- Cálculo de porcentajes de aprobación/completitud por subcriterio, criterio y project-contractor.
- Envío de correos de notificación cuando hay nuevos cargues disponibles para revisión.
- Fuera de alcance: gestión avanzada de versiones, antivirus/antimalware, firmas electrónicas o workflows de aprobación configurables.

## KPIs y Métricas
- Porcentaje de completitud por project-contractor (reflejado en dashboards ILV).
- Tiempo promedio que un documento permanece en cada estado (aporta a Reportes SLA).
- Ratio de rechazos vs. aprobaciones por subcriterio/criterio.
- Número de documentos próximos a vencer (consulta `getDocumentsCloseToEndDate`).
- Tasa de entrega de correos de notificación enviados a contratistas.

## Dependencias
- Módulos Project Contractors y Project Contractor Criterions para actualizar porcentajes y relaciones.
- Catálogo de Subcriterios/Criterios para validar requisitos (`multiple_required`, `employee_required`).
- Servicio de correo `MailUtil` y configuración `MAIL_*` para notificar cargues.
- Integración con Amazon S3 (variables `AWS_*`) tanto en backend (presigned URLs) como en frontend (`S3Manager`).
- Módulo Reports consume la auditoría generada para métricas SLA.

## Consideraciones Técnicas
- El cálculo de `time_in_previous_state_hours` depende de auditorías consecutivas; retrasos en registrar eventos producen métricas inconsistentes.
- Endpoints expuestos carecen de guardas JWT en varios casos (`@Public` sólo en presigned URL); se requiere reforzar seguridad.
- Operaciones intensivas (download masivo, cálculo de porcentajes) usan consultas sin paginación; se debe monitorear performance.
- Manejo de archivos en frontend depende de credenciales AWS en cliente; cualquier fallo de configuración invalida el flujo de subida.
- Falta manejo transaccional entre escritura en S3 y persistencia en DB; un fallo parcial puede dejar referencias inconsistentes.

