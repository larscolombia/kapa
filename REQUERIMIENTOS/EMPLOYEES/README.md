# 👥 Módulo Employees

Gestión de nóminas de personal asociadas a cada contratista en proyectos. Rastrea empleados, sus documentos de cumplimiento y recalcula automáticamente % de completitud.

## 📂 Estructura

- `MODULO_EMPLOYEES_RESUMEN_COMPLETO.md` — Resumen ejecutivo, objetivos, alcance, KPIs y roadmap
- `MODULO_EMPLOYEES_ESPECIFICACION.md` — 6 casos de uso detallados + reglas de negocio + interfaces REST
- `MODULO_EMPLOYEES_IMPLEMENTACION_BACKEND.md` — Arquitectura NestJS, endpoints, flujos, seguridad, tests, deuda técnica

## 🚀 Implementación

**Backend:** `backend/src/modules/employees/`
- `EmployeesController` — 5 endpoints REST (GET /, GET /?pc_id, POST, PUT, DELETE)
- `EmployeesService` — 6 métodos: CRUD + updatePercentages() (recalcular cascada)
- `EmployeesModule` — Registra controlador, importa TypeORM + ProjectContractor + DocumentService

**Frontend:** `frontend/src/components/`
- Componente EmployeeForm (agregar/editar)
- Tabla de empleados por ProjectContractor
- Modal de confirmación para eliminar

**Entidades:** `backend/src/database/entities/employee.entity.ts`

```typescript
@Entity()
export class Employee {
  employee_id: number (PK)
  identification: string (cédula/pasaporte)
  name: string
  position: string
  projectContractor: ProjectContractor (FK, ManyToOne)
  documents?: Document[] (OneToMany)
}
```

## 🗄️ Base de Datos

**Tabla `employee`**
```sql
employee_id INT PRIMARY KEY AUTO_INCREMENT
identification VARCHAR(20) NOT NULL
name VARCHAR(100) NOT NULL
position VARCHAR(50) NOT NULL
project_contractor_id INT NOT NULL (FK → project_contractor.id)
created_at TIMESTAMP AUTO
updated_at TIMESTAMP AUTO

INDEX idx_employee_project_contractor_id (project_contractor_id)
UNIQUE constraint (project_contractor_id, identification) -- FUTURA
```

**Cascada:**
- Hard delete (actual): elimina empleado
- Soft delete (futura): marca como inactive, audita quién

## 🔌 APIs REST

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/employees` | Listar todos los empleados | JWT |
| GET | `/employees?project_contractor_id=X` | Empleados por ProjectContractor | JWT |
| POST | `/employees` | Crear empleado + recalcular % | JWT |
| PUT | `/employees/:id` | Editar empleado + recalcular % | JWT |
| DELETE | `/employees/:id` | Eliminar empleado + recalcular % | JWT |

## 🔐 Seguridad

✅ **Endpoints Autenticados:**
- JWT requerido en todos los endpoints
- Validación de FK projectContractor

⚠️ **A Mejorar:**
- Sin UNIQUE constraint en (project_contractor_id, identification)
- identification (cédula) no debería ser pública
- Sin auditoría de quién creo/modifico
- Recalcular síncrono causa latencia (500ms)

## 📊 Dependencias Internas

- **ProjectContractor:** ManyToOne; cada empleado pertenece a 1 ProjectContractor
- **Document:** OneToMany; documentos requeridos si subcriterion.employee_required=true
- **Subcriterion:** Consultado en updatePercentages(); define employee_required flag
- **DocumentService:** Llamado en post-CRUD para recalcular % criterios

## 🧪 Testing

**Estado Actual:** ❌ `employees.service.spec.ts` vacío (0/8 tests)

**Necesarios:**
- getEmployees() retorna array
- getEmployeesByProjectContractorId() filtra correctamente
- addEmployee() valida FK projectContractor
- addEmployee() recalcula % (mockear updatePercentages)
- deleteEmployee() recalcula %
- updatePercentages() consulta criterios + documentService
- E2E: POST sin JWT → 403
- E2E: POST con proyecto inválido → 404

## 📈 Flujos Principales

```
Admin abre "Gestión de Personal"
  ↓
GET /employees?project_contractor_id=5 → lista 10 empleados
  ↓
Click "Agregar Empleado"
  ↓
POST /employees { name, identification, position, projectContractor: 5 }
  ↓ Backend recalcula % criterios employee_required=true
  ↓
% completitud sube/baja según documentos presentes
  ↓
Usuario puede editar (PUT) o eliminar (DELETE)
  ↓ Cada operación recalcula %
```

## 🚨 Deuda Técnica

| Severidad | Tema | Solución |
|---|---|---|
| 🔴 Crítica | Hard delete pierde auditoría | Soft delete + employee_audit table |
| 🟡 Alta | Sin UNIQUE (projectContractor_id, identification) | Agregar constraint |
| 🟡 Alta | Recalcular síncrono causa 500ms latencia | Batch recalcular en queue |
| 🟢 Media | Tests vacíos | Escribir 8 tests (4h) |
| 🟢 Media | Identification expuesta públicamente | DTO masked o omitido |
| 🟢 Media | Sin auditoría de cambios | Tabla employee_audit |
| 🟢 Media | Sin validación formato identification | Regex DTO + validator |

## 📚 Referencias

- Especificación completa: `MODULO_EMPLOYEES_ESPECIFICACION.md`
- Implementación detallada: `MODULO_EMPLOYEES_IMPLEMENTACION_BACKEND.md`
- Código backend: `backend/src/modules/employees/`
- Entidad: `backend/src/database/entities/employee.entity.ts`
- Integración: `backend/src/modules/documents/documents.service.ts` (updatePercentages)

