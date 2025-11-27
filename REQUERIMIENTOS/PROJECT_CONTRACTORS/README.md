# 🔗 Módulo Project Contractors

Junction table + state: vincula Contractor con Project, rastrea completition_percentage, valida dependencias pre-DELETE.

## 📂 Estructura

- `MODULO_PROJECT_CONTRACTORS_RESUMEN_COMPLETO.md` — Resumen ejecutivo
- `MODULO_PROJECT_CONTRACTORS_ESPECIFICACION.md` — 5 CUs + reglas + interfaces (7 endpoints)
- `MODULO_PROJECT_CONTRACTORS_IMPLEMENTACION_BACKEND.md` — Arquitectura + QueryBuilder + validaciones

## 🚀 Implementación

**Backend:** `backend/src/modules/project-contractors/`
- 7+ methods: CRUD + Query variants (combo contractor+project)
- QueryBuilder con 3 JOINs para nested relations

**Endpoints (7):**
- POST /project-contractors — Crear + generar criterios
- GET /project-contractors — Listar todos
- GET /project-contractors/:id — Por ID
- GET /project-contractors?project_id=X — Filtrar proyecto
- GET /project-contractors/contractor/:cid/project/:pid — Query combo
- PUT /project-contractors/:id — Actualizar %
- DELETE /project-contractors/:id — Eliminar (con validación)

## 🗄️ BD

```sql
project_contractor_id | project_id | contractor_id | completition_percentage
-- FK validations + UNIQUE(project_id, contractor_id)
-- Cascade: ProjectContractorCriterion deleted if pc deleted
-- Blocked: DELETE if Employee OR Document exists
```

## 🔐 Validaciones

- FK Project existe
- FK Contractor existe
- Combinación única (no duplicar)
- Pre-DELETE: no empleados, no documentos

## 📚 Referencias

- Especificación: `MODULO_PROJECT_CONTRACTORS_ESPECIFICACION.md`
- Implementación: `MODULO_PROJECT_CONTRACTORS_IMPLEMENTACION_BACKEND.md`

