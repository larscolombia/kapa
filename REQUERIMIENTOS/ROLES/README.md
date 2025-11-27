# 🔑 Módulo Roles

Catálogo maestro de 5 roles del sistema: Admin, Coordinador, Cliente, Contratista, Empleado.

## 📂 Estructura

- `MODULO_ROLES_RESUMEN_COMPLETO.md` — Resumen ejecutivo
- `MODULO_ROLES_ESPECIFICACION.md` — 2 casos de uso + reglas + interfaces
- `MODULO_ROLES_IMPLEMENTACION_BACKEND.md` — Arquitectura + endpoints + deuda técnica

## 🚀 Implementación

**Backend:** `backend/src/modules/roles/`
- `RolesService.getRoles()` — Query simple: SELECT * FROM role

**Endpoints:**
- GET `/roles` — Listar 5 roles
- GET `/roles/:id` — Obtener rol por ID

## 🗄️ BD

```sql
role_id | name
--------|-------------
1       | Admin
2       | Coordinador
3       | Cliente
4       | Contratista
5       | Empleado
```

## 📚 Referencias

- Especificación: `MODULO_ROLES_ESPECIFICACION.md`
- Implementación: `MODULO_ROLES_IMPLEMENTACION_BACKEND.md`

