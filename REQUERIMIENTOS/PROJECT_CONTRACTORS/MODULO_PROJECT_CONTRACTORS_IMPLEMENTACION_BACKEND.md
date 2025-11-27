# Módulo Project Contractors - Implementación Backend

## 🏗️ Arquitectura

```
backend/src/modules/project-contractors/
├── project-contractors.controller.ts  → 7 endpoints
├── project-contractors.service.ts     → 7+ métodos (CRUD + query variants)
└── entities/project-contractor.entity.ts
```

**Entidad:**
```typescript
@Entity()
export class ProjectContractor {
  project_contractor_id: number (PK)
  project: Project (FK, eager)
  contractor: Contractor (FK + nested emails)
  completition_percentage: number (0-100)
  employees: Employee[] (1:N)
  documents: Document[] (1:N)
  projectContractorCriterions: ProjectContractorCriterion[] (1:N, cascade)
}
```

---

## 🔌 Endpoints & Code

### POST /project-contractors (Crear)
```typescript
async createProjectContractor(data: { project_id, contractor_id }) {
  // 1. Validar FK
  const project = await projectRepo.findOne({ project_id });
  const contractor = await contractorRepo.findOne({ contractor_id });
  if (!project || !contractor) throw NotFoundException(...);
  
  // 2. INSERT ProjectContractor
  const pc = projectContractorRepo.create({
    project, contractor, completition_percentage: 0
  });
  await projectContractorRepo.save(pc);
  
  // 3. Crear ProjectContractorCriterion para CADA criterio
  const criterions = await criterionService.getCriterions();
  for (const c of criterions) {
    await pccRepo.create({ projectContractor: pc, criterion: c, completion_percentage: 0 });
  }
  
  return pc; // HTTP 201
}
```

### GET /project-contractors?project_id=X (Filter)
```typescript
async getContractorsByProject(projectId: number) {
  return this.projectContractorRepository.find({
    where: { project: { project_id: projectId } },
    relations: ['contractor', 'contractor.emails'], // nested
  });
}
// SQL: SELECT pc.*, c.*, e.* FROM project_contractor pc
//      LEFT JOIN contractor c ... LEFT JOIN contractor_emails e ...
//      WHERE pc.project_id = X
// Time: ~50ms
```

### GET /project-contractors/contractor/:contractorId/project/:projectId (Combo Query)
```typescript
async getProjectContractorByContractorIdAndProjectId(contractorId, projectId) {
  return this.projectContractorRepository.createQueryBuilder('projectContractor')
    .innerJoinAndSelect('projectContractor.contractor', 'contractor')
    .leftJoinAndSelect('contractor.emails', 'email')
    .innerJoinAndSelect('projectContractor.project', 'project')
    .where('contractor.contractor_id = :contractorId', { contractorId })
    .andWhere('project.project_id = :projectId', { projectId })
    .getOne();
  // 3 JOINs, 2 conditions
  // Time: ~50ms
}
```

### DELETE /project-contractors/:id (Validar Dependencias)
```typescript
async deleteProjectContractor(projectContractorId) {
  // 1. Validar no hay empleados
  const employees = await employeeRepo.find({
    where: { projectContractor: { project_contractor_id: projectContractorId } }
  });
  if (employees.length > 0) throw Error("No se puede eliminar: hay empleados");
  
  // 2. Validar no hay documentos
  const documents = await documentRepo.find({
    where: { projectContractor: { project_contractor_id: projectContractorId } }
  });
  if (documents.length > 0) throw Error("No se puede eliminar: hay documentos");
  
  // 3. DELETE (ProjectContractorCriterion cascade via FK)
  await projectContractorRepo.delete(projectContractorId);
  return { message: "Deleted" }; // HTTP 200
}
```

---

## 📊 Performance

| Query | Índices | Est. Time |
|---|---|---|
| Crear + generar criterios | FK múltiples | ~200ms (loop criterios) |
| getContractorsByProject(X) | project_id FK | ~50ms |
| Query combo contractor+project | PK + 2x FK | ~50ms |
| Delete con validación | FK + count | ~100ms |

---

## 🔐 Seguridad

- JWT requerido
- Validación de FK Project + Contractor
- Pre-DELETE check: Employees + Documents bloquean eliminación

---

## 📋 Deuda Técnica

| Severidad | Tema | Solución |
|---|---|---|
| 🟡 Alta | Sin UNIQUE(project_id, contractor_id) | Agregar constraint |
| 🟢 Media | Hard delete | Soft delete (state ENUM) |
| 🟢 Media | Sin auditoría | Tabla pc_audit |
| 🟢 Media | Tests vacíos | 5+ tests |

---

## ✅ Checklist

- ✅ 7 endpoints REST
- ✅ CRUD completo
- ✅ QueryBuilder con 3 JOINs
- ✅ Validación de dependencias pre-DELETE
- ✅ Integración: genera ProjectContractorCriterion automático
- ⚠️ Tests vacíos
- ⚠️ Sin UNIQUE constraint

