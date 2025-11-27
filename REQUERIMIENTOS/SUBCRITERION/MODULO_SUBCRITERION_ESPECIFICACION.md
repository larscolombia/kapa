# Módulo Subcriterion - Especificación Funcional

## 📋 Casos de Uso

### CU-01: Listar Subcriteria de un Criterio
```
GET /subcriterion?criterion_id=1
Retorna: [
  { subcriterion_id: 10, name: "Planos", order: 1, employee_required: false, multiple_required: true },
  { subcriterion_id: 11, name: "Cálculos", order: 2, employee_required: false, multiple_required: false }
]
```

### CU-02: Obtener Subcriteria con employee_required=true
```
GET /subcriterion/employee-required
Retorna: Subcriteria donde 1 doc es requerido PER empleado
```

### CU-03: Listar Todos los Subcriteria
```
GET /subcriterion
Retorna: Todos + relación con Criterion eager
```

---

## 🎯 Reglas de Negocio

| Regla | Implementación |
|---|---|
| **RN-01** | Subcriterion pertenece a exactamente 1 Criterion |
| **RN-02** | Order debe ser único dentro de Criterion |
| **RN-03** | Si employee_required=true: 1 doc/empleado |
| **RN-04** | Si multiple_required=true: ≥2 docs |
| **RN-05** | Si hasExpirationDate=true: doc vence |

---

## 🔌 Interfaces REST

| Endpoint | Descripción |
|---|---|
| GET /subcriterion | Listar todos |
| GET /subcriterion?criterion_id=X | Por criterio |
| GET /subcriterion/employee-required | Con employee_required=true |

---

## 📊 Validaciones

- name: 3-200 chars, requerido
- criterion_id: FK válido, requerido
- order: Integer ≥1, requerido
- employee_required, multiple_required, hasExpirationDate: Boolean

---

## ⚠️ Tareas Pendientes

- [ ] UNIQUE(criterion_id, order)
- [ ] GET /subcriterion/:id
- [ ] Paginación si >500 registros
- [ ] Cache Redis (1 hora)

