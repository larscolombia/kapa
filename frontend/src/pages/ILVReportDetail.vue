<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center">
      <q-spinner size="3rem" />
    </div>

    <div v-else-if="report">
      <!-- Header -->
      <div class="row q-mb-lg items-center">
        <div class="col">
          <q-breadcrumbs>
            <q-breadcrumbs-el label="ILV" @click="$router.push({ name: 'ilvDashboard' })" />
            <q-breadcrumbs-el label="Reportes" @click="$router.push({ name: 'ilvReportes' })" />
            <q-breadcrumbs-el :label="`Reporte #${report.report_id}`" />
          </q-breadcrumbs>
        </div>
        <div class="col-auto">
          <q-btn-group>
            <q-btn 
              v-if="canEdit"
              color="orange" 
              icon="edit" 
              label="Editar" 
              @click="$router.push({ name: 'ilvReporteEditar', params: { id: report.report_id } })"
            />
            <q-btn 
              flat 
              color="grey" 
              icon="arrow_back" 
              label="Volver" 
              @click="$router.back()"
            />
          </q-btn-group>
        </div>
      </div>

      <!-- Info Principal -->
      <div class="row q-gutter-lg q-mb-lg">
        <div class="col-md-8 col-xs-12">
          <q-card>
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h5">
                    <q-chip 
                      :color="getTipoColor(report.tipo)" 
                      text-color="white" 
                      :icon="getTipoIcon(report.tipo)"
                    >
                      {{ getTipoLabel(report.tipo) }}
                    </q-chip>
                    {{ getFieldValue('titulo') || `Reporte #${report.report_id}` }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-chip 
                    :color="report.estado === 'abierto' ? 'orange' : 'green'" 
                    text-color="white" 
                    :icon="report.estado === 'abierto' ? 'pending' : 'check_circle'"
                  >
                    {{ report.estado.toUpperCase() }}
                  </q-chip>
                </div>
              </div>

              <div v-if="getFieldValue('descripcion')" class="q-mb-md">
                <strong>Descripción:</strong>
                <p>{{ getFieldValue('descripcion') }}</p>
              </div>

              <div v-if="getFieldValue('ubicacion')" class="q-mb-md">
                <strong>Ubicación:</strong> {{ getFieldValue('ubicacion') }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md-4 col-xs-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Información General</div>
              
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Proyecto</q-item-label>
                    <q-item-label>{{ report.project?.name || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Cliente</q-item-label>
                    <q-item-label>{{ report.client?.name || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Creado por</q-item-label>
                    <q-item-label>{{ report.created_by?.name || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Fecha de creación</q-item-label>
                    <q-item-label>{{ formatDate(report.creado_en) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="report.fecha_cierre">
                  <q-item-section>
                    <q-item-label caption>Fecha de cierre</q-item-label>
                    <q-item-label>{{ formatDate(report.fecha_cierre) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Campos Dinámicos - Misma estructura que el formulario -->
      <div class="row q-mb-lg">
        <div class="col">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Detalles del Reporte</div>
              
              <div v-for="field in dynamicFields" :key="field.key" class="q-mb-md">
                <!-- Campo de texto -->
                <q-input
                  v-if="field.type === 'text'"
                  :model-value="field.value"
                  :label="field.label"
                  filled
                  readonly
                />

                <!-- Campo de fecha -->
                <q-input
                  v-else-if="field.type === 'date'"
                  :model-value="field.value"
                  :label="field.label"
                  filled
                  type="date"
                  readonly
                />

                <!-- Campo de tiempo -->
                <q-input
                  v-else-if="field.type === 'time'"
                  :model-value="field.value"
                  :label="field.label"
                  filled
                  type="time"
                  readonly
                />

                <!-- Campo de selección (muestra el valor legible) -->
                <q-input
                  v-else-if="field.type === 'select' || field.type === 'select-dependent' || field.type === 'select-hierarchical' || field.type === 'select-hierarchical-child'"
                  :model-value="field.value"
                  :label="field.label"
                  filled
                  readonly
                />

                <!-- Campo de textarea -->
                <q-input
                  v-else-if="field.type === 'textarea'"
                  :model-value="field.value"
                  :label="field.label"
                  type="textarea"
                  rows="3"
                  filled
                  readonly
                />

                <!-- Campo de archivo múltiple - mostrar cantidad -->
                <q-input
                  v-else-if="field.type === 'file-multiple'"
                  :model-value="field.value === '[object File]' ? 'Ver adjuntos abajo' : field.value"
                  :label="field.label"
                  filled
                  readonly
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-input>

                <!-- Otros campos -->
                <q-input
                  v-else
                  :model-value="field.value"
                  :label="field.label"
                  filled
                  readonly
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Adjuntos / Evidencias Fotográficas - Solo para HID -->
      <div class="row q-mb-lg" v-if="report.tipo === 'hazard_id'">
        <div class="col">
          <q-card>
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h6">Evidencias Fotográficas</div>
                  <div class="text-caption text-grey-7">Archivos adjuntos al reporte</div>
                </div>
              </div>

              <!-- Lista de adjuntos -->
              <div v-if="attachments.length > 0" class="row q-gutter-md">
                <div 
                  v-for="attachment in attachments" 
                  :key="attachment.attachment_id"
                  class="col-md-3 col-sm-6 col-xs-12"
                >
                  <q-card bordered>
                    <q-card-section class="text-center q-pa-md">
                      <!-- Preview para imágenes -->
                      <div v-if="isImage(attachment.mime_type)" class="q-mb-sm">
                        <q-img
                          :src="attachment.preview_url"
                          :ratio="1"
                          style="max-height: 150px; border-radius: 8px;"
                          loading="lazy"
                        >
                          <template v-slot:loading>
                            <q-spinner color="primary" size="sm" />
                          </template>
                        </q-img>
                      </div>
                      
                      <!-- Icono para PDFs -->
                      <div v-else class="q-mb-sm">
                        <q-icon name="picture_as_pdf" color="red" size="4rem" />
                      </div>

                      <div class="text-caption text-weight-medium ellipsis">
                        {{ attachment.filename }}
                      </div>
                      <div class="text-caption text-grey-7">
                        {{ formatFileSize(attachment.size_bytes) }}
                      </div>
                      <div class="text-caption text-grey-6">
                        {{ formatDate(attachment.uploaded_at) }}
                      </div>
                    </q-card-section>

                    <q-card-actions align="center">
                      <q-btn 
                        flat 
                        dense 
                        icon="download" 
                        color="primary" 
                        @click="downloadAttachment(attachment)"
                        :loading="attachment.downloading"
                      >
                        <q-tooltip>Descargar</q-tooltip>
                      </q-btn>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>

              <!-- Mensaje cuando no hay adjuntos -->
              <div v-else class="text-center q-pa-lg text-grey-6">
                <q-icon name="image" size="3rem" />
                <div class="q-mt-sm">No hay evidencias fotográficas adjuntas</div>
              </div>

              <!-- Loading upload -->
              <q-linear-progress 
                v-if="uploading" 
                indeterminate 
                color="primary" 
                class="q-mt-md"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Timeline/Auditoría (placeholder) -->
      <div class="row">
        <div class="col">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Historial de Cambios</div>
              <q-timeline>
                <q-timeline-entry 
                  :subtitle="formatDateTime(report.creado_en)"
                  title="Reporte creado"
                  icon="add_circle"
                  color="primary"
                >
                  <div>
                    Creado por {{ report.created_by?.name || 'Usuario' }}
                  </div>
                </q-timeline-entry>
                
                <q-timeline-entry 
                  v-if="report.fecha_cierre"
                  :subtitle="formatDateTime(report.fecha_cierre)"
                  title="Reporte cerrado"
                  icon="check_circle"
                  color="green"
                >
                  <div>
                    Cerrado {{ report.cerrado_por ? `por ${report.cerrado_por}` : 'vía token' }}
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else class="text-center">
      <q-icon name="error" size="4rem" color="grey" />
      <div class="text-h6 q-mt-md">Reporte no encontrado</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ilvService from 'src/services/ilvService'

const route = useRoute()
const $q = useQuasar()
const { proxy } = getCurrentInstance()

const loading = ref(true)
const report = ref(null)
const attachments = ref([])
const uploading = ref(false)
const fileInputRef = ref(null)

const canEdit = computed(() => {
  // TODO: Implementar lógica de ownership real
  return report.value?.estado === 'abierto'
})

// Configuración de campos por tipo (MISMA que el formulario)
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
};

const dynamicFields = computed(() => {
  if (!report.value?.tipo || !report.value?.fields) return []
  
  // Obtener la configuración de campos para este tipo de reporte
  const config = fieldConfigs[report.value.tipo] || []
  
  // Mapear los campos guardados con la configuración
  return config.map(fieldConfig => {
    const savedField = report.value.fields.find(f => f.key === fieldConfig.key)
    
    return {
      key: fieldConfig.key,
      label: fieldConfig.label,
      type: fieldConfig.type,
      value: savedField?.value_display || savedField?.value || 'N/A'
    }
  }).filter(f => f.value !== 'N/A' && f.value !== '' && f.value !== null)
})

const loadReport = async () => {
  loading.value = true
  
  try {
    const reportId = route.params.id
    report.value = await ilvService.getReportById(reportId)
  } catch (error) {
    console.error('Error loading report:', error)
    report.value = null
  } finally {
    loading.value = false
  }
}

const getFieldValue = (key) => {
  const field = report.value?.fields?.find(f => f.key === key)
  // Priorizar value_display (nombre legible) sobre value (ID)
  return field?.value_display || field?.value || ''
}

const getTipoColor = (tipo) => {
  const colors = {
    hazard_id: 'red',
    wit: 'blue',
    swa: 'orange', 
    fdkar: 'purple'
  }
  return colors[tipo] || 'grey'
}

const getTipoIcon = (tipo) => {
  const icons = {
    hazard_id: 'warning',
    wit: 'directions_walk',
    swa: 'stop',
    fdkar: 'credit_card'
  }
  return icons[tipo] || 'assignment'
}

const getTipoLabel = (tipo) => {
  const labels = {
    hazard_id: 'Identificación de Peligros',
    wit: 'Walk & Talk',
    swa: 'Stop Work Authority',
    fdkar: 'Safety Cards'
  }
  return labels[tipo] || tipo
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Funciones para adjuntos
const loadAttachments = async () => {
  try {
    const data = await ilvService.getAttachments(route.params.id)
    attachments.value = data.map(att => ({
      ...att,
      downloading: false,
      deleting: false,
      preview_url: null
    }))
    
    // Cargar preview URLs para imágenes
    attachments.value.forEach(async (att) => {
      if (isImage(att.mime_type)) {
        try {
          att.preview_url = await ilvService.getAttachmentDownloadUrl(route.params.id, att.attachment_id)
        } catch (err) {
          console.error('Error loading preview:', err)
        }
      }
    })
  } catch (error) {
    console.error('Error loading attachments:', error)
  }
}

const isImage = (mimeType) => {
  return mimeType === 'image/jpeg' || mimeType === 'image/png'
}

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validaciones cliente
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf']
  if (!allowedMimes.includes(file.type)) {
    $q.notify({
      type: 'negative',
      message: 'Formato no permitido. Solo JPG, PNG y PDF.',
      position: 'top'
    })
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: 'El archivo excede el tamaño máximo de 5MB.',
      position: 'top'
    })
    return
  }

  if (attachments.value.length >= 5) {
    $q.notify({
      type: 'negative',
      message: 'Límite de 5 adjuntos alcanzado.',
      position: 'top'
    })
    return
  }

  // Upload
  uploading.value = true
  try {
    await ilvService.uploadAttachment(route.params.id, file)
    $q.notify({
      type: 'positive',
      message: 'Archivo subido correctamente.',
      position: 'top'
    })
    await loadAttachments()
  } catch (error) {
    console.error('Error uploading file:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al subir el archivo.',
      position: 'top'
    })
  } finally {
    uploading.value = false
    // Reset input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

const downloadAttachment = async (attachment) => {
  attachment.downloading = true
  try {
    const url = await ilvService.getAttachmentDownloadUrl(route.params.id, attachment.attachment_id)
    
    // Abrir en nueva pestaña o descargar
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.download = attachment.filename
    link.click()
  } catch (error) {
    console.error('Error downloading attachment:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al descargar el archivo.',
      position: 'top'
    })
  } finally {
    attachment.downloading = false
  }
}

const confirmDeleteAttachment = (attachment) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${attachment.filename}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await deleteAttachment(attachment)
  })
}

const deleteAttachment = async (attachment) => {
  attachment.deleting = true
  try {
    await ilvService.deleteAttachment(route.params.id, attachment.attachment_id)
    $q.notify({
      type: 'positive',
      message: 'Archivo eliminado correctamente.',
      position: 'top'
    })
    await loadAttachments()
  } catch (error) {
    console.error('Error deleting attachment:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar el archivo.',
      position: 'top'
    })
  } finally {
    attachment.deleting = false
  }
}

onMounted(() => {
  loadReport()
  loadAttachments()
})
</script>
