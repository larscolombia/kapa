<template>
  <!-- Layout standalone sin MainLayout -->
  <div class="ilv-close-public-page">
    <!-- Header branding -->
    <div class="header-bar bg-primary text-white q-pa-md">
      <div class="container">
        <div class="text-h5">KAPA - Sistema ILV</div>
        <div class="text-caption">Cierre de Reporte</div>
      </div>
    </div>

    <div class="container q-pa-md">
      <!-- Loading state -->
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-puff size="80px" color="primary" />
        <div class="full-width text-center q-mt-md text-grey-7">
          Validando token y cargando reporte...
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="row justify-center">
        <div class="col-md-6 col-xs-12">
          <q-card class="q-pa-md">
            <q-card-section class="text-center">
              <q-icon :name="errorIcon" size="4rem" :color="errorColor" />
              <div class="text-h6 q-mt-md">{{ errorTitle }}</div>
              <p class="text-grey-7">{{ errorMessage }}</p>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Success state -->
      <div v-else-if="success" class="row justify-center">
        <div class="col-md-8 col-xs-12">
          <q-card class="q-pa-md">
            <q-card-section class="text-center">
              <q-icon name="check_circle" size="5rem" color="green" />
              <div class="text-h5 q-mt-md text-green">Reporte Cerrado Exitosamente</div>
              <p class="text-body1 q-mt-md">
                El reporte <strong>#{{ report.report_id }}</strong> ha sido cerrado correctamente.
              </p>
              
              <div class="q-mt-lg text-left bg-grey-2 q-pa-md rounded-borders">
                <div class="text-subtitle2 q-mb-sm">Resumen del cierre:</div>
                <ul class="text-body2">
                  <li><strong>Tipo:</strong> {{ getTipoLabel(report.tipo) }}</li>
                  <li><strong>Proyecto:</strong> {{ report.project?.name || 'N/A' }}</li>
                  <li><strong>Fecha cierre:</strong> {{ formatDateTime(new Date()) }}</li>
                  <li><strong>Plan de acción registrado:</strong> Sí</li>
                </ul>
              </div>

              <div class="q-mt-md text-caption text-grey-6">
                Este reporte ahora está marcado como cerrado en el sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Form state -->
      <div v-else-if="report" class="row justify-center">
        <div class="col-md-10 col-xs-12">
          <!-- Datos del reporte (readonly) -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h5">
                    <q-chip 
                      :color="getTipoColor(report.tipo)" 
                      text-color="white" 
                      :icon="getTipoIcon(report.tipo)"
                      size="md"
                    >
                      {{ getTipoLabel(report.tipo) }}
                    </q-chip>
                    Reporte #{{ report.report_id }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-chip color="orange" text-color="white" icon="pending">
                    {{ report.estado.toUpperCase() }}
                  </q-chip>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row q-gutter-md">
                <div class="col-md-5 col-xs-12">
                  <div class="text-subtitle2 text-grey-7">Proyecto</div>
                  <div class="text-body1">{{ report.project?.name || 'N/A' }}</div>
                </div>
                <div class="col-md-5 col-xs-12">
                  <div class="text-subtitle2 text-grey-7">Cliente</div>
                  <div class="text-body1">{{ report.client?.name || 'N/A' }}</div>
                </div>
                <div class="col-md-5 col-xs-12">
                  <div class="text-subtitle2 text-grey-7">Fecha de creación</div>
                  <div class="text-body1">{{ formatDate(report.creado_en) }}</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Campos dinámicos -->
              <div class="text-subtitle1 q-mb-md">Detalles del Reporte</div>
              <div class="row q-gutter-md">
                <div 
                  v-for="field in displayFields" 
                  :key="field.key"
                  class="col-md-5 col-xs-12"
                >
                  <div class="text-subtitle2 text-grey-7">{{ formatFieldLabel(field.key) }}</div>
                  <div class="text-body2">{{ field.value || 'N/A' }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Formulario de cierre -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Cierre del Reporte</div>
              <p class="text-grey-7">
                Por favor, complete la información de cierre del reporte.
              </p>

              <q-form @submit="submitClose">
                <q-input
                  v-model="closeForm.descripcion_cierre"
                  type="textarea"
                  label="Descripción de Cierre *"
                  hint="¿Qué acciones se tomaron? ¿Qué acuerdos se generaron? (Mínimo 50 caracteres)"
                  rows="5"
                  filled
                  counter
                  maxlength="2000"
                  :rules="[
                    val => !!val || 'La descripción de cierre es obligatoria',
                    val => val.length >= 50 || 'Mínimo 50 caracteres requeridos'
                  ]"
                  :readonly="submitting"
                >
                  <template v-slot:append>
                    <q-icon 
                      :name="closeForm.descripcion_cierre.length >= 50 ? 'check_circle' : 'edit'" 
                      :color="closeForm.descripcion_cierre.length >= 50 ? 'green' : 'grey'"
                    />
                  </template>
                </q-input>

                <div class="q-mt-md text-caption" :class="closeForm.descripcion_cierre.length >= 50 ? 'text-green' : 'text-orange'">
                  {{ closeForm.descripcion_cierre.length }} / 50 caracteres mínimos
                </div>

                <!-- Campos adicionales según tipo -->
                <div v-if="report.tipo === 'fdkar'" class="q-mt-md">
                  <q-input
                    v-model="closeForm.plan_accion_propuesto"
                    type="textarea"
                    label="Plan de Acción Propuesto *"
                    hint="Describe el plan de acción específico para Safety Cards"
                    rows="4"
                    filled
                    counter
                    maxlength="1000"
                    :rules="[val => !!val || 'El plan de acción es obligatorio']"
                    :readonly="submitting"
                  />

                  <q-input
                    v-model="closeForm.evidencia_cierre"
                    type="text"
                    label="Evidencia de Cierre *"
                    hint="Ej: Fotografía, documento, inspección realizada"
                    filled
                    class="q-mt-md"
                    :rules="[val => !!val || 'La evidencia es obligatoria']"
                    :readonly="submitting"
                  />

                  <q-input
                    v-model="closeForm.fecha_implantacion"
                    type="date"
                    label="Fecha de Implantación *"
                    filled
                    class="q-mt-md"
                    :rules="[val => !!val || 'La fecha es obligatoria']"
                    :readonly="submitting"
                  />
                </div>

                <div class="q-mt-lg">
                  <q-btn 
                    type="submit" 
                    color="primary" 
                    icon="check_circle" 
                    label="Cerrar Reporte" 
                    size="lg"
                    :loading="submitting"
                    :disable="closeForm.descripcion_cierre.length < 50"
                    class="full-width"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-bar bg-grey-3 q-pa-md q-mt-xl text-center text-grey-7">
      <div class="text-caption">
        © 2025 KAPA - Sistema de Gestión ILV
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import ilvService from 'src/services/ilvService'

const route = useRoute()
const $q = useQuasar()

const loading = ref(true)
const submitting = ref(false)
const report = ref(null)
const error = ref(false)
const success = ref(false)

const errorTitle = ref('')
const errorMessage = ref('')
const errorIcon = ref('error')
const errorColor = ref('negative')

const closeForm = ref({
  descripcion_cierre: '',
  plan_accion_propuesto: '',
  evidencia_cierre: '',
  fecha_implantacion: ''
})

const displayFields = computed(() => {
  if (!report.value?.fields) return []
  
  // Filtrar campos básicos que ya mostramos arriba
  const excludeFields = ['titulo']
  
  return report.value.fields
    .filter(f => !excludeFields.includes(f.key))
    .map(f => ({
      key: f.key,
      value: f.value
    }))
})

const loadReport = async () => {
  const token = route.query.token || route.query.t
  const reportId = route.query.id || route.query.reportId

  if (!token) {
    showError(
      'Token no encontrado',
      'El enlace no contiene un token de acceso válido. Por favor, utilice el enlace enviado por correo.',
      'link_off',
      'orange'
    )
    loading.value = false
    return
  }

  if (!reportId) {
    showError(
      'ID de reporte no encontrado',
      'El enlace no contiene un ID de reporte válido.',
      'report_off',
      'orange'
    )
    loading.value = false
    return
  }

  try {
    report.value = await ilvService.getReportPublic(reportId, token)
    
    // Verificar si ya está cerrado
    if (report.value.estado === 'cerrado') {
      showError(
        'Reporte ya cerrado',
        'Este reporte ya fue cerrado anteriormente.',
        'check_circle',
        'green'
      )
    }
  } catch (err) {
    console.error('Error loading report:', err)
    
    // Mensajes específicos según el error
    if (err.message?.includes('expirado') || err.message?.includes('expired')) {
      showError(
        'Token expirado',
        'El enlace ha expirado (más de 72 horas). Por favor, contacte al administrador para generar un nuevo enlace.',
        'schedule',
        'orange'
      )
    } else if (err.message?.includes('usado') || err.message?.includes('used')) {
      showError(
        'Token ya utilizado',
        'Este enlace ya fue utilizado anteriormente para cerrar el reporte.',
        'check_circle',
        'green'
      )
    } else if (err.message?.includes('inválido') || err.message?.includes('invalid') || err.statusCode === 401) {
      showError(
        'Token inválido',
        'El enlace no es válido. Por favor, verifique que está utilizando el enlace correcto enviado por correo.',
        'error',
        'negative'
      )
    } else {
      showError(
        'Error al cargar el reporte',
        'No se pudo cargar la información del reporte. Por favor, intente nuevamente más tarde.',
        'error',
        'negative'
      )
    }
  } finally {
    loading.value = false
  }
}

const showError = (title, message, icon, color) => {
  error.value = true
  errorTitle.value = title
  errorMessage.value = message
  errorIcon.value = icon
  errorColor.value = color
}

const submitClose = async () => {
  const token = route.query.token || route.query.t

  if (!token || !report.value) return

  submitting.value = true

  try {
    // Preparar datos según el tipo de reporte
    const closeData = {
      descripcion_cierre: closeForm.value.descripcion_cierre
    }

    // Campos adicionales para Safety Cards
    if (report.value.tipo === 'fdkar') {
      closeData.plan_accion_propuesto = closeForm.value.plan_accion_propuesto
      closeData.evidencia_cierre = closeForm.value.evidencia_cierre
      closeData.fecha_implantacion = closeForm.value.fecha_implantacion
    }

    await ilvService.closeReport(token, closeData)

    success.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    console.error('Error closing report:', err)
    
    $q.notify({
      type: 'negative',
      message: err.message || 'Error al cerrar el reporte. Por favor, intente nuevamente.',
      position: 'top',
      timeout: 5000
    })
  } finally {
    submitting.value = false
  }
}

// Helpers
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

const formatFieldLabel = (key) => {
  const labels = {
    descripcion: 'Descripción',
    ubicacion: 'Ubicación',
    fecha_evento: 'Fecha del Evento',
    severidad: 'Severidad',
    area: 'Área',
    descripcion_condicion: 'Descripción de la Condición',
    causa_probable: 'Causa Probable',
    accion_inmediata: 'Acción Inmediata',
    conducta_observada: 'Conducta Observada',
    riesgo_asociado: 'Riesgo Asociado',
    recomendacion: 'Recomendación',
    responsable: 'Responsable',
    testigo: 'Testigo',
    hora_inicio_parada: 'Hora Inicio Parada',
    hora_reinicio: 'Hora Reinicio',
    motivo: 'Motivo',
    quien_reporta: 'Quién Reporta',
    clasificacion: 'Clasificación',
    plan_accion_propuesto: 'Plan de Acción Propuesto'
  }
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date) => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.ilv-close-public-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f5f5f5, #ffffff);
}

.header-bar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer-bar {
  margin-top: auto;
}

.rounded-borders {
  border-radius: 8px;
}
</style>