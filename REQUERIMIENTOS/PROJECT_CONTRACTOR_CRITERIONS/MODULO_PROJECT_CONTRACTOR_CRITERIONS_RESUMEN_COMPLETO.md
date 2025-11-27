# Módulo ProjectContractorCriterion - Resumen Ejecutivo

> Tabla de unión (ProjectContractor, Criterion) que rastrea completion_percentage por criterio. Implementa **upsert pattern**: si entry existe, actualiza %; si no, crea nuevo.

## 🎯 Objetivo

Mantener matriz de **cumplimiento de criterios** para cada (Proyecto, Contratista) pair. Cuando ProjectContractor se crea, genera 1 entry por Criterion (completion_percentage = 0). Cuando documentos se suben/validan, % se recalcula automáticamente.

## 📊 Alcance

### ✅ Incluye
- **Upsert Pattern:** createOrUpdate() verifica existencia antes de INSERT/UPDATE
- **Query Matriz:** get() por ProjectContractor → retorna array de (Criterion, %)
- **Auto-Generation:** Al crear ProjectContractor, genera entries para cada Criterion
- **Recálculo:** DocumentService actualiza % tras cambios en documentos

### ❌ Fuera del Alcance
- CRUD manual (cambios vía documentos o programatic)
- Versionado de criterios (histórico por fecha)

## 📈 KPIs

| KPI | Target | Descripción |
|---|---|---|
| Coverage | 100% | Cada ProjectContractor tiene 1 entry/Criterion |
| Consistencia % | =100% | % coincide con % global de PC |
| Query Performance | <50ms | GET matriz criterios |

## 🔗 Dependencias

- **ProjectContractor:** ManyToOne FK cascade; si PC eliminado, entries también
- **Criterion:** ManyToOne FK NO action; si Criterion eliminado, bloquea
- **DocumentService:** Actualiza % via updatePercentageByCriterion()

## 🏗️ Consideraciones Técnicas

- **Upsert Lógica:** 
  ```
  IF EXISTS (SELECT id FROM pcc WHERE pc_id=X AND criterion_id=Y)
    THEN UPDATE
    ELSE INSERT
  ```
- **Composite Key:** (projectContractor_id, criterion_id) actúa como PK lógico
- **Cascade Delete:** Si ProjectContractor se elimina, entries cascadean

---

## 📚 Referencias
- Especificación: `MODULO_PROJECT_CONTRACTOR_CRITERIONS_ESPECIFICACION.md`
- Implementación: `MODULO_PROJECT_CONTRACTOR_CRITERIONS_IMPLEMENTACION_BACKEND.md`

