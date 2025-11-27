# Módulo Projects - Especificación Funcional

## Descripción General
- Gestiona el catálogo de proyectos activos e inactivos vinculados a los clientes de KAPA.
- Permite administrar datos operativos (dirección, supervisor, fechas) y la relación con contratistas.
- Brinda APIs de consulta para otros módulos (Clients, Contractors, Reports) que requieren información contextual de proyectos.

## Casos de Uso

1. **Registrar o actualizar proyecto**
   - Actores: Administrador, Usuario KAPA con permiso `project_management`.
   - Precondiciones: usuario autenticado; cliente existente; fechas válidas.
   - Flujo principal: desde `ProjectsPage` se abre el formulario, se diligencian campos obligatorios y se guarda vía `POST /projects` o `PUT /projects`; backend valida campos y persiste.
   - Flujos alternos: validaciones fallidas (fechas inconsistentes, falta de cliente, campos vacíos) retornan error; si el proyecto ya existe y no se encuentra => 404.

2. **Consultar listado de proyectos con contratistas**
   - Actores: Administrador, Usuario KAPA, Cliente (lectura).
   - Precondiciones: usuario con permisos de visualización.
   - Flujo principal: la UI invoca `GET /projects`; se listan proyectos junto con contratistas asociados y correos.
   - Flujos alternos: sin proyectos registrados → lista vacía; errores de servicio se muestran como alerta.

3. **Ver detalle de un proyecto**
   - Actores: Administrador, Usuario KAPA, Cliente.
   - Precondiciones: proyecto existente.
   - Flujo principal: `GET /projects/:id` devuelve información general; la UI la usa para mostrar datos y validar acceso a contratistas.
   - Flujos alternos: ID inexistente → 404 con mensaje "El proyecto no existe".

4. **Listar contratistas asociados a un proyecto (según rol)**
   - Actores: Administrador, Usuario KAPA, Cliente, Contratista, Subcontratista.
   - Precondiciones: token JWT válido, proyecto asociado al usuario.
   - Flujo principal: `GET /projects/:project_id/contractors` protegido por JWT; backend utiliza `role` y `email` para limitar resultados y retorna porcentajes de cumplimiento.
   - Flujos alternos: contratista sin acceso → 404; token inválido → 401.

5. **Obtener proyectos por cliente**
   - Actores: Clientes y Contratistas (vía módulo Clients).
   - Precondiciones: cliente existente, token válido cuando aplica.
   - Flujo principal: `ClientsService` invoca `ProjectsService.getProjectsByClient*`; resultados se muestran en `ClientProjectsPage`.
   - Flujos alternos: sin proyectos → mensaje "No existen proyectos".

## Reglas de Negocio
- Campos obligatorios: nombre, dirección, supervisor, fechas de inicio y fin, estado, cliente asociado.
- Estado permitido: `active` o `inactive`; clientes (rol 4) solo consumen proyectos activos.
- La fecha de inicio debe ser menor o igual a la fecha de fin.
- Al editar, no se permite omitir `project_id`.
- Los proyectos deben tener al menos un contratista en operación (validación sugerida; actualmente no impuesta).

## Interfaces
- Frontend: `ProjectsPage.vue`, `ProjectForm.vue`, `ProjectInfo.vue`, `ProjectContractorsPage.vue`.
- Servicios: `projectService.js`, `clientService.js` (para listado de clientes vinculados), `contractorService.js` (al consultar contratistas).
- API REST: `/projects`, `/projects/:id`, `/projects/:project_id/contractors`; métodos `ProjectsService.getProjectsByClient*` consumidos internamente.
- Integraciones: `AuthService` (claims JWT), `ContractorsService` (filtrado por rol), `DocumentService` y `ProjectContractorCriterionsService` indirectamente para porcentajes.

## Tareas Pendientes
- Implementar validación server-side para fechas (inicio <= fin) y garantizar consistencia en zonas horarias.
- Incorporar controles de acceso mediante `JwtAuthGuard` y verificación de permisos en POST/PUT/GET list.
- Agregar paginación, filtros por cliente/estado y búsqueda server-side.
- Registrar auditoría de cambios (usuario, fecha, campos modificados).
- Expandir pruebas funcionales y automatizadas que cubran los casos de uso anteriores.
