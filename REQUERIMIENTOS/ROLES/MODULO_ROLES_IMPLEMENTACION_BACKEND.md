# Módulo Roles - Implementación Backend

> Arquitectura, endpoints y decisiones técnicas para roles de sistema.

## 🏗️ Arquitectura

```
backend/src/modules/roles/
├── roles.controller.ts        → 2 endpoints GET
├── roles.service.ts           → 1 método: getRoles()
├── roles.module.ts            → DI Container
└── roles.service.spec.ts      → Tests
```

**Entidad:** `backend/src/database/entities/role.entity.ts`
```typescript
@Entity()
export class Role {
  role_id: number (PK)
  name: string (Admin, Coordinador, Cliente, Contratista, Empleado)
  users?: User[] (OneToMany)
  access?: Access[] (OneToMany)
}
```

---

## 🔌 Endpoints

### GET /roles
```
GET /roles HTTP/1.1
Authorization: Bearer <JWT>

SQL: SELECT * FROM role
Time: <5ms (5 registros)

Response 200:
[
  { "role_id": 1, "name": "Admin" },
  { "role_id": 2, "name": "Coordinador" },
  ...
]
```

**Service:**
```typescript
async getRoles(): Promise<Role[]> {
  return this.rolesRepository.find();
}
```

---

### GET /roles/:id
```
GET /roles/1 HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
{ "role_id": 1, "name": "Admin" }
```

---

## 🔐 Seguridad

- JWT requerido (cualquier rol puede listar)
- Sin rate limiting (datos públicos)
- Lectura únicamente

---

## 📋 Deuda Técnica

| Severidad | Tema | Solución |
|---|---|---|
| 🟢 Media | Tests vacíos | 2 tests unitarios |
| 🟢 Media | Sin cache | Redis 1 día TTL |
| 🟢 Media | Sin matriz de permisos | Tabla access + guards |

---

## ✅ Checklist

- ✅ 1 método service (getRoles)
- ✅ 2 endpoints GET
- ✅ Simple lookup (sin complejidad)
- ⚠️ Tests vacíos
- ✅ Datos maestros (inmutables)

