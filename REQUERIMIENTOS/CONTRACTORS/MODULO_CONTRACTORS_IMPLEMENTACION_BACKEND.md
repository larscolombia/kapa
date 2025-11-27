# Módulo Contractors - Implementación Backend

## Arquitectura
- Ubicado en `backend/src/modules/contractors/` con clases `ContractorsModule`, `ContractorsService`, `ContractorsController` y DTO `ContractorDto`.
- `ContractorsModule` importa `TypeOrmModule` para entidades `Contractor`, `ContractorEmail`, `Project`, `ProjectContractor`, además de `ProjectContractorsModule`, `ProjectContractorCriterionsModule` y `DocumentsModule` para reutilizar lógica.
- Entidades `Contractor` y `ContractorEmail` cargan relaciones `projectContractors` y `emails` con `eager: true`, permitiendo mapear DTOs sin consultas adicionales.
- Constante `MAX_SUBCONTRACTORS = 5` establece límite operativo controlado dentro del servicio.

## Endpoints / Servicios
- `GET /contractors` → retorna arreglo de `ContractorDto` (solo contratistas padre) usando `getContractorsResponseDto()`.
- `GET /contractors/:id` → devuelve detalle específico con correos y proyectos en `getContractorResponseDto()`.
- `POST /contractors` → crea contratista con correos y relaciones a proyectos; aplica validaciones de campos, estado y correo.
- `PUT /contractors` → actualiza contratista, sincroniza correos (reemplazo total) y relaciones proyecto-contratista (mantiene, agrega, elimina con verificación de dependencias).
- `GET /contractors/:id/projects` → obtiene proyectos asociados mediante `getProjectsByContractor()`.
- `GET /contractors/:id/subContractors` → lista subcontratistas dependientes del contratista padre.
- `POST /contractors/send-results` → compila métricas de cumplimiento y envía correo HTML con `MailUtil`.
- Métodos auxiliares: `getContractorsByProjectId`, `getContractorsByProjectIdAndEmail`, `getContractorsByEmail`, `validate*` y generación de HTML para reportes.

## Flujos Clave
- **Creación/Actualización**: separa datos del contratista, correos y proyectos; valida campos obligatorios, estado y formato de correo; crea entidades y persiste en cascada.
- **Sincronización de proyectos**: calcula diferencias entre proyectos actuales y nuevos; verifica dependencias de criterios antes de eliminar relaciones.
- **Filtrado por rol/correo**: métodos `getContractorsByProjectId*` aplican criterios según `roleId` (clientes ven solo activos; subcontratistas ven registros con `parent_contractor`).
- **Envío de resultados**: obtiene criterios y porcentajes desde `ProjectContractorCriterionsService` y `DocumentService`, arma HTML responsivo y envía correo al responsable y copias a correos registrados.

## Seguridad y Permisos
- El controlador no declara guardas explícitas; se asume protección global por `JwtAuthGuard` configurable. Recomendado agregar `@UseGuards(JwtAuthGuard)` y validar permisos antes de exponer métodos sensibles (POST/PUT/Send results).
- Validaciones de backend garantizan que solo correos y estados permitidos se almacenen; se evita cambiar nombre cuando hay documentos asociados mediante lógica en frontend.

## Integraciones
- `ProjectContractorsService` verifica dependencias y obtiene `projectContractor` para cálculos.
- `ProjectContractorCriterionsService` y `DocumentService` suministran porcentajes de cumplimiento.
- `MailUtil` utiliza `nodemailer` y variables `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`.
- Servicios externos invocan `ContractorsService.getContractorsByProjectId*` (ej. `ProjectsService`).

## Pruebas
- `contractors.service.spec.ts` solo valida instanciación; no existen pruebas de lógica.
- Se recomienda añadir tests unitarios para validaciones (`validateEmails`, `validateMaxSubcontractors`), sincronización de proyectos y generación de DTOs.
- Pruebas de integración/e2e deben cubrir creación con correos, límites de subcontratistas, envío de resultados y flujos con errores (correo inválido, dependencias activas).
