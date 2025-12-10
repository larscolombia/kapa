<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-8 col-xs-12">
        <!-- Loading -->
        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner size="50px" color="primary" />
        </div>

        <!-- Contenido -->
        <q-card v-else-if="report">
          <!-- Encabezado -->
          <q-card-section :class="report.tipo === 'tecnica' ? 'bg-blue' : 'bg-purple'" class="text-white">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-btn 
                  flat 
                  round 
                  icon="arrow_back" 
                  @click="$router.back()" 
                  class="q-mr-md"
                />
                <div>
                  <div class="text-h6">
                    <q-icon :name="report.tipo === 'tecnica' ? 'engineering' : 'swap_horiz'" class="q-mr-sm" />
                    {{ report.tipo === 'tecnica' ? 'Inspección Técnica' : 'Auditoría Cruzada' }}
                  </div>
                  <div class="text-caption">Reporte #{{ report.report_id }}</div>
                </div>
              </div>
              <div class="q-gutter-sm">
                <q-chip 
                  :color="report.estado === 'abierto' ? 'orange' : 'green'" 
                  text-color="white" 
                  :label="report.estado"
                />
                <q-btn 
                  flat 
                  icon="picture_as_pdf" 
                  label="Descargar PDF"
                  :loading="downloadingPdf"
                  @click="downloadPdf"
                />
                <q-btn 
                  v-if="canEdit"
                  flat 
                  icon="edit" 
                  label="Editar"
                  @click="editReport"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <!-- ============================================ -->
            <!-- INSPECCIÓN TÉCNICA (Opción 1) -->
            <!-- ============================================ -->
            <div v-if="report.tipo === 'tecnica'">
              <div class="text-subtitle1 q-mb-md">
                <q-icon name="engineering" class="q-mr-sm" />
                Inspección Técnica
              </div>
              
              <div class="row q-col-gutter-md q-mb-lg">
                <!-- 1. Fecha -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Fecha de la Inspección</div>
                  <div>{{ report.fecha ? formatDateShort(report.fecha) : 'N/A' }}</div>
                </div>

                <!-- 2. Cliente -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Cliente</div>
                  <div>{{ report.client?.name || 'N/A' }}</div>
                </div>

                <!-- 3. Proyecto -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Proyecto</div>
                  <div>{{ report.project?.name || 'N/A' }}</div>
                </div>

                <!-- 4. Empresa contratista -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Empresa contratista a quien se inspecciona</div>
                  <div>{{ report.contractor?.name || 'N/A' }}</div>
                </div>

                <!-- 5. Área -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Área</div>
                  <div>{{ getFieldDisplay('area_inspeccion_id') }}</div>
                </div>

                <!-- 6. Descripción del área -->
                <div class="col-12">
                  <div class="text-caption text-grey-7">Descripción detallada del área</div>
                  <div class="text-pre-wrap">{{ getFieldDisplay('descripcion_area') || 'Sin descripción' }}</div>
                </div>

                <!-- 7. Quien Reporta -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Quien Reporta</div>
                  <div>{{ getFieldDisplay('quien_reporta_id') }}</div>
                </div>

                <!-- 8. Tipo -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Tipo</div>
                  <div>{{ getFieldDisplay('tipo_inspeccion_id') }}</div>
                </div>

                <!-- 9. Clasificación -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Clasificación (Formato KAPA)</div>
                  <div>{{ getFieldDisplay('clasificacion_inspeccion_id') }}</div>
                </div>

                <!-- 10. Estado -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Estado</div>
                  <div>
                    <q-chip 
                      :color="report.estado === 'abierto' ? 'orange' : 'green'" 
                      text-color="white" 
                      size="sm"
                      :label="report.estado"
                    />
                  </div>
                </div>

                <!-- 11. Observación -->
                <div class="col-12">
                  <div class="text-caption text-grey-7">Observación</div>
                  <div class="text-pre-wrap">{{ report.observacion || getFieldDisplay('observacion') || 'Sin observaciones' }}</div>
                </div>
              </div>
            </div>

            <!-- ============================================ -->
            <!-- AUDITORÍA CRUZADA (Opción 2) -->
            <!-- ============================================ -->
            <div v-if="report.tipo === 'auditoria'">
              <div class="text-subtitle1 q-mb-md">
                <q-icon name="swap_horiz" class="q-mr-sm" />
                Auditoría Cruzada
              </div>
              
              <div class="row q-col-gutter-md q-mb-lg">
                <!-- 1. Fecha -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Fecha de la Auditoría</div>
                  <div>{{ report.fecha ? formatDateShort(report.fecha) : 'N/A' }}</div>
                </div>

                <!-- 2. Cliente -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Cliente</div>
                  <div>{{ report.client?.name || 'N/A' }}</div>
                </div>

                <!-- 3. Proyecto -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Proyecto</div>
                  <div>{{ report.project?.name || 'N/A' }}</div>
                </div>

                <!-- 4. Área -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Área</div>
                  <div>{{ getFieldDisplay('area_auditoria_id') }}</div>
                </div>

                <!-- 5. Descripción del área -->
                <div class="col-12">
                  <div class="text-caption text-grey-7">Descripción detallada del área</div>
                  <div class="text-pre-wrap">{{ getFieldDisplay('descripcion_area') || 'Sin descripción' }}</div>
                </div>

                <!-- 6. Empresa Auditora -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Empresa Auditora (Quien ejecuta)</div>
                  <div>{{ report.contractor?.name || 'N/A' }}</div>
                </div>

                <!-- 7. Empresa Auditada -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Empresa Auditada</div>
                  <div>{{ report.empresa_auditada?.name || 'N/A' }}</div>
                </div>

                <!-- 8. Clasificación -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Clasificación</div>
                  <div>{{ getFieldDisplay('clasificacion_auditoria_id') }}</div>
                </div>

                <!-- 9. Estado -->
                <div class="col-md-6 col-xs-12">
                  <div class="text-caption text-grey-7">Estado</div>
                  <div>
                    <q-chip 
                      :color="report.estado === 'abierto' ? 'orange' : 'green'" 
                      text-color="white" 
                      size="sm"
                      :label="report.estado"
                    />
                  </div>
                </div>

                <!-- 10. Observación -->
                <div class="col-12">
                  <div class="text-caption text-grey-7">Observación</div>
                  <div class="text-pre-wrap">{{ report.observacion || getFieldDisplay('observacion') || 'Sin observaciones' }}</div>
                </div>
              </div>
            </div>

            <!-- Información adicional -->
            <q-separator class="q-my-md" />
            
            <div class="row q-col-gutter-md">
              <div class="col-md-6 col-xs-12">
                <div class="text-caption text-grey-7">Fecha de Creación del Reporte</div>
                <div>{{ formatDate(report.creado_en) }}</div>
              </div>

              <div class="col-md-6 col-xs-12">
                <div class="text-caption text-grey-7">Creado por</div>
                <div>{{ report.created_by?.name || report.owner?.name || 'N/A' }}</div>
              </div>
            </div>

            <!-- Información de cierre -->
            <div v-if="report.estado === 'cerrado'" class="q-mt-lg">
              <q-separator class="q-mb-md" />
              <div class="text-subtitle1 q-mb-md text-green">
                <q-icon name="check_circle" class="q-mr-sm" />
                Información de Cierre
              </div>
              
              <div>
                <div class="text-caption text-grey-7">Fecha de Cierre</div>
                <div>{{ formatDate(report.fecha_cierre) }}</div>
              </div>
            </div>

            <!-- ============================================ -->
            <!-- FORMULARIOS DINÁMICOS -->
            <!-- ============================================ -->
            <div v-if="clasificacionId" class="q-mt-lg">
              <q-separator class="q-mb-md" />
              <div class="text-subtitle1 q-mb-md">
                <q-icon name="dynamic_form" class="q-mr-sm" />
                Formularios de {{ report.tipo === 'tecnica' ? 'Inspección' : 'Auditoría' }}
              </div>
              <dynamic-forms-section
                :clasificacion-id="clasificacionId"
                :report-id="report.report_id"
                :readonly="true"
              />
            </div>

            <!-- ============================================ -->
            <!-- ADJUNTOS / EVIDENCIAS FOTOGRÁFICAS -->
            <!-- ============================================ -->
            <div v-if="attachments.length > 0" class="q-mt-lg">
              <q-separator class="q-mb-md" />
              <div class="text-subtitle1 q-mb-md">
                <q-icon name="photo_library" class="q-mr-sm" />
                Evidencias Fotográficas ({{ attachments.length }})
              </div>
              
              <div class="row q-gutter-md">
                <div 
                  v-for="att in attachments" 
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
                          style="max-height: 120px; border-radius: 8px; cursor: pointer;"
                          loading="lazy"
                          @click="openPreview(att)"
                        >
                          <template v-slot:loading>
                            <q-spinner color="primary" size="sm" />
                          </template>
                        </q-img>
                      </div>
                      
                      <!-- Icono para PDFs -->
                      <div v-else class="q-mb-sm q-py-md">
                        <q-icon name="picture_as_pdf" color="red" size="4rem" />
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
                        icon="visibility" 
                        color="primary" 
                        size="sm"
                        @click="openPreview(att)"
                      >
                        <q-tooltip>Ver</q-tooltip>
                      </q-btn>
                      <q-btn 
                        flat 
                        dense 
                        icon="download" 
                        color="secondary" 
                        size="sm"
                        @click="downloadAttachment(att)"
                      >
                        <q-tooltip>Descargar</q-tooltip>
                      </q-btn>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Error -->
        <q-card v-else>
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="error" size="64px" color="negative" />
            <p class="text-h6 q-mt-md">No se pudo cargar la inspección</p>
            <q-btn color="primary" label="Volver" @click="$router.back()" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'
import inspeccionesService from 'src/services/inspeccionesService'
import DynamicFormsSection from 'src/components/form-builder/DynamicFormsSection.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(true)
const report = ref(null)
const attachments = ref([])
const downloadingPdf = ref(false)

const isAdmin = computed(() => {
  const roleId = authStore.user?.role_id ?? authStore.user?.role?.role_id
  return roleId === 1
})

const canEdit = computed(() => {
  if (!report.value) return false
  return isAdmin.value || report.value.estado === 'abierto'
})

// Obtener el ID de clasificación según el tipo de reporte
const clasificacionId = computed(() => {
  if (!report.value?.fields) return null
  
  const fieldKey = report.value.tipo === 'tecnica' 
    ? 'clasificacion_inspeccion_id' 
    : 'clasificacion_auditoria_id'
  
  const field = report.value.fields.find(f => f.key === fieldKey)
  return field?.value ? parseInt(field.value, 10) : null
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (date) => {
  if (!date) return 'N/A'
  // Evitar problemas de zona horaria parseando la fecha como local
  let dateObj
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    // Si es string ISO, parsear los componentes manualmente
    const [year, month, day] = date.split('T')[0].split('-').map(Number)
    dateObj = new Date(year, month - 1, day)
  } else {
    dateObj = new Date(date)
  }
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getFieldDisplay = (key) => {
  if (!report.value?.fields) return 'N/A'
  const field = report.value.fields.find(f => f.key === key)
  return field?.value_display || field?.value || 'N/A'
}

const editReport = () => {
  router.push({ name: 'inspeccionesEditar', params: { id: report.value.report_id } })
}

const loadReport = async () => {
  loading.value = true
  try {
    report.value = await inspeccionesService.getReportById(route.params.id)
    // Cargar adjuntos
    attachments.value = await inspeccionesService.getAttachments(route.params.id)
  } catch (error) {
    console.error('Error loading report:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar la inspección', position: 'top' })
  } finally {
    loading.value = false
  }
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

const downloadPdf = async () => {
  downloadingPdf.value = true
  try {
    const response = await api.get(`/inspecciones-reports/${report.value.report_id}/export/pdf`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inspeccion_${report.value.report_id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    $q.notify({ type: 'positive', message: 'PDF descargado correctamente', position: 'top' })
  } catch (error) {
    console.error('Error downloading PDF:', error)
    $q.notify({ type: 'negative', message: 'Error al descargar el PDF', position: 'top' })
  } finally {
    downloadingPdf.value = false
  }
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.text-pre-wrap {
  white-space: pre-wrap;
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
