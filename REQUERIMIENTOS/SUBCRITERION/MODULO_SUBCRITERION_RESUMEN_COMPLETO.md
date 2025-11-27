# Módulo Subcriterion - Resumen Ejecutivo

> Descomposición detallada de criterios en sub-requisitos específicos. Cada Criterion tiene 3-8 Subcriterion que definen documentación requerida y reglas de validación (employee_required, multiple_required, hasExpirationDate).

## 🎯 Objetivo

Proporcionar **granularidad en auditoría ILV**: si Criterio "Estructuras Metálicas" es muy amplio, Subcriteria lo descompone en: "Planos Estructurales", "Cálculos de Cargas", "Inspección Visual", etc. Cada subcriterio define si requiere doc por empleado, múltiples docs, o expiración.

## 📊 Alcance

### ✅ Incluye
- GET /subcriterion — Listar todos
- GET /subcriterion?criterion_id=X — Filtrar por Criterio
- GET /subcriterion/employee-required — Listar con employee_required=true
- Relación: Subcriterion.criterion (ManyToOne eager)
- Flags: employee_required, multiple_required, hasExpirationDate

### ❌ Fuera del Alcance
- CRUD dinámico (datos maestros)
- Versionado de subcriteria

## 📈 KPIs

| KPI | Target |
|---|---|
| Densidad | 3-8 subcriteria/criterio |
| Query employee_required | <100ms |
| Cobertura | 100% criterios con ≥1 subcriterion |

## 🔗 Dependencias

- **Criterion:** ManyToOne eager; cada subcriterion pertenece a 1 criterio
- **Document:** OneToMany; documentos que acreditan subcriteria
- **EmployeeService:** Consulta employee_required en updatePercentages()

## 🏗️ Consideraciones Técnicas

- **Eager loading Criterion:** Siempre se necesita nombre del criterio padre
- **Order field:** Ordena subcriteria dentro de criterio (1, 2, 3...)
- **Flags Booleanos:** employee_required (1 doc/empleado), multiple_required (≥2 docs), hasExpirationDate (doc vence)

---

## 📚 Referencias
- Especificación: `MODULO_SUBCRITERION_ESPECIFICACION.md`
- Implementación: `MODULO_SUBCRITERION_IMPLEMENTACION_BACKEND.md`

