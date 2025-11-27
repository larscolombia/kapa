# Módulo Auth - Especificación Funcional

## Descripción General
- Gestiona la autenticación de usuarios internos y contratistas que acceden a KAPA.
- Orquesta la emisión de tokens JWT y expone información de perfil y permisos según el rol asignado.
- Asegura la experiencia de login en la SPA de Quasar/Vue, incluyendo manejo de errores y cuentas inactivas.

## Casos de Uso

1. **Autenticar usuario (Login)**
   - Actores: Administrador, Usuario KAPA, Cliente, Contratista, Subcontratista.
   - Precondiciones: Usuario registrado en la tabla `user`, cuenta en estado `active`, contraseña almacenada con hash bcrypt.
   - Flujo principal: el frontend envía `POST /auth/login` con email y contraseña; el servicio valida credenciales y devuelve `accessToken` JWT; la SPA almacena el token y redirige al home.
   - Flujos alternos: credenciales inválidas → `400 Credenciales inválidas`; cuenta inactiva → `400 Cuenta inactiva`; fallo de reCAPTCHA (cuando se habilite) → error específico.

2. **Consultar perfil del usuario autenticado**
   - Actores: Cualquier usuario logueado.
   - Precondiciones: token JWT válido en encabezado `Authorization`.
   - Flujo principal: la SPA invoca `GET /auth/profile`; `JwtAuthGuard` valida el token; el servicio retorna datos básicos (nombre, correo, rol, sin contraseña).
   - Flujos alternos: token vencido o inválido → `401 Unauthorized`; usuario inexistente → `404`.

3. **Obtener permisos asociados al rol**
   - Actores: Cualquier usuario logueado.
   - Precondiciones: token válido, rol con permisos definidos en `access`.
   - Flujo principal: se solicita `GET /auth/permissions`; el servicio usa el rol del JWT para compilar la lista de permisos (flags `can_view`, `can_edit` por módulo) y la devuelve al frontend.
   - Flujos alternos: rol sin permisos asociados → responde arreglo vacío; token inválido → `401`.

4. **Validar sesión en el boot al recargar la SPA**
   - Actores: SPA de KAPA.
   - Precondiciones: token JWT persistido en `LocalStorage`.
   - Flujo principal: el store `auth` ejecuta `validateUser`, llama `/auth/profile` y `/auth/permissions`; si ambas respuestas son correctas, marca al usuario como autenticado.
   - Flujos alternos: token expirado o eliminado → se limpia la sesión y se redirige a `/login`.

## Reglas de Negocio
- Solo usuarios en estado `active` pueden autenticarse; los inactivos reciben mensaje específico.
- El token JWT debe incluir los claims `email`, `userId`, `role` y `state` para habilitar verificaciones descendentes.
- Los permisos se derivan exclusivamente de la relación `role.access` configurada en base de datos.
- Se requiere validar reCAPTCHA antes de emitir el token en entornos productivos (actualmente comentado en frontend).
- Intentos fallidos no bloquean la cuenta automáticamente; la revocación se gestiona manualmente cambiando el estado a `inactive`.

## Interfaces
- Frontend: `LoginPage.vue`, `useAuth.js`, `authService.js`, `auth` store y router guard que verifica permisos por módulo.
- Backend REST: `/auth/login`, `/auth/profile`, `/auth/permissions`; `AuthController` es el punto de entrada.
- Guardas/estrategias: `JwtAuthGuard`, `LocalStrategy`, `JwtStrategy` dentro del módulo Auth.
- Dependencias externas: servicio de correo para forgot password (mantenido en Users), reCAPTCHA v3 cuando esté activo.

## Tareas Pendientes
- Implementar endpoints de refresh token o revocación para sesiones prolongadas.
- Completar la re-integración de reCAPTCHA y documentar su configuración en ambientes dev/qa/prod.
- Añadir mensajes de error estandarizados y códigos para los diferentes motivos de bloqueo (inactivo, credenciales, expirado).
- Definir políticas de expiración y rotación de tokens, incluyendo soporte multi-dispositivo.
- Ampliar la suite de pruebas unitarias y e2e abarcando login, expiración y permisos.
