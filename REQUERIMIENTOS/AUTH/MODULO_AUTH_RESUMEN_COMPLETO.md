# Módulo Auth - Resumen Ejecutivo

> El módulo Auth garantiza el acceso seguro a KAPA mediante autenticación basada en JWT, control de permisos por rol y servicios auxiliares para mantener sesiones activas y protegidas.

## Objetivo
- Validar credenciales y emitir tokens JWT para el ecosistema KAPA.
- Proporcionar información de perfil y permisos a otros módulos tras el inicio de sesión.
- Integrar mecanismos de seguridad complementarios (estado de usuario, reCAPTCHA, recuperación de contraseña).

## Alcance
- Endpoints de login, perfil y permisos consumidos por la aplicación web.
- Estrategias de autenticación `local` y `jwt` configuradas con Passport y NestJS.
- Distribución de claims relevantes (email, role, state) en el token para habilitar autorizaciones descendentes.
- Fuera de alcance: administración de usuarios (alta/baja), federación con terceros o SSO empresarial, flujos avanzados de gestión de contraseñas.

## KPIs y Métricas
- Tasa de éxito y latencia promedio del endpoint `/auth/login`.
- Número de sesiones activas y expiradas según configuración `JWT_EXPIRES_IN`.
- Porcentaje de intentos de inicio fallidos por credenciales inválidas o cuentas inactivas.
- Incidencias registradas en verificación de reCAPTCHA y solicitudes de restablecimiento de contraseña.

## Dependencias
- `UsersService` para validar credenciales, extraer perfiles y reset tokens.
- Entidades `User`, `Role` y `Access` para mapear permisos por módulo.
- Configuración de variables `JWT_SECRET`, `JWT_EXPIRES_IN` y `RECAPTCHA_SECRET_KEY`.
- Servicios frontend `authService`, store `auth` y boot Axios para consumir y propagar el token.

## Consideraciones Técnicas
- Tokens firmados con `JWT_SECRET`; expiración configurable vía variables de entorno.
- `JwtAuthGuard` permite rutas públicas con el decorador `@Public`, preservando control centralizado.
- Logs actuales exponen credenciales en consola; se debe sanitizar en entornos productivos.
- El flujo de forgot/restore se apoya en endpoints del módulo Users; requiere coordinación de estados y expiraciones.
- Ausencia de pruebas unitarias/e2e robustas representa riesgo en despliegues y regresiones.
