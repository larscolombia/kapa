# Módulo Contractors - Resumen Ejecutivo

> El módulo Contractors centraliza la gestión de contratistas y subcontratistas vinculados a los proyectos KAPA, asegurando trazabilidad de contactos, cumplimiento documental y comunicación oportuna del avance.

## Objetivo
- Registrar y mantener la información maestra de contratistas y sus subcontratistas asociados.
- Vincular contratistas con proyectos para calcular porcentajes de cumplimiento y habilitar monitoreo operativo.
- Automatizar el envío de reportes de avance a los interesados mediante correo electrónico.

## Alcance
- CRUD de contratistas y subcontratistas con validación de correos y estado.
- Relación dinámica entre contratistas y proyectos, incluyendo límites de subcontratación.
- Exposición de endpoints para listar contratistas, recuperar detalle, enviar resultados y obtener proyectos asociados.
- Fuera de alcance: gestión financiera, contratos legales y carga masiva de contratistas (se realiza manualmente o vía seeds).

## KPIs y Métricas
- Tiempo promedio de respuesta de `/contractors` y `/contractors/:id`.
- Cantidad de subcontratistas activos por contratista y alertas cuando se alcanza el límite de cinco.
- Tasa de éxito en el envío de reportes (`/contractors/send-results`) y rebotes de correo.
- Porcentaje de contratistas con documentación completa según métricas del módulo Documents.

## Dependencias
- Servicios `ProjectContractorsService`, `ProjectContractorCriterionsService` y `DocumentService` para calcular avances y validar dependencias.
- Utilidad `MailUtil` y variables `MAIL_*` para la notificación por email.
- Integración con los módulos Projects y Reports para consumir la relación proyecto-contratista.
- Store y servicios frontend (`contractorService`, `projectService`) que renderizan la información.

## Consideraciones Técnicas
- NestJS y TypeORM gestionan transacciones; correos y proyectos se manipulan en cascada sobre entidades relacionadas.
- Validaciones estrictas garantizan formato y unicidad de correos; se requiere al menos un email por contratista.
- Restricción operativa de máximo cinco subcontratistas activos por contratista padre, controlada en backend.
- Endpoints actualmente no usan guardas; se sugiere incorporar `JwtAuthGuard` para evitar acceso anónimo.
- Pruebas automatizadas inexistentes más allá del stub; cambios deben acompañarse de cobertura adicional.
