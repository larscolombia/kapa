<template>
  <q-page padding>
    <div class="row q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none">�� Dashboard ILV</h4>
        <p class="text-grey-6">Resumen de reportes de Identificación de Peligros, WIT, SWA y FDKAR</p>
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

    <!-- Stats Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="text-center">
          <q-card-section>
            <q-icon name="assignment" size="2rem" color="primary" />
            <div class="text-h4 q-mt-sm">{{ stats.total }}</div>
            <div class="text-subtitle2">Total Reportes</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="text-center">
          <q-card-section>
            <q-icon name="pending" size="2rem" color="orange" />
            <div class="text-h4 q-mt-sm">{{ stats.abiertos }}</div>
            <div class="text-subtitle2">Reportes Abiertos</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="text-center">
          <q-card-section>
            <q-icon name="check_circle" size="2rem" color="green" />
            <div class="text-h4 q-mt-sm">{{ stats.cerrados }}</div>
            <div class="text-subtitle2">Reportes Cerrados</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="text-center">
          <q-card-section>
            <q-icon name="trending_up" size="2rem" color="blue" />
            <div class="text-h4 q-mt-sm">{{ Math.round((stats.cerrados / stats.total) * 100) || 0 }}%</div>
            <div class="text-subtitle2">Tasa de Cierre</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row q-gutter-md q-mb-lg">
      <!-- Por Tipo -->
      <div class="col-md-6 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Reportes por Tipo</div>
          </q-card-section>
          <q-card-section>
            <div v-for="tipo in stats.por_tipo" :key="tipo.tipo" class="row items-center q-mb-sm">
              <div class="col-4">
                <q-chip 
                  :color="getTipoColor(tipo.tipo)" 
                  text-color="white" 
                  :icon="getTipoIcon(tipo.tipo)"
                  dense
                >
                  {{ getTipoLabel(tipo.tipo) }}
                </q-chip>
              </div>
              <div class="col">
                <q-linear-progress 
                  :value="tipo.count / stats.total" 
                  :color="getTipoColor(tipo.tipo)"
                  size="md"
                />
              </div>
              <div class="col-2 text-right">
                <strong>{{ tipo.count }}</strong>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Trend -->
      <div class="col-md-6 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Tendencia (30 días)</div>
          </q-card-section>
          <q-card-section>
            <div v-if="trend.length === 0" class="text-center text-grey-6">
              No hay datos suficientes para mostrar tendencia
            </div>
            <div v-else>
              <div v-for="day in trend.slice(-7)" :key="day.fecha" class="row items-center q-mb-sm">
                <div class="col-4 text-caption">
                  {{ formatDate(day.fecha) }}
                </div>
                <div class="col">
                  <q-linear-progress 
                    :value="day.count / Math.max(...trend.map(t => t.count))" 
                    color="primary"
                    size="sm"
                  />
                </div>
                <div class="col-2 text-right">
                  {{ day.count }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="row">
      <div class="col">
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">Reportes Recientes</div>
              </div>
              <div class="col-auto">
                <q-btn 
                  flat 
                  color="primary" 
                  label="Ver Todos" 
                  @click="$router.push({ name: 'ilvReportes' })"
                />
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-section class="q-pa-none">
            <q-list separator>
              <q-item v-for="report in recentReports" :key="report.report_id" clickable>
                <q-item-section avatar>
                  <q-avatar :color="getTipoColor(report.tipo)" text-color="white" :icon="getTipoIcon(report.tipo)" />
                </q-item-section>
                
                <q-item-section>
                  <q-item-label>{{ getFieldValue(report, 'titulo') || `Reporte ${report.tipo.toUpperCase()} #${report.report_id}` }}</q-item-label>
                  <q-item-label caption>{{ report.project?.name || 'Sin proyecto' }}</q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <q-chip 
                    :color="report.estado === 'abierto' ? 'orange' : 'green'" 
                    text-color="white" 
                    dense
                  >
                    {{ report.estado }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ilvService from 'src/services/ilvService'

const stats = ref({
  total: 0,
  abiertos: 0,
  cerrados: 0,
  por_tipo: [],
  por_mes: []
})

const trend = ref([])
const recentReports = ref([])

const loadDashboardData = async () => {
  try {
    const [statsData, trendData, reportsData] = await Promise.all([
      ilvService.getStats(),
      ilvService.getTrend(30),
      ilvService.getReports({ limit: 5 })
    ])
    
    stats.value = statsData
    trend.value = trendData
    recentReports.value = reportsData.data || reportsData
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
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
    fdkar: 'find_in_page'
  }
  return icons[tipo] || 'assignment'
}

const getTipoLabel = (tipo) => {
  const labels = {
    hazard_id: 'Hazard ID',
    wit: 'WIT',
    swa: 'SWA',
    fdkar: 'FDKAR'
  }
  return labels[tipo] || tipo
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const getFieldValue = (report, key) => {
  const field = report.fields?.find(f => f.key === key)
  return field?.value || ''
}

onMounted(() => {
  loadDashboardData()
})
</script>
