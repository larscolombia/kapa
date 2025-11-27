<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-8 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Crear Nuevo Reporte ILV</div>
            <p class="text-grey-6">Selecciona el tipo de reporte que deseas crear</p>
          </q-card-section>
          
          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Selector de tipo de reporte -->
              <q-select
                v-model="reportForm.tipo"
                :options="reportTypes"
                option-value="value"
                option-label="label"
                label="Tipo de Reporte *"
                filled
                emit-value
                map-options
                @update:model-value="onTipoChange"
                :rules="[val => !!val || 'Tipo es requerido']"
              >
                <template v-slot:option="{ opt, itemProps }">
                  <q-item v-bind="itemProps">
                    <q-item-section avatar>
                      <q-icon :name="opt.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Campos dinámicos según tipo -->
              <div v-if="reportForm.tipo">
                <div v-for="field in dynamicFields" :key="field.key">
                  <!-- Campo de texto -->
                  <q-input
                    v-if="field.type === 'text'"
                    v-model="reportForm.campos[field.key]"
                    :label="field.label + (field.required ? ' *' : '')"
                    filled
                    :disable="field.disabled"
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  />

                  <!-- Campo de fecha -->
                  <q-input
                    v-else-if="field.type === 'date'"
                    v-model="reportForm.campos[field.key]"
                    :label="field.label + (field.required ? ' *' : '')"
                    filled
                    type="date"
                    :disable="field.disabled"
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  />

                  <!-- Campo de tiempo -->
                  <q-input
                    v-else-if="field.type === 'time'"
                    v-model="reportForm.campos[field.key]"
                    :label="field.label + (field.required ? ' *' : '')"
                    filled
                    type="time"
                    :disable="field.disabled"
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  />

                  <!-- Campo de selección estándar -->
                  <q-select
                    v-else-if="field.type === 'select'"
                    v-model="reportForm.campos[field.key]"
                    :options="field.options"
                    :label="field.label + (field.required ? ' *' : '')"
                    filled
                    emit-value
                    map-options
                    :disable="field.disabled"
                    @update:model-value="field.key === 'cliente' ? onClienteChange($event) : null"
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  />

                  <!-- Campo de selección dependiente (proyecto, empresa por cliente) -->
                  <q-select
                    v-else-if="field.type === 'select-dependent'"
                    v-model="reportForm.campos[field.key]"
                    :options="field.options || []"
                    :label="field.label + (field.required ? ' *' : '')"
                    filled
                    emit-value
                    map-options
                    :disable="!reportForm.campos[field.dependsOn]"
                    :hint="!reportForm.campos[field.dependsOn] ? 'Seleccione primero el cliente' : ''"
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  />

                  <!-- Campo de selección jerárquico (categoría padre) -->
                  <q-select
                    v-else-if="field.type === 'select-hierarchical'"
                    v-model="reportForm.campos[field.key]"
                    :options="field.options"
                    :label="field.label + (field.required ? ' *' : '')"
                    filled
                    emit-value
                    map-options
                    @update:model-value="onCategoriaChange(field.key)"
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  >
                    <template v-slot:prepend>
                      <q-icon name="folder" />
                    </template>
                  </q-select>

                  <!-- Campo de selección jerárquico hijo (subcategoría) -->
                  <q-select
                    v-else-if="field.type === 'select-hierarchical-child'"
                    v-model="reportForm.campos[field.key]"
                    :options="field.options || []"
                    :label="field.label + (field.required ? ' *' : '')"
                    filled
                    emit-value
                    map-options
                    :disable="!reportForm.campos[field.parentKey]"
                    :hint="!reportForm.campos[field.parentKey] ? 'Seleccione primero la categoría' : ''"
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  >
                    <template v-slot:prepend>
                      <q-icon name="subdirectory_arrow_right" />
                    </template>
                  </q-select>

                  <!-- Campo de textarea -->
                  <q-input
                    v-else-if="field.type === 'textarea'"
                    v-model="reportForm.campos[field.key]"
                    :label="field.label + (field.required ? ' *' : '')"
                    type="textarea"
                    rows="3"
                    filled
                    :disable="field.disabled"
                    :hint="field.disabled ? 'Solo editable cuando el estado es Abierto' : ''"
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  />

                  <!-- Campo de archivo múltiple con drag & drop -->
                  <div v-else-if="field.type === 'file-multiple'" class="q-mb-md">
                    <div class="text-subtitle2 q-mb-sm">
                      {{ field.label }}{{ field.required ? ' *' : '' }}
                    </div>
                    
                    <!-- Zona de drag & drop -->
                    <div 
                      class="file-drop-zone"
                      :class="{ 'drag-over': isDragging[field.key] }"
                      @dragover.prevent="isDragging[field.key] = true"
                      @dragleave.prevent="isDragging[field.key] = false"
                      @drop.prevent="handleFileDrop($event, field)"
                      @click="$event.currentTarget.querySelector('input[type=file]').click()"
                    >
                      <input 
                        type="file" 
                        :data-field="field.key"
                        :accept="field.accept || 'image/*'"
                        multiple
                        style="display: none"
                        @change="handleFileSelect($event, field)"
                      />
                      
                      <div class="drop-zone-content">
                        <q-icon name="cloud_upload" size="48px" color="primary" />
                        <div class="text-h6 q-mt-sm">Arrastra archivos aquí</div>
                        <div class="text-caption text-grey-6">o haz clic para seleccionar</div>
                        <div class="text-caption text-grey-5 q-mt-xs">
                          Máximo {{ field.maxFiles || 5 }} archivos de {{ formatBytes(field.maxSize || 5242880) }} cada uno
                        </div>
                      </div>
                    </div>
                    
                    <!-- Lista de archivos seleccionados -->
                    <div v-if="reportForm.campos[field.key]?.length > 0" class="q-mt-md">
                      <div class="text-subtitle2 q-mb-sm">
                        Archivos seleccionados ({{ reportForm.campos[field.key].length }})
                      </div>
                      <q-list bordered separator class="rounded-borders">
                        <q-item 
                          v-for="(file, index) in reportForm.campos[field.key]" 
                          :key="index"
                          class="file-item"
                        >
                          <q-item-section avatar>
                            <q-avatar color="primary" text-color="white" icon="image" />
                          </q-item-section>
                          
                          <q-item-section>
                            <q-item-label>{{ file.name }}</q-item-label>
                            <q-item-label caption>{{ formatBytes(file.size) }}</q-item-label>
                          </q-item-section>
                          
                          <q-item-section side>
                            <q-btn 
                              flat 
                              round 
                              dense 
                              icon="close" 
                              color="negative"
                              @click="removeFile(field.key, index)"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <div class="row q-mt-lg">
                <q-space />
                <q-btn 
                  flat 
                  label="Cancelar" 
                  color="grey" 
                  @click="$router.push({ name: 'ilvDashboard' })"
                  class="q-mr-sm"
                />
                <q-btn 
                  type="submit" 
                  label="Crear Reporte" 
                  color="primary"
                  :loading="loading"
                  :disable="!reportForm.tipo"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ilvService from 'src/services/ilvService'

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const loadingProyectos = ref(false)
const loadingContratistas = ref(false)
const maestros = ref({})
const subcategorias = ref({})
const proyectos = ref([])
const contratistas = ref([])
const proyectosPorCliente = ref({})
const contratistasPorCliente = ref({})

const reportForm = ref({
  tipo: '',
  proyecto_id: null,
  cliente_id: null,
  empresa_id: null,
  campos: {}
})

const reportTypes = [
  { value: 'hazard_id', label: 'Identificación de Peligros (HID)', icon: 'warning' },
  { value: 'wit', label: 'Walk & Talk (W&T)', icon: 'directions_walk' },
  { value: 'swa', label: 'Stop Work Authority (SWA)', icon: 'stop' },
  { value: 'fdkar', label: 'Safety Cards', icon: 'credit_card' }
]

const fieldConfigs = {
  hazard_id: [
    { key: 'fecha', label: 'Fecha', type: 'date', required: true },
    { key: 'cliente', label: 'Cliente (Centro de Trabajo)', type: 'select', required: true, masterType: 'centro_trabajo' },
    { key: 'proyecto', label: 'Proyecto', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'empresa_pertenece', label: 'Seleccione la empresa a la que pertenece', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'nombre_quien_reporta', label: 'Nombre de quien reporta', type: 'text', required: true },
    { key: 'tipo_reporte', label: 'Tipo de reporte', type: 'select', required: true, masterType: 'tipo_reporte_hid' },
    { key: 'empresa_genera_reporte', label: 'Empresa a quien se le genera el reporte', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'nombre_ehs_contratista', label: 'Nombre EHS del contratista', type: 'text', required: true },
    { key: 'nombre_supervisor_obra', label: 'Nombre Supervisor obra del contratista', type: 'text', required: true },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, masterType: 'tipo_hallazgo' },
    { key: 'categoria', label: 'Categoría', type: 'select-hierarchical', required: true, masterType: 'categoria_hid', hierarchical: true },
    { key: 'subcategoria', label: 'Subcategorías', type: 'select-hierarchical-child', required: true, parentKey: 'categoria' },
    { key: 'descripcion_hallazgo', label: 'Descripción de hallazgo (¿Qué pasó? ¿Dónde pasó? ¿Qué procedimiento se incumplió?)', type: 'textarea', required: true },
    { key: 'descripcion_cierre', label: 'Descripción de cierre (¿Qué acciones se tomaron? ¿Qué acuerdos se generaron?)', type: 'textarea', required: false },
    { key: 'registro_fotografico', label: 'Registro Fotográfico del hallazgo', type: 'file-multiple', required: false, maxFiles: 5, maxSize: 5242880, accept: 'image/jpeg,image/png' },
    { key: 'estado', label: 'Estado', type: 'select', required: true, masterType: 'estado_reporte' },
    { key: 'observacion', label: 'Observación', type: 'textarea', required: false, disableWhen: { field: 'estado', value: 'cerrado' } }
  ],
  wit: [
    { key: 'fecha', label: 'Fecha', type: 'date', required: true },
    { key: 'cliente', label: 'Cliente (Centro de Trabajo)', type: 'select', required: true, masterType: 'centro_trabajo' },
    { key: 'proyecto', label: 'Proyecto', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'empresa_pertenece', label: 'Seleccione la empresa a la que pertenece', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'nombre_quien_reporta', label: 'Nombre de quien reporta', type: 'text', required: true },
    { key: 'empresa_genera_reporte', label: 'Empresa a quien se le genera el reporte', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, masterType: 'tipo_wit_hallazgo' },
    { key: 'conducta_observada', label: 'Descripción de la conversación sostenida', type: 'textarea', required: true },
    { key: 'recomendacion', label: 'Describa el plan de acción generado o compromisos', type: 'textarea', required: true },
    { key: 'estado', label: 'Estado', type: 'select', required: true, masterType: 'estado_reporte' },
    { key: 'observacion', label: 'Observación', type: 'textarea', required: false, disableWhen: { field: 'estado', value: 'cerrado' } }
  ],
  swa: [
    { key: 'fecha', label: 'Fecha', type: 'date', required: true },
    { key: 'cliente', label: 'Cliente (Centro de Trabajo)', type: 'select', required: true, masterType: 'centro_trabajo' },
    { key: 'proyecto', label: 'Proyecto', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'empresa_pertenece', label: 'Seleccione la empresa a la que pertenece', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'nombre_quien_reporta', label: 'Nombre de quien reporta', type: 'text', required: true },
    { key: 'empresa_genera_reporte', label: 'Empresa a quien se le genera el reporte', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'nombre_ehs_contratista', label: 'Nombre EHS del contratista', type: 'text', required: true },
    { key: 'nombre_supervisor_obra', label: 'Nombre Supervisor obra del contratista', type: 'text', required: true },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, masterType: 'tipo_swa_hallazgo' },
    { key: 'tipo_swa', label: 'Tipo de SWA', type: 'select', required: true, masterType: 'tipo_swa' },
    { key: 'hora_inicio_parada', label: 'Hora de inicio de la detención', type: 'time', required: true },
    { key: 'hora_reinicio', label: 'Hora de reinicio de la actividad', type: 'time', required: true },
    { key: 'descripcion_hallazgo', label: 'Descripción de hallazgo (¿Qué pasó? ¿Dónde pasó? ¿Qué procedimiento se incumplió?)', type: 'textarea', required: true },
    { key: 'descripcion_cierre', label: 'Descripción de cierre (¿Qué acciones se tomaron? ¿Qué acuerdos se generaron?)', type: 'textarea', required: true },
    { key: 'estado', label: 'Estado', type: 'select', required: true, masterType: 'estado_reporte' },
    { key: 'observacion', label: 'Observación', type: 'textarea', required: false, disableWhen: { field: 'estado', value: 'cerrado' } }
  ],
  fdkar: [
    { key: 'fecha', label: 'Fecha', type: 'date', required: true },
    { key: 'cliente', label: 'Cliente (Centro de Trabajo)', type: 'select', required: true, masterType: 'centro_trabajo' },
    { key: 'proyecto', label: 'Proyecto', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'nombre_quien_reporta', label: 'Nombre de quien reporta', type: 'text', required: true },
    { key: 'empresa_genera_reporte', label: 'Empresa a quien se le genera el reporte', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'tipo_tarjeta', label: 'Tipo de tarjeta', type: 'select', required: true, masterType: 'tipo_tarjeta' },
    { key: 'descripcion_hallazgo', label: 'Descripción de hallazgo (¿Qué pasó? ¿Dónde pasó? ¿Qué procedimiento se incumplió?)', type: 'textarea', required: true },
    { key: 'descripcion_cierre', label: 'Descripción de cierre (¿Qué acciones se tomaron? ¿Qué acuerdos se generaron?)', type: 'textarea', required: true },
    { key: 'estado', label: 'Estado', type: 'select', required: true, masterType: 'estado_reporte' },
    { key: 'observacion', label: 'Observación', type: 'textarea', required: false, disableWhen: { field: 'estado', value: 'cerrado' } }
  ]
}

const dynamicFields = computed(() => {
  if (!reportForm.value.tipo) return []
  
  return fieldConfigs[reportForm.value.tipo]
    .filter(field => {
      // Filtrar campos condicionales (ahora solo aplica a conditional, no a disableWhen)
      if (field.conditional) {
        const conditionFieldValue = reportForm.value.campos[field.conditional.field]
        // Para campo estado, comparar con la clave del maestro seleccionado
        if (field.conditional.field === 'estado') {
          const estadoMaestro = maestros.value['estado_reporte']?.find(m => m.maestro_id === conditionFieldValue)
          return estadoMaestro?.clave === field.conditional.value
        }
        return conditionFieldValue === field.conditional.value
      }
      return true
    })
    .map(field => {
      // Calcular si debe estar deshabilitado
      let shouldDisable = false
      if (field.disableWhen) {
        const conditionFieldValue = reportForm.value.campos[field.disableWhen.field]
        if (field.disableWhen.field === 'estado') {
          const estadoMaestro = maestros.value['estado_reporte']?.find(m => m.maestro_id === conditionFieldValue)
          shouldDisable = estadoMaestro?.clave === field.disableWhen.value
        } else {
          shouldDisable = conditionFieldValue === field.disableWhen.value
        }
      }
      
      // Maestro estándar
      if (field.masterType && maestros.value[field.masterType]) {
        return {
          ...field,
          disabled: shouldDisable,
          options: maestros.value[field.masterType].map(m => ({
            label: m.valor,
            value: m.maestro_id
          }))
        }
      }
      
      // Subcategoría jerárquica (hijo)
      if (field.type === 'select-hierarchical-child' && field.parentKey) {
        const parentValue = reportForm.value.campos[field.parentKey]
        if (parentValue && subcategorias.value[parentValue]) {
          return {
            ...field,
            disabled: shouldDisable,
            options: subcategorias.value[parentValue].map(m => ({
              label: m.valor,
              value: m.maestro_id
            }))
          }
        }
      }
      
      // Campos dependientes (proyecto y empresas según cliente)
      if (field.type === 'select-dependent' && field.dependsOn === 'cliente') {
        const clienteId = reportForm.value.campos['cliente']
        if (clienteId && field.key === 'proyecto') {
          return {
            ...field,
            disabled: shouldDisable,
            options: proyectosPorCliente.value[clienteId] || []
          }
        }
        if (clienteId && (field.key === 'empresa_genera_reporte' || field.key === 'empresa_pertenece')) {
          return {
            ...field,
            disabled: shouldDisable,
            options: contratistasPorCliente.value[clienteId] || []
          }
        }
      }
      
      return {
        ...field,
        disabled: shouldDisable
      }
    })
})

const onTipoChange = () => {
  reportForm.value.campos = {}
  subcategorias.value = {}
  loadMaestrosForType()
}

const loadMaestrosForType = async () => {
  if (!reportForm.value.tipo) return
  
  const config = fieldConfigs[reportForm.value.tipo]
  const masterTypes = [...new Set(config.filter(f => f.masterType).map(f => f.masterType))]
  
  for (const type of masterTypes) {
    try {
      // Si es jerárquico, usar el endpoint tree
      if (config.find(f => f.masterType === type && f.hierarchical)) {
        const data = await ilvService.getMaestrosTree(type)
        maestros.value[type] = data
      } else {
        const data = await ilvService.getMaestros(type)
        maestros.value[type] = data
      }
    } catch (error) {
      console.error(`Error loading maestros for ${type}:`, error)
    }
  }
}

const onCategoriaChange = async (fieldKey) => {
  const categoriaId = reportForm.value.campos[fieldKey]
  
  if (!categoriaId) {
    // Limpiar subcategoría si se deselecciona la categoría
    const subcategoriaField = fieldConfigs[reportForm.value.tipo].find(
      f => f.type === 'select-hierarchical-child' && f.parentKey === fieldKey
    )
    if (subcategoriaField) {
      reportForm.value.campos[subcategoriaField.key] = null
      subcategorias.value[categoriaId] = []
    }
    return
  }
  
  try {
    // Cargar subcategorías de la categoría seleccionada
    const data = await ilvService.getSubcategorias(categoriaId)
    subcategorias.value[categoriaId] = data
    
    // Limpiar valor de subcategoría al cambiar categoría
    const subcategoriaField = fieldConfigs[reportForm.value.tipo].find(
      f => f.type === 'select-hierarchical-child' && f.parentKey === fieldKey
    )
    if (subcategoriaField) {
      reportForm.value.campos[subcategoriaField.key] = null
    }
  } catch (error) {
    console.error('Error loading subcategorias:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar subcategorías',
      position: 'top'
    })
  }
}

const onClienteChange = async (clienteId) => {
  if (!clienteId) {
    reportForm.value.campos['proyecto'] = null
    reportForm.value.campos['empresa_genera_reporte'] = null
    reportForm.value.campos['empresa_pertenece'] = null
    proyectosPorCliente.value[clienteId] = []
    contratistasPorCliente.value[clienteId] = []
    return
  }
  
  try {
    // Cargar proyectos del cliente
    const { default: projectService } = await import('src/services/projectService')
    const proyectosData = await projectService.getProjectsByClient(clienteId)
    proyectosPorCliente.value[clienteId] = proyectosData.map(p => ({
      label: p.name,
      value: p.project_id
    }))
    
    // Cargar contratistas del cliente
    const { default: contractorService } = await import('src/services/contractorService')
    const contratistasData = await contractorService.getContractorsByClient(clienteId)
    contratistasPorCliente.value[clienteId] = contratistasData.map(c => ({
      label: c.contractor_name || c.name,
      value: c.contractor_id
    }))
    
    // Limpiar selecciones dependientes
    reportForm.value.campos['proyecto'] = null
    reportForm.value.campos['empresa_genera_reporte'] = null
    reportForm.value.campos['empresa_pertenece'] = null
  } catch (error) {
    console.error('Error loading data for cliente:', error)
    // Solo mostrar error si realmente falló la carga
    if (error.response || error.message !== 'Network Error') {
      $q.notify({
        type: 'warning',
        message: 'No se pudieron cargar todos los datos del cliente',
        position: 'top'
      })
    }
  }
}

const loadProyectos = async () => {
  loadingProyectos.value = true
  try {
    // Importar el servicio de proyectos
    const { default: projectService } = await import('src/services/projectService')
    const data = await projectService.getProjects()
    proyectos.value = data
  } catch (error) {
    console.error('Error loading projects:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar proyectos',
      position: 'top'
    })
  } finally {
    loadingProyectos.value = false
  }
}

const onProyectoChange = async () => {
  reportForm.value.empresa_id = null
  contratistas.value = []
  
  if (!reportForm.value.proyecto_id) return
  
  // Obtener cliente_id del proyecto seleccionado
  const proyecto = proyectos.value.find(p => p.project_id === reportForm.value.proyecto_id)
  if (proyecto) {
    reportForm.value.cliente_id = proyecto.client_id
  }
  
  // Cargar contratistas del proyecto
  loadingContratistas.value = true
  try {
    const { default: projectService } = await import('src/services/projectService')
    const data = await projectService.getContractorsByProject(reportForm.value.proyecto_id)
    contratistas.value = data
  } catch (error) {
    console.error('Error loading contractors:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar contratistas',
      position: 'top'
    })
  } finally {
    loadingContratistas.value = false
  }
}

const onSubmit = async () => {
  console.log('🚀 onSubmit iniciado')
  console.log('📊 reportForm:', JSON.stringify(reportForm.value, null, 2))
  
  loading.value = true
  
  try {
    console.log('🔧 Preparando campos...')
    
    // Separar archivos de campos normales
    const fileFields = {}
    const normalFields = []
    
    Object.entries(reportForm.value.campos).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Detectar si el valor es un archivo o array de archivos
        if (value instanceof File || (Array.isArray(value) && value.length > 0 && value[0] instanceof File)) {
          fileFields[key] = value
          console.log(`📎 Campo de archivo detectado: ${key}, cantidad: ${Array.isArray(value) ? value.length : 1}`)
        } else {
          normalFields.push({ key, value: String(value) })
        }
      }
    })
    
    console.log('📋 normalFields:', normalFields)
    console.log('📎 fileFields:', Object.keys(fileFields))
    
    // Extraer IDs de los campos dinámicos para las columnas principales
    const clienteId = reportForm.value.campos['cliente']
    const proyectoId = reportForm.value.campos['proyecto']
    // Priorizar empresa_genera_reporte, sino empresa_pertenece
    const empresaId = reportForm.value.campos['empresa_genera_reporte'] || reportForm.value.campos['empresa_pertenece']

    const reportData = {
      tipo: reportForm.value.tipo,
      proyecto_id: proyectoId,
      cliente_id: clienteId,
      empresa_id: empresaId,
      fields: normalFields
    }
    
    console.log('📤 Enviando al backend:', reportData)
    
    const createdReport = await ilvService.createReport(reportData)
    const reportId = createdReport.report_id
    
    console.log('✅ Reporte creado exitosamente con ID:', reportId)
    
    // Subir archivos si existen
    if (Object.keys(fileFields).length > 0) {
      console.log('📤 Iniciando subida de archivos...')
      let uploadedCount = 0
      
      for (const [fieldKey, files] of Object.entries(fileFields)) {
        const fileArray = Array.isArray(files) ? files : [files]
        
        for (const file of fileArray) {
          try {
            console.log(`📤 Subiendo archivo: ${file.name}`)
            await ilvService.uploadAttachment(reportId, file)
            uploadedCount++
            console.log(`✅ Archivo subido: ${file.name}`)
          } catch (uploadError) {
            console.error(`❌ Error subiendo archivo ${file.name}:`, uploadError)
          }
        }
      }
      
      console.log(`✅ ${uploadedCount} archivo(s) subido(s)`)
    }
    
    $q.notify({
      type: 'positive',
      message: 'Reporte ILV creado exitosamente',
      position: 'top'
    })
    
    router.push({ name: 'ilvReportes' })
    
  } catch (error) {
    console.error('❌ Error completo:', error)
    console.error('❌ Error.response:', error.response)
    console.error('❌ Error.message:', error.message)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al crear el reporte',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Función para formatear bytes a formato legible
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Estado para drag & drop
const isDragging = ref({})

// Trigger del input file oculto
const triggerFileInput = (fieldKey) => {
  const input = document.querySelector(`input[type="file"][data-field="${fieldKey}"]`)
  if (input) input.click()
}

// Manejar selección de archivos desde input
const handleFileSelect = (event, field) => {
  const files = Array.from(event.target.files)
  addFiles(files, field)
}

// Manejar drop de archivos
const handleFileDrop = (event, field) => {
  isDragging.value[field.key] = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files, field)
}

// Agregar archivos con validación
const addFiles = (newFiles, field) => {
  const maxFiles = field.maxFiles || 5
  const maxSize = field.maxSize || 5242880
  const accept = field.accept || 'image/*'
  
  // Filtrar archivos por tipo
  const acceptedTypes = accept.split(',').map(t => t.trim())
  const validFiles = newFiles.filter(file => {
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'))
      }
      return file.type === type
    })
    
    const isValidSize = file.size <= maxSize
    
    if (!isValidType) {
      $q.notify({
        type: 'warning',
        message: `Archivo ${file.name} no tiene un formato válido`,
        position: 'top'
      })
    }
    
    if (!isValidSize) {
      $q.notify({
        type: 'warning',
        message: `Archivo ${file.name} excede el tamaño máximo de ${formatBytes(maxSize)}`,
        position: 'top'
      })
    }
    
    return isValidType && isValidSize
  })
  
  // Combinar con archivos existentes
  const currentFiles = reportForm.value.campos[field.key] || []
  const combinedFiles = [...currentFiles, ...validFiles]
  
  // Limitar cantidad
  if (combinedFiles.length > maxFiles) {
    $q.notify({
      type: 'warning',
      message: `Solo puedes subir máximo ${maxFiles} archivos`,
      position: 'top'
    })
    reportForm.value.campos[field.key] = combinedFiles.slice(0, maxFiles)
  } else {
    reportForm.value.campos[field.key] = combinedFiles
  }
}

// Remover archivo
const removeFile = (fieldKey, index) => {
  const files = [...reportForm.value.campos[fieldKey]]
  files.splice(index, 1)
  reportForm.value.campos[fieldKey] = files
}

onMounted(() => {
  // Cargar proyectos al iniciar
  loadProyectos()
  // Cargar maestros básicos
  loadMaestrosForType()
})
</script>

<style scoped>
.file-drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.file-drop-zone:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.file-drop-zone.drag-over {
  border-color: #1976d2;
  background-color: #e3f2fd;
  transform: scale(1.02);
}

.drop-zone-content {
  pointer-events: none;
}

.file-item {
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: #f5f5f5;
}
</style>