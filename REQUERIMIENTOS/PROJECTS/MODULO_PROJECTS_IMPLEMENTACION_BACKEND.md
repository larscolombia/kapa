# Módulo Projects - Implementación Backend

## Arquitectura
- Componentes ubicados en `backend/src/modules/projects/`: `ProjectsModule`, `ProjectsService`, `ProjectsController`.
- `ProjectsModule` importa `TypeOrmModule.forFeature([Project])`, `AuthModule` (para tokens JWT) y `ContractorsModule` (para reutilizar `ContractorsService`).
- Entidad `Project` (`database/entities/project.entity.ts`) define relación `ManyToOne` con `Client` (eager) y `OneToMany` con `ProjectContractor`.
- El servicio usa `Repository<Project>` inyectado por TypeORM y compone DTOs manualmente para listar contratistas.

## Endpoints / Servicios
- `GET /projects` → `getProjects()` carga proyectos con contratistas y correos (relaciones eager) y devuelve una vista simplificada.
- `GET /projects/:id` → `getProject()` retorna detalle básico o lanza `NotFoundException` si no existe.
- `POST /projects` → `create()` valida campos obligatorios y estado antes de persistir un nuevo proyecto.
- `PUT /projects` → `update()` valida existencia, campos y estado; mezcla datos y guarda.
- `GET /projects/:project_id/contractors` → protegido por JWT; invoca `getProjectContractors()` para filtrar según rol/correo.
- Métodos adicionales (`getProjectsByClient`, `getProjectsByClientAndContractorEmail`) son consumidos por otros módulos (ClientsService) para escenarios específicos.

## Flujos Clave
- **Validación de proyecto**: `validateProjectRequiredFields()` asegura presencia de campos, `validateStateEnum()` restringe estado a `active/inactive`.
- **Listado con contratistas**: `getProjects()` transforma la relación `projectContractors` en un arreglo de contratistas “flattened”, eliminando referencias circulares.
- **Contratistas por proyecto**: se determina rol y correo desde el token; contratistas/ subcontratistas usan `ContractorsService.getContractorsByProjectIdAndEmail`, otros roles usan `getContractorsByProjectId` (clientes sólo ven activos).
- **Consulta por cliente**: `getProjectsByClient*` aplica filtros por rol para reutilizar la misma lógica desde el módulo Clients.

## Seguridad y Permisos
- Sólo el endpoint `/projects/:project_id/contractors` aplica `@UseGuards(JwtAuthGuard)`; se recomienda proteger el resto con guardas y validar permisos de `project_management`.
- Filtrado por rol/control de visibilidad se realiza en capa de servicio basándose en claims `role` y `email` del JWT.
- No hay controles de concurrencia ni bloqueo optimista; actualizaciones dependen de transacciones TypeORM estándar.

## Integraciones
- `AuthService.getPayloadFromToken()` extrae claims para aplicar reglas de visibilidad.
- `ContractorsService` proporciona los listados filtrados y cálculos de porcentaje de cumplimiento.
- `ClientsService` utiliza `ProjectsService` para obtener proyectos por cliente; frontend se apoya en `projectService.js`, `ProjectForm.vue`, `ProjectContractorsPage.vue`.
- Validaciones de nombre editable dependen de `DocumentService` (consultado desde frontend para bloquear cambios si existen documentos).

## Pruebas
- `projects.service.spec.ts` sólo verifica la instanciación del servicio; carece de casos reales.
- Se requieren pruebas unitarias para `validateProjectRequiredFields`, `getProjectContractors` (roles), y `getProjectsByClient*`.
- Pruebas e2e deberían cubrir los endpoints REST (crear, actualizar, listar, contratistas por proyecto) y escenarios de error.
