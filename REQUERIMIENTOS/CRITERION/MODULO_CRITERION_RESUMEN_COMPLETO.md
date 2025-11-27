# Módulo Criterion - Resumen Ejecutivo

> Catálogo maestro de criterios de auditoría ILV. Define los estándares de evaluación bajo los cuales se auditan proyectos de construcción.

## 🎯 Objetivo

Proporcionar un repositorio centralizado y reutilizable de **criterios de evaluación de calidad (ILV)** que establezcan los lineamientos de cumplimiento para todos los proyectos del sistema. Cada criterio agrupa un conjunto de sub-criterios específicos y está asociado a un tipo de documento requerido para su cumplimiento.

**Valor de Negocio:**
- Garantía de consistencia en auditorías (mismo estándar para todos los proyectos)
- Facilita escalabilidad: agregar nuevos proyectos solo requiere asignar existentes criterios
- Base para generación de reportes de cumplimiento y métricas SLA
- Trazabilidad completa desde criterios → subcriteria → documentos → resultados

## 📊 Alcance

### ✅ Incluye

- **Gestión de Criterios:** CRUD de criterios, relación con DocumentType
- **Relación Jerárquica:** Mapping 1:N hacia SubCriterion para descomposición de requisitos
- **Vinculación con Auditorías:** Link a ProjectContractorCriterion para tracking de cumplimiento
- **Búsqueda Avanzada:** Query por proyecto + contratista para obtener criterios aplicables con % completitud
- **Carga Inicial:** Seeds con criterios estándar de ILV (minería, vías, energía, etc.)

### ❌ Fuera del Alcance

- Mutaciones de criterios (create/update/delete) → son datos maestros, solo lectura con control admin manual
- Versionado de criterios (histórico)
- A/B testing de criterios o cambios dinámicos
- Traducción multiidioma

## 📈 KPIs y Métricas

| KPI | Fórmula | Target | Descripción |
|---|---|---|---|
| **Cobertura de Criterios** | (# criterios asignados a proyecto) / (# criterios total) | ≥90% | % de criterios vigentes usados en auditorías activas |
| **Densidad de SubCriteria** | Σ subcriteria / Σ criteria | 3-8 | Promedio de detalles por criterio (mantiene granularidad sin explosión) |
| **Tiempo Query Criterios** | P95 latencia GET /criterion?project_id=X | <100ms | Asegura listados rápidos en frontend (query optimization) |
| **Coherencia ILV** | (# criterios con documentType válido) / (# criterios) | =100% | Cada criterio debe tener tipo doc obligatorio |

## 🔗 Dependencias

**Módulos Internos:**
- **Subcriterion:** Relación 1:N desde Criterion; cada criterio contiene 3-8 subcriteria con requisitos detallados
- **DocumentType:** ManyToOne eager; define qué tipo de documento acredita el cumplimiento (acta, certificado, etc.)
- **ProjectContractorCriterion:** OneToMany; tabla de unión que rastrea % completitud por (Proyecto, Contratista, Criterio)
- **ILV Module:** Consume criterios para generar reportes de auditoría y métricas SLA

**Integraciones Externas:**
- Base de datos: Seeds cargadas desde `database.sql` (criterios maestros)
- Frontend: Componentes que usan listado de criterios (dropdown en ILV, tabla en admin)

**APIs/Servicios:**
- `ReportesService.getAuditReport()`: Consume criterios para estructurar salida de Excel
- `ProjectContractorsService`: Valida criterios aplicables al asociar contratista

## 🏗️ Consideraciones Técnicas

### Decisiones de Arquitectura

1. **Eager Loading de DocumentType**
   - Razón: Cada criterio siempre necesita mostrar tipo de doc; evita N+1 queries
   - Implicación: Carga extra en memoria, pero tolerable (~100-200 criterios máximo)
   - Trade-off: Velocidad de lectura vs. huella de memoria

2. **Query Parametrizada para Proyecto+Contratista**
   - Usa `createQueryBuilder()` con `leftJoinAndSelect` en lugar de tres queries separadas
   - Razón: Un único viaje a BD con JOINs múltiples en lugar de 3 round-trips
   - Performance: O(1) latencia de red vs. O(3) sin query optimization

3. **No hay DELETE endpoint público**
   - Criterios son maestros; cambios solo via admin scripts
   - Razón: Mantiene auditoría histórica y evita inconsistencias en reportes pasados
   - Implementación: Protección via `@Roles(Role.ADMIN)` + eventual soft delete via `state` ENUM

4. **Subcriteria Embebido vs. Lazy Load**
   - Actual: Lazy load (relación OneToMany no eager)
   - Razón: Permite query flexible; cuando se necesita subcriteria, se carga explícitamente
   - Trade-off: Latencia adicional si todas las pantallas lo usan; posible optimización futura

### Restricciones de Performance

- **Máximo ~500 criterios:** Query sin paginación; si crece, agregar limit + offset
- **Eager load de documentType:** Si hay mil tipos de doc, causaría cartesian product; actualmente ~20-30 tipos
- **SubCriteria no eager:** Evita explosión de datos al listar criterios (1 criterio × 7 subcriteria × cada sub con docs = problema)

### Riesgos Identificados

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Criterio sin tipo de doc asignado | Media | Constraint NOT NULL en BD + validación en seed script |
| Query lenta en >500 criterios | Media | Agregar índice en `criterion.name`, paginación futura |
| Subcriteria huérfano sin criterio | Alta | Constraint FK ON DELETE RESTRICT en `subcriterion.criterion_id` |
| Frontend cachea criterios, cambios no reflejados | Baja | Versioning de criterios o botón refresh manual |

## 🔐 Seguridad

- **Endpoints lectura:** Sin restricción (datos públicos de auditoría)
- **Endpoints mutación:** Solo `@Roles(Role.ADMIN)` → no implementado aún, requiere control de acceso
- **CRUD Create/Update/Delete:** Fuera del scope actual; cambios = manual SQL scripts

## 🚀 Roadmap

### Mejoras Futuras

1. **Versionado de Criterios** (Q3 2024)
   - Tabla `criterion_version` con `valid_from` / `valid_to`
   - Permite auditoría de qué criterios se usaron en cada proyecto históricamente

2. **Criterios Dinámicos por Tipo de Proyecto** (Q3 2024)
   - Agregar atributo `project_type` (minería, vías, energía, agua)
   - Query `/criterion?project_type=mineria` retorna solo criterios relevantes
   - Reduce cognitive load en UI

3. **Índices de BD** (Q2 2024)
   - Index en `criterion.name` para búsqueda rápida
   - Index en `criterion_id + document_type_id` para join optimization

4. **API GraphQL Alternativa** (Q4 2024)
   - Endpoint GraphQL para queries flexibles
   - Permite frontend solicitar solo campos necesarios (name, documentType.id, subcriteria.count)

5. **Caché con Redis** (Q3 2024)
   - Cache criterios por 1 hora
   - Invalidación on deploy de cambios maestros
   - Latencia P95 de 10ms garantizada

6. **UI de Administración Criterios** (Q4 2024)
   - Interfaz admin para crear/editar criterios sin SQL
   - Validaciones en tiempo real
   - Audit log de cambios

7. **Búsqueda Full-Text** (Q4 2024)
   - Elasticsearch indexing para búsqueda por nombre/descripción
   - Autocompletado en frontend

8. **Export/Import Criterios** (Q3 2024)
   - Excel template para bulk import de criterios nuevos
   - CSV export de catálogo actual

9. **KPIs en Dashboard** (Q4 2024)
   - Widget mostrando cobertura de criterios por proyecto
   - Gráfico de distribución (# subcriteria por criterio)

10. **Rate Limiting en GET** (Q2 2024)
    - 1000 req/min por IP para endpoints públicos
    - Evita scraping de BD

## 📚 Referencias

- Especificación funcional: `MODULO_CRITERION_ESPECIFICACION.md`
- Implementación backend: `MODULO_CRITERION_IMPLEMENTACION_BACKEND.md`
- Código: `backend/src/modules/criterion/`
- Entidad: `backend/src/database/entities/criterion.entity.ts`
- Seed data: `database.sql`

