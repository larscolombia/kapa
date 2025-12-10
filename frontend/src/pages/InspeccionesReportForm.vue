<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-8 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h5 text-weight-medium">{{ isEdit ? 'Editar Inspección' : 'Nueva Inspección' }}</div>
            <div class="text-caption text-grey-7">{{ tipoLabel }}</div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-section>
            <q-form @submit.prevent="submitForm" class="q-gutter-md">
              
              <!-- ============================================ -->
              <!-- INSPECCIÓN TÉCNICA (Opción 1) -->
              <!-- ============================================ -->
              <template v-if="form.tipo === 'tecnica'">
                <!-- 1. Fecha -->
                <q-input
                  v-model="form.fecha"
                  label="Fecha de la Inspección *"
                  type="date"
                  filled
                  dense
                  :rules="[val => !!val || 'Fecha es requerida']"
                />

                <!-- 2. Cliente -->
                <q-select
                  v-model="form.cliente_id"
                  :options="clientes"
                  option-value="client_id"
                  option-label="name"
                  label="Cliente *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Cliente es requerido']"
                />

                <!-- 3. Proyecto -->
                <q-select
                  v-model="form.proyecto_id"
                  :options="proyectosFiltrados"
                  option-value="project_id"
                  option-label="name"
                  label="Proyecto *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Proyecto es requerido']"
                  :disable="!form.cliente_id"
                  :hint="!form.cliente_id ? 'Seleccione primero el cliente' : ''"
                />

                <!-- 4. Empresa contratista a quien se inspecciona -->
                <q-select
                  v-model="form.empresa_id"
                  :options="empresasFiltradas"
                  option-value="contractor_id"
                  option-label="name"
                  label="Empresa contratista a quien se inspecciona *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Empresa es requerida']"
                  :disable="!form.proyecto_id"
                  :hint="!form.proyecto_id ? 'Seleccione primero el proyecto' : ''"
                />

                <!-- 5. Área -->
                <q-select
                  v-model="fields.area_inspeccion_id"
                  :options="areasInspeccion"
                  option-value="maestro_id"
                  option-label="valor"
                  label="Área *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Área es requerida']"
                />

                <!-- 6. Descripción detallada del área -->
                <q-input
                  v-model="fields.descripcion_area"
                  label="Descripción detallada del área"
                  type="textarea"
                  filled
                  dense
                  rows="2"
                />

                <!-- 7. Quien Reporta -->
                <q-select
                  v-model="fields.quien_reporta_id"
                  :options="usuarios"
                  option-value="user_id"
                  option-label="name"
                  label="Quien Reporta *"
                  emit-value
                  map-options
                  filled
                  dense
                  use-input
                  input-debounce="300"
                  :rules="[val => !!val || 'Quien reporta es requerido']"
                  @filter="filterUsuarios"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <!-- 8. Tipo de Inspección -->
                <q-select
                  v-model="fields.tipo_inspeccion_id"
                  :options="tiposInspeccionTecnica"
                  option-value="maestro_id"
                  option-label="valor"
                  label="Tipo *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Tipo de inspección es requerido']"
                  @update:model-value="onTipoInspeccionChange"
                />

                <!-- 9. Clasificación -->
                <q-select
                  v-model="fields.clasificacion_inspeccion_id"
                  :options="clasificaciones"
                  option-value="maestro_id"
                  option-label="valor"
                  label="Clasificación (Formato KAPA) *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Clasificación es requerida']"
                  :disable="!fields.tipo_inspeccion_id"
                  :hint="!fields.tipo_inspeccion_id ? 'Seleccione primero el tipo' : ''"
                />

                <!-- Formularios Dinámicos asociados a la clasificación -->
                <div v-if="fields.clasificacion_inspeccion_id" class="q-mt-lg">
                  <q-separator class="q-mb-md" />
                  <div class="text-subtitle1 text-weight-medium q-mb-sm">
                    <q-icon name="dynamic_form" class="q-mr-xs" />
                    Formularios de Inspección
                  </div>
                  <template v-if="currentReportId">
                    <dynamic-forms-section
                      :clasificacion-id="fields.clasificacion_inspeccion_id"
                      :report-id="currentReportId"
                      :readonly="form.estado === 'cerrado' && !isAdmin"
                      @form-submitted="onFormSubmitted"
                      @form-updated="onFormUpdated"
                    />
                  </template>
                  <q-banner v-else class="bg-blue-1 text-blue-9 rounded-borders">
                    <template v-slot:avatar>
                      <q-icon name="info" color="blue" />
                    </template>
                    Guarde la inspección primero para poder llenar los formularios dinámicos.
                  </q-banner>
                </div>

                <!-- 10. Estado -->
                <q-select
                  v-model="form.estado"
                  :options="estadosReporte"
                  option-value="value"
                  option-label="label"
                  label="Estado *"
                  emit-value
                  map-options
                  filled
                  dense
                />

                <!-- 11. Observación -->
                <q-input
                  v-model="form.observacion"
                  label="Observación"
                  type="textarea"
                  filled
                  dense
                  rows="2"
                />
              </template>

              <!-- ============================================ -->
              <!-- AUDITORÍA CRUZADA (Opción 2) -->
              <!-- ============================================ -->
              <template v-if="form.tipo === 'auditoria'">
                <!-- 1. Fecha -->
                <q-input
                  v-model="form.fecha"
                  label="Fecha de la Auditoría *"
                  type="date"
                  filled
                  dense
                  :rules="[val => !!val || 'Fecha es requerida']"
                />

                <!-- 2. Cliente -->
                <q-select
                  v-model="form.cliente_id"
                  :options="clientes"
                  option-value="client_id"
                  option-label="name"
                  label="Cliente *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Cliente es requerido']"
                />

                <!-- 3. Proyecto -->
                <q-select
                  v-model="form.proyecto_id"
                  :options="proyectosFiltrados"
                  option-value="project_id"
                  option-label="name"
                  label="Proyecto *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Proyecto es requerido']"
                  :disable="!form.cliente_id"
                  :hint="!form.cliente_id ? 'Seleccione primero el cliente' : ''"
                />

                <!-- 4. Área -->
                <q-select
                  v-model="fields.area_auditoria_id"
                  :options="areasAuditoria"
                  option-value="maestro_id"
                  option-label="valor"
                  label="Área *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Área es requerida']"
                />

                <!-- 5. Descripción detallada del área -->
                <q-input
                  v-model="fields.descripcion_area"
                  label="Descripción detallada del área"
                  type="textarea"
                  filled
                  dense
                  rows="2"
                />

                <!-- 6. Empresa Auditora (Quien ejecuta) -->
                <q-select
                  v-model="form.empresa_id"
                  :options="empresasFiltradas"
                  option-value="contractor_id"
                  option-label="name"
                  label="Empresa Auditora (Quien ejecuta) *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Empresa auditora es requerida']"
                  :disable="!form.proyecto_id"
                  :hint="!form.proyecto_id ? 'Seleccione primero el proyecto' : ''"
                />

                <!-- 7. Empresa Auditada -->
                <q-select
                  v-model="form.empresa_auditada_id"
                  :options="empresasFiltradas.filter(e => e.contractor_id !== form.empresa_id)"
                  option-value="contractor_id"
                  option-label="name"
                  label="Empresa Auditada *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Empresa auditada es requerida']"
                  :disable="!form.proyecto_id"
                  :hint="!form.proyecto_id ? 'Seleccione primero el proyecto' : ''"
                />

                <!-- 8. Clasificación -->
                <q-select
                  v-model="fields.clasificacion_auditoria_id"
                  :options="clasificacionesAuditoria"
                  option-value="maestro_id"
                  option-label="valor"
                  label="Clasificación *"
                  emit-value
                  map-options
                  filled
                  dense
                  :rules="[val => !!val || 'Clasificación es requerida']"
                />

                <!-- Formularios Dinámicos asociados a la clasificación de auditoría -->
                <div v-if="fields.clasificacion_auditoria_id" class="q-mt-lg">
                  <q-separator class="q-mb-md" />
                  <div class="text-subtitle1 text-weight-medium q-mb-sm">
                    <q-icon name="dynamic_form" class="q-mr-xs" />
                    Formularios de Auditoría
                  </div>
                  <template v-if="currentReportId">
                    <dynamic-forms-section
                      :clasificacion-id="fields.clasificacion_auditoria_id"
                      :report-id="currentReportId"
                      :readonly="form.estado === 'cerrado' && !isAdmin"
                      @form-submitted="onFormSubmitted"
                      @form-updated="onFormUpdated"
                    />
                  </template>
                  <q-banner v-else class="bg-blue-1 text-blue-9 rounded-borders">
                    <template v-slot:avatar>
                      <q-icon name="info" color="blue" />
                    </template>
                    Guarde la inspección primero para poder llenar los formularios dinámicos.
                  </q-banner>
                </div>

                <!-- 9. Estado -->
                <q-select
                  v-model="form.estado"
                  :options="estadosReporte"
                  option-value="value"
                  option-label="label"
                  label="Estado *"
                  emit-value
                  map-options
                  filled
                  dense
                />

                <!-- 10. Observación -->
                <q-input
                  v-model="form.observacion"
                  label="Observación"
                  type="textarea"
                  filled
                  dense
                  rows="2"
                />
              </template>

              <!-- ============================================ -->
              <!-- ADJUNTOS (Ambos tipos) -->
              <!-- ============================================ -->
              <div class="q-mt-lg">
                <div class="text-subtitle1 text-weight-medium q-mb-sm">
                  <q-icon name="attach_file" class="q-mr-xs" />
                  Evidencias Fotográficas
                </div>
                
                <!-- Zona de drag & drop -->
                <div 
                  class="file-drop-zone"
                  :class="{ 'drag-over': isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleFileDrop"
                  @click="$refs.fileInput.click()"
                >
                  <input 
                    ref="fileInput"
                    type="file" 
                    accept="image/*,application/pdf"
                    multiple
                    style="display: none"
                    @change="handleFileSelect"
                  />
                  
                  <div class="drop-zone-content">
                    <q-icon name="cloud_upload" size="48px" color="primary" />
                    <div class="text-h6 q-mt-sm">Arrastra imágenes aquí</div>
                    <div class="text-caption text-grey-6">o haz clic para seleccionar</div>
                    <div class="text-caption text-grey-5 q-mt-xs">
                      Máximo 10 archivos de 10MB cada uno (JPG, PNG, GIF, WebP, PDF)
                    </div>
                  </div>
                </div>
                
                <!-- Lista de archivos nuevos a subir -->
                <div v-if="newFiles.length > 0" class="q-mt-md">
                  <div class="text-subtitle2 q-mb-sm">
                    Nuevos archivos a subir ({{ newFiles.length }})
                  </div>
                  <q-list bordered separator class="rounded-borders">
                    <q-item 
                      v-for="(file, index) in newFiles" 
                      :key="'new-' + index"
                      class="file-item"
                    >
                      <q-item-section avatar>
                        <q-avatar color="primary" text-color="white">
                          <q-icon :name="file.type.includes('pdf') ? 'picture_as_pdf' : 'image'" />
                        </q-avatar>
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
                          @click="removeNewFile(index)"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                
                <!-- Lista de archivos existentes (modo edición) -->
                <div v-if="isEdit && existingAttachments.length > 0" class="q-mt-md">
                  <div class="text-subtitle2 q-mb-sm">
                    Archivos existentes ({{ existingAttachments.length }})
                  </div>
                  <div class="row q-gutter-md">
                    <div 
                      v-for="att in existingAttachments" 
                      :key="att.attachment_id"
                      class="col-md-3 col-sm-4 col-xs-6"
                    >
                      <q-card bordered class="attachment-card">
                        <q-card-section class="text-center q-pa-sm">
                          <!-- Preview para imágenes -->
                          <div v-if="att.mime_type.startsWith('image/')" class="q-mb-sm">
                            <q-img
                              :src="att.preview_url"
                              :ratio="1"
                              style="max-height: 100px; border-radius: 8px; cursor: pointer;"
                              loading="lazy"
                              @click="openPreview(att)"
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

                          <div class="text-caption text-weight-medium ellipsis" style="max-width: 100%;">
                            {{ att.filename }}
                          </div>
                          <div class="text-caption text-grey-6">
                            {{ formatBytes(att.size_bytes) }}
                          </div>
                        </q-card-section>
                        
                        <q-separator />
                        
                        <q-card-actions align="center">
                          <q-btn 
                            flat 
                            dense 
                            icon="download" 
                            color="primary" 
                            size="sm"
                            @click="downloadAttachment(att)"
                          >
                            <q-tooltip>Descargar</q-tooltip>
                          </q-btn>
                          <q-btn 
                            flat 
                            dense 
                            icon="delete" 
                            color="negative" 
                            size="sm"
                            @click="confirmDeleteAttachment(att)"
                            :disable="form.estado === 'cerrado' && !isAdmin"
                          >
                            <q-tooltip>Eliminar</q-tooltip>
                          </q-btn>
                        </q-card-actions>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <q-separator class="q-my-md" />
              
              <div class="row">
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
                  :label="isEdit ? 'Guardar Cambios' : 'Crear Inspección'" 
                  color="primary"
                  :loading="saving"
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
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import inspeccionesService from 'src/services/inspeccionesService'
import { api } from 'boot/axios'
import DynamicFormsSection from 'src/components/form-builder/DynamicFormsSection.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const saving = ref(false)
const isLoading = ref(true) // Bandera para evitar que watchers limpien durante carga
const isEdit = computed(() => !!route.params.id)
const currentReportId = ref(null)

const isAdmin = computed(() => {
  const roleId = authStore.user?.role_id ?? authStore.user?.role?.role_id
  return roleId === 1
})

const form = ref({
  tipo: route.query.tipo || 'tecnica',
  proyecto_id: null,
  cliente_id: null,
  empresa_id: null,
  empresa_auditada_id: null,
  fecha: new Date().toISOString().split('T')[0],
  observacion: '',
  estado: 'abierto'
})

const fields = ref({
  // Campos Inspección Técnica
  tipo_inspeccion_id: null,
  clasificacion_inspeccion_id: null,
  area_inspeccion_id: null,
  descripcion_area: '',
  quien_reporta_id: null,
  // Campos Auditoría Cruzada
  area_auditoria_id: null,
  clasificacion_auditoria_id: null,
  hallazgos: '',
  acciones_correctivas: ''
})

const proyectos = ref([])
const clientes = ref([])
const empresas = ref([])
const usuarios = ref([])
const usuariosOriginal = ref([])
const tiposInspeccionTecnica = ref([])
const clasificaciones = ref([])
const areasInspeccion = ref([])
const areasAuditoria = ref([])
const clasificacionesAuditoria = ref([])

// Adjuntos
const newFiles = ref([])
const existingAttachments = ref([])
const isDragging = ref(false)
const uploadingFiles = ref(false)

const estadosReporte = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' }
]

const tipoLabel = computed(() => {
  return form.value.tipo === 'tecnica' 
    ? 'Opción 1: Inspección Técnica' 
    : 'Opción 2: Auditoría Cruzada'
})

// Proyectos filtrados por cliente seleccionado
const proyectosFiltrados = computed(() => {
  if (!form.value.cliente_id) return []
  return proyectos.value.filter(p => p.client?.client_id === form.value.cliente_id)
})

// Empresas filtradas por proyecto seleccionado (usa projectContractors)
const empresasFiltradas = computed(() => {
  if (!form.value.proyecto_id) return []
  const proyecto = proyectos.value.find(p => p.project_id === form.value.proyecto_id)
  if (!proyecto || !proyecto.projectContractors) return []
  return proyecto.projectContractors
})

// Filtro para búsqueda de usuarios
const filterUsuarios = (val, update) => {
  update(() => {
    if (!val) {
      usuarios.value = usuariosOriginal.value
    } else {
      const needle = val.toLowerCase()
      usuarios.value = usuariosOriginal.value.filter(
        u => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle)
      )
    }
  })
}

// Watch para limpiar proyecto cuando cambia cliente y verificar si tiene proyectos
watch(() => form.value.cliente_id, (newVal, oldVal) => {
  if (isLoading.value) return // No limpiar durante carga
  if (newVal !== oldVal && oldVal !== null) {
    form.value.proyecto_id = null
    form.value.empresa_id = null
    form.value.empresa_auditada_id = null
  }
  
  // Verificar si el cliente tiene proyectos
  if (newVal && !isLoading.value) {
    const proyectosDelCliente = proyectos.value.filter(p => p.client?.client_id === newVal)
    if (proyectosDelCliente.length === 0) {
      const cliente = clientes.value.find(c => c.client_id === newVal)
      $q.dialog({
        title: 'Sin proyectos disponibles',
        message: `El cliente "${cliente?.name || 'seleccionado'}" no tiene proyectos asociados. Por favor seleccione otro cliente.`,
        icon: 'warning',
        color: 'warning',
        persistent: true
      }).onOk(() => {
        form.value.cliente_id = null
      })
    }
  }
})

// Watch para limpiar empresa cuando cambia proyecto y verificar si tiene contratistas
watch(() => form.value.proyecto_id, (newVal, oldVal) => {
  if (isLoading.value) return // No limpiar durante carga
  if (newVal !== oldVal && oldVal !== null) {
    form.value.empresa_id = null
    form.value.empresa_auditada_id = null
  }
  
  // Verificar si el proyecto tiene contratistas
  if (newVal && !isLoading.value) {
    const proyecto = proyectos.value.find(p => p.project_id === newVal)
    if (proyecto && (!proyecto.projectContractors || proyecto.projectContractors.length === 0)) {
      $q.dialog({
        title: 'Sin empresas contratistas',
        message: `El proyecto "${proyecto?.name || 'seleccionado'}" no tiene empresas contratistas asociadas. Por favor seleccione otro proyecto.`,
        icon: 'warning',
        color: 'warning',
        persistent: true
      }).onOk(() => {
        form.value.proyecto_id = null
      })
    }
  }
})

const onTipoInspeccionChange = async (tipoId) => {
  if (!tipoId) {
    clasificaciones.value = []
    fields.value.clasificacion_inspeccion_id = null
    return
  }
  try {
    clasificaciones.value = await inspeccionesService.getClasificacionesByTipo(tipoId)
    
    // Verificar si el tipo tiene clasificaciones
    if (clasificaciones.value.length === 0) {
      const tipo = tiposInspeccionTecnica.value.find(t => t.maestro_id === tipoId)
      $q.dialog({
        title: 'Sin clasificaciones disponibles',
        message: `El tipo de inspección "${tipo?.valor || 'seleccionado'}" no tiene clasificaciones asociadas. Por favor seleccione otro tipo.`,
        icon: 'warning',
        color: 'warning',
        persistent: true
      }).onOk(() => {
        fields.value.tipo_inspeccion_id = null
      })
    }
  } catch (error) {
    console.error('Error loading clasificaciones:', error)
  }
}

const onProyectoChange = async (proyectoId) => {
  const proyecto = proyectos.value.find(p => p.project_id === proyectoId)
  if (proyecto && proyecto.client?.client_id) {
    form.value.cliente_id = proyecto.client.client_id
  }
}

const loadInitialData = async () => {
  try {
    const [projectsRes, clientsRes, contractorsRes] = await Promise.all([
      api.get('/projects'),
      api.get('/clients'),
      api.get('/contractors')
    ])

    proyectos.value = projectsRes.data
    clientes.value = clientsRes.data
    empresas.value = contractorsRes.data

    const [tipos, areas, areasInsp, usuariosData, clasifAuditoria] = await Promise.all([
      inspeccionesService.getTiposInspeccion(),
      inspeccionesService.getAreasAuditoria(),
      inspeccionesService.getAreasInspeccion(),
      inspeccionesService.getUsuarios(),
      inspeccionesService.getClasificacionesAuditoria()
    ])

    tiposInspeccionTecnica.value = tipos
    areasAuditoria.value = areas
    areasInspeccion.value = areasInsp
    usuariosOriginal.value = usuariosData
    usuarios.value = usuariosData
    clasificacionesAuditoria.value = clasifAuditoria

  } catch (error) {
    console.error('Error loading initial data:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos iniciales', position: 'top' })
  }
}

// Función auxiliar para formatear fecha sin problemas de zona horaria
const formatDateForInput = (dateValue) => {
  if (!dateValue) return null
  // Si ya es string en formato YYYY-MM-DD, usarlo directamente
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
    return dateValue.split('T')[0]
  }
  // Si es Date, formatear manualmente para evitar problemas de zona horaria
  const date = new Date(dateValue)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const loadExistingReport = async () => {
  if (!isEdit.value) return

  try {
    const report = await inspeccionesService.getReportById(route.params.id)
    
    form.value = {
      tipo: report.tipo,
      proyecto_id: report.proyecto_id,
      cliente_id: report.cliente_id,
      empresa_id: report.empresa_id,
      empresa_auditada_id: report.empresa_auditada_id,
      fecha: formatDateForInput(report.fecha),
      observacion: report.observacion || '',
      estado: report.estado
    }

    // Cargar campos dinámicos convirtiendo strings a números donde corresponda
    for (const field of report.fields || []) {
      if (fields.value.hasOwnProperty(field.key)) {
        // Convertir a número si el campo termina en _id y el valor es numérico
        if (field.key.endsWith('_id') && field.value && /^\d+$/.test(field.value)) {
          fields.value[field.key] = parseInt(field.value, 10)
        } else {
          fields.value[field.key] = field.value
        }
      }
    }

    // Cargar observación desde campos si existe
    const obsField = report.fields?.find(f => f.key === 'observacion')
    if (obsField) {
      form.value.observacion = obsField.value
    }

    // Cargar clasificaciones si hay tipo de inspección seleccionado
    if (fields.value.tipo_inspeccion_id) {
      await onTipoInspeccionChange(fields.value.tipo_inspeccion_id)
    }

    // Establecer el ID del reporte actual para los formularios dinámicos
    currentReportId.value = parseInt(route.params.id, 10)

  } catch (error) {
    console.error('Error loading report:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar la inspección', position: 'top' })
    router.back()
  }
}

const submitForm = async () => {
  saving.value = true

  try {
    const fieldsArray = []
    
    for (const [key, value] of Object.entries(fields.value)) {
      if (value !== null && value !== '') {
        fieldsArray.push({
          key,
          value: String(value),
          value_type: typeof value === 'number' ? 'number' : 'string'
        })
      }
    }

    // Agregar observación como campo
    if (form.value.observacion) {
      fieldsArray.push({
        key: 'observacion',
        value: form.value.observacion,
        value_type: 'string'
      })
    }

    const payload = {
      tipo: form.value.tipo,
      proyecto_id: form.value.proyecto_id,
      cliente_id: form.value.cliente_id,
      empresa_id: form.value.empresa_id,
      empresa_auditada_id: form.value.empresa_auditada_id,
      fecha: form.value.fecha,
      observacion: form.value.observacion,
      estado: form.value.estado,
      fields: fieldsArray
    }

    let savedReportId
    
    if (isEdit.value) {
      await inspeccionesService.updateReport(route.params.id, payload)
      savedReportId = route.params.id
      
      // Subir nuevos archivos
      if (newFiles.value.length > 0) {
        await uploadNewFiles(savedReportId)
      }
      
      $q.notify({ type: 'positive', message: 'Inspección actualizada exitosamente', position: 'top' })
    } else {
      const response = await inspeccionesService.createReport(payload)
      savedReportId = response.report_id
      
      // Subir archivos del nuevo reporte
      if (newFiles.value.length > 0) {
        await uploadNewFiles(savedReportId)
      }
      
      $q.notify({ type: 'positive', message: 'Inspección creada exitosamente', position: 'top' })
    }

    router.push({ name: 'inspeccionesLista' })

  } catch (error) {
    console.error('Error saving report:', error)
    $q.notify({ type: 'negative', message: error.message || 'Error al guardar la inspección', position: 'top' })
  } finally {
    saving.value = false
  }
}

// ============================================
// FUNCIONES DE FORMULARIOS DINÁMICOS
// ============================================

const onFormSubmitted = (submission) => {
  console.log('Formulario enviado:', submission)
  $q.notify({
    type: 'positive',
    message: 'Formulario guardado correctamente',
    position: 'top',
    timeout: 2000
  })
}

const onFormUpdated = (submission) => {
  console.log('Formulario actualizado:', submission)
  $q.notify({
    type: 'positive',
    message: 'Formulario actualizado correctamente',
    position: 'top',
    timeout: 2000
  })
}

// ============================================
// FUNCIONES DE ADJUNTOS
// ============================================

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleFileDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
  event.target.value = '' // Reset input
}

const addFiles = (files) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  const maxSize = 10 * 1024 * 1024 // 10MB
  const maxFiles = 10
  
  for (const file of files) {
    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      $q.notify({
        type: 'warning',
        message: `Archivo "${file.name}" no permitido. Solo imágenes y PDFs.`,
        position: 'top'
      })
      continue
    }
    
    // Validar tamaño
    if (file.size > maxSize) {
      $q.notify({
        type: 'warning',
        message: `Archivo "${file.name}" excede el límite de 10MB.`,
        position: 'top'
      })
      continue
    }
    
    // Validar cantidad total
    if (newFiles.value.length + existingAttachments.value.length >= maxFiles) {
      $q.notify({
        type: 'warning',
        message: `Máximo ${maxFiles} archivos por reporte.`,
        position: 'top'
      })
      break
    }
    
    // Verificar duplicados
    const isDuplicate = newFiles.value.some(f => f.name === file.name && f.size === file.size)
    if (isDuplicate) {
      $q.notify({
        type: 'info',
        message: `Archivo "${file.name}" ya está en la lista.`,
        position: 'top'
      })
      continue
    }
    
    newFiles.value.push(file)
  }
}

const removeNewFile = (index) => {
  newFiles.value.splice(index, 1)
}

const loadExistingAttachments = async () => {
  if (!isEdit.value) return
  try {
    existingAttachments.value = await inspeccionesService.getAttachments(route.params.id)
  } catch (error) {
    console.error('Error loading attachments:', error)
  }
}

const uploadNewFiles = async (reportId) => {
  if (newFiles.value.length === 0) return
  
  uploadingFiles.value = true
  let uploaded = 0
  let failed = 0
  
  for (const file of newFiles.value) {
    try {
      await inspeccionesService.uploadAttachment(reportId, file)
      uploaded++
    } catch (error) {
      console.error('Error uploading file:', file.name, error)
      failed++
    }
  }
  
  uploadingFiles.value = false
  
  if (failed > 0) {
    $q.notify({
      type: 'warning',
      message: `${uploaded} archivos subidos, ${failed} fallaron.`,
      position: 'top'
    })
  }
  
  newFiles.value = []
}

const downloadAttachment = async (att) => {
  try {
    const { url } = await inspeccionesService.getAttachmentDownloadUrl(
      route.params.id, 
      att.attachment_id,
      'attachment'
    )
    window.open(url, '_blank')
  } catch (error) {
    console.error('Error downloading:', error)
    $q.notify({ type: 'negative', message: 'Error al descargar el archivo', position: 'top' })
  }
}

const openPreview = async (att) => {
  try {
    const { url } = await inspeccionesService.getAttachmentDownloadUrl(
      route.params.id, 
      att.attachment_id,
      'inline'
    )
    window.open(url, '_blank')
  } catch (error) {
    console.error('Error opening preview:', error)
  }
}

const confirmDeleteAttachment = (att) => {
  $q.dialog({
    title: 'Eliminar archivo',
    message: `¿Está seguro de eliminar "${att.filename}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await inspeccionesService.deleteAttachment(route.params.id, att.attachment_id)
      existingAttachments.value = existingAttachments.value.filter(
        a => a.attachment_id !== att.attachment_id
      )
      $q.notify({ type: 'positive', message: 'Archivo eliminado', position: 'top' })
    } catch (error) {
      console.error('Error deleting attachment:', error)
      $q.notify({ type: 'negative', message: error.message || 'Error al eliminar', position: 'top' })
    }
  })
}

onMounted(async () => {
  isLoading.value = true
  try {
    await loadInitialData()
    await loadExistingReport()
    await loadExistingAttachments()
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.file-drop-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.file-drop-zone:hover {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.file-drop-zone.drag-over {
  border-color: #1976d2;
  background-color: #bbdefb;
  transform: scale(1.02);
}

.drop-zone-content {
  pointer-events: none;
}

.file-item {
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.attachment-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.attachment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>