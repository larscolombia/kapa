# 📐 Módulo Subcriterion

Descomposición granular de criterios ILV en sub-requisitos específicos. Define documentación requerida, flags de validación y relaciones con empleados.

## 📂 Estructura

- `MODULO_SUBCRITERION_RESUMEN_COMPLETO.md` — Resumen ejecutivo
- `MODULO_SUBCRITERION_ESPECIFICACION.md` — 3 CUs + reglas + interfaces
- `MODULO_SUBCRITERION_IMPLEMENTACION_BACKEND.md` — Arquitectura + endpoints + deuda técnica

## 🚀 Implementación

**Backend:** `backend/src/modules/subcriterion/`
- 3 methods: getSubCriterions(), getSubCriterionsByCriterionId(), getSubCriterionsWithEmployeeRequired()

**Endpoints:**
- GET `/subcriterion` — Listar todos
- GET `/subcriterion?criterion_id=X` — Por criterio
- GET `/subcriterion/employee-required` — Filtrar por flag

## 🗄️ BD

```sql
subcriterion_id | name | order | criterion_id | employee_required | multiple_required | hasExpirationDate
```

**Flags:**
- employee_required: 1 doc/empleado
- multiple_required: ≥2 docs
- hasExpirationDate: doc vence

## 📚 Referencias

- Especificación: `MODULO_SUBCRITERION_ESPECIFICACION.md`
- Implementación: `MODULO_SUBCRITERION_IMPLEMENTACION_BACKEND.md`

