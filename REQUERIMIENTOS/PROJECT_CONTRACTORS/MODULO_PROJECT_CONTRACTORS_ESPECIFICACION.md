# Módulo Project Contractors - Especificación Funcional

## 📋 Casos de Uso (5)

### CU-01: Crear ProjectContractor (Asignar Contratista a Proyecto)

**Flujo:**
1. POST /project-contractors { project_id: 1, contractor_id: 2 }
2. Valida FK ambas existen
3. INSERT + genera ProjectContractorCriterion para cada criterio (completition_percentage = 0)
4. Retorna ProjectContractor creado con % = 0
5. Frontend: muestra contratista agregado con 0% progress

**Validaciones:**
- Proyecto existe
- Contratista existe
- Combinación única (no agregar 2x mismo contractor en proyecto)

---

### CU-02: Obtener ProjectContractors de un Proyecto

**Flujo:**
```
GET /project-contractors?project_id=1
Retorna: [
  {
    project_contractor_id: 50,
    project_id: 1,
    contractor_id: 2,
    completition_percentage: 75,
    contractor: { id: 2, name: "Acme Inc", emails: [...] },
    employees: [ {...}, {...} ],
    projectContractorCriterions: [ {...}, {...} ]
  }
]
```

---

### CU-03: Query Combo: Contratista + Proyecto

**Flujo:**
```
GET /project-contractors/contractor/2/project/1
SELECT pc.*, contractor.*, project.* 
FROM project_contractor pc
INNER JOIN contractor ON pc.contractor_id = contractor.id
INNER JOIN project ON pc.project_id = project.id
WHERE contractor_id = 2 AND project_id = 1
```

---

### CU-04: Actualizar completition_percentage

**Flujo:**
1. Interno: DocumentService.updatePercentageByProjectContractor(pc_id)
2. Recalcula: (% criterio1 + % criterio2 + ...) / # criterios
3. PUT /project-contractors/:id { completition_percentage: 80 }
4. Updates BD

---

### CU-05: Eliminar ProjectContractor (Disociar Contratista)

**Flujo:**
1. DELETE /project-contractors/:id
2. **Validación de Dependencias:**
   - Query: SELECT COUNT(*) FROM employee WHERE project_contractor_id = :id
   - Si > 0: throw error "No se puede eliminar: hay empleados asignados"
   - Query: SELECT COUNT(*) FROM document WHERE project_contractor_id = :id
   - Si > 0: throw error "No se puede eliminar: hay documentos"
3. Si pasa: 
   - DELETE ProjectContractorCriterion (cascade)
   - DELETE ProjectContractor
   - Retorna 200

---

## 🎯 Reglas de Negocio

| Regla | Descripción |
|---|---|
| **RN-01** | ProjectContractor requiere validar FK Project + Contractor |
| **RN-02** | Combinación (project_id, contractor_id) debe ser única |
| **RN-03** | No se puede eliminar si tiene Employee o Document |
| **RN-04** | ProjectContractorCriterion se crea automático (1 por Criterion) |
| **RN-05** | completition_percentage se recalcula automático |
| **RN-06** | Lazy load: Employees, Documents, ProjectContractorCriterions |

---

## 🔌 Interfaces REST

| Endpoint | Método | Descripción |
|---|---|---|
| /project-contractors | GET | Listar todos |
| /project-contractors/:id | GET | Obtener por ID |
| /project-contractors?project_id=X | GET | Filtrar por proyecto |
| /project-contractors/contractor/:contractorId/project/:projectId | GET | Query combo |
| /project-contractors | POST | Crear + generar criterios |
| /project-contractors/:id | PUT | Actualizar % |
| /project-contractors/:id | DELETE | Eliminar (con validación) |

---

## 📊 Validaciones

- project_id: FK válido, requerido
- contractor_id: FK válido, requerido
- completition_percentage: 0-100, requerido (default 0)
- Combinación única: UNIQUE(project_id, contractor_id)

---

## ⚠️ Tareas Pendientes

- [ ] UNIQUE(project_id, contractor_id) constraint
- [ ] Auditoría de cambios (quien agregó/eliminó)
- [ ] Soft delete en lugar de hard delete
- [ ] Email notificación al contratista cuando asignado

