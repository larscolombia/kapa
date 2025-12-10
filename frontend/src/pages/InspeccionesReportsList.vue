<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <div class="text-h5">📋 Inspecciones</div>
        <p class="text-grey-6 q-mb-none">Gestión de Inspecciones Técnicas y Auditorías Cruzadas</p>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn-dropdown 
          color="secondary" 
          icon="download" 
          label="Exportar"
          :loading="exporting"
        >
          <q-list>
            <q-item clickable v-close-popup @click="exportToExcel">
              <q-item-section avatar>
                <q-icon name="table_chart" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Exportar a Excel</q-item-label>
                <q-item-label caption>Tabla con filtros aplicados</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
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
          label="Nueva Inspección" 
          @click="openNewDialog"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Primera fila de filtros -->
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.tipo"
              :options="tiposInspeccion"
              option-value="value"
              option-label="label"
              label="Tipo de Inspección"
              clearable
              filled
              dense
              emit-value
              map-options
              @update:model-value="applyFilters"
            />
          </div>
          
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.estado"
              :options="estados"
              option-value="value"
              option-label="label"
              label="Estado"
              clearable
              filled
              dense
              emit-value
              map-options
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.cliente_id"
              :options="clientes"
              option-value="client_id"
              option-label="name"
              label="Centro de Trabajo"
              clearable
              filled
              dense
              emit-value
              map-options
              @update:model-value="onClienteChange"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.proyecto_id"
              :options="proyectosFiltrados"
              option-value="project_id"
              option-label="name"
              label="Proyecto"
              clearable
              filled
              dense
              emit-value
              map-options
              :disable="!filters.cliente_id"
              @update:model-value="onProyectoChange"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.empresa_id"
              :options="empresasFiltradas"
              option-value="contractor_id"
              option-label="name"
              label="Empresa/Contratista"
              clearable
              filled
              dense
              emit-value
              map-options
              :disable="!filters.proyecto_id"
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.clasificacion_id"
              :options="clasificacionesOptions"
              option-value="value"
              option-label="label"
              label="Clasificación"
              clearable
              filled
              dense
              emit-value
              map-options
              @update:model-value="applyFilters"
            />
          </div>

          <!-- Segunda fila de filtros -->
          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.fecha_desde"
              label="Fecha Desde"
              type="date"
              filled
              dense
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.fecha_hasta"
              label="Fecha Hasta"
              type="date"
              filled
              dense
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-2 col-sm-6 col-xs-12">
            <q-btn 
              flat 
              icon="clear" 
              label="Limpiar" 
              color="grey"
              class="full-width"
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
        v-model:pagination="pagination"
        v-model:selected="selected"
        @request="onRequest"
        :selection="isAdmin ? 'multiple' : 'none'"
        binary-state-sort
      >
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip 
              :color="props.value === 'tecnica' ? 'blue' : 'purple'" 
              text-color="white" 
              :icon="props.value === 'tecnica' ? 'engineering' : 'swap_horiz'"
              size="sm"
            >
              {{ props.value === 'tecnica' ? 'Técnica' : 'Auditoría' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip 
              :color="props.value === 'abierto' ? 'orange' : 'green'" 
              text-color="white" 
              size="sm"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-clasificacion="props">
          <q-td :props="props">
            {{ getClasificacion(props.row) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn 
              flat 
              round 
              icon="visibility" 
              color="primary" 
              size="sm"
              @click="viewReport(props.row.report_id)"
            >
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
            <q-btn 
              v-if="canEdit(props.row)"
              flat 
              round 
              icon="edit" 
              color="orange" 
              size="sm"
              @click="editReport(props.row.report_id)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn 
              flat 
              round 
              icon="picture_as_pdf" 
              color="red-7" 
              size="sm"
              :loading="downloadingPdf === props.row.report_id"
              @click="downloadPdf(props.row.report_id)"
            >
              <q-tooltip>Descargar PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog para seleccionar tipo de inspección -->
    <q-dialog v-model="showNewDialog">
      <q-card style="width: 400px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">Nueva Inspección</div>
          <p class="text-grey-6">Seleccione el tipo de inspección a crear</p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list>
            <q-item 
              v-if="canCreateTecnica"
              clickable 
              v-ripple 
              @click="createNew('tecnica')"
              class="rounded-borders q-mb-sm"
              style="border: 1px solid #e0e0e0;"
            >
              <q-item-section avatar>
                <q-avatar color="blue" text-color="white" icon="engineering" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Opción 1: Inspección Técnica</q-item-label>
                <q-item-label caption>Seguridad, Medio Ambiente, Salud</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey" />
              </q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              v-ripple 
              @click="createNew('auditoria')"
              class="rounded-borders"
              style="border: 1px solid #e0e0e0;"
            >
              <q-item-section avatar>
                <q-avatar color="purple" text-color="white" icon="swap_horiz" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Opción 2: Auditoría Cruzada</q-item-label>
                <q-item-label caption>Auditorías entre empresas</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import inspeccionesService from 'src/services/inspeccionesService'
import { getClients } from 'src/services/clientService'
import { getProjects } from 'src/services/projectService'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const exporting = ref(false)
const downloadingPdf = ref(null)
const reports = ref([])
const selected = ref([])
const showNewDialog = ref(false)

// Datos para filtros
const clientes = ref([])
const proyectos = ref([])
const clasificacionesTecnicas = ref([])
const clasificacionesAuditoria = ref([])

const isAdmin = computed(() => {
  const roleId = authStore.user?.role_id ?? authStore.user?.role?.role_id
  return roleId === 1
})

const canCreateTecnica = computed(() => {
  const roleId = authStore.user?.role_id ?? authStore.user?.role?.role_id
  return [1, 2, 3].includes(roleId)
})

const filters = ref({
  tipo: null,
  estado: null,
  fecha_desde: null,
  fecha_hasta: null,
  cliente_id: null,
  proyecto_id: null,
  empresa_id: null,
  clasificacion_id: null
})

// Proyectos filtrados por cliente
const proyectosFiltrados = computed(() => {
  if (!filters.value.cliente_id) return []
  return proyectos.value.filter(p => p.client?.client_id === filters.value.cliente_id)
})

// Empresas filtradas por proyecto
const empresasFiltradas = computed(() => {
  if (!filters.value.proyecto_id) return []
  const proyecto = proyectos.value.find(p => p.project_id === filters.value.proyecto_id)
  if (!proyecto || !proyecto.projectContractors) return []
  return proyecto.projectContractors.map(pc => ({
    contractor_id: pc.contractor_id,
    name: pc.name || pc.contractor_name
  }))
})

// Clasificaciones combinadas (técnicas + auditoría)
const clasificacionesOptions = computed(() => {
  const tecnicas = clasificacionesTecnicas.value.map(c => ({
    value: `tecnica_${c.maestro_id}`,
    label: `[Técnica] ${c.valor}`
  }))
  const auditoria = clasificacionesAuditoria.value.map(c => ({
    value: `auditoria_${c.maestro_id}`,
    label: `[Auditoría] ${c.valor}`
  }))
  return [...tecnicas, ...auditoria]
})

const pagination = ref({
  sortBy: 'creado_en',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0
})

const columns = [
  { name: 'report_id', label: 'ID', align: 'left', field: 'report_id', sortable: true },
  { name: 'tipo', label: 'Tipo', align: 'left', field: 'tipo', sortable: true },
  { name: 'clasificacion', label: 'Clasificación/Área', align: 'left', sortable: false },
  { name: 'cliente', label: 'Centro de Trabajo', align: 'left', field: row => row.client?.name || 'N/A', sortable: true },
  { name: 'proyecto', label: 'Proyecto', align: 'left', field: row => row.project?.name || 'N/A', sortable: true },
  { name: 'empresa', label: 'Empresa/Contratista', align: 'left', field: row => row.contractor?.name || 'N/A', sortable: true },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado', sortable: true },
  { name: 'fecha', label: 'Fecha Inspección', align: 'left', field: 'fecha', sortable: true, format: val => formatDateLocal(val) },
  { name: 'creado_en', label: 'Fecha Registro', align: 'left', field: 'creado_en', sortable: true, format: val => formatDateLocal(val) },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

// Función para formatear fecha evitando problemas de zona horaria
const formatDateLocal = (date) => {
  if (!date) return 'N/A'
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [year, month, day] = date.split('T')[0].split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('es-ES')
  }
  return new Date(date).toLocaleDateString('es-ES')
}

const tiposInspeccion = [
  { value: 'tecnica', label: 'Inspección Técnica' },
  { value: 'auditoria', label: 'Auditoría Cruzada' }
]

const estados = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' }
]

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  loading.value = true
  
  try {
    // Construir parámetros de filtro
    const params = { 
      page, 
      limit: rowsPerPage, 
      sortBy: sortBy || 'creado_en', 
      order: descending ? 'DESC' : 'ASC' 
    }
    
    // Agregar filtros que tengan valor
    if (filters.value.tipo) params.tipo = filters.value.tipo
    if (filters.value.estado) params.estado = filters.value.estado
    if (filters.value.fecha_desde) params.fecha_desde = filters.value.fecha_desde
    if (filters.value.fecha_hasta) params.fecha_hasta = filters.value.fecha_hasta
    if (filters.value.cliente_id) params.cliente_id = filters.value.cliente_id
    if (filters.value.proyecto_id) params.proyecto_id = filters.value.proyecto_id
    if (filters.value.empresa_id) params.empresa_id = filters.value.empresa_id
    
    // Manejar clasificación (puede ser técnica o auditoría)
    if (filters.value.clasificacion_id) {
      const [tipoClasif, id] = filters.value.clasificacion_id.split('_')
      if (tipoClasif === 'tecnica') {
        params.clasificacion_inspeccion_id = parseInt(id)
      } else if (tipoClasif === 'auditoria') {
        params.clasificacion_auditoria_id = parseInt(id)
      }
    }
    
    const response = await inspeccionesService.getReports(params)
    
    reports.value = response.data || response
    pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending, rowsNumber: response.total || reports.value.length }
  } catch (error) {
    console.error('Error loading reports:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar inspecciones', position: 'top' })
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
    fecha_hasta: null,
    cliente_id: null,
    proyecto_id: null,
    empresa_id: null,
    clasificacion_id: null
  }
  applyFilters()
}

// Handlers para cambios en filtros dependientes
const onClienteChange = () => {
  filters.value.proyecto_id = null
  filters.value.empresa_id = null
  applyFilters()
}

const onProyectoChange = () => {
  filters.value.empresa_id = null
  applyFilters()
}

const getClasificacion = (report) => {
  const field = report.fields?.find(f => f.key === 'clasificacion_inspeccion_id' || f.key === 'area_auditoria_id')
  return field?.value_display || field?.value || 'N/A'
}

const canEdit = (report) => isAdmin.value || report.estado === 'abierto'
const openNewDialog = () => { showNewDialog.value = true }
const createNew = (tipo) => { showNewDialog.value = false; router.push({ name: 'inspeccionesNuevo', query: { tipo } }) }
const viewReport = (reportId) => { router.push({ name: 'inspeccionesDetalle', params: { id: reportId } }) }
const editReport = (reportId) => { router.push({ name: 'inspeccionesEditar', params: { id: reportId } }) }

const confirmDelete = () => {
  $q.dialog({
    title: 'Confirmar borrado',
    message: `¿Está seguro de borrar ${selected.value.length} inspección(es)? Esta acción no se puede deshacer.`,
    cancel: true, persistent: true, color: 'negative'
  }).onOk(async () => { await deleteBulk() })
}

const deleteBulk = async () => {
  loading.value = true
  try {
    const ids = selected.value.map(r => r.report_id)
    await inspeccionesService.deleteBulk(ids)
    $q.notify({ type: 'positive', message: `${ids.length} inspección(es) borrada(s) exitosamente`, position: 'top' })
    selected.value = []
    pagination.value.page = 1
    await onRequest({ pagination: pagination.value })
  } catch (error) {
    console.error('Error deleting reports:', error)
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al borrar inspecciones', position: 'top' })
  } finally {
    loading.value = false
  }
}

// Exportar tabla a Excel con filtros aplicados
const exportToExcel = async () => {
  exporting.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.tipo) params.append('tipo', filters.value.tipo)
    if (filters.value.estado) params.append('estado', filters.value.estado)
    if (filters.value.cliente_id) params.append('cliente_id', filters.value.cliente_id)
    if (filters.value.proyecto_id) params.append('proyecto_id', filters.value.proyecto_id)
    if (filters.value.fecha_desde) params.append('fecha_desde', filters.value.fecha_desde)
    if (filters.value.fecha_hasta) params.append('fecha_hasta', filters.value.fecha_hasta)
    if (filters.value.clasificacion_id) params.append('clasificacion_id', filters.value.clasificacion_id)

    const response = await api.get(`/inspecciones/export/excel?${params}`, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inspecciones_${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'Excel descargado exitosamente',
      position: 'top'
    })
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a Excel',
      position: 'top'
    })
  } finally {
    exporting.value = false
  }
}

// Descargar PDF individual de una inspección
const downloadPdf = async (reportId) => {
  downloadingPdf.value = reportId
  try {
    const response = await api.get(`/inspecciones/export/pdf/${reportId}`, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inspeccion_${reportId}_${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'PDF descargado exitosamente',
      position: 'top'
    })
  } catch (error) {
    console.error('Error downloading PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al descargar PDF',
      position: 'top'
    })
  } finally {
    downloadingPdf.value = null
  }
}

onMounted(async () => {
  if (!authStore.user) await authStore.validateUser()
  
  // Cargar datos para filtros en paralelo
  try {
    const [clientesData, proyectosData, clasificacionesTecData, clasificacionesAudData] = await Promise.all([
      getClients(),
      getProjects(),
      inspeccionesService.getAllClasificacionesTecnicas().catch(() => []), // Todas las clasificaciones técnicas
      inspeccionesService.getClasificacionesAuditoria().catch(() => [])
    ])
    
    clientes.value = clientesData || []
    proyectos.value = proyectosData || []
    clasificacionesTecnicas.value = clasificacionesTecData || []
    clasificacionesAuditoria.value = clasificacionesAudData || []
  } catch (error) {
    console.error('Error cargando datos de filtros:', error)
  }
  
  onRequest({ pagination: pagination.value })
})
</script>
