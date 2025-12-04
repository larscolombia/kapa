<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <div class="text-h5">📋 Inspecciones</div>
        <p class="text-grey-6 q-mb-none">Gestión de Inspecciones Técnicas y Auditorías Cruzadas</p>
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
          label="Nueva Inspección" 
          @click="openNewDialog"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.tipo"
              :options="tiposInspeccion"
              option-value="value"
              option-label="label"
              label="Tipo de Inspección"
              clearable
              filled
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
              emit-value
              map-options
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.fecha_desde"
              label="Fecha Desde"
              type="date"
              filled
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.fecha_hasta"
              label="Fecha Hasta"
              type="date"
              filled
              @update:model-value="applyFilters"
            />
          </div>

          <div class="col-md-1 col-sm-6 col-xs-12">
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
        :pagination="pagination"
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

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const reports = ref([])
const selected = ref([])
const showNewDialog = ref(false)

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
  { name: 'report_id', label: 'ID', align: 'left', field: 'report_id', sortable: true },
  { name: 'tipo', label: 'Tipo', align: 'left', field: 'tipo', sortable: true },
  { name: 'clasificacion', label: 'Clasificación/Área', align: 'left' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado', sortable: true },
  { name: 'proyecto', label: 'Proyecto', align: 'left', field: row => row.project?.name || 'N/A' },
  { name: 'fecha', label: 'Fecha Inspección', align: 'left', field: 'fecha', sortable: true, format: val => formatDateLocal(val) },
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
    const params = { ...filters.value, page, limit: rowsPerPage, sortBy, order: descending ? 'DESC' : 'ASC' }
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
  filters.value = { tipo: null, estado: null, fecha_desde: null, fecha_hasta: null }
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

onMounted(async () => {
  if (!authStore.user) await authStore.validateUser()
  onRequest({ pagination: pagination.value })
})
</script>
