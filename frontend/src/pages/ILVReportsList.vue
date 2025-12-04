<template>
  <q-page padding>
    <div class="row q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none">📋 Reportes ILV</h4>
        <p class="text-grey-6">Listado completo de reportes con filtros avanzados</p>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn 
          v-if="isAdmin && selected.length > 0"
          color="negative" 
          icon="delete" 
          :label="`Borrar (${selected.length})`"
          @click="confirmDelete"
        />
        <q-btn 
          color="primary" 
          icon="add" 
          label="Nuevo Reporte" 
          @click="$router.push({ name: 'ilvNuevoReporte' })"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-md-2 col-sm-4 col-xs-12">
            <q-select
              v-model="filters.tipo"
              :options="reportTypes"
              option-value="value"
              option-label="label"
              label="Tipo"
              clearable
              filled
              emit-value
              map-options
              @update:model-value="applyFilters"
            />
          </div>
          
          <div class="col-md-2 col-sm-4 col-xs-12">
            <q-select
              v-model="filters.estado"
              :options="estados"
              option-value="value"
              option-label="label"
              label="Estado"
              clearable
              filled
              emit-value
              map-options
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-3 col-sm-4 col-xs-12">
            <q-input
              v-model="filters.fecha_desde"
              label="Fecha Desde"
              type="date"
              filled
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-3 col-sm-4 col-xs-12">
            <q-input
              v-model="filters.fecha_hasta"
              label="Fecha Hasta"
              type="date"
              filled
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-auto">
            <q-btn 
              flat 
              icon="clear" 
              label="Limpiar" 
              @click="clearFilters"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-card>
      <q-table
        :rows="reports"
        :columns="columns"
        row-key="report_id"
        :loading="loading"
        :pagination="pagination"
        v-model:selected="selected"
        @request="onRequest"
        :selection="isAdmin ? 'multiple' : 'none'"
        binary-state-sort
      >
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip 
              :color="getTipoColor(props.value)" 
              text-color="white" 
              :icon="getTipoIcon(props.value)"
              dense
            >
              {{ getTipoLabel(props.value) }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip 
              :color="props.value === 'abierto' ? 'orange' : 'green'" 
              text-color="white" 
              dense
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-titulo="props">
          <q-td :props="props">
            {{ getFieldValue(props.row, 'titulo') || `Reporte #${props.row.report_id}` }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn 
              flat 
              round 
              icon="visibility" 
              color="primary" 
              @click.stop="viewReport(props.row.report_id)"
            />
            <q-btn 
              v-if="canEdit(props.row)"
              flat 
              round 
              icon="edit" 
              color="orange" 
              @click.stop="editReport(props.row.report_id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import ilvService from 'src/services/ilvService'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const reports = ref([])
const selected = ref([])

const isAdmin = computed(() => {
  const roleId = authStore.user?.role_id ?? authStore.user?.role?.role_id
  return roleId === 1
})

const filters = ref({
  tipo: null,
  estado: null,
  fecha_desde: null,
  fecha_hasta: null
})

const pagination = ref({
  sortBy: 'creado_en',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0
})

const columns = [
  {
    name: 'report_id',
    label: 'ID',
    align: 'left',
    field: 'report_id',
    sortable: true
  },
  {
    name: 'tipo',
    label: 'Tipo',
    align: 'left',
    field: 'tipo',
    sortable: true
  },
  {
    name: 'titulo',
    label: 'Título',
    align: 'left',
    field: 'titulo'
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    sortable: true
  },
  {
    name: 'proyecto',
    label: 'Proyecto',
    align: 'left',
    field: row => row.project?.name || 'N/A'
  },
  {
    name: 'creado_en',
    label: 'Fecha',
    align: 'left',
    field: 'creado_en',
    sortable: true,
    format: val => new Date(val).toLocaleDateString('es-ES')
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center'
  }
]

const reportTypes = [
  { value: 'hazard_id', label: 'Identificación de Peligros' },
  { value: 'wit', label: 'Walk & Talk' },
  { value: 'swa', label: 'Stop Work Authority' },
  { value: 'fdkar', label: 'Safety Cards' }
]

const estados = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' }
]

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  loading.value = true
  
  try {
    const params = {
      ...filters.value,
      page,
      limit: rowsPerPage,
      sortBy,
      order: descending ? 'DESC' : 'ASC'
    }
    
    const response = await ilvService.getReports(params)
    
    reports.value = response.data || response
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
    pagination.value.rowsNumber = response.total || reports.value.length
    
  } catch (error) {
    console.error('Error loading reports:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  onRequest({ pagination: pagination.value })
}

const clearFilters = () => {
  filters.value = {
    tipo: null,
    estado: null,
    fecha_desde: null,
    fecha_hasta: null
  }
  applyFilters()
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
    hazard_id: 'Hazard ID',
    wit: 'WIT',
    swa: 'SWA',
    fdkar: 'Safety Cards'
  }
  return labels[tipo] || tipo
}

const getFieldValue = (report, key) => {
  const field = report.fields?.find(f => f.key === key)
  // Priorizar value_display si existe (nombre legible), sino value (ID)
  return field?.value_display || field?.value || ''
}

const canEdit = (report) => {
  // Admins pueden editar cualquier reporte (incluso cerrados)
  if (isAdmin.value) {
    return true
  }
  // Otros usuarios solo pueden editar reportes abiertos
  return report.estado === 'abierto'
}

const viewReport = (reportId) => {
  router.push({ name: 'ilvReporteDetalle', params: { id: reportId } })
}

const editReport = (reportId) => {
  router.push({ name: 'ilvReporteEditar', params: { id: reportId } })
}

const confirmDelete = () => {
  $q.dialog({
    title: 'Confirmar borrado',
    message: `¿Está seguro de borrar ${selected.value.length} reporte(s)? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(async () => {
    await deleteBulk()
  })
}

const deleteBulk = async () => {
  loading.value = true
  try {
    const ids = selected.value.map(r => r.report_id)
    await ilvService.deleteBulk(ids)
    
    $q.notify({
      type: 'positive',
      message: `${ids.length} reporte(s) borrado(s) exitosamente`,
      position: 'top'
    })
    
    selected.value = []
    // Resetear a primera página para ver los reportes actualizados
    pagination.value.page = 1
    await onRequest({ pagination: pagination.value })
  } catch (error) {
    console.error('Error deleting reports:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al borrar reportes',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Asegurar que el authStore esté cargado
  if (!authStore.user) {
    await authStore.validateUser()
  }
  console.log('ILV Reports - User:', authStore.user)
  console.log('ILV Reports - Is Admin:', isAdmin.value)
  
  onRequest({ pagination: pagination.value })
})
</script>
