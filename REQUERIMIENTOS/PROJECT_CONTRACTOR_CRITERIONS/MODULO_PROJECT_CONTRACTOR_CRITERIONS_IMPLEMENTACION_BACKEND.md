# Módulo ProjectContractorCriterion - Implementación Backend

## 🏗️ Arquitectura

```
backend/src/modules/project-contractor-criterions/
├── pcc.controller.ts            → 3 endpoints
├── pcc.service.ts               → 3+ métodos (upsert, get)
└── entities/pcc.entity.ts       → Composite key
```

**Entidad:**
```typescript
@Entity()
export class ProjectContractorCriterion {
  id: number (PK)
  projectContractor: ProjectContractor (FK, ManyToOne)
  criterion: Criterion (FK, ManyToOne)
  completion_percentage: number (0-100)
}
// Composite unique: (projectContractor_id, criterion_id)
```

---

## 🔌 Endpoints

### POST /project-contractor-criterions (Upsert)
```typescript
async createOrUpdate(data: {
  projectContractor_id: number;
  criterion_id: number;
  completion_percentage: number;
}) {
  // 1. FIND si existe
  const existing = await pccRepository.findOne({
    where: {
      projectContractor: { project_contractor_id: data.projectContractor_id },
      criterion: { criterion_id: data.criterion_id }
    }
  });
  
  // 2. UPDATE o INSERT
  if (existing) {
    existing.completion_percentage = data.completion_percentage;
    return pccRepository.save(existing);
  } else {
    const newPcc = pccRepository.create({
      projectContractor: { project_contractor_id: data.projectContractor_id },
      criterion: { criterion_id: data.criterion_id },
      completion_percentage: data.completion_percentage
    });
    return pccRepository.save(newPcc);
  }
}
// Time: ~20ms (find) + ~10ms (save) = ~30ms
```

### GET /project-contractor-criterions?project_contractor_id=X
```typescript
async get(projectContractorId: number) {
  return pccRepository.find({
    where: { projectContractor: { project_contractor_id: projectContractorId } },
    relations: ['criterion']
  });
}
// SQL: SELECT pcc.*, c.* FROM project_contractor_criterion pcc
//      INNER JOIN criterion c ...
//      WHERE pcc.project_contractor_id = X
// Time: ~10ms
```

### GET /project-contractor-criterions/contractor/:cid/project/:pid (DTO)
```typescript
async getCompletionPercentage(contractorId, projectId) {
  // Query complicada
  const pccs = await pccRepository
    .createQueryBuilder('pcc')
    .innerJoinAndSelect('pcc.projectContractor', 'pc')
    .innerJoinAndSelect('pc.project', 'project')
    .innerJoinAndSelect('pc.contractor', 'contractor')
    .innerJoinAndSelect('pcc.criterion', 'criterion')
    .where('project.project_id = :projectId', { projectId })
    .andWhere('contractor.contractor_id = :contractorId', { contractorId })
    .getMany();
  
  // Transform a DTO
  return pccs.map(pcc => ({
    criterion: { id: pcc.criterion.id, name: pcc.criterion.name },
    completion_percentage: pcc.completion_percentage
  }));
}
```

---

## 📊 Upsert Pattern

```
Typical Flow:
1. ProjectContractorService.create() → genera pcc entries
   ├─ Para cada Criterion:
   │  └─ ProjectContractorCriterionService.createOrUpdate({
   │      projectContractor_id: 50,
   │      criterion_id: 1,
   │      completion_percentage: 0
   │    })
   └─ RESULT: 15 entries creadas (1 per criterion)

2. DocumentService.updatePercentageByCriterion(pc_id, criterion_id)
   └─ ProjectContractorCriterionService.createOrUpdate({
       projectContractor_id: 50,
       criterion_id: 1,
       completion_percentage: 85 (recalculado)
     })
   └─ RESULT: entry actualizado

3. Frontend: GET /pcc?project_contractor_id=50 → matriz actualizada
```

---

## 🔐 Seguridad

- JWT requerido
- FK validations: ProjectContractor + Criterion deben existir

---

## 📋 Deuda Técnica

| Severidad | Tema | Solución |
|---|---|---|
| 🟡 Alta | Sin UNIQUE(pc_id, criterion_id) | Agregar constraint |
| 🟢 Media | Sin DELETE endpoint | Agregar + controller |
| 🟢 Media | Tests para upsert | 3+ tests |
| 🟢 Media | Batch upsert no soportado | Loop vs. bulk |

---

## ✅ Checklist

- ✅ Upsert pattern implementado
- ✅ 3 endpoints GET (variantes)
- ✅ DTO transformation
- ✅ Cascade DELETE ProjectContractor
- ⚠️ Sin UNIQUE constraint
- ⚠️ Sin DELETE endpoint
- ⚠️ Tests vacíos

