# Módulo Employees - Resumen Ejecutivo

> Gestión de nóminas de personal asociadas a cada contratista en proyectos. Rastrea empleados, sus documentos de cumplimiento y recalcula automáticamente % de completitud cuando cambia la plantilla.

## 🎯 Objetivo

Mantener un registro centralizado de **empleados asignados a cada contratista en cada proyecto** y gestionar la **relación cascada entre cambios de personal y documentación requerida**. Cuando un empleado se agrega o elimina, el sistema recalcula automáticamente los porcentajes de cumplimiento de los criterios que requieren documentación por empleado.

**Valor de Negocio:**
- Auditoría completa de plantilla de personal (quién trabaja en qué proyecto)
- Automatización de recálculo de cumplimiento (eliminar empleado = ↓% criterios dependientes)
- Trazabilidad de cambios de personal en tiempo real
- Asegura documentación completa por empleado (si criterion.employee_required=true)

## 📊 Alcance

### ✅ Incluye

- **CRUD de Empleados:** Create, Read, Update, Delete
- **Filtrado por ProjectContractor:** Listar empleados de un contratista en un proyecto específico
- **Auto-Recálculo de Cumplimiento:** Al agregar/eliminar, recalcula % de criterios dependent on employee_required
- **Validación de FK:** Empleado debe pertenecer a ProjectContractor existente
- **DTOs de Seguridad:** No expone campos innecesarios (password, etc.)

### ❌ Fuera del Alcance

- Gestión de nómina/salarios (fuera de KAPA)
- Integraciones con HR externos
- Reportes de ausencias/vacaciones
- Validación de cedula con base de datos nacional

## 📈 KPIs y Métricas

| KPI | Fórmula | Target | Descripción |
|---|---|---|---|
| **Cobertura de Empleados** | (# empleados con documentos) / (# empleados total) | ≥90% | % de empleados con docs requeridos (si employee_required=true) |
| **Tiempo Recálculo** | P95 latencia POST /employees | <500ms | Performance después de agregar/eliminar empleado |
| **Densidad de Empleados** | Σ empleados / Σ projectContractors | 3-15 | Promedio de empleados por contratista |
| **Consistencia de % Criterios** | (# criterios con % correcto) / (# criterios auditados) | =100% | Recálculo no introduce errores |

## 🔗 Dependencias

**Módulos Internos:**
- **ProjectContractor:** ManyToOne; cada empleado pertenece a un (Proyecto, Contratista)
- **Documents:** OneToMany; documentos de cumplimiento requeridos si subcriterion.employee_required=true
- **Subcriterion:** Consultado indirectamente; si tiene employee_required=true y employee es nuevo, requiere new doc
- **DocumentService:** Llamado en updatePercentages() para recalcular % de criterios

**Integraciones Externas:**
- Base de datos: Seeds iniciales de empleados (si aplica)
- Frontend: Formularios de agregar/editar empleado; tabla de personal

**APIs/Servicios:**
- `DocumentService.updatePercentageByCriterion()`: Recalcula % para criterio específico
- `DocumentService.updatePercentageByProjectContractor()`: Recalcula % global de projectContractor

## 🏗️ Consideraciones Técnicas

### Decisiones de Arquitectura

1. **Soft Delete vs. Hard Delete**
   - Actual: Hard delete (elimina registro completamente)
   - Razón: Simplifica datos; empleado no es "histórico" como criterio
   - Trade-off: Pierde auditoría de "quién estuvo aquí en X fecha"
   - Mejora futura: Soft delete con `state` ENUM

2. **Recalculo en Post-Delete**
   - Usa `DocumentService.updatePercentages()` tras cada agregar/eliminar
   - Razón: Mantiene % de criterios siempre correctos
   - Performance: Extra 100-200ms por operación (acceptable para cambios infrequentes)
   - Trade-off: Si se agregan 100 empleados en bulk, recálculo corre 100 veces

3. **Lazy Load de ProjectContractor**
   - Relación ManyToOne NOT eager en listar empleados
   - Razón: Permite query flexible; cuando se necesita proyecto/contratista, va en otro join
   - Trade-off: Latencia adicional si lista siempre necesita proyecto info

4. **DTO Proyección**
   - `getEmployeesByProjectContractorId()` retorna DTO projectado (select ['employee_id', 'name', 'identification', 'position'])
   - Razón: No expone campos extra; mantiene respuesta ligera
   - Trade-off: Si frontend necesita más campos, requiere query adicional

### Restricciones de Performance

- **Máximo ~500 empleados por ProjectContractor:** Sin paginación; si excede, agregar limit/offset
- **Recalculo cascada:** Si empleado pertenece a ProjectContractor con 20+ criterios, recalculo toma 1-2 segundos
- **Bulk inserts:** No optimizado; insertar 50 empleados = 50 queries de recalculo

### Riesgos Identificados

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Empleado sin ProjectContractor asignado | Alta | Constraint NOT NULL + validación en service |
| Recálculo cascada O(n) en ProjectContractor grande | Media | Batch recálculo o lazy evaluation |
| Hard delete pierde auditoría | Media | Implementar soft delete futura |
| Empleado duplicado (mismo name + projectContractor) | Baja | Agregar UNIQUE constraint futura |
| Documento requerido sin empleado | Baja | Validación en DocumentService |

## 🔐 Seguridad

- **Endpoints CRUD:** Roles Admin, Coordinador (control via @Roles guard)
- **Campos Sensibles:** `identification` (cédula) no debe exponerse públicamente
- **Auditoría:** No hay log de quién creó/modificó empleado (mejora futura)
- **Soft Delete:** Empleado no se "borra" en producción, solo se marca como inactive (futura implementación)

## 🚀 Roadmap

### Mejoras Futuras

1. **Soft Delete** (Q2 2024)
   - Agregar `state` ENUM ('active'/'inactive') en lugar de hard delete
   - Permite auditoría histórica

2. **Validación de Cédula** (Q3 2024)
   - Integración con sistema de cédulas nacional
   - Previene duplicados con errores de tipeo

3. **Bulk Import** (Q3 2024)
   - Endpoint POST `/employees/bulk-upload` con CSV
   - Agregar 100 empleados en 1 request en lugar de 100

4. **Validación de Categorías** (Q2 2024)
   - Enum de posiciones válidas (albañil, ingeniero, supervisor, etc.)
   - Dropdown en UI en lugar de texto libre

5. **Recálculo Optimizado** (Q3 2024)
   - Queue de cambios; recalcula en batch (cada 5 min) en lugar de inmediato
   - Reduce latencia de insert (de 500ms a 50ms)

6. **Auditoría de Cambios** (Q3 2024)
   - Tabla `employee_audit` con user_id, timestamp, campo_cambiado
   - Permite tracking: "quién agregó empleado X en Y fecha"

7. **Notificaciones** (Q4 2024)
   - Alerts cuando empleado sin documentos requeridos
   - Email a coordinador si employee_required pero sin docs

8. **Validación de Unicidad** (Q2 2024)
   - UNIQUE constraint en (projectContractor_id, identification)
   - Previene empleados duplicados

9. **Reportes de Personal** (Q4 2024)
   - Export CSV de empleados por proyecto
   - Dashboard: # empleados por proyecto, por rol

10. **Integración con Certificados Laborales** (Q4 2024)
    - Enlace a DocumentService para validar cédula/certificado
    - Auto-validación cuando documento se sube

## 📚 Referencias

- Especificación funcional: `MODULO_EMPLOYEES_ESPECIFICACION.md`
- Implementación backend: `MODULO_EMPLOYEES_IMPLEMENTACION_BACKEND.md`
- Código: `backend/src/modules/employees/`
- Entidad: `backend/src/database/entities/employee.entity.ts`
- Integración: `backend/src/modules/documents/documents.service.ts` (updatePercentages)

