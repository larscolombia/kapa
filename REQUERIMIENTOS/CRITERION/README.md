# 📋 Módulo Criterion

Catálogo maestro de criterios de auditoría ILV. Define los estándares de evaluación bajo los cuales se auditan proyectos de construcción.

## 📂 Estructura

- `MODULO_CRITERION_RESUMEN_COMPLETO.md` — Resumen ejecutivo, objetivos, alcance, KPIs y roadmap
- `MODULO_CRITERION_ESPECIFICACION.md` — 5 casos de uso detallados + reglas de negocio + interfaces REST/Frontend
- `MODULO_CRITERION_IMPLEMENTACION_BACKEND.md` — Arquitectura NestJS, endpoints, flujos, seguridad, tests, deuda técnica

## 🚀 Implementación

**Backend:** `backend/src/modules/criterion/`
- `CriterionController` — 2 endpoints GET
- `CriterionService` — 3 métodos: getCriterions(), getCriterionById(), getCriterionsByProjectIdAndContractorID()
- `CriterionModule` — Registra controlador, importa TypeORM + DocumentType

**Frontend:** `frontend/src/pages/`
- Tabla de criterios (futura: AdminCriterionPage.vue)
- Modal de detalles con subcriteria
- Vista ILV con % progreso por criterio (ReportesPage.vue)

**Entidades:** `backend/src/database/entities/criterion.entity.ts`

```typescript
@Entity()
export class Criterion {
  criterion_id: number (PK)
  name: string
  documentType: DocumentType (FK, eager)
  subcriteria: Subcriterion[] (OneToMany, lazy)
  projectContractorCriterions: ProjectContractorCriterion[]
}
```

## 🗄️ Base de Datos

**Tabla `criterion`**
```sql
criterion_id INT PRIMARY KEY AUTO_INCREMENT
name VARCHAR(255) NOT NULL UNIQUE
document_type_id INT NOT NULL (FK → document_type.id)
created_at TIMESTAMP AUTO
updated_at TIMESTAMP AUTO

INDEX idx_criterion_document_type_id (document_type_id)
```

**Seeds iniciales:** `database.sql`
```sql
INSERT INTO criterion (name, document_type_id) VALUES
  ('Estructuras Metálicas', 5),
  ('Soldaduras', 6),
  ('Fundaciones', 7);
```

## 🔌 APIs REST

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/criterion` | Listar todos los criterios | JWT |
| GET | `/criterion/:id` | Obtener criterio por ID | JWT |
| GET | `/criterion?project_id=X&contractor_id=Y` | Criterios por proyecto+contratista | JWT |

## 🔐 Seguridad

✅ **Endpoints de Lectura:**
- JWT requerido (cualquier rol)
- Datos públicos (estándares de auditoría)

⚠️ **A Mejorar:**
- Sin rate limiting → posible scraping de BD
- GET /:id retorna 400 en lugar de 404
- Sin auditoría de queries

## 📊 Dependencias Internas

- **Subcriterion:** Relación 1:N; cada criterio tiene 3-8 subcriteria
- **DocumentType:** ManyToOne eager; tipo de doc requerido
- **ProjectContractorCriterion:** OneToMany; tracking de % completitud
- **ReportesService:** Consume criterios para generar reportes ILV

## 🧪 Testing

**Estado Actual:** ❌ `criterion.service.spec.ts` vacío (0/7 tests)

**Necesarios:**
- getCriterions() retorna array
- getCriterionById() retorna criterio o null
- getCriterionsByProjectIdAndContractorID() filtra correctamente
- E2E: GET /criterion sin JWT → 403
- E2E: GET /criterion/999 → 404

## 📈 Flujos Principales

```
Listar Criterios → GET /criterion → eager load documentType
  ↓
Usuario selecciona criterio
  ↓
GET /criterion/:id → detalles + subcriteria (lazy)
  ↓
Auditor inicia evaluación proyecto+contratista
  ↓
GET /criterion?project_id=1&contractor_id=2 → criterios + % completitud
  ↓
Renderiza tabla: Criterio | DocumentType | Progreso %
```

## 🚨 Deuda Técnica

| Severidad | Tema | Solución |
|---|---|---|
| 🔴 Crítica | Sin rate limiting | Redis throttle |
| 🟡 Alta | Status code 400 en 404 | Lanzar NotFoundException |
| 🟡 Alta | Sin paginación | Implementar limit/offset |
| 🟢 Media | Tests vacíos | Escribir 7 tests (3h) |
| 🟢 Media | Sin cache | Redis 1h TTL |
| 🟢 Media | Query proyecto+contratista lenta | Agregar índices BD |

## 📚 Referencias

- Especificación completa: `MODULO_CRITERION_ESPECIFICACION.md`
- Implementación detallada: `MODULO_CRITERION_IMPLEMENTACION_BACKEND.md`
- Código backend: `backend/src/modules/criterion/`
- Entidad: `backend/src/database/entities/criterion.entity.ts`

