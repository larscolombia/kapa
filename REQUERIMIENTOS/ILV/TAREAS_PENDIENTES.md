# ✅ MÓDULO ILV - Lista de Tareas Pendientes

**Fecha:** 13 de Noviembre, 2025  
**Estado General:** 73% completo  
**Crítico:** 3 tareas | **Importante:** 3 tareas | **Mejoras:** 7 tareas

---

## 🔴 TAREAS CRÍTICAS (Sprint 1 - Semana 1)

### ✅ T1.1: Implementar Upload de Adjuntos S3 [2-3 días]
**Prioridad:** ALTA ⚠️ | **Bloqueante:** Sí

**Backend:**
- [ ] Crear `IlvAttachmentsController.ts`
- [ ] POST `/api/ilv/reports/:id/attachments` (upload con multer)
- [ ] DELETE `/api/ilv/reports/:id/attachments/:aid`
- [ ] GET `/api/ilv/reports/:id/attachments/:aid/download` (signed URL)
- [ ] Validar MIME (JPG/PNG/PDF), tamaño (≤5MB), máximo 5 archivos
- [ ] Calcular SHA256 hash para deduplicación
- [ ] Subir a `AWS_BUCKET_NAME` (ya configurado en .env)

**Frontend:**
- [ ] Crear componente `FileUploader.vue` (drag & drop, preview, progress)
- [ ] Integrar en `ILVReportForm.vue` (crear reporte)
- [ ] Integrar en `ILVReportDetail.vue` (ver adjuntos con preview)

**Testing:**
- [ ] Subir JPG válido < 5MB → OK
- [ ] Subir archivo > 5MB → Error 400
- [ ] Subir 6 archivos → Error "máximo 5"
- [ ] Subir .exe → Error "formato no permitido"

---

### ✅ T1.2: Completar ILVClosePublic.vue (Sin Login) [1-2 días]
**Prioridad:** ALTA ⚠️ | **Bloqueante:** Sí

**Frontend:**
- [ ] Diseñar layout **sin MainLayout** (standalone page)
- [ ] Leer token desde `$route.query.token`
- [ ] Llamar backend para obtener datos reporte (readonly)
- [ ] Mostrar: Cliente, Proyecto, Tipo, Descripción hallazgo
- [ ] Formulario cierre:
  - [ ] Textarea `plan_accion` (obligatorio, min 50 caracteres)
  - [ ] Input `evidencia_cierre` (opcional inicialmente)
  - [ ] Botón "Cerrar Reporte"
- [ ] Manejo errores:
  - Token expirado → "Enlace expirado, contacte al administrador"
  - Token usado → "Este reporte ya fue cerrado"
  - Token inválido → "Enlace no válido"
- [ ] Página éxito: "Reporte cerrado exitosamente"

**Backend:**
- [ ] Verificar POST `/api/ilv/close?token=XXX` funciona (ya implementado)

**Testing E2E:**
- [ ] Crear reporte HID → Recibir email → Abrir link → Cerrar → Verificar estado

---

### ✅ T1.3: Decidir Safety Cards vs FDKAR [0.5 días]
**Prioridad:** MEDIA 🔶 | **Bloqueante:** No

**Opciones:**

**A) Renombrar FDKAR → Safety Cards**
- [ ] Actualizar enum: `IlvReportType.FDKAR` → `SAFETY_CARDS`
- [ ] Migración: `UPDATE ilv_report SET tipo='safety_cards' WHERE tipo='fdkar'`
- [ ] Actualizar `FieldMapper.util.ts` config
- [ ] Crear maestro `tipo_tarjeta`: Verde, Amarilla, Roja
- [ ] Actualizar frontend labels

**B) Añadir Safety Cards como 5to tipo** (mantener FDKAR)
- [ ] Añadir `SAFETY_CARDS` al enum
- [ ] Crear nueva config en `FieldMapper`
- [ ] Documentar diferencia FDKAR vs Safety Cards

**C) Solo documentar** (RECOMENDADO)
- [ ] Actualizar README: "FDKAR es la implementación de Safety Cards"
- [ ] No hacer cambios en código

---

## 🔶 TAREAS IMPORTANTES (Sprint 2 - Semana 2)

### T2.1: Completar Campos Específicos HID [2 días]
- [ ] Añadir a `FieldMapper.HAZARD_ID`:
  - `nombre_quien_reporta` (string, required)
  - `nombre_ehs_contratista` (string, optional)
  - `nombre_supervisor_obra` (string, optional)
  - `tipo_reporte_hid` (maestro, required)
- [ ] Crear maestros:
  - `tipo_hid`: "HID Inert Smith", "HID Preventivo", "HID Reactivo"
  - `tipo_hse`: "Seguridad", "Salud", "Medio Ambiente", "Inocuidad", "Daño Propiedad"
- [ ] Actualizar frontend para renderizar nuevos campos

### T2.2: Implementar Maestros Jerárquicos [2 días]
- [ ] Migración: `ALTER TABLE ilv_maestro ADD COLUMN parent_maestro_id INT`
- [ ] Actualizar `IlvMaestrosService`:
  - `getMaestrosTree(tipo)` → retorna estructura árbol
  - `getSubcategorias(categoriaId)`
- [ ] Seed categorías HID:
  ```sql
  -- Categoría: Trabajos en Alturas
  INSERT INTO ilv_maestro (tipo, clave, valor, parent_maestro_id)
  VALUES ('categoria_hid', 'trabajos_alturas', 'Trabajos en Alturas', NULL);
  
  -- Subcategorías
  INSERT INTO ilv_maestro (tipo, clave, valor, parent_maestro_id)
  VALUES 
    ('subcategoria_hid', 'caidas_nivel', 'Caídas a distinto nivel', 1),
    ('subcategoria_hid', 'golpes_objetos', 'Golpes por caída de objetos', 1);
  ```
- [ ] Frontend: Select en cascada Categoría → Subcategoría

### T3.1: Job Automático SLA 5 Días [1 día]
- [ ] Instalar: `npm install @nestjs/schedule`
- [ ] Crear `IlvSchedulerService`:
  ```typescript
  @Cron('0 8 * * *') // Diario 8am
  async checkSlaVencido() {
    const reportes = await this.repo.find({
      where: { estado: 'abierto' },
      relations: ['contractor', 'created_by']
    });
    
    const vencidos = reportes.filter(r => 
      (Date.now() - r.creado_en.getTime()) > 5 * 24 * 3600 * 1000
    );
    
    for (const r of vencidos) {
      await this.notificationService.sendSlaVencidoEmail(r);
      await this.auditRepo.save({ entidad: 'ilv_report', accion: 'sla_vencido', ... });
    }
  }
  ```
- [ ] Integrar en `IlvModule.providers`
- [ ] Testing: Insertar reporte con fecha pasada y ejecutar manualmente

---

## 🟡 MEJORAS (Sprint 3-4 - Semanas 3-4)

### T3.2: Enriquecer Plantillas Email [1 día]
- [ ] Diseñar HTML templates con CSS inline
- [ ] Logo KAPA en header
- [ ] Tabla con todos los campos del reporte
- [ ] Botón CTA destacado con token
- [ ] Footer con contacto

### T4.1: Mejorar UX Formularios [2 días]
- [ ] `ILVReportForm`: Stepper multi-paso
- [ ] Modal previsualización antes de guardar
- [ ] Validación tiempo real con mensajes específicos
- [ ] `ILVReportDetail`: Timeline auditoría visual

### T4.2: Gráficos Estadísticas [2 días]
- [ ] Instalar ApexCharts: `npm install apexcharts vue3-apexcharts`
- [ ] Gráfico torta: Reportes por tipo
- [ ] Gráfico barras: Abiertos vs Cerrados por contratista
- [ ] Gráfico línea: Tendencia últimos 30 días

### T4.3: Ordenamiento Dinámico [0.5 días]
- [ ] Backend: Añadir `sort` a `FilterIlvReportDto`
- [ ] Frontend: Columnas ordenables (click header)

### T5.1: Testing Backend [2 días]
- [ ] Unit tests con Jest
- [ ] Integration tests de endpoints
- [ ] E2E tests flujo completo

### T5.2: Testing Frontend Cypress [2 días]
- [ ] Crear reporte HID completo
- [ ] Subir adjuntos
- [ ] Editar reporte
- [ ] Cerrar vía token

### T5.3: Documentación Final [3 días]
- [ ] README_ILV.md con arquitectura y ejemplos
- [ ] Guía Usuario Final (PDF con screenshots)
- [ ] Guía Administrador (gestión maestros y SLA)

---

## 📊 Resumen de Esfuerzo

| Sprint | Duración | Tareas | Prioridad |
|--------|----------|--------|-----------|
| Sprint 1 | 1 semana | T1.1, T1.2, T1.3 | 🔴 CRÍTICO |
| Sprint 2 | 1 semana | T2.1, T2.2, T3.1 | 🔶 IMPORTANTE |
| Sprint 3 | 1 semana | T3.2, T4.1, T4.2 | 🟡 MEJORAS |
| Sprint 4 | 1 semana | T4.3, T5.1, T5.2 | 🟢 POLISH |
| Sprint 5 | 1 semana | T5.3, Deploy | 🔵 CIERRE |

**Total estimado:** 5 semanas (25 días hábiles)

---

## ✅ Checklist Torvalds Final

Antes de cerrar cada sprint, verificar:

1. **Minimalismo real:** ¿Cada línea tiene propósito? ¿Sin abstracciones innecesarias?
2. **Legibilidad brutal:** ¿Cualquiera entiende el código sin "trucos"?
3. **Consistencia:** ¿Sigue patrones del sistema existente?
4. **Eficiencia:** ¿Sin regresiones de rendimiento? ¿Queries optimizadas?
5. **Robustez:** ¿Errores manejados? ¿Tests cubren casos borde?

---

**Próxima acción inmediata:** Comenzar T1.1 (Upload S3) o T1.2 (ILVClosePublic)

**Última actualización:** 13 de Noviembre, 2025
