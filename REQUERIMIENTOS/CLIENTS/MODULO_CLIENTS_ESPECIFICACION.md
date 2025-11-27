# Módulo Clients - Especificación Funcional

## Descripción General
- Gestiona la consulta de clientes corporativos y permite navegar hacia sus proyectos asociados.
- Forma parte del flujo principal del home y sirve como catálogo base para otros módulos (proyectos, contratistas, reportes).
- Opera en modo lectura; las altas o ediciones de clientes se proyectan como evolutivos futuros.

## Casos de Uso

1. **Listar clientes disponibles**
   - Actores: Administrador, Usuario KAPA, Cliente, Contratista, Subcontratista.
   - Precondiciones: el usuario debe haber iniciado sesión; la base de datos contiene al menos un cliente.
   - Flujo principal: el frontend invoca `GET /clients`, presenta la lista y permite seleccionar un cliente.
   - Flujos alternos: si no hay clientes, se muestra mensaje de ausencia; si la API falla, se exhibe notificación de error.

2. **Consultar detalle de un cliente**
   - Actores: Administrador, Usuario KAPA, Cliente.
   - Precondiciones: existir un `client_id` válido.
   - Flujo principal: el frontend solicita `GET /clients/:client_id`, muestra la información básica y habilita acciones posteriores (ir a proyectos o formularios relacionados).
   - Flujos alternos: si el ID no existe, backend responde 404 y la UI muestra alerta.

3. **Visualizar proyectos asignados a un cliente**
   - Actores: Administrador, Usuario KAPA, Cliente, Contratista, Subcontratista.
   - Precondiciones: usuario autenticado con JWT vigente y permisos sobre el cliente.
   - Flujo principal: la UI llama `GET /clients/:client_id/projects`; backend aplica reglas por rol y devuelve los proyectos autorizados; la página `ClientProjectsPage` los lista mediante tarjetas.
   - Flujos alternos: si no existen proyectos visibles, se retorna 404 con mensaje contextual; si el token es inválido se responde 401.

## Reglas de Negocio
- Solo roles autenticados pueden acceder a `/clients/:client_id/projects`; los listados generales son públicos dentro del sistema.
- Roles 3 (Contratista) y 5 (Subcontratista) solo ven proyectos activos donde su correo esté asociado como contratista.
- Rol 4 (Cliente) observa únicamente proyectos en estado `active`; administradores y usuarios KAPA ven todos los estados.
- Los identificadores de cliente deben ser enteros positivos presentes en la base de datos.

## Interfaces
- Frontend: `ClientProjectsPage.vue` para la lista de proyectos, `IndexPage.vue` como acceso rápido.
- Servicios de datos: `clientService.js` encapsula las llamadas HTTP al backend.
- API REST: `/clients`, `/clients/:client_id`, `/clients/:client_id/projects`.
- Integraciones: `ProjectsService` y `ContractorsService` aportan datos complementarios según rol.

## Tareas Pendientes
- Documentar un flujo para alta/edición de clientes y definir permisos asociados.
- Reemplazar los IDs codificados en el home por datos provenientes del endpoint `/clients`.
- Añadir mensajes de error estandarizados y códigos específicos para escenarios de autorización.
- Diseñar pruebas funcionales que recorran los casos de uso descritos.
