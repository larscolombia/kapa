# Implementación de Categorías y Subcategorías HID

## Resumen

Se implementó exitosamente la estructura jerárquica de categorías y subcategorías para los reportes HID (Identificación de Peligros), con 12 categorías principales y 45 subcategorías distribuidas según las especificaciones del usuario.

## Estado de la Base de Datos

### Categorías Insertadas (12 total)

| ID  | Clave                  | Valor                             | Subcategorías |
|-----|------------------------|-----------------------------------|---------------|
| 108 | trabajos_alturas       | Trabajos en alturas               | 7             |
| 109 | trabajos_caliente      | Trabajos en caliente              | 3             |
| 110 | espacio_confinado      | Trabajos en espacio confinado     | 3             |
| 111 | izaje_cargas           | Trabajos de izaje de cargas       | 2             |
| 112 | trabajos_electricos    | Trabajos eléctricos               | 2             |
| 113 | altas_temperaturas     | Trabajos altas temperaturas       | 1             |
| 114 | maquinaria             | Trabajos con maquinaria           | 2             |
| 115 | otros_alto_riesgo      | Otros trabajos de alto riesgo     | 3             |
| 116 | medio_ambiente         | Medio Ambiente                    | 4             |
| 117 | salud                  | Salud                             | 3             |
| 118 | inocuidad              | Inocuidad                         | 7             |
| 119 | aseguramiento          | Aseguramiento                     | 8             |

### Subcategorías por Categoría

#### 1. Trabajos en alturas (7 subcategorías)
- Caídas a distinto Nivel
- Derrumbe de estructura
- Golpes por caída de objetos
- Atrapamiento
- Uso de EPCC
- Puntos de anclaje
- Sistemas de acceso

#### 2. Trabajos en caliente (3 subcategorías)
- Riesgo de incendio
- Proyección de partículas
- Quemaduras

#### 3. Trabajos en espacio confinado (3 subcategorías)
- Confinamiento-Asfixia
- Atrapamiento
- Golpes

#### 4. Trabajos de izaje de cargas (2 subcategorías)
- Sujeción de carga
- Maniobra

#### 5. Trabajos eléctricos (2 subcategorías)
- Lock Out (Bloqueo y etiquetado)
- Contactos eléctricos

#### 6. Trabajos altas temperaturas (1 subcategoría)
- Tiempos de recuperación

#### 7. Trabajos con maquinaria (2 subcategorías)
- Seguridad Vial
- Daños o Golpes

#### 8. Otros trabajos de alto riesgo (3 subcategorías)
- Trabajos de demolición
- Trabajos de excavación
- Manipulación de residuos

#### 9. Medio Ambiente (4 subcategorías)
- Generación de residuos
- Recolección de residuos
- Canales de evacuación
- Derrame de sustancias

#### 10. Salud (3 subcategorías)
- Uso de EPP adecuado
- Carga de peso
- Manipulación de carga

#### 11. Inocuidad (7 subcategorías)
- Contaminación Cruzada
- Uso de dotación
- Limpieza y desinfección
- Manejo y transporte
- Presencia de plagas
- Manipulador sano
- Presencia de animales domésticos

#### 12. Aseguramiento (8 subcategorías)
- Recepción de mercancía
- Autorizaciones y permisos
- Registro de visitantes
- Uso de carnet
- Elementos de dotación
- Pérdida por robo o incapacidad
- Elementos o documentos extraviados
- Instalaciones adecuadas

## Solución Implementada

### Problema: Columna `parent_maestro_id` No Funcional

Durante la implementación se intentó agregar una columna `parent_maestro_id` para la relación jerárquica, pero PostgreSQL presentó un problema donde:
- `ALTER TABLE` se ejecutaba exitosamente
- La columna aparecía en `\d ilv_maestro`
- Pero los `INSERT` fallaban con "column does not exist"

**Diagnóstico:** Posible problema de caché de prepared statements en psql.

### Solución Alternativa: Campo `aplica_a_tipo`

Se utilizó el campo existente `aplica_a_tipo` para almacenar la relación jerárquica:
- **Categorías:** `aplica_a_tipo` = NULL
- **Subcategorías:** `aplica_a_tipo` = clave de la categoría padre

**Ejemplo:**
```sql
-- Categoría padre
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo) VALUES
('categoria_hid', 'trabajos_alturas', 'Trabajos en alturas', 1, TRUE);

-- Subcategoría hija
INSERT INTO ilv_maestro (tipo, clave, valor, orden, activo, aplica_a_tipo) VALUES
('subcategoria_hid', 'trabajos_alturas_caidas_distinto_nivel', 'Caídas a distinto Nivel', 1, TRUE, 'trabajos_alturas');
```

## Cambios en el Backend

### Archivos Modificados

#### 1. `backend/src/modules/ilv/services/ilv-maestros.service.ts`

**Método `getMaestrosTree()`:**
- Ahora obtiene categorías y sus subcategorías usando `aplica_a_tipo`
- Retorna estructura de árbol con `children` array

**Método `getSubcategoriasByClave()` (NUEVO):**
```typescript
async getSubcategoriasByClave(parentClave: string): Promise<IlvMaestro[]> {
  return this.maestroRepo.find({
    where: { 
      tipo: 'subcategoria_hid',
      aplica_a_tipo: parentClave,
      activo: true 
    },
    order: { orden: 'ASC', valor: 'ASC' },
  });
}
```

**Método `getSubcategorias()` (ACTUALIZADO):**
- Ahora busca el padre por ID, obtiene su `clave`
- Llama a `getSubcategoriasByClave()` para obtener los hijos

#### 2. `backend/src/modules/ilv/controllers/ilv-maestros.controller.ts`

**Endpoint Agregado:**
```typescript
@Get('subcategorias-by-clave/:clave')
async getSubcategoriasByClave(@Param('clave') clave: string) {
  return this.maestrosService.getSubcategoriasByClave(clave);
}
```

## Endpoints Disponibles

### 1. Obtener Árbol Jerárquico
```
GET /api/ilv/maestros/categoria_hid/tree
```
Retorna todas las categorías con sus subcategorías anidadas.

### 2. Obtener Subcategorías por ID de Categoría
```
GET /api/ilv/maestros/subcategorias/:categoriaId
```
Ejemplo: `/api/ilv/maestros/subcategorias/108` (Trabajos en alturas)

### 3. Obtener Subcategorías por Clave de Categoría
```
GET /api/ilv/maestros/subcategorias-by-clave/:clave
```
Ejemplo: `/api/ilv/maestros/subcategorias-by-clave/trabajos_alturas`

## Verificación de Datos

### Query de Verificación
```sql
SELECT 
  c.valor as categoria,
  c.maestro_id as cat_id,
  COUNT(s.maestro_id) as num_subcategorias
FROM ilv_maestro c
LEFT JOIN ilv_maestro s ON s.aplica_a_tipo = c.clave AND s.tipo = 'subcategoria_hid'
WHERE c.tipo = 'categoria_hid'
GROUP BY c.valor, c.maestro_id, c.orden
ORDER BY c.orden;
```

### Resultado Esperado
- 12 categorías
- 45 subcategorías totales
- Cada subcategoría vinculada a su categoría padre mediante `aplica_a_tipo`

## Próximos Pasos

### Frontend (Pendiente)

1. **Actualizar formulario HID** para cargar categorías dinámicamente
2. **Implementar cascada** de subcategorías al seleccionar categoría
3. **Consumir endpoint** `/api/ilv/maestros/categoria_hid/tree`

### Opciones de Implementación

**Opción 1: Dropdown anidado**
```vue
<q-select
  v-model="reportForm.categoria_hid"
  :options="categorias"
  label="Categoría HID *"
  @update:model-value="loadSubcategorias"
/>

<q-select
  v-if="subcategorias.length > 0"
  v-model="reportForm.subcategoria_hid"
  :options="subcategorias"
  label="Subcategoría *"
/>
```

**Opción 2: Tree select**
```vue
<q-tree
  :nodes="categoriasTree"
  node-key="maestro_id"
  v-model:selected="reportForm.subcategoria_hid"
  label-key="valor"
/>
```

### Tareas Opcionales Futuras

1. **Resolver problema de `parent_maestro_id`:**
   - Investigar caché de prepared statements
   - Considerar recrear tabla con FK nativa
   - Migrar de `aplica_a_tipo` a `parent_maestro_id`

2. **Optimizaciones:**
   - Agregar índice en `aplica_a_tipo`
   - Caché de categorías en Redis
   - Lazy loading de subcategorías

## Comandos de Deployment

```bash
# Backend
cd /var/www/kapa.healtheworld.com.co/backend
npm run build
pm2 restart kapa-backend

# Verificar
pm2 logs kapa-backend --lines 20
```

## Estado Actual

✅ **Completado:**
- Base de datos poblada con 12 categorías + 45 subcategorías
- Servicio backend actualizado para usar `aplica_a_tipo`
- Endpoints REST funcionando
- Backend compilado y desplegado

⏳ **Pendiente:**
- Integración con frontend
- Actualizar formulario HID para usar nueva estructura
- Pruebas E2E de cascada de selects

## Fecha de Implementación

20 de Noviembre de 2025
