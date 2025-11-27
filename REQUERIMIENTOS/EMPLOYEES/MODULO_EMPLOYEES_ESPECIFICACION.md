# Módulo Employees - Especificación Funcional

> Casos de uso, reglas de negocio e interfaces REST/Frontend para gestión de empleados de contratistas.

## 📋 Casos de Uso

### CU-01: Listar Todos los Empleados

**Actores:** Admin, Coordinador

**Precondiciones:**
- Usuario autenticado con rol Admin o Coordinador
- Base de datos contiene ≥1 empleado

**Flujo Principal:**
1. Usuario accede a pantalla "Gestión de Personal" o requiere GET `/employees`
2. Sistema ejecuta query a tabla `employee` con relación a `projectContractor`
3. Sistema retorna array de empleados con: id, name, identification, position, project_contractor_id
4. Frontend renderiza tabla

**Flujo Alterno A1 - Sin Empleados:**
- BD vacía
- Retorna array vacío `[]`
- Frontend muestra "No hay empleados registrados"

**Postcondiciones:**
- Lista renderizada en tabla con paginación

---

### CU-02: Obtener Empleados por ProjectContractor

**Actores:** Admin, Coordinador, ILV Auditor

**Precondiciones:**
- Usuario autenticado
- ProjectContractor con `project_contractor_id` = X existe

**Flujo Principal:**
1. Usuario accede a detalles de un contratista en proyecto (e.g., projectContractor_id=5)
2. Sistema envía GET `/employees?project_contractor_id=5`
3. Backend ejecuta query con WHERE `projectContractor.project_contractor_id = 5`
4. Retorna array de empleados filtered

**Respuesta Exitosa:**
```json
[
  {
    "employee_id": 1,
    "identification": "12345678",
    "name": "Juan Pérez",
    "position": "Albañil",
    "project_contractor_id": 5
  }
]
```

---

### CU-03: Agregar Nuevo Empleado

**Actores:** Admin, Coordinador

**Precondiciones:**
- Usuario autenticado con permisos
- ProjectContractor existe
- Datos: nombre, cédula, posición

**Flujo Principal:**
1. Usuario abre modal "Agregar Empleado"
2. Completa form: name, identification, position, project_contractor_id
3. Submit POST `/employees`
4. Backend:
   - Valida FK projectContractor existe
   - Crea entry en tabla `employee`
   - Llama `updatePercentages(project_contractor_id)` → recalcula % criterios employee_required=true
5. Retorna empleado creado
6. Frontend actualiza tabla + % progreso

**Validaciones:**
- `name`: 3-100 caracteres, requerido
- `identification`: Formato válido, requerido
- `position`: String 2-50 caracteres, requerido
- `project_contractor_id`: Integer FK válido, requerido

**Flujo Alterno A1 - ProjectContractor No Existe:**
- HTTP 404 "Contratista del proyecto no encontrado"

**Postcondiciones:**
- Empleado insertado
- % criterios recalculados

---

### CU-04: Editar Empleado Existente

**Actores:** Admin, Coordinador

**Precondiciones:**
- Usuario autenticado
- Empleado con `employee_id` = X existe

**Flujo Principal:**
1. Usuario clickea fila de empleado → abre modal de edición
2. Modifica campos: name, position
3. Submit PUT `/employees/:id`
4. Backend valida, merge, recalcula porcentajes
5. Retorna empleado actualizado
6. Frontend actualiza tabla

**Campos Editables:**
- `name`, `position`, `project_contractor_id` (cambiar de contratista)

**Campos NO Editables:**
- `employee_id` (PK), `identification` (única per empleado)

**Postcondiciones:**
- Empleado actualizado
- Porcentajes recalculados

---

### CU-05: Eliminar Empleado

**Actores:** Admin, Coordinador

**Precondiciones:**
- Usuario autenticado
- Empleado existe
- Confirmación del usuario

**Flujo Principal:**
1. Usuario selecciona empleado en tabla
2. Click botón "Eliminar" → confirma "¿Seguro?"
3. Backend DELETE `/employees/:id`
4. Backend:
   - Obtiene project_contractor_id
   - Hard delete del empleado
   - Recalcula porcentajes
5. Frontend actualiza tabla, % progreso

**Flujo Alterno A1 - Empleado No Existe:**
- HTTP 404 "Empleado no encontrado"

**Postcondiciones:**
- Empleado eliminado
- % criterios donde employee_required=true recalculados (↓% porque hay menos empleados)

---

### CU-06: Recalcular Porcentajes tras Cambio de Personal

**Actores:** Sistema (automático)

**Precondiciones:**
- Empleado agregado, modificado o eliminado
- ProjectContractor tiene criterios con employee_required=true

**Flujo Principal:**
1. Service invoca `updatePercentages(project_contractor_id)`
2. Query Subcriterion WHERE employee_required=true
3. Para cada criterion_id:
   - Llama `documentService.updatePercentageByCriterion()`
   - Recalcula: # docs cumplidos / # docs requeridos
4. Recalcula % global de projectContractor
5. BD actualizada

**Ejemplo:**
- ProjectContractor tiene 3 empleados
- Criterion requiere 1 doc/empleado
- Inicialmente: 3 docs requeridos, 3 presentes = 100%
- Agrego 1 empleado (4to):
  - Ahora requiere: 4 docs
  - Si solo 3 presentes: 3/4 = 75%

**Postcondiciones:**
- % actualizado en BD

---

## 🎯 Reglas de Negocio

| Regla | Descripción |
|---|---|
| **RN-01** | Todo empleado debe pertenecer a 1 ProjectContractor válido |
| **RN-02** | Al agregar/editar/eliminar empleado, recalcular % criterios |
| **RN-03** | Identification único por ProjectContractor (futura UNIQUE constraint) |
| **RN-04** | Position obligatorio (NOT NULL) |
| **RN-05** | Name válido: 3-100 caracteres |
| **RN-06** | Recalcular antes de retornar (síncrono) |

---

## 🔌 Interfaces REST

### GET /employees
**Listar todos los empleados**

```
GET /employees HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
[ { empleado1 }, { empleado2 } ]
```

---

### GET /employees?project_contractor_id=X
**Obtener empleados por ProjectContractor**

```
GET /employees?project_contractor_id=5 HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
[ { empleados de ProjectContractor 5 } ]
```

---

### POST /employees
**Crear nuevo empleado**

```
POST /employees HTTP/1.1
Authorization: Bearer <JWT>
Content-Type: application/json

Body:
{
  "name": "Juan Pérez",
  "identification": "12345678",
  "position": "Albañil",
  "projectContractor": 5
}

Response 201:
{
  "employee_id": 101,
  "name": "Juan Pérez",
  "identification": "12345678",
  "position": "Albañil",
  "project_contractor_id": 5
}
```

---

### PUT /employees/:id
**Editar empleado existente**

```
PUT /employees/101 HTTP/1.1
Authorization: Bearer <JWT>

Body:
{
  "name": "Juan Pérez Actualizado",
  "position": "Supervisor",
  "projectContractor": 5
}

Response 200:
{ empleado actualizado }
```

---

### DELETE /employees/:id
**Eliminar empleado**

```
DELETE /employees/101 HTTP/1.1
Authorization: Bearer <JWT>

Response 200:
{ "message": "Empleado eliminado" }
```

---

## 📊 Validaciones

- `name`: String 3-100 caracteres, requerido
- `identification`: String 6-20 caracteres, único por ProjectContractor, requerido
- `position`: String 2-50 caracteres, requerido
- `project_contractor_id`: Integer FK válido, requerido

---

## ⚠️ Tareas Pendientes

- [ ] Bulk upload (CSV)
- [ ] Validación cédula nacional
- [ ] UNIQUE constraint (projectContractor_id, identification)
- [ ] Soft delete con state ENUM
- [ ] Auditoría de cambios
- [ ] Notificaciones empleado sin docs
- [ ] Enum posiciones válidas
- [ ] Recalculo batch (queue)
- [ ] Reportes de personal

