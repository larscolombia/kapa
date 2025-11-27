# 🔐 Módulo Users - Especificación Funcional Completa

---

## 📖 Descripción General

El módulo Users gestiona el ciclo completo de la vida de un usuario en KAPA:
- **Creación** con asignación de rol y validación de seguridad
- **Autenticación** mediante credenciales y JWT
- **Gestión de acceso** considerando estado y permisos por rol
- **Recuperación de acceso** cuando el usuario olvida su contraseña
- **Cambio de contraseña** para usuarios autenticados

La arquitectura garantiza que **solo usuarios activos con roles válidos** puedan interactuar con el sistema, y que **todas las contraseñas** se almacenen hasheadas mediante bcrypt.

---

## 🎯 Casos de Uso Detallados

### 1️⃣ Caso de Uso: Crear Usuario (Admin)

**Actores:** Administrador KAPA (role_id=1)

**Precondiciones:**
- Admin autenticado con token JWT válido
- Usuario tiene permiso `user_management` (verificado en frontend vía access table)
- Email único (no existe otro user con ese email)

**Flujo Principal:**
1. Admin accede a "Administrar Usuarios" en AdminUsersPage.vue
2. Completa formulario: nombre, email, contraseña, rol, estado
3. Valida cliente-side (email válido, password cumple política)
4. Envía `POST /users` con body `{ name, email, password, role, state }`
5. Backend:
   - Valida campos requeridos (`name`, `email`, `password`, `role`, `state`)
   - Verifica email único contra tabla `user`
   - Valida política password: mín 8 caracteres, 1 mayúscula, 1 carácter especial
   - Valida estado en `['active', 'inactive']`
   - Genera salt bcrypt (`genSalt()`)
   - Hashea password (`bcrypt.hash(password, salt)`)
   - Crea registro en BD y retorna sin incluir `password`
6. Success → Notificación de usuario creado
7. Admin puede enviar correo manual con credenciales temporales

**Flujos Alternos:**
- **Email duplicado:** Retorna error 400 "Ya existe un usuario con este correo"
- **Password débil:** Retorna error 400 "La contraseña debe tener..."
- **Campo requerido faltante:** Retorna error 400 "El campo X es obligatorio"
- **Role inexistente:** Error 400 (FK constraint fallida)
- **Usuario no autenticado:** Error 401 "No autorizado"

**Datos de Entrada (DTO):**
```typescript
{
  name: string;          // "Juan Pérez"
  email: string;         // "juan@kapa.com"
  password: string;      // "Password123!"
  role: number;          // 3 (cliente)
  state: string;         // "active"
}
```

**Respuesta Exitosa:**
```json
{
  "user_id": 42,
  "name": "Juan Pérez",
  "email": "juan@kapa.com",
  "role": { "role_id": 3, "name": "Cliente" },
  "state": "active"
}
```

---

### 2️⃣ Caso de Uso: Listar Usuarios

**Actores:** Administrador, Coordinador

**Precondiciones:**
- Usuario autenticado vía JWT

**Flujo Principal:**
1. Admin navega a "Administrar Usuarios"
2. Sistema ejecuta `GET /users` con token en Authorization header
3. Backend:
   - Verifica JWT válido (`JwtAuthGuard`)
   - Consulta todos los usuarios sin incluir passwords/tokens temporales
   - Eager-loads relación `role` para mostrar nombre del rol
   - Ordena por `user_id` ASC
4. Retorna lista con columnas: ID, nombre, email, rol, estado
5. UI renderiza tabla con acciones: Ver, Editar, Eliminar

**Respuesta Exitosa:**
```json
[
  {
    "user_id": 1,
    "name": "Admin System",
    "email": "admin@kapa.com",
    "state": "active",
    "role": { "role_id": 1, "name": "Admin KAPA" }
  },
  {
    "user_id": 42,
    "name": "Juan Pérez",
    "email": "juan@kapa.com",
    "state": "active",
    "role": { "role_id": 3, "name": "Cliente" }
  }
]
```

---

### 3️⃣ Caso de Uso: Cambiar Contraseña (Usuario Autenticado)

**Actores:** Cualquier usuario autenticado

**Precondiciones:**
- Usuario logueado con sesión válida
- Tiene component `ChangePassword.vue` accesible en perfil

**Flujo Principal:**
1. Usuario abre "Mi Perfil" → "Cambiar Contraseña"
2. Completa nueva contraseña en formulario
3. Envía `PUT /users/change-password` con:
   ```json
   {
     "newPassword": "NewPassword456!"
   }
   ```
   (backend extrae user_id del JWT token)
4. Backend:
   - Valida JWT y extrae `userId`
   - Busca usuario por `user_id`
   - Valida nueva password cumple política
   - Genera nuevo salt y hashea
   - Actualiza `password`, limpia `reset_password_token` y `reset_password_expires`
   - Guarda cambios en BD
5. Success → "Contraseña actualizada con éxito"
6. Usuario puede seguir usando la sesión actual (no requiere logout)

**Respuesta:**
```json
{
  "message": "Contraseña actualizada con éxito."
}
```

---

### 4️⃣ Caso de Uso: Olvidad Contraseña (Público, Sin Login)

**Actores:** Cualquiera (público)

**Precondiciones:**
- Ninguna (no requiere autenticación)
- Usuario tiene email registrado

**Flujo Principal:**
1. Usuario hace clic "¿Olvidaste tu contraseña?" en LoginPage.vue
2. Ingresa email en formulario
3. Envía `POST /users/user-forgot-password` con body `{ "email": "john@example.com" }`
4. Backend:
   - Busca usuario por email
   - **Si existe:** genera token aleatorio (`randomBytes(32).toString('hex')`)
   - Guarda token + expiración (1 hora) en BD
   - Construye URL de reseteo: `${URL_FRONT}/restore-password/${token}`
   - Envía HTML email con link clickeable
   - Retorna "Si el correo está registrado, recibirás..."
5. **Si NO existe:** Retorna mismo mensaje (por seguridad, no revela si email existe)
6. Usuario recibe email con link válido por 1 hora
7. Puede proceder al Caso de Uso #5

**Email Template (HTML):**
```html
<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
<a href="https://kapa.healtheworld.com.co/restore-password/abc123def456...">
  Reestablecer contraseña
</a>
<p>Este enlace expira en 1 hora.</p>
```

**Respuesta (siempre igual por seguridad):**
```json
{
  "message": "Si el correo está registrado, recibirás un email para restablecer la contraseña."
}
```

---

### 5️⃣ Caso de Uso: Restaurar Contraseña (Público con Token)

**Actores:** Usuario con token válido del Caso de Uso #4

**Precondiciones:**
- Token no expirado (< 1 hora desde creación)
- Token existe en BD con `reset_password_expires > NOW()`

**Flujo Principal:**
1. Usuario hace clic en email link → accede a `restore-password/:token`
2. Componente RestorePasswordPage.vue muestra formulario
3. Usuario ingresa nueva contraseña
4. Envía `PUT /users/restore-password` con:
   ```json
   {
     "token": "abc123def456...",
     "newPassword": "SuperSecure789!"
   }
   ```
5. Backend:
   - Busca registro con `reset_password_token = token` y `reset_password_expires > NOW()`
   - **Si no encuentra o expiró:** Error 400 "Token inválido o expirado"
   - Valida nueva password cumple política
   - Genera nuevo hash bcrypt
   - Actualiza `password`, limpia `reset_password_token` y `reset_password_expires`
   - Guarda en BD
6. Success → "Contraseña restablecida con éxito"
7. Usuario puede loguear con nuevo password

**Flujos Alternos:**
- **Token expirado:** "Token inválido o expirado"
- **Token no existe:** "Token inválido o expirado"
- **Password no cumple policy:** "La contraseña debe tener..."

---

### 6️⃣ Caso de Uso: Listar Correos Kapa (Público)

**Actores:** Sistemas internos, reportes

**Precondiciones:**
- Ninguna (endpoint público)

**Flujo Principal:**
1. Componente o servicio necesita lista de emails de admins/coordinadores
2. Solicita `POST /users/getKapaEmails`
3. Backend:
   - QueryBuilder: busca usuarios con `role_id IN (1, 2)` (Admin, Coordinador)
   - Selecciona solo campo `email`
   - Retorna array de users con esos emails
4. Resultado usado para:
   - Notificaciones de reportes ILV creados
   - Copias en correos de documentos cargados
   - Listas de distribución

**Respuesta:**
```json
[
  { "user_id": 1, "email": "admin@kapa.com", "role_id": 1 },
  { "user_id": 5, "email": "coord1@kapa.com", "role_id": 2 },
  { "user_id": 8, "email": "coord2@kapa.com", "role_id": 2 }
]
```

---

## 📋 Reglas de Negocio

| Regla | Descripción | Enforced Where |
|---|---|---|
| **Email único** | No puede existir 2 usuarios con mismo email | DB constraint + Service validation |
| **Política Password** | Mín 8 chars, 1 mayúscula, 1 especial | `UsersService.validateUserPassword()` |
| **State válido** | Solo 'active' o 'inactive' | `UsersService.validateStateEnum()` |
| **Role requerido** | Todo usuario debe tener role_id | FK constraint + DTO |
| **Cambio de estado** | Solo admin puede cambiar estado de usuario | Frontend + posible backend guard (futuro) |
| **Password hash** | Nunca se almacena plain text | `bcrypt.hash()` en creación/reset/change |
| **Reset token TTL** | Token expira en 1 hora | `reset_password_expires` timestamp |
| **Email en respuesta** | Password, tokens nunca retornados en APIs | `getUserWithoutPassword()` |
| **One-time password** | (Recomendado) Token se invalida después de uso | Actualmente NO implementado |
| **Roles predefinidos** | Catálogo fijo de 5 roles en BD | Seeds en `database.sql` |

---

## 🎨 Interfaces Usuario (Frontend)

### AdminUsersPage.vue
**Ubicación:** `frontend/src/pages/AdminUsersPage.vue`

**Funcionalidades:**
- Tabla de usuarios con paginación
- Búsqueda por nombre/email
- Botón "Agregar Usuario" abre modal
- Acciones: Ver, Editar, Eliminar
- Filtro por estado (activo/inactivo)
- Columnas: ID, Nombre, Email, Rol, Estado, Acciones

**Permisos requeridos:** `supports_management:can_edit` (ó similar para usuarios)

### ChangePassword.vue
**Ubicación:** `frontend/src/components/ChangePassword.vue`

**Funcionalidades:**
- Formulario con campo "Nueva Contraseña"
- Indicador de fuerza de password en tiempo real
- Botón "Actualizar"
- Validación client-side de política
- Mensaje de éxito/error

### RestorePasswordPage.vue
**Ubicación:** `frontend/src/pages/RestorePasswordPage.vue`

**Funcionalidades:**
- Componente público (sin login requerido)
- Extrae token de URL params
- Formulario: nueva contraseña
- Valida complejidad local
- Envía token + password
- Muestra resultado

---

## 🔌 Endpoints REST

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/users` | JWT (Admin) | Crear usuario |
| GET | `/users` | JWT | Listar usuarios |
| GET | `/users/:id` | JWT | Obtener usuario por ID |
| PUT | `/users` | JWT (Admin) | Actualizar usuario |
| POST | `/users/user-forgot-password` | Público | Solicitar reseteo |
| PUT | `/users/restore-password` | Público | Restaurar con token |
| PUT | `/users/change-password` | JWT | Cambiar password |
| POST | `/users/getKapaEmails` | Público | Listar emails admins/coords |

---

## 🔒 Validaciones Críticas

**Crear/Actualizar Usuario:**
```javascript
✓ name: 1-255 caracteres, requerido
✓ email: formato válido, único, requerido
✓ password: mín 8, 1 mayúscula, 1 especial (solo en creación)
✓ role: FK existe en tabla role, requerido
✓ state: 'active' o 'inactive', requerido
```

**Cambiar/Restaurar Contraseña:**
```javascript
✓ newPassword: mín 8, 1 mayúscula, 1 especial
✓ Token: 32 bytes hexadecimal aleatorio
✓ Expiración: timestamp > NOW()
```

---

## 📊 Tareas Pendientes

- [ ] Implementar auditoría: tabla `user_audit` con quién cambió qué y cuándo
- [ ] Agregar tests unitarios/e2e en `users.service.spec.ts`
- [ ] Bloqueo por intentos fallidos de login (5 intentos = lock 15 min)
- [ ] Two-factor authentication (2FA)
- [ ] Expiración automática de contraseña cada 90 días
- [ ] Soft delete mejorado con `deleted_at` en lugar de `state`
- [ ] Validación más robusta de email (DNS check, deliverability)
- [ ] Integración con OAuth/SSO (Google, Microsoft Entra)
- [ ] Logging detallado de login attempts y cambios de password

