<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div class="col">
            <h4 class="q-ma-none text-weight-bold">Reportes ILV</h4>
            <p class="text-grey-6 q-ma-none">Gestión de reportes ILV</p>
          </div>
          <div class="col-auto">
            <q-btn 
              color="primary" 
              icon="add" 
              label="Nuevo Reporte" 
              @click="$router.push({ name: 'ilvNuevoReporte' })"
            />
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-select
                  v-model="filters.tipo"
                  :options="tipoOptions"
                  label="Tipo"
                  clearable
                  @update:model-value="loadReports"
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-select
                  v-model="filters.estado"
                  :options="estadoOptions"
                  label="Estado"
                  clearable
                  @update:model-value="loadReports"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model="filters.fecha_desde"
                  type="date"
                  label="Fecha desde"
                  @update:model-value="loadReports"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model="filters.fecha_hasta"
                  type="date"
                  label="Fecha hasta"
                  @update:model-value="loadReports"
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-btn 
                  color="primary" 
                  icon="refresh" 
                  label="Actualizar"
                  @click="loadReports"
                  :loading="loading"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tabla de reportes -->
      <div class="col-12">
        <q-table
          :rows="reports"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          row-key="report_id"
          binary-state-sort
        >
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-chip 
                :color="getTypeColor(props.value)" 
                text-color="white" 
                size="sm"
              >
                <q-icon :name="getTypeIcon(props.value)" class="q-mr-xs" />
                {{ getTypeLabel(props.value) }}
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

          <template v-slot:body-cell-creado_en="props">
            <q-td :props="props">
              {{ formatDate(props.value) }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn 
                flat 
                round 
                color="blue" 
                icon="visibility" 
                @click="viewReport(props.row.report_id)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
              <q-btn 
                v-if="canEdit(props.row)"
                flat 
                round 
                color="orange" 
                icon="edit" 
                @click="editReport(props.row.report_id)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>No hay reportes que mostrar</span>
            </div>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { date } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import ilvService from 'src/services/ilvService';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const reports = ref([]);
const filters = ref({
  tipo: null,
  estado: null,
  fecha_desde: null,
  fecha_hasta: null
});

const pagination = ref({
  sortBy: 'creado_en',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  {
    name: 'report_id',
    required: true,
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
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    sortable: true
  },
  {
    name: 'creado_en',
    label: 'Fecha',
    align: 'left',
    field: 'creado_en',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center'
  }
];

const tipoOptions = ilvService.getReportTypes().map(t => ({
  label: t.label,
  value: t.value
}));

const estadoOptions = ilvService.getEstados().map(e => ({
  label: e.label,
  value: e.value
}));

onMounted(() => {
  loadReports();
});

const loadReports = async () => {
  loading.value = true;
  try {
    const queryFilters = {
      ...filters.value,
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sort: `${pagination.value.sortBy}:${pagination.value.descending ? 'desc' : 'asc'}`
    };

    // Limpiar filtros vacíos
    Object.keys(queryFilters).forEach(key => {
      if (queryFilters[key] === null || queryFilters[key] === '') {
        delete queryFilters[key];
      }
    });

    const response = await ilvService.getReports(queryFilters);
    reports.value = response.data || [];
    pagination.value.rowsNumber = response.total || 0;

  } catch (error) {
    console.error('Error cargando reportes:', error);
    reports.value = [];
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  loadReports();
};

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD/MM/YYYY HH:mm');
};

const getTypeColor = (tipo) => {
  const colors = {
    hazard_id: 'red',
    wit: 'blue',
    swa: 'orange',
    fdkar: 'purple'
  };
  return colors[tipo] || 'grey';
};

const getTypeIcon = (tipo) => {
  const reportType = ilvService.getReportTypes().find(t => t.value === tipo);
  return reportType?.icon || 'help';
};

const getTypeLabel = (tipo) => {
  const reportType = ilvService.getReportTypes().find(t => t.value === tipo);
  return reportType?.label || tipo;
};

const canEdit = (report) => {
  // Solo el propietario puede editar reportes abiertos
  return report.estado === 'abierto' && 
         report.propietario_user_id === authStore.user.user_id;
};

const viewReport = (reportId) => {
  router.push({ name: 'ilvReporteDetalle', params: { id: reportId } });
};

const editReport = (reportId) => {
  router.push({ name: 'ilvReporteDetalle', params: { id: reportId }, query: { edit: 'true' } });
};
</script>