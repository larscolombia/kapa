# Módulo Auth - Implementación Backend

## Arquitectura
- NestJS module ubicado en `backend/src/modules/auth/` con `AuthController`, `AuthService`, `AuthModule` y las estrategias `LocalStrategy` y `JwtStrategy`.
- `AuthModule` importa `PassportModule`, `JwtModule.registerAsync`, `ConfigModule`, `UsersModule` (para funcionalidades cruzadas) y `TypeOrmModule` para entidades `User` y `Role`.
- `AuthService` encapsula la validación de credenciales, emisión de tokens, recuperación de perfil y agregación de permisos.
- El guard `JwtAuthGuard` se declara en `backend/src/common/guards/` y reutiliza `AuthGuard('jwt')` con soporte para endpoints públicos mediante decorador `@Public`.

## Endpoints / Servicios
- `POST /auth/login` → `AuthController.login()` llama `AuthService.validateUser()` y `AuthService.login()`; responde con `{ accessToken }`.
- `GET /auth/profile` → protegido con `JwtAuthGuard`; retorna perfil sin credenciales usando `AuthService.getProfile()`.
- `GET /auth/permissions` → protegido con `JwtAuthGuard`; agrupa permisos del rol mediante `AuthService.getRolePermissions()`.
- Métodos adicionales en `AuthService`: `getPayloadFromToken()` (utilizado por otros módulos) y `verifyCaptcha()` (integración con reCAPTCHA v3).

## Flujos Clave
- **Validación de credenciales**: se busca el usuario por email, se verifica estado y coincidencia de password con bcrypt; se omite la contraseña en la respuesta de servicio.
- **Generación de token**: `JwtService.sign()` firma payload con `email`, `userId`, `role`, `state`; la expiración se define a través de `JWT_EXPIRES_IN`.
- **Recuperación de perfil**: se excluyen campos sensibles (`password`, `reset_password_token`, `reset_password_expires`) antes de responder.
- **Asignación de permisos**: se carga el rol con la relación `access` y se transforma en arreglo `{ module_name, can_view, can_edit }`.

## Seguridad y Permisos
- `LocalStrategy` configura Passport para recibir `email` como username y rechaza usuarios inactivos con `UnauthorizedException`.
- `JwtStrategy` extrae el token del header Bearer y valida la firma con `JWT_SECRET`; busca el usuario en base de datos para inyectarlo en el request.
- `JwtAuthGuard` permite combinar rutas privadas y públicas según metadata `IS_PUBLIC_KEY`.
- Los permisos finos (por módulo y acción) dependen del contenido de la tabla `access` y se envían al frontend para evaluar vistas y botones.

## Integraciones
- `UsersService` (vía `UsersModule`) para operaciones complementarias como recuperación de contraseña (no implementadas en este controlador pero usadas por composables frontend).
- `ConfigService` provee secretos (`JWT_SECRET`, `JWT_EXPIRES_IN`, `RECAPTCHA_SECRET_KEY`).
- Módulos consumidores (`Clients`, `Projects`, `ILV`, etc.) usan `AuthService.getPayloadFromToken()` para obtener claims sin re-validar el token.
- Frontend utiliza `authService.js`, `useAuth.js` y `auth` store con token almacenado en `LocalStorage`.

## Pruebas
- `auth.service.spec.ts` sólo verifica que el servicio instancie; faltan pruebas que cubran validación, login y permisos.
- Recomendado agregar pruebas unitarias simulando usuarios activos/inactivos, contraseñas válidas/incorrectas y payloads maliciosos.
- Incluir pruebas e2e que validen la protección del guard, la expiración del token y la respuesta de permisos por rol.
