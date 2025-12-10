<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-10 col-xs-12">
        <!-- Header -->
        <div class="row items-center q-mb-md">
          <div class="col">
            <div class="text-h5 text-weight-medium">Dashboard Inspecciones</div>
            <div class="text-caption text-grey-7">Resumen de Inspecciones Técnicas y Auditorías Cruzadas</div>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="add"
              label="Nueva Inspección"
              @click="$router.push({ name: 'inspeccionesNuevo' })"
            />
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card flat bordered class="text-center">
              <q-card-section class="q-pa-md">
                <q-icon name="assignment" size="1.5rem" color="primary" />
                <div class="text-h5 q-mt-xs">{{ stats.total }}</div>
                <div class="text-caption text-grey-7">Total Inspecciones</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card flat bordered class="text-center">
              <q-card-section class="q-pa-md">
                <q-icon name="pending" size="1.5rem" color="orange" />
                <div class="text-h5 q-mt-xs">{{ stats.abiertos }}</div>
                <div class="text-caption text-grey-7">Inspecciones Abiertas</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card flat bordered class="text-center">
              <q-card-section class="q-pa-md">
                <q-icon name="check_circle" size="1.5rem" color="green" />
                <div class="text-h5 q-mt-xs">{{ stats.cerrados }}</div>
                <div class="text-caption text-grey-7">Inspecciones Cerradas</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card flat bordered class="text-center">
              <q-card-section class="q-pa-md">
                <q-icon name="trending_up" size="1.5rem" color="blue" />
                <div class="text-h5 q-mt-xs">{{ Math.round((stats.cerrados / stats.total) * 100) || 0 }}%</div>
                <div class="text-caption text-grey-7">Tasa de Cierre</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Secondary Stats Cards -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-md-6 col-sm-6 col-xs-12">
            <q-card flat bordered class="text-center">
              <q-card-section class="q-pa-md">
                <q-icon name="build" size="1.5rem" color="deep-purple" />
                <div class="text-h5 q-mt-xs">{{ stats.tecnicas }}</div>
                <div class="text-caption text-grey-7">Inspecciones Técnicas</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-6 col-sm-6 col-xs-12">
            <q-card flat bordered class="text-center">
              <q-card-section class="q-pa-md">
                <q-icon name="fact_check" size="1.5rem" color="teal" />
                <div class="text-h5 q-mt-xs">{{ stats.auditorias }}</div>
                <div class="text-caption text-grey-7">Auditorías Cruzadas</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row q-col-gutter-md q-mb-md">
          <!-- Por Tipo -->
          <div class="col-md-6 col-xs-12">
            <q-card flat bordered>
              <q-card-section class="q-pb-sm">
                <div class="text-subtitle1 text-weight-medium">Inspecciones por Tipo</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div v-for="tipo in stats.por_tipo" :key="tipo.tipo" class="row items-center q-mb-sm">
                  <div class="col-4">
                    <q-chip
                      :color="getTipoColor(tipo.tipo)"
                      text-color="white"
                      :icon="getTipoIcon(tipo.tipo)"
                      size="sm"
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
                <div v-if="!stats.por_tipo || stats.por_tipo.length === 0" class="text-center text-grey-6 q-py-md">
                  No hay datos disponibles
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Trend -->
          <div class="col-md-6 col-xs-12">
            <q-card flat bordered>
              <q-card-section class="q-pb-sm">
                <div class="text-subtitle1 text-weight-medium">Tendencia (30 días)</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div v-if="trend.length === 0" class="text-center text-grey-6 q-py-md">
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
                    <div class="col-2 text-right text-caption">
                      {{ day.count }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Recent Reports -->
        <q-card flat bordered>
          <q-card-section class="q-pb-sm">
            <div class="row items-center">
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">Inspecciones Recientes</div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="Ver Todas"
                  @click="$router.push({ name: 'inspeccionesLista' })"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-list separator>
            <q-item 
              v-for="report in recentReports" 
              :key="report.report_id" 
              clickable 
              @click="$router.push({ name: 'inspeccionesDetalle', params: { id: report.report_id } })"
            >
              <q-item-section avatar>
                <q-avatar :color="getTipoColor(report.tipo)" text-color="white" size="md">
                  <q-icon :name="getTipoIcon(report.tipo)" size="sm" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ getReportTitle(report) }}</q-item-label>
                <q-item-label caption>{{ report.project?.name || 'Sin proyecto' }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-chip
                  :color="report.estado === 'abierto' ? 'orange' : 'green'"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ report.estado }}
                </q-chip>
              </q-item-section>
            </q-item>

            <q-item v-if="recentReports.length === 0">
              <q-item-section class="text-center text-grey-6 q-py-md">
                No hay inspecciones recientes
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import inspeccionesService from 'src/services/inspeccionesService'

const stats = ref({
  total: 0,
  abiertos: 0,
  cerrados: 0,
  tecnicas: 0,
  auditorias: 0,
  por_tipo: [],
  por_mes: []
})

const trend = ref([])
const recentReports = ref([])

const loadDashboardData = async () => {
  try {
    const [statsData, trendData, reportsData] = await Promise.all([
      inspeccionesService.getStats(),
      inspeccionesService.getTrend(30),
      inspeccionesService.getReports({ limit: 5 })
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
    tecnica: 'deep-purple',
    auditoria: 'teal'
  }
  return colors[tipo] || 'grey'
}

const getTipoIcon = (tipo) => {
  const icons = {
    tecnica: 'build',
    auditoria: 'fact_check'
  }
  return icons[tipo] || 'checklist'
}

const getTipoLabel = (tipo) => {
  const labels = {
    tecnica: 'Técnica',
    auditoria: 'Auditoría'
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
  return field?.value || field?.value_display || ''
}

const getReportTitle = (report) => {
  // Intentar obtener un título descriptivo del reporte
  const observacion = report.observacion
  if (observacion && observacion.length > 0) {
    return observacion.length > 50 ? observacion.substring(0, 50) + '...' : observacion
  }
  
  // Si no hay observación, mostrar tipo e ID
  const tipoLabel = getTipoLabel(report.tipo)
  return `${tipoLabel} #${report.report_id}`
}

onMounted(() => {
  loadDashboardData()
})
</script>
