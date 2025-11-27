# Módulo Criterion - Implementación Backend

> Detalles técnicos, arquitectura, endpoints y decisiones de implementación en NestJS + TypeORM.

## 🏗️ Arquitectura

### Estructura de Carpetas

```
backend/src/modules/criterion/
├── criterion.controller.ts        → Endpoints REST (2 métodos)
├── criterion.service.ts           → Lógica de negocio (3 métodos)
├── criterion.module.ts            → DI Container + imports
├── dto/
│   └── query-criterion.dto.ts     → Validación de query params
└── criterion.service.spec.ts      → Suite de tests (vacía)
```

### Entidad Principal

**Archivo:** `backend/src/database/entities/criterion.entity.ts`

```typescript
@Entity()
export class Criterion {
  @PrimaryGeneratedColumn()
  criterion_id: number;                           // PK, auto-increment

  @Column()
  name: string;                                   // Nombre del criterio (ej. "Estructuras Metálicas")

  @ManyToOne(() => DocumentType, (dt) => dt.criteria, { eager: true })
  @JoinColumn({ name: 'document_type_id' })
  documentType: DocumentType;                     // FK eager: qué tipo de doc se requiere

  @OneToMany(() => Subcriterion, (sc) => sc.criterion)
  subcriteria: Subcriterion[];                    // Relación 1:N: 3-8 subcriteria por criterio

  @OneToMany(() => ProjectContractorCriterion, (pcc) => pcc.criterion)
  projectContractorCriterions: ProjectContractorCriterion[];  // Relación 1:N: tracking de cumplimiento
}
```

**Decisiones de Diseño:**

| Decisión | Razón | Trade-off |
|---|---|---|
| **Eager loading de documentType** | Siempre se necesita tipo de doc; evita N+1 queries | +memoria (tolerable: ~100-200 criterios) |
| **Lazy loading de subcriteria** | Permite query flexible; no todos los listados necesitan detalles | +latencia si se accede a subcriteria |
| **OneToMany sin eager para ProjectContractorCriterion** | Evita explosión de datos; se carga explícitamente si necesario | +query adicional cuando se necesita % |
| **FK RESTRICT en document_type_id** | No permite criterio sin tipo de doc | Requiere populated list de DocumentType |

---

## 🔌 Endpoints REST

### GET /criterion

**Descripción:** Listar todos los criterios del sistema

**Controller:**
```typescript
@Controller('criterion')
export class CriterionController {
  @Get('/')
  async getCriterions() {
    try {
      const criterions = await this.CriterionService.getCriterions();
      return criterions;                          // Retorna array directo
    } catch (error) {
      throw new BadRequestException('Error al obtener los criterios');
    }
  }
}
```

**Service:**
```typescript
async getCriterions(): Promise<Criterion[]> {
  return this.criterionRepository.find({
    relations: ['documentType'],                  // Eager load de tipo de doc
  });
}
```

**Flow:**
```
GET /criterion
  ↓
criterionRepository.find({ relations: ['documentType'] })
  ↓ (SQL Query)
SELECT c.*, dt.* FROM criterion c 
LEFT JOIN document_type dt ON c.document_type_id = dt.id
  ↓
Array<Criterion> con documentType hidratado
  ↓
HTTP 200 + JSON array
```

**Respuesta HTTP 200:**
```json
[
  {
    "criterion_id": 1,
    "name": "Estructuras Metálicas",
    "documentType": {
      "id": 5,
      "name": "Acta de Inspección",
      "description": "Documento que acredita inspección de estructuras"
    }
  },
  {
    "criterion_id": 2,
    "name": "Soldaduras",
    "documentType": {
      "id": 6,
      "name": "Certificado de Calidad"
    }
  }
]
```

**Error HTTP 400:**
```json
{
  "message": "Error al obtener los criterios",
  "statusCode": 400,
  "error": "Bad Request"
}
```

**Latencia Esperada:** <50ms (sin WHERE, solo scan + join)
**Paginación:** No implementada (asume <500 criterios; futura mejora: limit/offset)
**Autenticación:** JWT requerido (cualquier rol)

---

### GET /criterion/:criterion_id

**Descripción:** Obtener criterio específico por ID

**Controller:**
```typescript
@Get('/:criterion_id')
async getCriterionById(@Param('criterion_id') criterion_id: number) {
  try {
    const criterion = await this.CriterionService.getCriterionById(criterion_id);
    return criterion;
  } catch (error) {
    throw new BadRequestException('Error al obtener el criterio');
  }
}
```

**Service:**
```typescript
async getCriterionById(criterion_id: number): Promise<Criterion> {
  return this.criterionRepository.findOne({
    where: { criterion_id },
    relations: ['documentType']
  });
}
```

**Flow:**
```
GET /criterion/1
  ↓
criterionRepository.findOne({ where: { criterion_id: 1 }, relations: ['documentType'] })
  ↓ (SQL Query)
SELECT c.*, dt.* FROM criterion c
LEFT JOIN document_type dt ON c.document_type_id = dt.id
WHERE c.criterion_id = 1
  ↓
Criterion | null
```

**Respuesta HTTP 200:**
```json
{
  "criterion_id": 1,
  "name": "Estructuras Metálicas",
  "documentType": {
    "id": 5,
    "name": "Acta de Inspección"
  }
}
```

**Respuesta HTTP 400 (No Encontrado):**
```json
{
  "message": "Error al obtener el criterio",
  "statusCode": 400
}
```

**Nota:** Actualmente retorna error genérico (400) en lugar de 404; mejora futura: diferenciar no existente vs. error BD

---

### GET /criterion?project_id=X&contractor_id=Y

**Descripción:** Obtener criterios aplicables a un proyecto+contratista con % completitud

**Nota:** Endpoint NO IMPLEMENTADO actualmente. Query alternativa vía frontend:
1. GET `/criterion` (todos)
2. GET `/project-contractor-criterion?project_id=X&contractor_id=Y` (percentages)
3. Frontend combina en cliente

**Implementación Propuesta:**

```typescript
async getCriterionsByProjectIdAndContractorID(
  projectId: number,
  contractorId: number
): Promise<any[]> {
  const criterions = await this.criterionRepository
    .createQueryBuilder('criterion')
    .leftJoinAndSelect('criterion.documentType', 'documentType')
    .leftJoinAndSelect(
      'criterion.projectContractorCriterions',
      'projectContractorCriterion',
      'projectContractorCriterion.criterion_id = criterion.criterion_id'
    )
    .leftJoinAndSelect(
      'projectContractorCriterion.projectContractor',
      'projectContractor',
      'projectContractor.project_id = :projectId AND projectContractor.contractor_id = :contractorId',
      { projectId, contractorId }
    )
    .orderBy('criterion.criterion_id', 'ASC')
    .getMany();
    
  return criterions;
}
```

**SQL Generated:**
```sql
SELECT 
  c.criterion_id, c.name, c.document_type_id,
  dt.id, dt.name,
  pcc.id, pcc.completion_percentage,
  pc.id, pc.project_id, pc.contractor_id
FROM criterion c
LEFT JOIN document_type dt ON c.document_type_id = dt.id
LEFT JOIN project_contractor_criterion pcc ON c.criterion_id = pcc.criterion_id
LEFT JOIN project_contractor pc ON pcc.project_contractor_id = pc.id
WHERE pc.project_id = 1 AND pc.contractor_id = 2
ORDER BY c.criterion_id ASC
```

**Respuesta:**
```json
[
  {
    "criterion_id": 1,
    "name": "Estructuras Metálicas",
    "documentType": { "id": 5, "name": "Acta" },
    "projectContractorCriterions": [
      {
        "id": 100,
        "completion_percentage": 85,
        "projectContractor": { "id": 50 }
      }
    ]
  }
]
```

**Latencia:** 50-150ms (múltiples JOINs)
**Índices Necesarios:** 
- PK `criterion.criterion_id`
- FK `project_contractor_criterion.criterion_id`
- FK `project_contractor.project_id, contractor_id`

---

## 📊 Flujos Clave

### Flujo 1: Lectura de Criterios en ILV Audit

```
Frontend: Accede a ILV Audit Page
  ↓
GET /criterion
  ↓ (Backend)
CriterionService.getCriterions()
  ↓
SQL: SELECT c.*, dt.* FROM criterion c LEFT JOIN document_type dt ...
  ↓
Array<Criterion> retornado
  ↓ (Frontend)
Renderiza tabla: Nombre | DocumentType | # SubCriteria
  ↓
Usuario clickea criterio
  ↓
GET /subcriterion?criterion_id=1 (otro módulo)
  ↓
Renderiza modal con detalles
```

### Flujo 2: Obtener Criterios Aplicables a Proyecto+Contratista

```
Frontend: Inicia auditoría de contratista en proyecto X
  ↓
GET /criterion?project_id=1&contractor_id=2
  ↓ (Backend)
QueryBuilder con 3 JOINs
  ↓
SQL retorna criterios + completion_percentage
  ↓ (Frontend)
Renderiza lista con progreso:
  - Criterio A: 85% (barra verde)
  - Criterio B: 40% (barra naranja)
  - Criterio C: 0% (barra roja)
```

### Flujo 3: Búsqueda de Criterio (Futura)

```
Frontend: Usuario tipea "estructura" en buscador
  ↓
GET /criterion/search?q=estructura
  ↓ (Backend - si implementado)
QueryBuilder con WHERE name LIKE '%estructura%'
  ↓
SQL retorna criterios coincidentes
```

---

## 🔐 Seguridad y Permisos

| Endpoint | GET /criterion | GET /:id | GET /?project_id=X | GET /search | POST | PUT | DELETE |
|---|---|---|---|---|---|---|---|
| **Requiere Auth** | ✅ JWT | ✅ JWT | ✅ JWT | ✅ JWT | ✅ Admin | ✅ Admin | ✅ Admin |
| **Roles Permitidos** | Todos | Todos | Todos | Todos | Admin | Admin | Admin |
| **Rate Limit** | 1000/min | 1000/min | 500/min | 500/min | 10/min | 10/min | 5/min |

**Implementación Actual:** Sin validación de rol (todos los roles pueden leer)

**Protecciones:**
- JwtAuthGuard en CriterionController (verificar si está aplicado)
- Datos públicos (criterios de auditoría son no-sensibles)

**Riesgos:**
- ⚠️ Sin rate limiting → posible scraping de BD
- ⚠️ Sin roles explícitos → todos los usuarios ven todos los criterios (podría ser intencional)

**Mejoras Futuras:**
- Redis throttle: 1000 req/min por IP
- Validación de role_id antes de retornar datos
- Auditoría de queries a /criterion?project_id=X (log proyecto accedido)

---

## 🔗 Integraciones

### 1. Integración con DocumentType

**Relación:** Criterion.documentType (ManyToOne eager)

```typescript
// Cuando GET /criterion retorna, documentType siempre presente
{
  criterion_id: 1,
  name: "Estructuras",
  documentType: {
    id: 5,
    name: "Acta de Inspección"
    // ... más campos de DocumentType
  }
}
```

**Dependencia:** DocumentType debe existir; si se elimina, criterio queda huérfano (evitar FK CASCADE aquí)

### 2. Integración con Subcriterion

**Relación:** Criterion.subcriteria (OneToMany, lazy)

```typescript
// Subcriterion service:
async getSubCriterionsByCriterionId(criterion_id: number) {
  return this.subcriterionRepository.find({
    where: { criterion_id },
    order: { order: 'ASC' }
  });
}
```

**Flow:** Cuando usuario ve detalles del criterio, segunda query obtiene subcriteria

### 3. Integración con ProjectContractorCriterion

**Relación:** Criterion.projectContractorCriterions (OneToMany, lazy)

**Cuando se crea ProjectContractor:**
```typescript
// ProjectContractorService pseudocode
async createProjectContractor(projectId, contractorId) {
  // Obtener todos los criterios
  const criterions = await this.criterionService.getCriterions();
  
  // Para cada criterio, crear entry en project_contractor_criterion
  for (const criterion of criterions) {
    await this.projectContractorCriterionService.create({
      projectContractor,
      criterion,
      completion_percentage: 0
    });
  }
}
```

### 4. Integración con ReportesService

**Cuando se genera reporte ILV:**
```typescript
async getAuditReport(projectId, contractorId) {
  // Obtener criterios con progreso
  const criterions = await this.criterionService
    .getCriterionsByProjectIdAndContractorID(projectId, contractorId);
  
  // Cada criterio estructura una sección del reporte
  const reportRows = criterions.map(c => ({
    criterio: c.name,
    tipo_doc: c.documentType.name,
    avance: c.projectContractorCriterions[0]?.completion_percentage || 0
  }));
  
  return generateExcelReport(reportRows);
}
```

---

## 🧪 Pruebas

### Estado Actual

**Archivo:** `backend/src/modules/criterion/criterion.service.spec.ts`

```typescript
describe('CriterionService', () => {
  let service: CriterionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CriterionService],
    }).compile();

    service = module.get<CriterionService>(CriterionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

**Status:** ❌ Solo instanciación; 0 tests funcionales

### Tests Necesarios (Priority Order)

#### Unit Tests (CriterionService)

**Test 1: getCriterions() retorna array**
```typescript
it('should return array of criterions', async () => {
  const mockCriterions = [
    { criterion_id: 1, name: 'Criterio A', documentType: { id: 1, name: 'Acta' } },
    { criterion_id: 2, name: 'Criterio B', documentType: { id: 2, name: 'Cert' } }
  ];
  
  jest.spyOn(criterionRepository, 'find').mockResolvedValue(mockCriterions);
  
  const result = await service.getCriterions();
  
  expect(result).toEqual(mockCriterions);
  expect(criterionRepository.find).toHaveBeenCalledWith({
    relations: ['documentType']
  });
});
```

**Test 2: getCriterionById() retorna criterio o null**
```typescript
it('should return criterion by id', async () => {
  const mockCriterion = { criterion_id: 1, name: 'Criterio A' };
  
  jest.spyOn(criterionRepository, 'findOne').mockResolvedValue(mockCriterion);
  
  const result = await service.getCriterionById(1);
  
  expect(result).toEqual(mockCriterion);
});

it('should return null if criterion not found', async () => {
  jest.spyOn(criterionRepository, 'findOne').mockResolvedValue(null);
  
  const result = await service.getCriterionById(999);
  
  expect(result).toBeNull();
});
```

**Test 3: getCriterionsByProjectIdAndContractorID() con QueryBuilder**
```typescript
it('should return criterions with project+contractor filter', async () => {
  const mockCriterions = [
    {
      criterion_id: 1,
      name: 'Criterio A',
      projectContractorCriterions: [
        { completion_percentage: 85 }
      ]
    }
  ];
  
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(mockCriterions)
  };
  
  jest.spyOn(criterionRepository, 'createQueryBuilder')
    .mockReturnValue(mockQueryBuilder as any);
  
  const result = await service.getCriterionsByProjectIdAndContractorID(1, 2);
  
  expect(result).toEqual(mockCriterions);
  expect(mockQueryBuilder.getMany).toHaveBeenCalled();
});
```

#### E2E Tests (CriterionController)

**Test 4: GET /criterion retorna 200**
```typescript
it('GET /criterion should return 200 with criterions', async () => {
  const response = await request(app.getHttpServer())
    .get('/criterion')
    .set('Authorization', `Bearer ${validJwt}`)
    .expect(200);
    
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body[0]).toHaveProperty('criterion_id');
  expect(response.body[0]).toHaveProperty('documentType');
});
```

**Test 5: GET /criterion/:id retorna 200**
```typescript
it('GET /criterion/1 should return 200 with criterion', async () => {
  const response = await request(app.getHttpServer())
    .get('/criterion/1')
    .set('Authorization', `Bearer ${validJwt}`)
    .expect(200);
    
  expect(response.body).toHaveProperty('criterion_id');
  expect(response.body.criterion_id).toBe(1);
});
```

**Test 6: GET /criterion sin JWT retorna 403**
```typescript
it('GET /criterion without JWT should return 403', async () => {
  await request(app.getHttpServer())
    .get('/criterion')
    .expect(403);
});
```

**Test 7: Query con project_id+contractor_id**
```typescript
it('GET /criterion?project_id=1&contractor_id=2 filters correctly', async () => {
  const response = await request(app.getHttpServer())
    .get('/criterion?project_id=1&contractor_id=2')
    .set('Authorization', `Bearer ${validJwt}`)
    .expect(200);
    
  expect(response.body).toBeInstanceOf(Array);
  // Cada criterio debe tener projectContractorCriterion populate
  response.body.forEach(c => {
    expect(c).toHaveProperty('projectContractorCriterions');
  });
});
```

---

## ⚡ Performance Analysis

### Query Performance

| Query | SQL | Índices Usados | Est. Time | Nota |
|---|---|---|---|---|
| `getCriterions()` | SELECT * FROM criterion LEFT JOIN documentType | PK + FK | ~30ms | Sin WHERE; full table scan tolerable (<500 rows) |
| `getCriterionById(1)` | SELECT * FROM criterion WHERE id=1 LEFT JOIN documentType | PK | ~5ms | Índice PK óptimo |
| `getCriterionsByProjectIdAndContractorID(1,2)` | 3 LEFT JOINs con WHERE | PK + FK múltiples | ~80ms | QueryBuilder no óptimo; agregar covering index |

### Optimizaciones Propuestas

**1. Índices BD (Prioridad Alta)**
```sql
CREATE INDEX idx_criterion_document_type_id 
  ON criterion(document_type_id);

CREATE INDEX idx_pcc_criterion_id 
  ON project_contractor_criterion(criterion_id);

CREATE INDEX idx_pcc_project_contractor_id 
  ON project_contractor_criterion(project_contractor_id);

CREATE INDEX idx_pc_project_contractor 
  ON project_contractor(project_id, contractor_id);
```

**2. Paginación (Prioridad Media)**
```typescript
async getCriterionsPaginated(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;
  return this.criterionRepository.find({
    relations: ['documentType'],
    skip,
    take: limit,
    order: { criterion_id: 'ASC' }
  });
}
```

**3. Caching Redis (Prioridad Media)**
```typescript
async getCriterions(): Promise<Criterion[]> {
  const cached = await this.cacheService.get('all_criterions');
  if (cached) return cached;
  
  const criterions = await this.criterionRepository.find({
    relations: ['documentType']
  });
  
  await this.cacheService.set('all_criterions', criterions, 3600); // 1h TTL
  return criterions;
}
```

---

## 📋 Deuda Técnica

| Severidad | Tema | Solución | Esfuerzo |
|---|---|---|---|
| 🔴 Crítica | Sin rate limiting en GET | Redis throttle middleware | 2h |
| 🟡 Alta | GET /:id retorna 400 en lugar de 404 | Capturar null, lanzar NotFoundException | 30m |
| 🟡 Alta | Sin paginación; asume <500 criterios | Implementar limit/offset | 1h |
| 🟢 Media | Tests vacíos (0% coverage) | Escribir 7 tests (unit + E2E) | 3h |
| 🟢 Media | Sin cache para criterios estáticos | Redis 1h TTL | 1.5h |
| 🟢 Media | Query proyecto+contratista no optimizada | Agregar índices BD + covering queries | 1.5h |
| 🟢 Media | Lazy load subcriteria causa N+1 si accedido siempre | Evaluar eager vs. separada query | 1h |
| 🟢 Media | Sin auditoría de cambios (si DELETE implementado) | Tabla criterion_audit | 2h |
| 🟢 Media | Documentación vacía en algunas propiedades entity | Agregar @ApiProperty comments | 30m |

---

## 🔄 Consideraciones de Mantenibilidad

1. **Cambios en DocumentType:** Si DocumentType se elimina, criterio queda huérfano → implementar FK RESTRICT para evitar
2. **Cambios en Subcriterion:** Si todo subcriterion se elimina, criterio es vacío → validación en UI/service
3. **Cambios en ProjectContractorCriterion:** Si entry se elimina, auditoría se pierde → implementar soft delete (state ENUM)
4. **Escalabilidad:** >1000 criterios → agregar versionado + archivado

---

## ✅ Checklist de Calidad vs ILV Baseline

- ✅ 3 métodos service codificados + funcionales
- ✅ 2 endpoints REST + query parameter versión
- ✅ Eager loading de relación principal (documentType)
- ✅ QueryBuilder para queries complejas (proyecto+contratista)
- ✅ Integración con 4 módulos (Subcriterion, DocumentType, ProjectContractorCriterion, Reportes)
- ⚠️ Tests: 0/7 implementados (vacío)
- ⚠️ Error handling básico (BadRequestException genérico, no diferenciar 404)
- ⚠️ Sin rate limiting público
- ⚠️ Sin auditoría de queries
- ✅ Deuda técnica identificada y priorizada
- ✅ Roadmap de mejoras futuras documentado

