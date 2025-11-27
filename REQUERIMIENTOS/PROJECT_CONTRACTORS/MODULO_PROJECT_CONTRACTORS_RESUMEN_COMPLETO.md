# Módulo ProjectContractors - Resumen Ejecutivo

> Junction table + state: vincula Contractor con Project, rastrea completition_percentage e implementa validaciones de dependencias (no disociar si hay empleados/documentos).

## 🎯 Objetivo

Gestionar la **asignación de contratistas a proyectos** y mantener tracking del **porcentaje de cumplimiento global** de cada asignación. Previene disociación si existen empleados o documentos (integridad referencial).

## 📊 Alcance

### ✅ Incluye
- CRUD: Create, Read, Update, Delete ProjectContractor
- Validación de FK (Proyecto + Contratista deben existir)
- Query por Proyecto (listar contratistas asignados)
- Query por Contractor+Proyecto combo
- Recalcular completition_percentage tras cambios en DocumentService
- Validación de dependencias antes de DELETE
- Relaciones: ProjectContractorCriterion (1:N, cascade)

### ❌ Fuera del Alcance
- Cambio dinámico de Proyecto/Contractor (una vez asignado, fijo)

## 📈 KPIs

| KPI | Target | Descripción |
|---|---|---|
| Cobertura | ≥50% | # Contractors asignados / # Contractors disponibles |
| Integridad | 100% | Validación de dependencias correcta |
| Latencia Query | <100ms | Buscar ProjectContractor por ids |

## 🔗 Dependencias

- **Project:** ManyToOne eager
- **Contractor:** ManyToOne + emails (nested relation)
- **Employees:** OneToMany; bloquea DELETE si >0
- **Documents:** OneToMany; bloquea DELETE si >0
- **ProjectContractorCriterion:** OneToMany cascade DELETE
- **DocumentService:** updatePercentages() recalcula completition_percentage

## 🏗️ Consideraciones Técnicas

- **Validación pre-DELETE:** Query si existe employee O document → throw error
- **QueryBuilder con Brackets:** Para queries complejas (contratista + proyecto combo)
- **Nested Relations:** contractor.emails incluido en respuesta

---

## 📚 Referencias
- Especificación: `MODULO_PROJECT_CONTRACTORS_ESPECIFICACION.md`
- Implementación: `MODULO_PROJECT_CONTRACTORS_IMPLEMENTACION_BACKEND.md`

