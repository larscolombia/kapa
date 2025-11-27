<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-8 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h5">🧪 Test de Carga de Datos ILV</div>
            <p class="text-grey-6">Página temporal para debugging - verificar carga de proyectos y contratistas</p>
          </q-card-section>

          <q-card-section>
            <q-select
              v-model="selectedClient"
              :options="clientOptions"
              label="Seleccionar Cliente"
              filled
              emit-value
              map-options
              @update:model-value="onClientChange"
            />

            <div v-if="loading" class="q-mt-md text-center">
              <q-spinner color="primary" size="50px" />
              <p>Cargando datos...</p>
            </div>

            <div v-if="error" class="q-mt-md">
              <q-banner class="bg-negative text-white">
                <template v-slot:avatar>
                  <q-icon name="error" />
                </template>
                {{ error }}
              </q-banner>
            </div>

            <div v-if="projects.length > 0" class="q-mt-md">
              <div class="text-h6">✅ Proyectos ({{ projects.length }})</div>
              <q-list bordered separator>
                <q-item v-for="project in projects" :key="project.project_id">
                  <q-item-section>
                    <q-item-label>{{ project.name }}</q-item-label>
                    <q-item-label caption>ID: {{ project.project_id }} | Estado: {{ project.state }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div v-if="contractors.length > 0" class="q-mt-md">
              <div class="text-h6">✅ Contratistas ({{ contractors.length }})</div>
              <q-list bordered separator>
                <q-item v-for="contractor in contractors" :key="contractor.contractor_id">
                  <q-item-section>
                    <q-item-label>{{ contractor.name }}</q-item-label>
                    <q-item-label caption>ID: {{ contractor.contractor_id }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div v-if="selectedClient && !loading && projects.length === 0 && contractors.length === 0" class="q-mt-md">
              <q-banner class="bg-warning">
                <template v-slot:avatar>
                  <q-icon name="warning" />
                </template>
                No se encontraron datos para este cliente
              </q-banner>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-h6">📊 Logs de API</div>
            <q-input
              v-model="apiLogs"
              type="textarea"
              filled
              readonly
              rows="10"
              label="Respuestas de API"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const selectedClient = ref(null)
const loading = ref(false)
const error = ref('')
const projects = ref([])
const contractors = ref([])
const apiLogs = ref('')

const clientOptions = [
  { label: 'Owens Illinois (Planta Peldar Cogua)', value: 2 },
  { label: 'Otro Cliente', value: 1 }
]

const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  apiLogs.value += `[${timestamp}] ${message}\n`
}

const onClientChange = async (clientId) => {
  if (!clientId) {
    projects.value = []
    contractors.value = []
    apiLogs.value = ''
    error.value = ''
    return
  }

  loading.value = true
  error.value = ''
  projects.value = []
  contractors.value = []
  apiLogs.value = ''

  addLog(`🎯 Cliente seleccionado: ${clientId}`)

  try {
    // TEST 1: Cargar proyectos usando endpoint temporal
    addLog(`📡 GET /clients/test/projects-by-client/${clientId}`)
    const projectsResponse = await api.get(`/clients/test/projects-by-client/${clientId}`)
    addLog(`✅ Proyectos Response: ${JSON.stringify(projectsResponse.data, null, 2)}`)
    
    if (projectsResponse.data.success) {
      projects.value = projectsResponse.data.projects
      addLog(`✅ ${projectsResponse.data.count} proyectos cargados`)
    } else {
      throw new Error(projectsResponse.data.error)
    }

    // TEST 2: Cargar contratistas usando endpoint temporal
    addLog(`📡 GET /clients/test/contractors-by-client/${clientId}`)
    const contractorsResponse = await api.get(`/clients/test/contractors-by-client/${clientId}`)
    addLog(`✅ Contratistas Response: ${JSON.stringify(contractorsResponse.data, null, 2)}`)
    
    if (contractorsResponse.data.success) {
      contractors.value = contractorsResponse.data.contractors
      addLog(`✅ ${contractorsResponse.data.count} contratistas cargados`)
    } else {
      throw new Error(contractorsResponse.data.error)
    }

    addLog(`🎉 ÉXITO: Todos los datos cargados correctamente`)

    $q.notify({
      type: 'positive',
      message: `Datos cargados: ${projects.value.length} proyectos, ${contractors.value.length} contratistas`,
      position: 'top'
    })

  } catch (err) {
    console.error('❌ Error completo:', err)
    addLog(`❌ ERROR: ${err.message}`)
    addLog(`❌ Error.response: ${JSON.stringify(err.response?.data, null, 2)}`)
    
    error.value = `Error al cargar datos: ${err.message}`
    
    $q.notify({
      type: 'negative',
      message: `Error: ${err.message}`,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>
