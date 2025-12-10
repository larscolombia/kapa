<template>
  <q-page padding>
    <div class="row q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none">📋 Reportes ILV</h4>
        <p class="text-grey-6">Listado completo de reportes con filtros avanzados</p>
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
          label="Nuevo Reporte" 
          @click="$router.push({ name: 'ilvNuevoReporte' })"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <!-- Primera fila: Tipo, Estado, Centro de Trabajo -->
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
              @update:model-value="onTipoChange"
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

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.cliente_id"
              :options="clientes"
              option-value="client_id"
              option-label="name"
              label="Centro de Trabajo"
              clearable
              filled
              emit-value
              map-options
              :loading="loadingClientes"
              @update:model-value="onClienteChange"
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.proyecto_id"
              :options="proyectosFiltrados"
              option-value="project_id"
              option-label="name"
              label="Proyecto"
              clearable
              filled
              emit-value
              map-options
              :loading="loadingProyectos"
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
              emit-value
              map-options
              :loading="loadingEmpresas"
              :disable="!filters.proyecto_id"
              @update:model-value="applyFilters"
            />
          </div>
        </div>

        <!-- Segunda fila: Categoría, Subcategoría, Responsable -->
        <div class="row q-gutter-md q-mt-sm items-center">
          <div class="col-md-2 col-sm-4 col-xs-12">
            <q-select
              v-model="filters.categoria_id"
              :options="categorias"
              option-value="maestro_id"
              option-label="valor"
              label="Categoría"
              clearable
              filled
              emit-value
              map-options
              :loading="loadingCategorias"
              :disable="!filters.tipo"
              @update:model-value="onCategoriaChange"
            />
          </div>

          <div class="col-md-2 col-sm-4 col-xs-12">
            <q-select
              v-model="filters.subcategoria_id"
              :options="subcategoriasFiltradas"
              option-value="maestro_id"
              option-label="valor"
              label="Subcategoría"
              clearable
              filled
              emit-value
              map-options
              :loading="loadingSubcategorias"
              :disable="!filters.categoria_id"
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
              label="Limpiar Filtros" 
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
            >
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
            <q-btn 
              v-if="canEdit(props.row)"
              flat 
              round 
              icon="edit" 
              color="orange" 
              @click.stop="editReport(props.row.report_id)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn 
              flat 
              round 
              icon="picture_as_pdf" 
              color="red-7"
              :loading="downloadingPdf === props.row.report_id"
              @click.stop="downloadPdf(props.row.report_id)"
            >
              <q-tooltip>Descargar PDF</q-tooltip>
            </q-btn>
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
import { getClients } from 'src/services/clientService'
import { getProjects } from 'src/services/projectService'
import { getContractors } from 'src/services/contractorService'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const loadingClientes = ref(false)
const loadingProyectos = ref(false)
const loadingEmpresas = ref(false)
const loadingCategorias = ref(false)
const loadingSubcategorias = ref(false)
const exporting = ref(false)
const downloadingPdf = ref(null)
const reports = ref([])
const selected = ref([])
const clientes = ref([])
const proyectos = ref([])
const contratistas = ref([])
const categorias = ref([])
const subcategorias = ref([])

const isAdmin = computed(() => {
  const roleId = authStore.user?.role_id ?? authStore.user?.role?.role_id
  return roleId === 1
})

// Proyectos filtrados por cliente seleccionado
const proyectosFiltrados = computed(() => {
  if (!filters.value.cliente_id) return proyectos.value
  return proyectos.value.filter(p => p.client?.client_id === filters.value.cliente_id)
})

// Empresas/Contratistas filtrados por proyecto seleccionado
const empresasFiltradas = computed(() => {
  if (!filters.value.proyecto_id) return contratistas.value
  const proyecto = proyectos.value.find(p => p.project_id === filters.value.proyecto_id)
  if (!proyecto || !proyecto.projectContractors) return contratistas.value
  // Extraer contratistas del proyecto
  return proyecto.projectContractors.map(pc => pc.contractor || pc).filter(c => c)
})

// Subcategorías filtradas por categoría seleccionada
const subcategoriasFiltradas = computed(() => {
  if (!filters.value.categoria_id) return subcategorias.value
  return subcategorias.value.filter(s => s.parent_id === filters.value.categoria_id)
})

const filters = ref({
  tipo: null,
  estado: null,
  fecha_desde: null,
  fecha_hasta: null,
  cliente_id: null,
  proyecto_id: null,
  empresa_id: null,
  categoria_id: null,
  subcategoria_id: null
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
    name: 'cliente',
    label: 'Centro de Trabajo',
    align: 'left',
    field: row => row.client?.name || 'N/A',
    sortable: true
  },
  {
    name: 'proyecto',
    label: 'Proyecto',
    align: 'left',
    field: row => row.project?.name || 'N/A',
    sortable: true
  },
  {
    name: 'empresa',
    label: 'Empresa/Contratista',
    align: 'left',
    field: row => row.contractor?.name || 'N/A',
    sortable: true
  },
  {
    name: 'creado_en',
    label: 'Fecha Registro',
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

const onClienteChange = () => {
  // Al cambiar cliente, limpiar proyecto y empresa
  filters.value.proyecto_id = null
  filters.value.empresa_id = null
  applyFilters()
}

const onProyectoChange = () => {
  // Al cambiar proyecto, limpiar empresa
  filters.value.empresa_id = null
  applyFilters()
}

const onTipoChange = async () => {
  // Al cambiar tipo, limpiar categoría y subcategoría y cargar las nuevas
  filters.value.categoria_id = null
  filters.value.subcategoria_id = null
  
  if (filters.value.tipo) {
    await loadCategoriasByTipo(filters.value.tipo)
  } else {
    categorias.value = []
    subcategorias.value = []
  }
  
  applyFilters()
}

const onCategoriaChange = async () => {
  // Al cambiar categoría, limpiar subcategoría y cargar las nuevas
  filters.value.subcategoria_id = null
  
  if (filters.value.categoria_id) {
    await loadSubcategorias(filters.value.categoria_id)
  } else {
    subcategorias.value = []
  }
  
  applyFilters()
}

const loadCategoriasByTipo = async (tipo) => {
  loadingCategorias.value = true
  try {
    // Mapear tipo de reporte al tipo de maestro de categoría
    const tipoMaestroMap = {
      'hazard_id': 'categoria_hid',
      'wit': 'categoria_wit',
      'swa': 'categoria_swa',
      'fdkar': 'categoria_fdkar'
    }
    const tipoMaestro = tipoMaestroMap[tipo]
    if (tipoMaestro) {
      const response = await api.get(`/ilv/maestros/${tipoMaestro}`)
      categorias.value = response.data || []
      console.log('Categorias cargadas:', categorias.value)
    }
  } catch (error) {
    console.error('Error loading categorias:', error)
    categorias.value = []
  } finally {
    loadingCategorias.value = false
  }
}

const loadSubcategorias = async (categoriaId) => {
  loadingSubcategorias.value = true
  try {
    const response = await api.get(`/ilv/maestros/subcategorias/${categoriaId}`)
    subcategorias.value = response.data || []
  } catch (error) {
    console.error('Error loading subcategorias:', error)
    subcategorias.value = []
  } finally {
    loadingSubcategorias.value = false
  }
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
    categoria_id: null,
    subcategoria_id: null
  }
  categorias.value = []
  subcategorias.value = []
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

// Exportar tabla a Excel con filtros aplicados
const exportToExcel = async () => {
  exporting.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.tipo) params.append('tipo', filters.value.tipo)
    if (filters.value.estado) params.append('estado', filters.value.estado)
    if (filters.value.cliente_id) params.append('cliente_id', filters.value.cliente_id)
    if (filters.value.proyecto_id) params.append('proyecto_id', filters.value.proyecto_id)
    if (filters.value.empresa_id) params.append('empresa_id', filters.value.empresa_id)
    if (filters.value.fecha_desde) params.append('fecha_desde', filters.value.fecha_desde)
    if (filters.value.fecha_hasta) params.append('fecha_hasta', filters.value.fecha_hasta)

    const response = await api.get(`/ilv/reports/export/excel?${params}`, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reportes_ilv_${new Date().toISOString().split('T')[0]}.xlsx`
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

// Descargar PDF individual de un reporte
const downloadPdf = async (reportId) => {
  downloadingPdf.value = reportId
  try {
    const response = await api.get(`/ilv/reports/export/pdf/${reportId}`, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte_ilv_${reportId}_${new Date().toISOString().split('T')[0]}.pdf`
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
  // Asegurar que el authStore esté cargado
  if (!authStore.user) {
    await authStore.validateUser()
  }
  console.log('ILV Reports - User:', authStore.user)
  console.log('ILV Reports - Is Admin:', isAdmin.value)
  
  // Cargar datos para los filtros
  try {
    loadingClientes.value = true
    loadingProyectos.value = true
    loadingEmpresas.value = true
    
    const [clientesRes, proyectosRes, contratistasRes] = await Promise.all([
      getClients(),
      getProjects(),
      getContractors()
    ])
    
    clientes.value = clientesRes || []
    proyectos.value = proyectosRes || []
    contratistas.value = contratistasRes || []
  } catch (error) {
    console.error('Error loading filter data:', error)
  } finally {
    loadingClientes.value = false
    loadingProyectos.value = false
    loadingEmpresas.value = false
  }
  
  onRequest({ pagination: pagination.value })
})
</script>
