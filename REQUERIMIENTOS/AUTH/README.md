# Módulo Auth

Este directorio reúne la documentación funcional y técnica del módulo de autenticación (Auth) del sistema KAPA. El módulo gestiona el inicio de sesión, validación de sesiones JWT, carga de perfil y permisos por rol.

## Estructura
- `MODULO_AUTH_RESUMEN_COMPLETO.md` - Visión ejecutiva del módulo y sus objetivos.
- `MODULO_AUTH_ESPECIFICACION.md` - Detalle funcional, reglas y casos de uso.
- `MODULO_AUTH_IMPLEMENTACION_BACKEND.md` - Arquitectura NestJS, endpoints y consideraciones técnicas.

## Implementación
- Backend: `../../backend/src/modules/auth/` contiene controlador, servicio, estrategias `jwt` y `local`, además del módulo `AuthModule`. Guardas compartidas en `../../backend/src/common/guards/jwt-auth.guard.ts`.
- Frontend: `../../frontend/src/pages/LoginPage.vue`, composable `../../frontend/src/composables/useAuth.js`, store `../../frontend/src/stores/auth.js` y servicio `../../frontend/src/services/authService.js` orquestan el flujo de login y autorización.
- Boot Axios: `../../frontend/src/boot/axios.js` inserta el token JWT en cada request y captura errores de backend.

## Integraciones Clave
- Usuarios y roles: entidades `User` y `Role` (`../../backend/src/database/entities/`) y tabla `access` para permisos por módulo.
- Servicios auxiliares: `UsersModule` para recuperación de contraseña y módulos que consumen `AuthService.getPayloadFromToken`.
- Seguridad: estrategias Passport (`jwt` y `local`) y guardas públicas mediante decorator `@Public` en `../../backend/src/common/decorators/public.decorator.ts`.

## Base de Datos
- Tablas `user`, `role` y `access` definidas en `../../database.sql`; contienen las relaciones necesarias para autenticación y autorización.
- Campos relevantes: `user.state` para bloquear cuentas, `role.access` para permisos, tokens de reseteo (`reset_password_token`) para recuperación.

## Pendientes Sugeridos
- Añadir ocultamiento de logs sensibles en `AuthService.validateUser()`.
- Documentar completamente el flujo de reCAPTCHA y restablecimiento de contraseña.
- Incorporar pruebas unitarias y e2e que cubran los endpoints `/auth/login`, `/auth/profile` y `/auth/permissions`.
