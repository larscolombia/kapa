# Módulo Clients - Implementación Backend

## Arquitectura
- Implementado en NestJS dentro de `backend/src/modules/clients/` con las clases `ClientsController`, `ClientsService` y `ClientsModule`.
- `ClientsModule` importa `TypeOrmModule.forFeature([Client])`, además de `AuthModule`, `ProjectsModule` y `ContractorsModule` para reutilizar servicios existentes.
- La entidad `Client` definida en `backend/src/database/entities/client.entity.ts` mantiene una relación `OneToMany` con `Project` (ver `project.entity.ts`).
- TypeORM gestiona el repositorio `Repository<Client>` inyectado en `ClientsService`.

## Endpoints / Servicios
- `GET /clients` → `ClientsController.getClients()` llama a `clientsService.getClients()`, retorna todos los registros de la tabla `client`.
- `GET /clients/:client_id` → `ClientsController.getClient()` obtiene un cliente puntual mediante `findOneBy` y responde 404 si no existe.
- `GET /clients/:client_id/projects` → protegido con `JwtAuthGuard`; extrae `role` y `email` del JWT para delegar en `clientsService.getClientProjects()`.
- Errores en servicios se transforman en `BadRequestException` cuando no son `HttpException` conocidos.

## Flujos Clave
- Consulta general: el controlador recupera todos los clientes sin filtros ni paginación y devuelve el arreglo tal cual lo entrega TypeORM.
- Consulta específica: se valida la existencia del cliente antes de responder; no se exponen campos derivados.
- Proyectos por cliente: según el rol, se invoca `ProjectsService.getProjectsByClientAndContractorEmail()` (roles 3 y 5) o `ProjectsService.getProjectsByClient()` (resto). El resultado es un listado de proyectos con la estructura definida por el servicio de proyectos.

## Seguridad y Permisos
- Solo el endpoint `/clients/:client_id/projects` exige autenticación vía `JwtAuthGuard`.
- Roles 3 (Contratista) y 5 (Subcontratista) se filtran por correo asociado a contratistas activos, garantizando visibilidad acotada.
- Rol 4 (Cliente) recibe únicamente proyectos en estado `active`; los roles 1 y 2 obtienen todos los estados.
- Falta control de acceso en los endpoints públicos; se recomienda evaluar protección adicional si la topología de despliegue lo requiere.

## Integraciones
- `AuthService` (`auth.module`) para decodificar el JWT y obtener `role` y `email`.
- `ProjectsService` (`projects.module`) para construir los listados de proyectos según el rol.
- `ContractorsService` (`contractors.module`) utilizado indirectamente por `ProjectsService` cuando se limita por correo.
- Frontend consume las rutas a través de `clientService.js`, especialmente en `ClientProjectsPage.vue` y `IndexPage.vue`.

## Pruebas
- Existe `clients.service.spec.ts` con una prueba mínima de inicialización; no se cubren escenarios reales.
- Se recomienda añadir pruebas unitarias que validen los flujos de `getClientProjects` con distintos roles y correos.
- Incluir pruebas e2e que aseguren la protección de `/clients/:client_id/projects` y el manejo de respuestas 404.
