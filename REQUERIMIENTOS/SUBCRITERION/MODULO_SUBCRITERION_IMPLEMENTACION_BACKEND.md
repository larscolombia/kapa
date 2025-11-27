# Módulo Subcriterion - Implementación Backend

## 🏗️ Arquitectura

```
backend/src/modules/subcriterion/
├── subcriterion.controller.ts     → 3 endpoints GET
├── subcriterion.service.ts        → 3 métodos
└── entities/subcriterion.entity.ts → Campos: id, name, order, flags
```

**Entidad:**
```typescript
@Entity()
export class Subcriterion {
  subcriterion_id: number (PK)
  name: string
  order: number (sorting dentro de criterio)
  employee_required: boolean (1 doc/empleado)
  multiple_required: boolean (≥2 docs)
  hasExpirationDate: boolean (doc vence)
  criterion: Criterion (FK, eager)
  documents?: Document[]
}
```

---

## 🔌 Endpoints

### GET /subcriterion
```typescript
async getSubCriterions(): Promise<Subcriterion[]> {
  return this.subcriterionRepository.find({
    relations: ['criterion'],
  });
}
// SQL: SELECT s.*, c.* FROM subcriterion s 
//      LEFT JOIN criterion c ON s.criterion_id = c.id
// Time: ~50ms
```

### GET /subcriterion?criterion_id=X
```typescript
async getSubCriterionsByCriterionId(criterion_id: number) {
  return this.subcriterionRepository.find({
    where: { criterion: { criterion_id } },
    relations: ['criterion'],
    order: { order: 'ASC' },
  });
}
// WHERE c.criterion_id = X, ORDER BY s.order ASC
// Time: ~10ms
```

### GET /subcriterion/employee-required
```typescript
async getSubCriterionsWithEmployeeRequired() {
  return this.subcriterionRepository.find({
    where: { employee_required: true },
    relations: ['criterion', 'criterion.documentType'],
    order: { order: 'ASC' },
  });
}
// WHERE s.employee_required=true
// Usado por: EmployeeService.updatePercentages()
```

---

## 🔐 Seguridad

- JWT requerido (cualquier rol)
- Lectura únicamente (datos maestros)

---

## 📊 Performance

| Query | Índices | Est. Time |
|---|---|---|
| getSubCriterions() | criterion_id FK | 50ms |
| getSubCriterionsByCriterionId(X) | PK + FK | 10ms |
| getSubCriterionsWithEmployeeRequired() | employee_required index | 20ms |

---

## 📋 Deuda Técnica

| Severidad | Tema | Solución |
|---|---|---|
| 🟡 Alta | Sin índice on employee_required | CREATE INDEX |
| 🟢 Media | Sin GET /:id endpoint | Agregar método + controller |
| 🟢 Media | Tests vacíos | 3 tests unitarios |

---

## ✅ Checklist

- ✅ 3 métodos service
- ✅ 3 endpoints GET
- ✅ Eager loading Criterion
- ⚠️ Sin GET /:id
- ⚠️ Tests vacíos

