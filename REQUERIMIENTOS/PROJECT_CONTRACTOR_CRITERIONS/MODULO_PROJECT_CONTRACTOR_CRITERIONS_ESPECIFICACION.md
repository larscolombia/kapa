# Módulo ProjectContractorCriterion - Especificación Funcional

## 📋 Casos de Uso (3)

### CU-01: Crear o Actualizar Entry (Upsert)

**Patrón:** createOrUpdate()
```
POST /project-contractor-criterions
Body: { projectContractor_id: 50, criterion_id: 1, completion_percentage: 75 }

1. Query: SELECT id FROM pcc WHERE pc_id=50 AND criterion_id=1
2. Si existe: UPDATE completion_percentage = 75
3. Si no existe: INSERT nueva row
4. Retorna row creada/actualizada
```

---

### CU-02: Obtener Matriz de Criterios por ProjectContractor

**Flujo:**
```
GET /project-contractor-criterions?project_contractor_id=50
Retorna: [
  { id: 100, projectContractor: 50, criterion: 1, completion_percentage: 85 },
  { id: 101, projectContractor: 50, criterion: 2, completion_percentage: 60 }
]
Frontend renderiza tabla: Criterio | % Completitud
```

---

### CU-03: Get Transformado a DTO

**Flujo:**
```
GET /project-contractor-criterions/contractor/2/project/1
Retorna: [
  { criterion: { id: 1, name: "Estructuras" }, completion_percentage: 75 }
]
Frontend: más legible (nombre criterio + %)
```

---

## 🎯 Reglas de Negocio

| Regla | Descripción |
|---|---|
| **RN-01** | Composite PK lógico: (projectContractor_id, criterion_id) |
| **RN-02** | Upsert automático: insert si no existe, update si existe |
| **RN-03** | completion_percentage: 0-100, requerido |
| **RN-04** | Cascade DELETE ProjectContractor → elimina entries |
| **RN-05** | NO ACTION Criterion → no se puede eliminar criterio con entries |

---

## 🔌 Interfaces REST

### POST /project-contractor-criterions (Upsert)
```
POST /project-contractor-criterions
Body: { projectContractor_id, criterion_id, completion_percentage }
Response: { id, projectContractor_id, criterion_id, completion_percentage }
```

### GET /project-contractor-criterions?project_contractor_id=X
```
GET /project-contractor-criterions?project_contractor_id=50
Response: [{ ...}, { ...}]
```

### GET /project-contractor-criterions/contractor/:cid/project/:pid
```
GET /project-contractor-criterions/contractor/2/project/1
Response: [
  { criterion: { id, name }, completion_percentage }
]
DTO transformado
```

---

## 📊 Validaciones

- projectContractor_id: FK válido, requerido
- criterion_id: FK válido, requerido
- completion_percentage: 0-100, requerido

---

## ⚠️ Tareas Pendientes

- [ ] DELETE endpoint
- [ ] Composite unique (pc_id, criterion_id)
- [ ] Tests para upsert logic
- [ ] Batch upsert (múltiples en 1 request)

