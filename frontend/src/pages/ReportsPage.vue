<template>
  <div class="q-pa-md">
    <h4 class="text-h4 q-pl-md kapa-title">Reportes de Auditoría</h4>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md">
          <q-select
            v-model="filters.clientId"
            :options="clients"
            option-value="client_id"
            option-label="name"
            label="Cliente"
            emit-value
            map-options
            clearable
            class="col-md-3 col-xs-12"
          />
          
          <q-select
            v-model="filters.projectId"
            :options="filteredProjects"
            option-value="project_id"
            option-label="name"
            label="Proyecto"
            emit-value
            map-options
            clearable
            class="col-md-3 col-xs-12"
          />
          
          <q-select
            v-model="filters.contractorId"
            :options="contractors"
            option-value="contractor_id"
            option-label="name"
            label="Contratista"
            emit-value
            map-options
            clearable
            class="col-md-3 col-xs-12"
          />
          
          <q-input
            v-model="filters.startDate"
            type="date"
            label="Fecha Inicio"
            class="col-md-2 col-xs-6"
          />
          
          <q-input
            v-model="filters.endDate"
            type="date"
            label="Fecha Fin"
            class="col-md-2 col-xs-6"
          />
          
          <q-btn
            color="primary"
            label="Buscar"
            @click="loadMetrics"
            :loading="loading"
            class="col-md-2 col-xs-12"
          />
          
          <q-btn
            color="green"
            label="Descargar Excel"
            icon="download"
            @click="downloadExcel"
            :loading="downloading"
            class="col-md-2 col-xs-12"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Métricas SLA -->
    <div class="row q-gutter-md q-mb-md" v-if="slaMetrics">
      <q-card class="col">
        <q-card-section>
          <div class="text-h6">Cumplimiento SLA</div>
          <div class="text-h3 text-primary">{{ slaMetrics.slaCompliance }}%</div>
          <div class="text-caption">Objetivo: 24 horas</div>
        </q-card-section>
      </q-card>

      <q-card class="col">
        <q-card-section>
          <div class="text-h6">Tiempo Promedio</div>
          <div class="text-h3 text-orange">{{ slaMetrics.averageResponseTime?.toFixed(1) }}h</div>
          <div class="text-caption">Horas de revisión</div>
        </q-card-section>
      </q-card>

      <q-card class="col">
        <q-card-section>
          <div class="text-h6">Dentro de SLA</div>
          <div class="text-h3 text-positive">{{ slaMetrics.withinSLA }}</div>
          <div class="text-caption">de {{ slaMetrics.total }} documentos</div>
        </q-card-section>
      </q-card>

      <q-card class="col">
        <q-card-section>
          <div class="text-h6">Fuera de SLA</div>
          <div class="text-h3 text-negative">{{ slaMetrics.breachedSLA }}</div>
          <div class="text-caption">Requieren atención</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Tabla de Métricas -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Detalle por Documento</div>
        <q-table
          :rows="metrics"
          :columns="columns"
          row-key="document.document_id"
          :loading="loading"
          :pagination="{ rowsPerPage: 20 }"
          flat
          bordered
        >
          <template v-slot:body-cell-reviewTime="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.totalTimeInSubmitted > 24 ? 'red' : 'green'"
                :label="`${props.row.totalTimeInSubmitted?.toFixed(1) || '0'}h`"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-rejections="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.totalResubmissions > 0 ? 'orange' : 'grey'"
                :label="props.row.totalResubmissions"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-state="props">
            <q-td :props="props">
              <q-chip
                :color="getStateColor(props.row.document.state)"
                text-color="white"
                dense
              >
                {{ translateState(props.row.document.state) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                icon="history"
                color="primary"
                @click="showTimeline(props.row)"
              >
                <q-tooltip>Ver historial</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Timeline -->
    <q-dialog v-model="showTimelineDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Historial: {{ selectedDocument?.document?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-timeline color="primary">
            <q-timeline-entry
              v-for="(event, index) in selectedDocument?.timeline"
              :key="index"
              :title="translateState(event.new_state)"
              :subtitle="new Date(event.changed_at).toLocaleString('es-CO')"
              :icon="getStateIcon(event.new_state)"
              :color="getStateColor(event.new_state)"
            >
              <div>
                <strong>Estado anterior:</strong> {{ translateState(event.previous_state) }}<br>
                <strong>Tiempo en estado:</strong> {{ event.time_in_previous_state_hours }}h<br>
                <strong>Cambiado por:</strong> {{ event.changed_by_user?.name || event.changed_by_email || 'Sistema' }}<br>
                <strong>Comentarios:</strong> {{ event.comments || 'Sin comentarios' }}
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from 'boot/axios';
import { getClients } from 'src/services/clientService';
import { getProjects } from 'src/services/projectService';
import { getContractors } from 'src/services/contractorService';

const filters = ref({
  clientId: null,
  projectId: null,
  contractorId: null,
  startDate: null,
  endDate: null,
});

const clients = ref([]);
const projects = ref([]);
const contractors = ref([]);
const metrics = ref([]);
const slaMetrics = ref(null);
const loading = ref(false);
const downloading = ref(false);
const showTimelineDialog = ref(false);
const selectedDocument = ref(null);

const filteredProjects = computed(() => {
  if (!filters.value.clientId) return projects.value;
  return projects.value.filter(p => p.client?.client_id === filters.value.clientId);
});

const columns = [
  { name: 'client', label: 'Cliente', field: row => row.document.projectContractor?.project?.client?.name || 'N/A', align: 'left' },
  { name: 'project', label: 'Proyecto', field: row => row.document.projectContractor?.project?.name || 'N/A', align: 'left' },
  { name: 'contractor', label: 'Contratista', field: row => row.document.projectContractor?.contractor?.name || 'N/A', align: 'left' },
  { name: 'document', label: 'Documento', field: row => row.document.name, align: 'left' },
  { name: 'reviewTime', label: 'Tiempo Revisión', align: 'center' },
  { name: 'rejections', label: 'Rechazos', align: 'center' },
  { name: 'state', label: 'Estado', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
];

onMounted(async () => {
  clients.value = await getClients();
  projects.value = await getProjects();
  contractors.value = await getContractors();
});

async function loadMetrics() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.value.clientId) params.append('clientId', filters.value.clientId);
    if (filters.value.projectId) params.append('projectId', filters.value.projectId);
    if (filters.value.contractorId) params.append('contractorId', filters.value.contractorId);
    if (filters.value.startDate) params.append('startDate', filters.value.startDate);
    if (filters.value.endDate) params.append('endDate', filters.value.endDate);

    const [metricsRes, slaRes] = await Promise.all([
      api.get(`/reports/metrics?${params}`),
      api.get(`/reports/sla?${params}`)
    ]);

    metrics.value = metricsRes.data;
    slaMetrics.value = slaRes.data;
  } catch (error) {
    console.error('Error al cargar métricas:', error);
  } finally {
    loading.value = false;
  }
}

async function downloadExcel() {
  downloading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.value.clientId) params.append('clientId', filters.value.clientId);
    if (filters.value.projectId) params.append('projectId', filters.value.projectId);
    if (filters.value.contractorId) params.append('contractorId', filters.value.contractorId);
    if (filters.value.startDate) params.append('startDate', filters.value.startDate);
    if (filters.value.endDate) params.append('endDate', filters.value.endDate);

    const response = await api.get(`/reports/export/excel?${params}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error al descargar Excel:', error);
  } finally {
    downloading.value = false;
  }
}

function showTimeline(doc) {
  selectedDocument.value = doc;
  showTimelineDialog.value = true;
}

function translateState(state) {
  const translations = {
    'submitted': 'Enviado',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'not_applicable': 'No Aplica',
    'pending': 'Pendiente',
    'none': 'Ninguno',
  };
  return translations[state] || state;
}

function getStateColor(state) {
  const colors = {
    'submitted': 'blue',
    'approved': 'green',
    'rejected': 'red',
    'not_applicable': 'grey',
    'pending': 'orange',
  };
  return colors[state] || 'grey';
}

function getStateIcon(state) {
  const icons = {
    'submitted': 'upload',
    'approved': 'check_circle',
    'rejected': 'cancel',
    'not_applicable': 'remove_circle',
    'pending': 'schedule',
  };
  return icons[state] || 'circle';
}
</script>

<style scoped>
.kapa-title {
  font-weight: bold;
  color: #2c3e50;
}
</style>
