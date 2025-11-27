# Módulo Criterion - Especificación Funcional

> Definición de casos de uso, reglas de negocio e interfaces REST/Frontend para el módulo de Criterios de ILV.

## 📋 Casos de Uso

### CU-01: Listar Todos los Criterios

**Actores:** Admin, Coordinador, Cliente, Contratista

**Precondiciones:**
- Usuario autenticado (JWT válido)
- Base de datos contiene ≥1 criterio

**Flujo Principal:**
1. Usuario accede a pantalla de "Configuración de Criterios" o requiere GET `/criterion`
2. Sistema ejecuta query a tabla `criterion` con eager loading de `documentType`
3. Sistema retorna array de criterios con: id, nombre, documentType.name
4. Frontend renderiza tabla con paginación (opcional: 50 items por página)

**Flujo Alterno A1 - Sin Criterios:**
- Base de datos vacía
- Sistema retorna array vacío `[]`
- Frontend muestra "No hay criterios disponibles"

**Flujo Alterno A2 - Error BD:**
- Query falla (timeout, conexión perdida)
- Sistema captura error, loguea con timestamp
- Retorna HTTP 400 "Error al obtener los criterios"

**Postcondiciones:**
- Lista cacheada localmente en frontend (localStorage de Quasar)
- Cache se invalida cada 1 hora o con F5

**Restricciones:**
- Sin autenticación: 403 Forbidden
- Máximo 500 criterios sin paginación

---

### CU-02: Obtener Criterio por ID

**Actores:** Admin, Coordinador, Cliente, Contratista

**Precondiciones:**
- Usuario autenticado
- Criterio con `criterion_id` = X existe

**Flujo Principal:**
1. Usuario hace click en fila de tabla o accede a `/criterion/:id`
2. Sistema ejecuta GET `/criterion/:criterion_id`
3. Query retorna criterio con eager loading de documentType
4. Sistema retorna objeto con: id, nombre, documentType (id, nombre), subcriteria (count)

**Flujo Alterno A1 - Criterio No Existe:**
- `criterion_id = 999` (no en BD)
- Query devuelve `null`
- Sistema retorna HTTP 404 o criterio vacío
- Frontend muestra error "Criterio no encontrado"

**Postcondiciones:**
- Criterio mostrado en detalle (modal o página dedicada)
- Subcriteria cargados en lazy load (siguiente query)

---

### CU-03: Obtener Criterios por Proyecto + Contratista

**Actores:** Admin, Coordinador, ILV Auditor

**Precondiciones:**
- Usuario autenticado
- Proyecto con `project_id` = X existe
- Contratista con `contractor_id` = Y existe
- Criterios asignados a (Proyecto, Contratista) via `ProjectContractorCriterion`

**Flujo Principal:**
1. Usuario accede a página de "Auditoría ILV" para un proyecto/contratista específico
2. Frontend envía GET `/criterion?project_id=1&contractor_id=2`
3. Backend ejecuta compleja query con QueryBuilder:
   ```
   SELECT criterion.*, documentType.*, projectContractorCriterion.*
   FROM criterion
   LEFT JOIN documentType ON criterion.document_type_id = documentType.id
   LEFT JOIN projectContractorCriterion ON criterion.criterion_id = projectContractorCriterion.criterion_id
   LEFT JOIN projectContractor ON projectContractorCriterion.project_contractor_id = projectContractor.id
   WHERE projectContractor.project_id = 1 AND projectContractor.contractor_id = 2
   ORDER BY criterion.criterion_id ASC
   ```
4. Sistema retorna array de criterios con su % completitud desde ProjectContractorCriterion

**Respuesta Exitosa:**
```json
[
  {
    "criterion_id": 1,
    "name": "Estructuras Metálicas",
    "documentType": { "id": 5, "name": "Acta de Inspección" },
    "projectContractorCriterion": {
      "id": 100,
      "completion_percentage": 85,
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
]
```

**Flujo Alterno A1 - Sin Asignaciones:**
- Query retorna criterios pero `projectContractorCriterion = null`
- Frontend interpreta como 0% completitud

**Postcondiciones:**
- Frontend renderiza tabla con % completitud per criterio

---

### CU-04: Buscar Criterio por Nombre (Implementación Futura)

**Actores:** Admin, Coordinador

**Precondiciones:**
- Usuario autenticado
- Elasticsearch indexado (futura mejora)

**Flujo Principal:**
1. Usuario ingresa texto en buscador: "estructura"
2. Query full-text: `WHERE name LIKE '%estructura%'`
3. Sistema retorna criterios coincidentes

---

### CU-05: Visualizar SubCriteria de un Criterio

**Actores:** Admin, Coordinador, Auditor

**Precondiciones:**
- Usuario seleccionó criterio (CU-02)
- Criterio tiene 1:N relación con Subcriterion

**Flujo Principal:**
1. Sistema ejecuta GET `/subcriterion?criterion_id=1`
2. Query retorna array de subcriteria
3. Frontend renderiza lista jerárquica bajo criterio padre

---

## 🎯 Reglas de Negocio

| Regla | Descripción | Implementación |
|---|---|---|
| **RN-01: Criterio ≥ 1 DocumentType** | Cada criterio debe tener tipo de documento asignado | NOT NULL constraint en `criterion.document_type_id` |
| **RN-02: Criterio ≥ 1 SubCriterio** | Criterio sin subcriteria es inválido | Validación en seed script |
| **RN-03: SubCriteria Ordenado** | Subcriteria tienen orden numérico | Campo `order` INT |
| **RN-04: Unicidad de Nombre** | No pueden existir dos criterios con mismo nombre | UNIQUE constraint en `criterion.name` |
| **RN-05: Criterio Inmutable** | Criterios no se eliminan (son históricos) | No DELETE endpoint público |
| **RN-06: Relación Cascada** | Si criterio se elimina, ProjectContractorCriterion también | ON DELETE CASCADE en FK |

---

## 🔌 Interfaces REST

### GET /criterion
**Listar todos los criterios**

```
GET /criterion HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
[
  {
    "criterion_id": 1,
    "name": "Estructuras Metálicas",
    "documentType": { "id": 5, "name": "Acta de Inspección" }
  }
]
```

---

### GET /criterion/:criterion_id
**Obtener criterio específico**

```
GET /criterion/1 HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
{
  "criterion_id": 1,
  "name": "Estructuras Metálicas",
  "documentType": { "id": 5, "name": "Acta de Inspección" }
}
```

---

### GET /criterion?project_id=X&contractor_id=Y
**Obtener criterios por proyecto + contratista**

```
GET /criterion?project_id=1&contractor_id=2 HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
[
  {
    "criterion_id": 1,
    "name": "Estructuras",
    "projectContractorCriterion": { "completion_percentage": 85 }
  }
]
```

---

## 🎨 Interfaces Frontend

### Tabla de Criterios
- Componente: `AdminCriterionPage.vue` (futuro)
- Columnas: ID, Nombre, DocumentType, # SubCriteria
- Acciones: Ver, Editar*, Eliminar* (*solo Admin)

### Modal de Detalle
- Nombre del criterio
- DocumentType
- SubCriteria listado
- Documentos requeridos

---

## 📊 Validaciones

- `name`: String 3-200 caracteres
- `document_type_id`: Integer FK obligatorio
- Query params: `project_id` y `contractor_id` numbers

---

## ⚠️ Tareas Pendientes

- [ ] Implementar buscar por nombre (LIKE o Elasticsearch)
- [ ] Agregar DELETE endpoint solo Admin
- [ ] Paginación para >500 criterios
- [ ] Cache Redis (1 hora TTL)
- [ ] UI Admin para CRUD criterios
- [ ] Versionado de criterios
- [ ] Filtrado por project_type
- [ ] Rate limiting

