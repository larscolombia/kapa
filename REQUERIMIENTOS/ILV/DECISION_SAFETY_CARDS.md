# Decisión: Safety Cards vs FDKAR

**Fecha:** 13 de Noviembre, 2025  
**Decisión:** ✅ Mantener FDKAR (Opción C - Documentar)

---

## Contexto

Durante la implementación del módulo ILV, se identificó una discrepancia entre los requerimientos originales (que mencionaban "Safety Cards") y la implementación actual (que usa "FDKAR").

## Opciones Evaluadas

### Opción A: Renombrar FDKAR → Safety Cards
- **Esfuerzo:** 0.5 días
- **Ventajas:** Fiel a requerimientos originales
- **Desventajas:** Requiere migración de datos existentes

### Opción B: Añadir Safety Cards como 5to tipo
- **Esfuerzo:** 1 día
- **Ventajas:** No afecta FDKAR existente
- **Desventajas:** 5 tipos en lugar de 4, duplicación conceptual

### Opción C: Mantener FDKAR y documentar ⭐ SELECCIONADA
- **Esfuerzo:** 0.1 días
- **Ventajas:** Sin cambios en código, sin riesgo, cero impacto
- **Desventajas:** Requiere documentación clara

---

## Decisión Final

**Mantener FDKAR como está implementado**, reconociendo que FDKAR es la implementación funcional del concepto "Safety Cards" en el sistema KAPA.

### Justificación

1. **Sistema funcional:** FDKAR ya está implementado y funcionando correctamente
2. **Cero riesgo:** No requiere cambios en código ni migraciones
3. **Terminología interna:** FDKAR es el término usado internamente por el equipo
4. **Funcionalidad equivalente:** FDKAR cumple los mismos objetivos que Safety Cards
5. **Prioridad:** Hay funcionalidades más críticas pendientes

### Mapeo Conceptual

```
Safety Cards (concepto requerimientos) = FDKAR (implementación KAPA)
```

**Ambos representan el mismo tipo de reporte:** Registro de hallazgos, desviaciones, actos/condiciones inseguras que requieren clasificación y plan de acción.

---

## Campos FDKAR

Los campos implementados en FDKAR cubren completamente las necesidades de "Safety Cards":

```typescript
{
  required: [
    'quien_reporta',      // Quién identifica la situación
    'clasificacion',      // Tipo de hallazgo
    'descripcion',        // Detalle del hallazgo
    'plan_accion_propuesto' // Acción correctiva
  ],
  optional: [],
  maestros: {
    clasificacion: 'clasificacion_fdkar' // Puede incluir: Acto Inseguro, Condición Insegura, etc.
  },
  close_required: [
    'evidencia_cierre',     // Foto/documento del cierre
    'fecha_implantacion'    // Cuándo se implementó la acción
  ]
}
```

---

## Acciones de Documentación

- [x] Actualizar MODULO_ILV_ESPECIFICACION.md con nota aclaratoria
- [x] Crear este documento DECISION_SAFETY_CARDS.md
- [x] Actualizar README.md del módulo ILV
- [x] Añadir comentario en el código del enum IlvReportType

---

## Revisión Futura (Opcional)

Si en el futuro se requiere cambiar la terminología:

1. **Migration SQL:**
   ```sql
   UPDATE ilv_report SET tipo='safety_cards' WHERE tipo='fdkar';
   ```

2. **Backend:** Renombrar enum value
3. **Frontend:** Actualizar labels
4. **Documentación:** Actualizar especificaciones

**Estimación si se requiere:** 2-3 horas de trabajo + testing

---

**Firmado por:** Equipo de Desarrollo KAPA  
**Estado:** ✅ DECISIÓN CERRADA
