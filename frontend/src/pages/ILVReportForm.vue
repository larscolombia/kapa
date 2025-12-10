<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-8 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ isEditMode ? 'Editar Reporte ILV' : 'Crear Nuevo Reporte ILV' }}</div>
            <p class="text-grey-6">{{ isEditMode ? 'Modifica los campos del reporte' : 'Selecciona el tipo de reporte que deseas crear' }}</p>
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
                :disable="isEditMode"
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
                    :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
                  />

                  <!-- Campo de selección dependiente (proyecto por cliente, empresa por proyecto) -->
                  <q-select
                    v-else-if="field.type === 'select-dependent'"
                    v-model="reportForm.campos[field.key]"
                    :options="field.options || []"
                    :label="field.label + (field.required ? ' *' : '')"
                    filled
                    emit-value
                    map-options
                    :disable="!reportForm.campos[field.dependsOn]"
                    :hint="getHintForDependentField(field)"
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
                    
                    <!-- Lista de archivos seleccionados (nuevos) -->
                    <div v-if="reportForm.campos[field.key]?.length > 0" class="q-mt-md">
                      <div class="text-subtitle2 q-mb-sm">
                        Nuevos archivos a subir ({{ reportForm.campos[field.key].length }})
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
                    
                    <!-- Lista de archivos existentes (modo edición) -->
                    <div v-if="isEditMode && existingAttachments.length > 0" class="q-mt-md">
                      <div class="text-subtitle2 q-mb-sm">
                        Archivos existentes ({{ existingAttachments.length }})
                      </div>
                      <div class="row q-gutter-md">
                        <div 
                          v-for="att in existingAttachments" 
                          :key="att.attachment_id"
                          class="col-md-3 col-sm-6 col-xs-12"
                        >
                          <q-card bordered>
                            <q-card-section class="text-center q-pa-md">
                              <!-- Preview para imágenes -->
                              <div v-if="att.mime_type === 'image/jpeg' || att.mime_type === 'image/png'" class="q-mb-sm">
                                <q-img
                                  :src="att.preview_url"
                                  :ratio="1"
                                  style="max-height: 100px; border-radius: 8px;"
                                  loading="lazy"
                                >
                                  <template v-slot:loading>
                                    <q-spinner color="primary" size="sm" />
                                  </template>
                                </q-img>
                              </div>
                              
                              <!-- Icono para PDFs -->
                              <div v-else class="q-mb-sm">
                                <q-icon name="picture_as_pdf" color="red" size="3rem" />
                              </div>

                              <div class="text-caption text-weight-medium ellipsis">
                                {{ att.filename }}
                              </div>
                              <div class="text-caption text-grey-7">
                                {{ formatBytes(att.size_bytes) }}
                              </div>
                            </q-card-section>

                            <q-card-actions align="center">
                              <q-btn 
                                flat 
                                dense 
                                icon="delete" 
                                color="negative" 
                                @click="deleteExistingAttachment(att)"
                                :loading="deletingAttachment[att.attachment_id]"
                              >
                                <q-tooltip>Eliminar</q-tooltip>
                              </q-btn>
                            </q-card-actions>
                          </q-card>
                        </div>
                      </div>
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
                  @click="$router.back()"
                  class="q-mr-sm"
                />
                <q-btn 
                  type="submit" 
                  :label="isEditMode ? 'Guardar Cambios' : 'Crear Reporte'" 
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ilvService from 'src/services/ilvService'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// Detectar modo edición
const isEditMode = computed(() => !!route.params.id)
const reportId = computed(() => route.params.id)

const loading = ref(false)
const loadingReport = ref(false)
const loadingProyectos = ref(false)
const isLoadingEdit = ref(false) // Bandera para evitar que watchers limpien durante carga de edición
const maestros = ref({})
const subcategorias = ref({})
const proyectos = ref([]) // Todos los proyectos con projectContractors incluidos
const existingAttachments = ref([]) // Archivos adjuntos existentes en modo edición
const deletingAttachment = ref({}) // Estado de eliminación por attachment_id

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
    { key: 'fecha', label: 'Fecha del Evento', type: 'date', required: true },
    { key: 'cliente', label: 'Cliente (Centro de Trabajo)', type: 'select', required: true, masterType: 'client' },
    { key: 'proyecto', label: 'Proyecto', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'empresa_pertenece', label: 'Seleccione la empresa a la que pertenece', type: 'select-dependent', required: true, dependsOn: 'proyecto' },
    { key: 'nombre_quien_reporta', label: 'Nombre de quien reporta', type: 'text', required: true },
    { key: 'tipo_reporte', label: 'Tipo de reporte', type: 'select', required: true, masterType: 'tipo_reporte_hid' },
    { key: 'empresa_genera_reporte', label: 'Empresa a quien se le genera el reporte', type: 'select-dependent', required: true, dependsOn: 'proyecto' },
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
    { key: 'fecha', label: 'Fecha del Evento', type: 'date', required: true },
    { key: 'cliente', label: 'Cliente (Centro de Trabajo)', type: 'select', required: true, masterType: 'client' },
    { key: 'proyecto', label: 'Proyecto', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'empresa_pertenece', label: 'Seleccione la empresa a la que pertenece', type: 'select-dependent', required: true, dependsOn: 'proyecto' },
    { key: 'nombre_quien_reporta', label: 'Nombre de quien reporta', type: 'text', required: true },
    { key: 'empresa_genera_reporte', label: 'Empresa a quien se le genera el reporte', type: 'select-dependent', required: true, dependsOn: 'proyecto' },
    { key: 'tipo', label: 'Tipo', type: 'select', required: true, masterType: 'tipo_wit_hallazgo' },
    { key: 'conducta_observada', label: 'Descripción de la conversación sostenida', type: 'textarea', required: true },
    { key: 'recomendacion', label: 'Describa el plan de acción generado o compromisos', type: 'textarea', required: true },
    { key: 'estado', label: 'Estado', type: 'select', required: true, masterType: 'estado_reporte' },
    { key: 'observacion', label: 'Observación', type: 'textarea', required: false, disableWhen: { field: 'estado', value: 'cerrado' } }
  ],
  swa: [
    { key: 'fecha', label: 'Fecha del Evento', type: 'date', required: true },
    { key: 'cliente', label: 'Cliente (Centro de Trabajo)', type: 'select', required: true, masterType: 'client' },
    { key: 'proyecto', label: 'Proyecto', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'empresa_pertenece', label: 'Seleccione la empresa a la que pertenece', type: 'select-dependent', required: true, dependsOn: 'proyecto' },
    { key: 'nombre_quien_reporta', label: 'Nombre de quien reporta', type: 'text', required: true },
    { key: 'empresa_genera_reporte', label: 'Empresa a quien se le genera el reporte', type: 'select-dependent', required: true, dependsOn: 'proyecto' },
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
    { key: 'fecha', label: 'Fecha del Evento', type: 'date', required: true },
    { key: 'cliente', label: 'Cliente (Centro de Trabajo)', type: 'select', required: true, masterType: 'client' },
    { key: 'proyecto', label: 'Proyecto', type: 'select-dependent', required: true, dependsOn: 'cliente' },
    { key: 'nombre_quien_reporta', label: 'Nombre de quien reporta', type: 'text', required: true },
    { key: 'empresa_genera_reporte', label: 'Empresa a quien se le genera el reporte', type: 'select-dependent', required: true, dependsOn: 'proyecto' },
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
      
      // Campos dependientes: proyecto depende de cliente
      if (field.type === 'select-dependent' && field.dependsOn === 'cliente') {
        if (field.key === 'proyecto') {
          return {
            ...field,
            disabled: shouldDisable,
            options: proyectosFiltrados.value
          }
        }
      }
      
      // Campos dependientes: empresas dependen de proyecto
      if (field.type === 'select-dependent' && field.dependsOn === 'proyecto') {
        if (field.key === 'empresa_genera_reporte' || field.key === 'empresa_pertenece') {
          return {
            ...field,
            disabled: shouldDisable,
            options: empresasFiltradas.value
          }
        }
      }
      
      return {
        ...field,
        disabled: shouldDisable
      }
    })
})

// Proyectos filtrados por cliente seleccionado (igual que Inspecciones)
const proyectosFiltrados = computed(() => {
  const clienteId = reportForm.value.campos['cliente']
  if (!clienteId) return []
  
  // Filtrar proyectos que pertenecen al cliente seleccionado
  return proyectos.value
    .filter(p => p.client?.client_id === clienteId || p.client_id === clienteId)
    .map(p => ({
      label: p.name,
      value: p.project_id
    }))
})

// Empresas/Contratistas filtrados por proyecto seleccionado (igual que Inspecciones)
const empresasFiltradas = computed(() => {
  const proyectoId = reportForm.value.campos['proyecto']
  if (!proyectoId) return []
  
  // Buscar el proyecto seleccionado
  const proyecto = proyectos.value.find(p => p.project_id === proyectoId)
  if (!proyecto || !proyecto.projectContractors) return []
  
  // Retornar los contratistas del proyecto
  return proyecto.projectContractors.map(c => ({
    label: c.name || c.contractor_name,
    value: c.contractor_id
  }))
})

// Watch para limpiar proyecto cuando cambia cliente
watch(() => reportForm.value.campos['cliente'], (newVal, oldVal) => {
  if (isLoadingEdit.value) return // No limpiar durante carga de edición
  if (newVal !== oldVal && oldVal !== null && oldVal !== undefined) {
    reportForm.value.campos['proyecto'] = null
    reportForm.value.campos['empresa_genera_reporte'] = null
    reportForm.value.campos['empresa_pertenece'] = null
  }
})

// Watch para limpiar empresas cuando cambia proyecto
watch(() => reportForm.value.campos['proyecto'], (newVal, oldVal) => {
  if (isLoadingEdit.value) return // No limpiar durante carga de edición
  if (newVal !== oldVal && oldVal !== null && oldVal !== undefined) {
    reportForm.value.campos['empresa_genera_reporte'] = null
    reportForm.value.campos['empresa_pertenece'] = null
  }
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
      // Tipo especial 'client' - cargar desde tabla client en lugar de ilv_maestro
      if (type === 'client') {
        const { getClients } = await import('src/services/clientService')
        const clientsData = await getClients()
        // Transformar al formato esperado (similar a maestros)
        maestros.value[type] = clientsData.map(c => ({
          maestro_id: c.client_id, // Usar client_id como identificador
          valor: c.name,
          clave: `client_${c.client_id}`
        }))
      } else if (config.find(f => f.masterType === type && f.hierarchical)) {
        // Si es jerárquico, usar el endpoint tree
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

// Helper para obtener el hint de campos dependientes
const getHintForDependentField = (field) => {
  if (field.dependsOn === 'cliente' && !reportForm.value.campos['cliente']) {
    return 'Seleccione primero el cliente'
  }
  if (field.dependsOn === 'proyecto' && !reportForm.value.campos['proyecto']) {
    return 'Seleccione primero el proyecto'
  }
  return ''
}

const loadProyectos = async () => {
  loadingProyectos.value = true
  try {
    // Importar el servicio de proyectos - carga TODOS los proyectos con sus contratistas
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

const onSubmit = async () => {
  console.log('🚀 onSubmit iniciado - Modo:', isEditMode.value ? 'EDICIÓN' : 'CREACIÓN')
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
    
    let savedReportId
    
    if (isEditMode.value) {
      // MODO EDICIÓN: Actualizar reporte existente
      await ilvService.updateReport(reportId.value, reportData)
      savedReportId = reportId.value
      console.log('✅ Reporte actualizado exitosamente con ID:', savedReportId)
    } else {
      // MODO CREACIÓN: Crear nuevo reporte
      const createdReport = await ilvService.createReport(reportData)
      savedReportId = createdReport.report_id
      console.log('✅ Reporte creado exitosamente con ID:', savedReportId)
    }
    
    // Subir archivos si existen (solo en modo creación o si hay nuevos archivos)
    if (Object.keys(fileFields).length > 0) {
      console.log('📤 Iniciando subida de archivos...')
      let uploadedCount = 0
      
      for (const [fieldKey, files] of Object.entries(fileFields)) {
        const fileArray = Array.isArray(files) ? files : [files]
        
        for (const file of fileArray) {
          try {
            console.log(`📤 Subiendo archivo: ${file.name}`)
            await ilvService.uploadAttachment(savedReportId, file)
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
      message: isEditMode.value ? 'Reporte ILV actualizado exitosamente' : 'Reporte ILV creado exitosamente',
      position: 'top'
    })
    
    router.push({ name: 'ilvReportes' })
    
  } catch (error) {
    console.error('❌ Error completo:', error)
    console.error('❌ Error.response:', error.response)
    console.error('❌ Error.message:', error.message)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || (isEditMode.value ? 'Error al actualizar el reporte' : 'Error al crear el reporte'),
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

// Eliminar archivo existente (en modo edición)
const deleteExistingAttachment = async (attachment) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${attachment.filename}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    deletingAttachment.value[attachment.attachment_id] = true
    try {
      await ilvService.deleteAttachment(reportId.value, attachment.attachment_id)
      // Remover de la lista local
      existingAttachments.value = existingAttachments.value.filter(
        a => a.attachment_id !== attachment.attachment_id
      )
      $q.notify({
        type: 'positive',
        message: 'Archivo eliminado correctamente',
        position: 'top'
      })
    } catch (error) {
      console.error('Error eliminando attachment:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el archivo',
        position: 'top'
      })
    } finally {
      deletingAttachment.value[attachment.attachment_id] = false
    }
  })
}

// Cargar reporte existente para edición
const loadExistingReport = async () => {
  if (!isEditMode.value) return
  
  loadingReport.value = true
  isLoadingEdit.value = true // Evitar que los watchers limpien valores durante la carga
  try {
    const report = await ilvService.getReportById(reportId.value)
    console.log('📋 Reporte cargado para edición:', report)
    
    // Establecer el tipo primero
    reportForm.value.tipo = report.tipo
    
    // Establecer IDs principales
    reportForm.value.proyecto_id = report.proyecto_id
    reportForm.value.cliente_id = report.cliente_id
    reportForm.value.empresa_id = report.empresa_id
    
    // Cargar maestros para este tipo
    await loadMaestrosForType()
    
    // Mapear los campos guardados - primero los campos simples
    if (report.fields && Array.isArray(report.fields)) {
      // Establecer cliente y proyecto primero (las computed properties se actualizarán automáticamente)
      const clienteField = report.fields.find(f => f.key === 'cliente')
      if (clienteField) {
        const clienteId = typeof clienteField.value === 'string' ? parseInt(clienteField.value) : clienteField.value
        reportForm.value.campos['cliente'] = clienteId
      }
      
      const proyectoField = report.fields.find(f => f.key === 'proyecto')
      if (proyectoField) {
        const proyectoId = typeof proyectoField.value === 'string' ? parseInt(proyectoField.value) : proyectoField.value
        reportForm.value.campos['proyecto'] = proyectoId
      }
      
      // Luego establecer las categorías jerárquicas para cargar subcategorías
      for (const field of report.fields) {
        // Obtener la configuración del campo
        const config = fieldConfigs[report.tipo]
        const fieldConfig = config?.find(f => f.key === field.key)
        
        if (fieldConfig?.type === 'select-hierarchical') {
          // Es una categoría padre, cargar subcategorías
          const catId = typeof field.value === 'string' ? parseInt(field.value) : field.value
          reportForm.value.campos[field.key] = catId
          await onCategoriaChange(field.key)
        }
      }
      
      // Finalmente mapear todos los campos
      report.fields.forEach(field => {
        // Para campos numéricos (selects), convertir a número
        const config = fieldConfigs[report.tipo]
        const fieldConfig = config?.find(f => f.key === field.key)
        
        if (fieldConfig && ['select', 'select-dependent', 'select-hierarchical', 'select-hierarchical-child'].includes(fieldConfig.type)) {
          // Campos de selección: usar el ID numérico
          reportForm.value.campos[field.key] = typeof field.value === 'string' && /^\d+$/.test(field.value) 
            ? parseInt(field.value) 
            : field.value
        } else {
          // Campos de texto: usar el valor directamente
          reportForm.value.campos[field.key] = field.value
        }
      })
    }
    
    // Cargar archivos adjuntos existentes (solo para HID)
    if (report.tipo === 'hazard_id') {
      try {
        const attachments = await ilvService.getAttachments(reportId.value)
        // Cargar URLs de preview para cada archivo
        for (const att of attachments) {
          if (att.mime_type === 'image/jpeg' || att.mime_type === 'image/png') {
            try {
              att.preview_url = await ilvService.getAttachmentDownloadUrl(reportId.value, att.attachment_id)
            } catch (e) {
              console.warn('No se pudo cargar preview para:', att.filename)
            }
          }
        }
        existingAttachments.value = attachments
        console.log('📎 Attachments cargados:', attachments.length)
      } catch (e) {
        console.warn('Error cargando attachments:', e)
      }
    }
    
    console.log('✅ Formulario cargado:', reportForm.value)
    
  } catch (error) {
    console.error('❌ Error cargando reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el reporte para edición',
      position: 'top'
    })
    router.push({ name: 'ilvReportes' })
  } finally {
    loadingReport.value = false
    isLoadingEdit.value = false // Permitir que los watchers funcionen normalmente
  }
}

onMounted(async () => {
  // Cargar proyectos al iniciar
  await loadProyectos()
  
  // Si es modo edición, cargar el reporte
  if (isEditMode.value) {
    await loadExistingReport()
  } else {
    // Cargar maestros básicos solo en modo creación
    loadMaestrosForType()
  }
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