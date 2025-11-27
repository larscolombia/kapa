# Módulo Documents - Implementación Backend

## Arquitectura
- Componentes en `backend/src/modules/documents/`: `DocumentsModule`, `DocumentController`, `DocumentService` y spec de pruebas vacía.
- `DocumentsModule` expone el servicio e importa entidades `Document`, `Subcriterion`, `DocumentStateAudit`, `Employee`, además de módulos `ProjectContractorCriterionsModule` y `ProjectContractorsModule` para actualizar métricas cruzadas.
- `DocumentService` concentra lógica de negocio: repositorios TypeORM, cliente AWS S3 (`@aws-sdk/client-s3`), auditoría de estado y correo.
- Decorador `@Public()` habilita el endpoint de presigned URL sin JWT para permitir descargas controladas.

## Endpoints / Servicios
- `GET /document/presigned-url/:fileKey` (public) — genera URL firmada S3 con `disposition` configurable (`inline`/`attachment`).
- `GET /document` — devuelve listado completo de documentos con relaciones básicas.
- `GET /document/:id` — obtiene documento específico; lanza `BadRequestException` si hay error.
- `GET /document/subcriterion/:subcriterionId/project-contractor/:projectContractorId` — lista por subcriterio + project-contractor con select optimizado.
- `GET /document/employee/:employeeId` y `GET /document/employee/:employeeId/subcriterion/:subcriterionId` — filtros por empleado.
- `GET /document/by-project-contractor/:id?state=` — lista según estado solicitado.
- `GET /document/by-project/:projectId` y `/by-contractor/:contractorId` — accesos rápidos para formularios.
- `POST /document` — crea documento, valida campos y registra auditoría inicial.
- `PUT /document` — actualiza documento, recalcula métricas y añade auditoría si el estado cambia.
- `DELETE /document/:id` — elimina documento (sin eliminación física en S3).
- `POST /document/send-notification` — envía correo HTML con resumen de documentos `submitted`.
- `POST /document/getDocumentsCloseToEndDate` — retorna documentos a vencer en 7 días.
- `PUT /document/project-contractor/:id/uploaded-percentage` y `PUT /document/project-contractors/:id/uploaded-all-percentages` — recalculan completitud individual o en lote.

## Flujos Clave
- **Generación de presigned URL**: construye `GetObjectCommand` con `ResponseContentDisposition`, expira en 1 hora, captura errores como `BadRequestException`.
- **Creación de documento**:
	1. `validateDocumentRequiredFields()` verifica nombre y estado.
	2. Persiste entidad y crea auditoría con `previous_state = 'none'`.
	3. Obtiene `criterionId` del subcriterio y actualiza porcentajes en `ProjectContractorCriterionsService` y `ProjectContractorsService`.
- **Actualización de documento**:
	1. Busca documento; si no existe lanza `NotFoundException`.
	2. Calcula horas en estado previo comparando con último registro de auditoría (`getLastStateChangeTime`).
	3. Guarda cambios y, si varía el estado, registra auditoría con comentario.
	4. Recalcula porcentaje de aprobación del criterio asociado.
- **Cálculo de porcentajes**: usa consultas `QueryBuilder` para contar subcriterios aplicables y documentos en estados clave (`approved`, `submitted`, `rejected`, `not_applicable`), ajustando por documentos requeridos por empleado.
- **Notificación por correo**: arma HTML con tabla de criterios/subcriterios, porcentaje de completitud y datos de proyecto/contratista, llama `MailUtil.sendMail`.
- **Documentos por vencer**: consulta `endDate BETWEEN now AND now+7` incluyendo relaciones para plan de acción.

## Seguridad y Permisos
- Sólo `/document/presigned-url` está marcado `@Public`; el resto depende del guard global JWT configurado en la app (aunque varios métodos no aplican `UseGuards` explícito).
- No se verifica el permiso funcional (p.ej. `documents_management`); cualquier usuario autenticado podría invocar endpoints si conoce la ruta.
- No hay validación de ownership: un usuario puede solicitar documentos de otro proyecto/contratista.
- Falta control de tamaño/tipo de archivo en backend (riesgo de DoS o almacenamiento indebido).

## Integraciones
- AWS S3: usa `S3Client` con `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` para generar presigned URLs; la carga/borrado de archivos se realiza desde frontend mediante `VITE_AWS_*`.
- Project Contractor Criterions & Project Contractors: servicios inyectados actualizan porcentaje de aprobación/completitud.
- Subcriterion/Employee: necesarios para determinar cardinalidad y relaciones.
- MailUtil: utiliza configuración SMTP (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, etc.) para enviar resúmenes.
- Reports Module: consume `document_state_audit` para métricas SLA; depende de que `createAuditLog` se ejecute consistentemente.

## Pruebas
- `documents.service.spec.ts` solo crea el servicio; no valida lógica.
- Se requieren unit tests para:
	- `validateDocumentRequiredFields`, `create`, `update` (cálculo de horas y auditoría).
	- `calculateApprovalPercentageByCriterion` y `calculateCompletionPercentageWithDetails` con escenarios de `employee_required` y `not_applicable`.
	- `getPresignedUrl` (manejo de disposition y errores de AWS).
	- `sendNotification` (cuando hay documentos vs. cuando no hay).
- Pruebas e2e recomendadas para endpoints CRUD, generación de auditorías y actualización de porcentajes.
- Test de integración con S3 utilizando mocks/fakes para evitar dependencias externas en CI.

