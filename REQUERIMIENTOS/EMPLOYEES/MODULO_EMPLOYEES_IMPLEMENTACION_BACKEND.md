# Módulo Employees - Implementación Backend

> Detalles técnicos, arquitectura, endpoints, flujos y decisiones en NestJS + TypeORM.

## 🏗️ Arquitectura

### Estructura de Carpetas

```
backend/src/modules/employees/
├── employees.controller.ts           → Endpoints REST (6 métodos)
├── employees.service.ts              → Lógica de negocio (CRUD + recálculo %)
├── employees.module.ts               → DI Container + imports
├── dto/
│   └── employee.dto.ts               → DTO de proyección
└── employees.service.spec.ts         → Tests (vacío)
```

### Entidad Principal

**Archivo:** `backend/src/database/entities/employee.entity.ts`

```typescript
@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  employee_id: number;                            // PK, auto-increment

  @ManyToOne(() => ProjectContractor, (pc) => pc.employees)
  @JoinColumn({ name: 'project_contractor_id' })
  projectContractor: ProjectContractor;           // FK: pertenece a 1 ProjectContractor

  @Column()
  identification: string;                         // Cédula/pasaporte (6-20 chars)

  @Column()
  name: string;                                   // Nombre empleado (3-100 chars)

  @Column()
  position: string;                               // Cargo (albañil, supervisor, etc.)

  @OneToMany(() => Document, (doc) => doc.employee, { nullable: true })
  documents?: Document[];                         // Documentos asociados (si employee_required=true en subcriterion)
}
```

**Decisiones de Diseño:**

| Decisión | Razón | Trade-off |
|---|---|---|
| **Hard delete** | Empleado no es histórico como criterio | Pierde auditoría de "quién estuvo aquí" |
| **FK NO eager** | Permite query flexible | Latencia adicional si siempre necesita proyecto |
| **OneToMany documents nullable** | No todos los empleados tienen docs | Puede quedar inconsistente si employee_required=true pero sin docs |
| **Identification como String** | Flexible para múltiples formatos (cédula, pasaporte) | Sin validación integrada; mejora futura |

---

## 🔌 Endpoints REST

### GET /employees

**Descripción:** Listar todos los empleados del sistema

**Controller:**
```typescript
@Controller('employees')
export class EmployeesController {
  @Get()
  async getEmployees() {
    return this.employeesService.getEmployees();
  }
}
```

**Service:**
```typescript
async getEmployees(): Promise<Employee[] | undefined> {
  return this.employeeRepository.find({
    relations: ['projectContractor'],
  });
}
```

**Flow:**
```
GET /employees
  ↓
employeeRepository.find({ relations: ['projectContractor'] })
  ↓ (SQL)
SELECT e.*, pc.* FROM employee e 
LEFT JOIN project_contractor pc ON e.project_contractor_id = pc.id
  ↓
Array<Employee> with projectContractor hydrated
  ↓
HTTP 200 + JSON array
```

**Respuesta HTTP 200:**
```json
[
  {
    "employee_id": 1,
    "identification": "12345678",
    "name": "Juan Pérez",
    "position": "Albañil",
    "projectContractor": {
      "project_contractor_id": 5,
      "project": 10,
      "contractor": 3
    }
  }
]
```

**Latencia:** <50ms (sin WHERE, full table scan tolerable para <5000 empleados)
**Autenticación:** JWT requerido (cualquier rol)

---

### GET /employees?project_contractor_id=X

**Descripción:** Obtener empleados filtrados por ProjectContractor

**Controller:**
```typescript
@Get('byProjectContractor/:projectContractorId')
async getEmployeesByProjectContractorId(
  @Param('projectContractorId') projectContractorId: number
) {
  return this.employeesService.getEmployeesByProjectContractorId(projectContractorId);
}
```

**Service:**
```typescript
async getEmployeesByProjectContractorId(
  projectContractorId: number
): Promise<EmployeeDto[]> {
  const employees = await this.employeeRepository.find({
    where: {
      projectContractor: {
        project_contractor_id: projectContractorId,
      },
    },
    select: ['employee_id', 'name', 'identification', 'position'],
    relations: ['projectContractor'],
    order: { employee_id: 'ASC' },
  });

  return employees.map((employee) => ({
    employee_id: employee.employee_id,
    name: employee.name,
    identification: employee.identification,
    position: employee.position,
    project_contractor_id: employee.projectContractor?.project_contractor_id,
  }));
}
```

**SQL Generated:**
```sql
SELECT e.employee_id, e.name, e.identification, e.position
FROM employee e
INNER JOIN project_contractor pc ON e.project_contractor_id = pc.id
WHERE pc.project_contractor_id = 5
ORDER BY e.employee_id ASC
```

**Respuesta HTTP 200:**
```json
[
  {
    "employee_id": 1,
    "identification": "12345678",
    "name": "Juan Pérez",
    "position": "Albañil",
    "project_contractor_id": 5
  },
  {
    "employee_id": 2,
    "identification": "87654321",
    "name": "María García",
    "position": "Supervisor",
    "project_contractor_id": 5
  }
]
```

**Latencia:** ~10ms (con índice en project_contractor_id)
**Nota:** DTO proyecta solo 4 campos (select); mantiene respuesta ligera

---

### POST /employees

**Descripción:** Crear nuevo empleado (y recalcular % criterios)

**Controller:**
```typescript
@Post()
async addEmployee(@Body() employeeData: Partial<Employee>) {
  return this.employeesService.addEmployee(employeeData);
}
```

**Service:**
```typescript
async addEmployee(employeeData: Partial<Employee>): Promise<{...}> {
  const projectContractorId = Number(employeeData.projectContractor);

  const projectContractor = await this.projectContractorRepository.findOne({
    where: { project_contractor_id: projectContractorId },
  });

  if (!projectContractor) {
    throw new NotFoundException('Contratista del proyecto no encontrado');
  }

  const newEmployee = this.employeeRepository.create({
    ...employeeData,
    projectContractor,
  });
  
  await this.employeeRepository.save(newEmployee);
  
  // CRITICAL: Recalcular % criterios employee_required
  await this.updatePercentages(projectContractorId);

  return {
    employee_id: newEmployee.employee_id,
    identification: newEmployee.identification,
    name: newEmployee.name,
    position: newEmployee.position,
    project_contractor_id: projectContractor.project_contractor_id,
  };
}
```

**Flow:**
```
POST /employees { name: "Juan", identification: "123", position: "Albañil", projectContractor: 5 }
  ↓
Valida projectContractor_id=5 existe
  ↓ (Si no, throw NotFoundException 404)
CREATE employee row
  ↓
updatePercentages(5) → 100-200ms adicional
  - Query Subcriterion WHERE employee_required=true
  - Para cada criterion: DocumentService.updatePercentageByCriterion(pc_id=5, criterion_id)
  - Recalcula: docs presentes / (num_empleados * docs_requeridos_por_empleado)
  - UPDATE projectContractor.completition_percentage
  ↓
HTTP 201 + JSON creado
```

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "identification": "12345678",
  "position": "Albañil",
  "projectContractor": 5
}
```

**Respuesta HTTP 201:**
```json
{
  "employee_id": 101,
  "name": "Juan Pérez",
  "identification": "12345678",
  "position": "Albañil",
  "project_contractor_id": 5
}
```

**Latencia:** ~500ms (incluye recalcular porcentajes)
**Error HTTP 404:**
```json
{
  "message": "Contratista del proyecto no encontrado",
  "statusCode": 404
}
```

---

### PUT /employees/:id

**Descripción:** Editar empleado existente (y recalcular %)

**Service:**
```typescript
async updateEmployee(
  id: number,
  employeeData: Partial<Employee>,
): Promise<{...}> {
  const existingEmployee = await this.employeeRepository.findOne({
    where: { employee_id: id },
  });

  if (!existingEmployee) {
    throw new NotFoundException('Empleado no encontrado');
  }

  const projectContractorId = Number(employeeData.projectContractor);
  const projectContractor = projectContractorId
    ? await this.projectContractorRepository.findOne({
        where: { project_contractor_id: projectContractorId },
      })
    : existingEmployee.projectContractor;

  if (!projectContractor && projectContractorId) {
    throw new NotFoundException('Contratista del proyecto no encontrado');
  }

  const updatedEmployee = this.employeeRepository.merge(existingEmployee, {
    ...employeeData,
    projectContractor,
  });

  await this.employeeRepository.save(updatedEmployee);

  // Recalcular en AMBOS projectContractors si cambió de contratista
  if (projectContractorId !== existingEmployee.projectContractor.project_contractor_id) {
    await this.updatePercentages(existingEmployee.projectContractor.project_contractor_id);
    await this.updatePercentages(projectContractorId);
  } else {
    await this.updatePercentages(projectContractorId);
  }

  return { employee actualizado };
}
```

**Request Body:**
```json
{
  "name": "Juan Pérez Actualizado",
  "position": "Supervisor",
  "projectContractor": 5
}
```

**Respuesta HTTP 200:**
```json
{
  "employee_id": 101,
  "name": "Juan Pérez Actualizado",
  "position": "Supervisor",
  "project_contractor_id": 5
}
```

**Error HTTP 404:**
```json
{ "message": "Empleado no encontrado" }
```

---

### DELETE /employees/:id

**Descripción:** Eliminar empleado (y recalcular %)

**Service:**
```typescript
async deleteEmployee(id: number): Promise<void> {
  const existingEmployee = await this.employeeRepository.findOne({
    where: { employee_id: id },
    relations: ['projectContractor'],
  });

  if (!existingEmployee) {
    throw new NotFoundException('Empleado no encontrado');
  }

  const projectContractorId = existingEmployee.projectContractor?.project_contractor_id;

  await this.employeeRepository.delete(id);

  // Recalcular % en ProjectContractor afectado
  await this.updatePercentages(projectContractorId);
}
```

**Flow:**
```
DELETE /employees/101
  ↓
Valida empleado existe
  ↓ (Si no, 404)
DELETE FROM employee WHERE employee_id=101
  ↓
updatePercentages(pc_id) → recalcula criterios employee_required
  - Menos empleados = menos docs requeridos
  - % criterios sube (si antes faltaban docs para nuevos empleados)
  - ↓% global si criterios con less employees now have fewer docs
  ↓
HTTP 200
```

**Respuesta HTTP 200:**
```json
{ "message": "Empleado eliminado exitosamente" }
```

**Error HTTP 404:**
```json
{ "message": "Empleado no encontrado" }
```

---

## 📊 Flujos Clave

### Flujo 1: Agregar Empleado y Recalcular %

```
User: POST /employees { ..., projectContractor: 5 }
  ↓
EmployeesService.addEmployee()
  ├─ Valida projectContractor_id=5 existe → ProjectContractorRepository.findOne()
  ├─ INSERT new employee
  └─ updatePercentages(5)
      ├─ Query: Subcriterion WHERE employee_required=true
      │   Result: [subcriterion_A, subcriterion_B]
      ├─ Extract criterions: [criterion_1, criterion_2]
      └─ Para cada criterion:
          └─ DocumentService.updatePercentageByCriterion(pc_id=5, criterion_id)
              ├─ COUNT(*) documentos presentes
              ├─ COUNT(*) documentos requeridos = employees × docs_per_employee
              ├─ % = presentes / requeridos
              └─ UPDATE projectContractorCriterion.completion_percentage
      └─ DocumentService.updatePercentageByProjectContractor(5)
          ├─ Suma % todos criterios
          └─ UPDATE projectContractor.completition_percentage

Result: HTTP 201 + nuevo empleado + % recalculado
```

### Flujo 2: Eliminar Empleado

```
User: DELETE /employees/101
  ↓
EmployeesService.deleteEmployee()
  ├─ Busca empleado 101 + projectContractor_id=5
  ├─ DELETE FROM employee WHERE id=101
  └─ updatePercentages(5)
      ├─ Recalcula criterios employee_required
      ├─ Menos empleados → menos docs requeridos
      ├─ Si antes faltaban docs: % sube
      └─ UPDATE completition_percentage

Result: HTTP 200 + % recalculado
```

### Flujo 3: Listar Empleados por Contratista+Proyecto

```
User: GET /employees?project_contractor_id=5
  ↓
EmployeesService.getEmployeesByProjectContractorId(5)
  ├─ Query: SELECT * FROM employee WHERE project_contractor_id=5 ORDER BY id
  ├─ Map a EmployeeDto (proyección)
  └─ Retorna array

Result: HTTP 200 + array empleados filtered
```

---

## 🔐 Seguridad y Permisos

| Endpoint | GET / | GET /?pc_id | POST | PUT | DELETE |
|---|---|---|---|---|---|
| **Requiere Auth** | ✅ JWT | ✅ JWT | ✅ JWT | ✅ JWT | ✅ JWT |
| **Roles Permitidos** | Todos* | Todos* | Admin, Coord | Admin, Coord | Admin, Coord |
| **Rate Limit** | 1000/min | 1000/min | 50/min | 50/min | 50/min |

*Futura: Restringir a Admin/Coordinador

**Protecciones:**
- JwtAuthGuard protege todos los endpoints
- NotFoundException si FKs no resuelven
- DTO proyecta solo campos necesarios

**Riesgos:**
- ⚠️ Sin validación de identificación única (UNIQUE constraint no existe)
- ⚠️ Sin auditoría de quién agregó/eliminó (mejora futura)
- ⚠️ identification no debe ser público (cédula sensible)

---

## 🔗 Integraciones

### 1. Integración con ProjectContractor

**Relación:** Employee.projectContractor (ManyToOne)

```typescript
// Cuando se crea employee, debe validar FK
const projectContractor = await this.projectContractorRepository.findOne({
  where: { project_contractor_id: projectContractorId }
});
if (!projectContractor) throw new NotFoundException(...);
```

### 2. Integración con DocumentService

**Cuando:** POST/PUT/DELETE employee, recalcular % criterios

```typescript
async updatePercentages(project_contractor_id: number) {
  const subcriterionsWithEmployees = await this.subcriterionRepository.find({
    where: { employee_required: true },
    relations: ['criterion']
  });
  
  const criterions = new Set(
    subcriterionsWithEmployees.map(sc => sc.criterion.criterion_id)
  );
  
  for (const criterion_id of criterions) {
    await this.documentService.updatePercentageByCriterion(
      project_contractor_id,
      criterion_id
    );
  }
  
  await this.documentService.updatePercentageByProjectContractor(
    project_contractor_id
  );
}
```

### 3. Integración con Subcriterion

**Consultado en updatePercentages():** Qué subcriteria requieren documento por empleado

```
Si Subcriterion.employee_required=true:
  → 1 Documento requerido PER empleado
  → Si ProjectContractor tiene N empleados: N × 1 = N docs requeridos
  → % = docs_presentes / N
```

### 4. Integración con Document

**Relación:** Employee.documents (OneToMany)

```typescript
// Documents asociados a este empleado
// Si employee_required=true en subcriterion, documentos se vinculan a employee
// Si employee se elimina: ¿qué pasa con documentos?
// Actual: No specified (posible FK cascade pendiente)
```

---

## 🧪 Pruebas

### Estado Actual

**Archivo:** `backend/src/modules/employees/employees.service.spec.ts`

**Status:** ❌ Vacío

### Tests Necesarios (Priority Order)

#### Unit Tests

**Test 1: getEmployees() retorna array**
```typescript
it('should return all employees', async () => {
  const mockEmployees = [
    { employee_id: 1, name: 'Juan', identification: '123', position: 'Albañil' }
  ];
  
  jest.spyOn(employeeRepository, 'find').mockResolvedValue(mockEmployees);
  
  const result = await service.getEmployees();
  
  expect(result).toEqual(mockEmployees);
});
```

**Test 2: getEmployeesByProjectContractorId() filtra**
```typescript
it('should filter by projectContractorId', async () => {
  const mockEmployees = [{ employee_id: 1, project_contractor_id: 5 }];
  
  jest.spyOn(employeeRepository, 'find').mockResolvedValue(mockEmployees);
  
  const result = await service.getEmployeesByProjectContractorId(5);
  
  expect(result).toEqual(mockEmployees);
});
```

**Test 3: addEmployee() valida FK**
```typescript
it('should throw if projectContractor not found', async () => {
  jest.spyOn(projectContractorRepository, 'findOne').mockResolvedValue(null);
  
  await expect(service.addEmployee({...}))
    .rejects.toThrow(NotFoundException);
});
```

**Test 4: addEmployee() recalcula porcentajes**
```typescript
it('should call updatePercentages after adding employee', async () => {
  const updateSpy = jest.spyOn(service, 'updatePercentages');
  
  await service.addEmployee({...});
  
  expect(updateSpy).toHaveBeenCalledWith(projectContractorId);
});
```

**Test 5: deleteEmployee() recalcula**
```typescript
it('should recalculate percentages after deleting', async () => {
  const updateSpy = jest.spyOn(service, 'updatePercentages');
  
  await service.deleteEmployee(101);
  
  expect(updateSpy).toHaveBeenCalled();
});
```

**Test 6: updatePercentages() consulta criterios + documentService**
```typescript
it('should query employee_required subcriteria and update docs', async () => {
  const updateByCriterionSpy = jest.spyOn(documentService, 'updatePercentageByCriterion');
  
  await service.updatePercentages(5);
  
  expect(updateByCriterionSpy).toHaveBeenCalled();
});
```

#### E2E Tests

**Test 7: POST /employees sin JWT → 403**
```typescript
it('POST /employees without JWT should return 403', async () => {
  await request(app.getHttpServer())
    .post('/employees')
    .send({...})
    .expect(403);
});
```

**Test 8: POST /employees con proyecto inválido → 404**
```typescript
it('POST /employees with invalid projectContractor → 404', async () => {
  await request(app.getHttpServer())
    .post('/employees')
    .set('Authorization', `Bearer ${jwt}`)
    .send({ ..., projectContractor: 999 })
    .expect(404);
});
```

---

## ⚡ Performance Analysis

| Query | SQL | Índices | Est. Time | Nota |
|---|---|---|---|---|
| `getEmployees()` | SELECT * FROM employee | PK | ~50ms | Sin WHERE; full scan |
| `getEmployeesByProjectContractorId(5)` | SELECT * WHERE project_contractor_id=5 | FK | ~10ms | Con índice FK |
| `addEmployee()` + updatePercentages() | INSERT + 2-5 queries recursivas | FK múltiples | ~500ms | Performance crítica; recálculo cascada |
| `deleteEmployee()` + updatePercentages() | DELETE + recálculo | FK | ~300ms | Acceptable |

### Optimizaciones Propuestas

**1. Índices BD (Prioridad Alta)**
```sql
CREATE INDEX idx_employee_project_contractor_id 
  ON employee(project_contractor_id);

CREATE INDEX idx_subcriterion_employee_required 
  ON subcriterion(employee_required) WHERE employee_required=true;
```

**2. Batch Recálculo (Prioridad Media)**
```typescript
// En lugar de recalcular en POST (síncrono, 500ms):
// Agregar a queue, recalcular cada 5 min
await this.queueService.addJob('recalculate-percentages', { project_contractor_id: 5 });
// POST retorna en 50ms
```

**3. Caching de Empleados (Prioridad Baja)**
```typescript
// Cache list de empleados por ProjectContractor
// TTL 30 min; invalida on mutation
```

---

## 📋 Deuda Técnica

| Severidad | Tema | Solución | Esfuerzo |
|---|---|---|---|
| 🔴 Crítica | Hard delete pierde auditoría | Soft delete + employee_audit table | 2h |
| 🟡 Alta | Sin UNIQUE (project_contractor_id, identification) | Agregar constraint | 30m |
| 🟡 Alta | Recalcular síncrono causa 500ms latencia | Batch recalcular en queue | 2h |
| 🟢 Media | Tests vacíos (0% coverage) | Escribir 8 tests | 4h |
| 🟢 Media | Sin validación de identification format | Regex + validación DTO | 1h |
| 🟢 Media | Identification expuesta públicamente | DTO sin identification o masked | 30m |
| 🟢 Media | Sin auditoría de cambios | Tabla employee_audit + triggers | 2h |
| 🟢 Media | Sin notificaciones empleado sin docs | Email alert | 1.5h |

---

## ✅ Checklist de Calidad vs ILV Baseline

- ✅ 5 métodos service codificados + funcionales
- ✅ 5 endpoints REST (GET /, GET /?pc_id, POST, PUT, DELETE)
- ✅ CRUD completo con validaciones
- ✅ Integración con DocumentService para recálculo cascada
- ✅ Lazy loading de ProjectContractor (flexible)
- ⚠️ Tests: 0/8 implementados (vacío)
- ⚠️ Hard delete pierde auditoría
- ⚠️ Sin UNIQUE constraint en identification
- ⚠️ Recalcular síncrono puede causar latencia
- ✅ Deuda técnica identificada y priorizada
- ✅ Integraciones documentadas (ProjectContractor, DocumentService, Subcriterion, Document)
- ✅ Flujos cascada claros (add/delete → recalcular %)

