# Módulo Roles - Resumen Ejecutivo

> Catálogo maestro de 5 roles de sistema: Admin, Coordinador, Cliente, Contratista, Empleado. Define permisos y acceso a funcionalidades.

## 🎯 Objetivo

Mantener un registro centralizado de **roles del sistema** que define qué funcionalidades puede acceder cada usuario según su rol asignado. Roles son datos maestros (sin mutations en producción); cambios vía DBA scripts.

**Valor de Negocio:**
- Control de acceso basado en roles (RBAC)
- Separación de responsabilidades (auditor ≠ cliente ≠ contratista)
- Facilita escalabilidad: agregar nuevos roles sin código

## 📊 Alcance

### ✅ Incluye
- **5 Roles Predefinidos:** Admin, Coordinador, Cliente, Contratista, Empleado
- **Lectura de Roles:** GET `/roles` + GET `/roles/:id`
- **Relación con Users:** User.role (ManyToOne); cada usuario tiene 1 rol

### ❌ Fuera del Alcance
- CRUD dinámico de roles (solo seeds/scripts)
- Permisos granulares por endpoint (futuro: ABAC)
- Roles jerárquicos o anidados

## 📈 KPIs

| KPI | Target | Descripción |
|---|---|---|
| **Uptime Roles** | 99.9% | GET /roles siempre disponible (caché si aplica) |
| **Coverage** | =5 | Exactamente 5 roles cargados en BD |
| **Queries N+1** | 0 | Sin lazy loading; roles son simple lookup |

## 🔗 Dependencias

- **Users:** User.role (ManyToOne eager); cada usuario debe tener rol válido
- **Accesos:** Access.role (ManyToOne); define qué endpoints accede cada rol

## 🏗️ Consideraciones Técnicas

- **Datos Maestros:** Roles no cambian en runtime; seeds iniciales
- **No Versionado:** Cambios de roles son raros; no necesita histórico
- **Simple Lookup:** ~5 registros; sin paginación, sin índices complejos

---

## 📚 Referencias

- Especificación: `MODULO_ROLES_ESPECIFICACION.md`
- Implementación: `MODULO_ROLES_IMPLEMENTACION_BACKEND.md`

