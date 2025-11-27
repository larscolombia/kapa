# Módulo Users - Autenticación y Gestión de Usuarios

> **Documentación oficial del módulo Users de KAPA**  
> Responsable de crear, validar, actualizar y gestionar credenciales de usuarios, contraseñas con políticas de seguridad e integración JWT.

## Estructura de Documentación

- `MODULO_USERS_RESUMEN_COMPLETO.md` — Resumen ejecutivo, objetivos, alcance, KPIs y dependencias.
- `MODULO_USERS_ESPECIFICACION.md` — Casos de uso, reglas de negocio, validaciones e interfaces REST/Frontend.
- `MODULO_USERS_IMPLEMENTACION_BACKEND.md` — Arquitectura NestJS, servicios, seguridad, integraciones y pruebas.

## Archivos de Implementación Backend

```
backend/src/modules/users/
├── users.controller.ts          → Endpoints REST
├── users.service.ts             → Lógica de negocio (CRUD, validaciones, reseteo)
├── users.module.ts              → Importación TypeORM y registros
├── dto/
│   └── create-user.dto.ts       → Validaciones al crear usuario
└── users.service.spec.ts        → Suite de pruebas (vacía)
```

## Estructura de Base de Datos

**Tabla `user`:**
```sql
- user_id (PK, auto_increment)
- name (varchar, requerido)
- email (varchar, UNIQUE, requerido)
- password (varchar, hash bcrypt, requerido en creación)
- role (FK → role, requerido)
- state (enum: active/inactive, default: active)
- reset_password_token (varchar, nullable, temporal)
- reset_password_expires (timestamp, nullable, temporal)
- created_at (timestamp, auto)
- updated_at (timestamp, auto)
```

## Entidad TypeORM

**Ubicación:** `backend/src/database/entities/user.entity.ts`  
**Relaciones:**
- ManyToOne: `Role` (relación con módulo Roles)
- OneToMany: `Support Files` (usuario que creó soporte)
- OneToMany: `ILV Audits` (usuario que actualizó reportes ILV)

## Integración con Otros Módulos

- **Auth Module:** Valida credenciales y genera JWT
- **Roles Module:** Define permisos y visibilidad
- **Mail Util:** Envía correos de reseteo de contraseña
- **Guards:** `JwtAuthGuard` protege endpoints autenticados

## Frontend Components

- `frontend/src/pages/AdminUsersPage.vue` → Tabla de usuarios (admin)
- `frontend/src/components/ChangePassword.vue` → Cambio de contraseña autenticado
- `frontend/src/pages/RestorePasswordPage.vue` → Reseteo sin autenticación
- `frontend/src/services/userService.js` → Consumo de APIs REST

## Endpoints Principales

```
POST   /users/user-forgot-password              → Solicitar reseteo (público)
PUT    /users/restore-password                  → Restaurar con token (público)
PUT    /users/change-password                   → Cambiar password (JWT)
GET    /users                                   → Listar sin password (JWT, admin)
GET    /users/:id                               → Obtener usuario (JWT)
POST   /users                                   → Crear usuario (JWT, admin)
PUT    /users                                   → Actualizar usuario (JWT, admin)
POST   /users/getKapaEmails                     → Listar correos internos
```

