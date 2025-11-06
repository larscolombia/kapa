<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div class="col">
            <h4 class="q-ma-none text-weight-bold">Dashboard ILV</h4>
            <p class="text-grey-6 q-ma-none">Sistema de Identificación de Peligros, WIT, SWA y FDKAR</p>
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

      <!-- Tarjetas de resumen -->
      <div class="col-12">
        <div class="row q-gutter-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="text-center">
              <q-card-section>
                <q-icon name="assignment" size="3rem" color="primary" />
                <div class="text-h6 q-mt-sm">{{ stats.total || 0 }}</div>
                <div class="text-body2 text-grey-6">Total Reportes</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="text-center">
              <q-card-section>
                <q-icon name="schedule" size="3rem" color="orange" />
                <div class="text-h6 q-mt-sm">{{ stats.abiertos || 0 }}</div>
                <div class="text-body2 text-grey-6">Abiertos</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="text-center">
              <q-card-section>
                <q-icon name="check_circle" size="3rem" color="green" />
                <div class="text-h6 q-mt-sm">{{ stats.cerrados || 0 }}</div>
                <div class="text-body2 text-grey-6">Cerrados</div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="text-center">
              <q-card-section>
                <q-icon name="trending_up" size="3rem" color="blue" />
                <div class="text-h6 q-mt-sm">{{ stats.este_mes || 0 }}</div>
                <div class="text-body2 text-grey-6">Este mes</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Distribución por tipo -->
      <div class="col-md-6 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Reportes por Tipo</div>
          </q-card-section>
          <q-card-section>
            <div v-for="tipo in reportTypes" :key="tipo.value" class="row items-center q-mb-sm">
              <q-icon :name="tipo.icon" class="q-mr-sm" />
              <div class="col">{{ tipo.label }}</div>
              <div class="col-auto">
                <q-chip :color="getColorForType(tipo.value)" text-color="white">
                  {{ stats.por_tipo?.[tipo.value] || 0 }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Reportes recientes -->
      <div class="col-md-6 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Reportes Recientes</div>
          </q-card-section>
          <q-card-section>
            <div v-if="recentReports.length === 0" class="text-center text-grey-6">
              No hay reportes recientes
            </div>
            <div v-else>
              <div 
                v-for="report in recentReports" 
                :key="report.report_id" 
                class="row items-center q-mb-sm cursor-pointer"
                @click="goToReport(report.report_id)"
              >
                <div class="col">
                  <div class="text-weight-medium"># {{ report.report_id }}</div>
                  <div class="text-caption text-grey-6">
                    {{ formatDate(report.creado_en) }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-chip 
                    :color="report.estado === 'abierto' ? 'orange' : 'green'" 
                    text-color="white" 
                    size="sm"
                  >
                    {{ report.estado }}
                  </q-chip>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn 
              flat 
              color="primary" 
              label="Ver todos" 
              @click="$router.push({ name: 'ilvReportes' })"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Acciones rápidas -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Acciones Rápidas</div>
          </q-card-section>
          <q-card-section>
            <div class="row q-gutter-md">
              <q-btn 
                v-for="tipo in reportTypes" 
                :key="tipo.value"
                color="primary" 
                outline
                :icon="tipo.icon" 
                :label="`Crear ${tipo.label}`"
                @click="createReport(tipo.value)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loading -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { date } from 'quasar';
import ilvService from 'src/services/ilvService';

const router = useRouter();

const loading = ref(false);
const stats = ref({});
const recentReports = ref([]);

const reportTypes = ilvService.getReportTypes();

onMounted(() => {
  loadDashboardData();
});

const loadDashboardData = async () => {
  loading.value = true;
  try {
    // Cargar reportes recientes
    const reportsResponse = await ilvService.getReports({ 
      limit: 5, 
      sort: 'creado_en:desc' 
    });
    recentReports.value = reportsResponse.data || [];

    // Calcular estadísticas básicas
    const allReports = await ilvService.getReports();
    const reports = allReports.data || [];
    
    stats.value = {
      total: reports.length,
      abiertos: reports.filter(r => r.estado === 'abierto').length,
      cerrados: reports.filter(r => r.estado === 'cerrado').length,
      este_mes: reports.filter(r => {
        const reportDate = new Date(r.creado_en);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && 
               reportDate.getFullYear() === now.getFullYear();
      }).length,
      por_tipo: reports.reduce((acc, report) => {
        acc[report.tipo] = (acc[report.tipo] || 0) + 1;
        return acc;
      }, {})
    };

  } catch (error) {
    console.error('Error cargando dashboard:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD/MM/YYYY HH:mm');
};

const getColorForType = (tipo) => {
  const colors = {
    hazard_id: 'red',
    wit: 'blue',
    swa: 'orange',
    fdkar: 'purple'
  };
  return colors[tipo] || 'grey';
};

const goToReport = (reportId) => {
  router.push({ name: 'ilvReporteDetalle', params: { id: reportId } });
};

const createReport = (tipo) => {
  router.push({ 
    name: 'ilvNuevoReporte', 
    query: { tipo } 
  });
};
</script>