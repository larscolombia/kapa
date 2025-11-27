# 📊 Módulo ProjectContractorCriterion

Tabla de unión (ProjectContractor, Criterion) que rastrea completion_percentage. Implementa **upsert pattern**: insert si no existe, update si existe.

## 📂 Estructura

- `MODULO_PROJECT_CONTRACTOR_CRITERIONS_RESUMEN_COMPLETO.md` — Resumen ejecutivo
- `MODULO_PROJECT_CONTRACTOR_CRITERIONS_ESPECIFICACION.md` — 3 CUs + upsert + interfaces
- `MODULO_PROJECT_CONTRACTOR_CRITERIONS_IMPLEMENTACION_BACKEND.md` — Upsert pattern + DTO transformation

## 🚀 Implementación

**Backend:** `backend/src/modules/project-contractor-criterions/`
- **Upsert:** createOrUpdate() verifica existencia antes de INSERT/UPDATE
- **Auto-gen:** Creada automáticamente al crear ProjectContractor (1 entry/Criterion)
- **Recalcular:** DocumentService actualiza % automáticamente

**Endpoints (3):**
- POST /pcc — Upsert (create or update)
- GET /pcc?project_contractor_id=X — Matriz criterios
- GET /pcc/contractor/:cid/project/:pid — DTO transformado (nombre criterio + %)

## 🗄️ BD

```sql
id | projectContractor_id | criterion_id | completion_percentage
-- Composite unique: (pc_id, criterion_id)
-- Cascade: DELETE ProjectContractor → elimina entries
-- FK NO ACTION: NO se puede eliminar Criterion con entries
```

## 🔌 Upsert Pattern

```
POST /pcc { projectContractor_id: 50, criterion_id: 1, completion_percentage: 75 }
↓
IF EXISTS (SELECT id FROM pcc WHERE pc_id=50 AND criterion_id=1)
  THEN UPDATE completion_percentage = 75
  ELSE INSERT new entry
↓
HTTP 200 + entry actualizado
```

## 📚 Referencias

- Especificación: `MODULO_PROJECT_CONTRACTOR_CRITERIONS_ESPECIFICACION.md`
- Implementación: `MODULO_PROJECT_CONTRACTOR_CRITERIONS_IMPLEMENTACION_BACKEND.md`

