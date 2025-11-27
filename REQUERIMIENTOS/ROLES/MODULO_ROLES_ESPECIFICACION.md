# Módulo Roles - Especificación Funcional

> Casos de uso y reglas de negocio para el módulo de Roles del sistema.

## 📋 Casos de Uso

### CU-01: Listar Todos los Roles

**Actores:** Cualquier usuario autenticado

**Precondiciones:**
- Usuario autenticado (JWT válido)
- BD contiene 5 roles

**Flujo Principal:**
1. Usuario accede a selector de roles o requiere GET `/roles`
2. Sistema retorna array: [Admin, Coordinador, Cliente, Contratista, Empleado]
3. Frontend renderiza dropdown o tabla

**Respuesta:**
```json
[
  { "role_id": 1, "name": "Admin" },
  { "role_id": 2, "name": "Coordinador" },
  { "role_id": 3, "name": "Cliente" },
  { "role_id": 4, "name": "Contratista" },
  { "role_id": 5, "name": "Empleado" }
]
```

---

### CU-02: Obtener Rol por ID

**Flujo:**
1. GET `/roles/:id`
2. Retorna rol individual con detalles (si aplica)

**Respuesta:**
```json
{ "role_id": 1, "name": "Admin" }
```

---

## 🎯 Reglas de Negocio

| Regla | Descripción |
|---|---|
| **RN-01** | Exactamente 5 roles: Admin, Coordinador, Cliente, Contratista, Empleado |
| **RN-02** | Cada usuario debe tener 1 rol asignado |
| **RN-03** | Roles son inmutables (no CRUD dinámico) |
| **RN-04** | Cambios de roles vía DBA scripts + deploy |

---

## 🔌 Interfaces REST

### GET /roles
```
GET /roles HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
[ { rol1 }, { rol2 }, ... ]
```

### GET /roles/:id
```
GET /roles/1 HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
{ "role_id": 1, "name": "Admin" }
```

---

## 📊 Roles del Sistema

| ID | Nombre | Descripción | Permisos |
|---|---|---|---|
| 1 | Admin | Superusuario | Todos |
| 2 | Coordinador | Gestor de proyectos | CRUD proyectos, criterios, reportes |
| 3 | Cliente | Titular del proyecto | Lectura del estado + documentos |
| 4 | Contratista | Ejecutor del proyecto | CRUD empleados + documentos asignados |
| 5 | Empleado | Ejecutante | Lectura estado + documentos personales |

---

## ⚠️ Tareas Pendientes

- [ ] Definir matriz de permisos por rol (endpoints)
- [ ] Implementar auditoría de cambios de rol de usuario
- [ ] UI Admin para visualizar permisos por rol

