<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">
      <q-icon name="settings" class="q-mr-sm" />
      Configuración del Sistema
    </div>

    <!-- Estadísticas Generales -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">Centros de Trabajo</div>
            <div class="text-h3">{{ stats.workCenters || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="bg-secondary text-white">
          <q-card-section>
            <div class="text-h6">Maestros ILV</div>
            <div class="text-h3">{{ stats.ilvMaestros?.total || 0 }}</div>
            <div class="text-caption">{{ stats.ilvMaestros?.tipos || 0 }} tipos</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="bg-accent text-white">
          <q-card-section>
            <div class="text-h6">Maestros Inspecciones</div>
            <div class="text-h3">{{ stats.inspeccionMaestros?.total || 0 }}</div>
            <div class="text-caption">{{ stats.inspeccionMaestros?.tipos || 0 }} tipos</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tarjetas de Acceso -->
    <div class="row q-col-gutter-md">
      <!-- Centros de Trabajo -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer hover-elevate" @click="$router.push({ name: 'systemConfigWorkCenters' })">
          <q-card-section class="row items-center">
            <q-icon name="business" size="3rem" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h6">Administrar Centros de Trabajo</div>
              <div class="text-caption text-grey">CRUD de centros de trabajo (clientes)</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm">
            <q-chip color="primary" text-color="white" icon="location_city">
              {{ stats.workCenters || 0 }} registros
            </q-chip>
          </q-card-section>
        </q-card>
      </div>

      <!-- Maestros ILV -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer hover-elevate" @click="$router.push({ name: 'systemConfigIlvMaestros' })">
          <q-card-section class="row items-center">
            <q-icon name="report_problem" size="3rem" color="orange" class="q-mr-md" />
            <div>
              <div class="text-h6">Maestros ILV</div>
              <div class="text-caption text-grey">Catálogos para reportes ILV</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm">
            <div class="row q-gutter-xs">
              <q-chip v-for="item in ilvSummary.slice(0, 3)" :key="item.tipo" size="sm" color="orange-2">
                {{ item.label }}: {{ item.count }}
              </q-chip>
              <q-chip v-if="ilvSummary.length > 3" size="sm" color="grey-4">
                +{{ ilvSummary.length - 3 }} más
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Maestros Inspecciones -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer hover-elevate" @click="$router.push({ name: 'systemConfigInspeccionMaestros' })">
          <q-card-section class="row items-center">
            <q-icon name="checklist" size="3rem" color="teal" class="q-mr-md" />
            <div>
              <div class="text-h6">Maestros Inspecciones</div>
              <div class="text-caption text-grey">Catálogos para inspecciones</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm">
            <div class="row q-gutter-xs">
              <q-chip v-for="item in inspeccionSummary.slice(0, 3)" :key="item.tipo" size="sm" color="teal-2">
                {{ item.label }}: {{ item.count }}
              </q-chip>
              <q-chip v-if="inspeccionSummary.length > 3" size="sm" color="grey-4">
                +{{ inspeccionSummary.length - 3 }} más
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Parámetros del Sistema -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer hover-elevate" @click="$router.push({ name: 'systemConfigParameters' })">
          <q-card-section class="row items-center">
            <q-icon name="tune" size="3rem" color="purple" class="q-mr-md" />
            <div>
              <div class="text-h6">Parámetros del Sistema</div>
              <div class="text-caption text-grey">SLA, notificaciones, reportes</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-sm">
            <div class="row q-gutter-xs">
              <q-chip size="sm" color="purple-2" icon="timer">
                SLA Configurable
              </q-chip>
              <q-chip size="sm" color="purple-2" icon="email">
                Modo Email
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Info de formularios vinculados -->
    <q-card class="q-mt-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="info" class="q-mr-sm" />
          Información sobre los catálogos
        </div>
        <q-banner rounded class="bg-blue-1 q-mb-md">
          <template v-slot:avatar>
            <q-icon name="lightbulb" color="primary" />
          </template>
          Los cambios en estos catálogos se reflejan automáticamente en los formularios de ILV e Inspecciones.
          Los campos relacionados (Centro de Trabajo → Proyecto → Contratista) no se administran aquí ya que tienen 
          sus propias secciones de administración.
        </q-banner>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Formularios ILV</div>
            <q-list dense bordered separator class="rounded-borders">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="assignment" color="orange" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>HID - Identificación de Peligros</q-item-label>
                  <q-item-label caption>Tipo reporte, Tipo hallazgo, Categoría/Subcategoría, Estado</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="directions_walk" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>W&T - Walk & Talk</q-item-label>
                  <q-item-label caption>Tipo hallazgo W&T, Estado</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="pan_tool" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>SWA - Stop Work Authority</q-item-label>
                  <q-item-label caption>Tipo hallazgo SWA, Tipo SWA, Motivo, Estado</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="credit_card" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>FDKAR - Safety Cards</q-item-label>
                  <q-item-label caption>Tipo tarjeta, Clasificación FDKAR, Estado</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Formularios Inspecciones</div>
            <q-list dense bordered separator class="rounded-borders">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="engineering" color="teal" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Inspección Técnica</q-item-label>
                  <q-item-label caption>Tipo inspección, Clasificación técnica, Área inspección, Estado</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="fact_check" color="purple" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Auditoría Cruzada</q-item-label>
                  <q-item-label caption>Área auditoría, Clasificación auditoría, Estado</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSystemStats, getIlvMaestrosSummary, getInspeccionMaestrosSummary } from 'src/services/systemConfigService';
import { Notify } from 'quasar';

const stats = ref({});
const ilvSummary = ref([]);
const inspeccionSummary = ref([]);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const [statsData, ilvData, inspeccionData] = await Promise.all([
      getSystemStats(),
      getIlvMaestrosSummary(),
      getInspeccionMaestrosSummary(),
    ]);
    stats.value = statsData;
    ilvSummary.value = ilvData;
    inspeccionSummary.value = inspeccionData;
  } catch (error) {
    console.error('Error loading system config data:', error);
    Notify.create({
      type: 'negative',
      message: 'Error al cargar la configuración del sistema',
    });
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.hover-elevate {
  transition: all 0.3s ease;
}
.hover-elevate:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
