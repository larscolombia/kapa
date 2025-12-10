<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn flat icon="arrow_back" @click="$router.push({ name: 'systemConfig' })" class="q-mr-sm" />
      <div class="text-h5">
        <q-icon name="tune" color="purple" class="q-mr-sm" />
        Parámetros del Sistema
      </div>
      <q-space />
      <q-btn 
        color="primary" 
        icon="save" 
        label="Guardar Cambios" 
        @click="saveAllChanges"
        :loading="saving"
        :disable="!hasChanges"
      />
    </div>

    <!-- Indicador de cambios sin guardar -->
    <q-banner v-if="hasChanges" class="bg-warning text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="warning" />
      </template>
      Tienes cambios sin guardar. Haz clic en "Guardar Cambios" para aplicarlos.
    </q-banner>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey">Cargando parámetros...</div>
    </div>

    <!-- Contenido -->
    <div v-else>
      <!-- Tabs por categoría -->
      <q-tabs
        v-model="selectedCategory"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab 
          v-for="cat in categories" 
          :key="cat" 
          :name="cat" 
          :label="getCategoryLabel(cat)"
          :icon="getCategoryIcon(cat)"
        />
      </q-tabs>

      <q-separator />

      <!-- Panel de parámetros -->
      <q-tab-panels v-model="selectedCategory" animated>
        <q-tab-panel v-for="cat in categories" :key="cat" :name="cat">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon :name="getCategoryIcon(cat)" class="q-mr-sm" />
                {{ getCategoryLabel(cat) }}
              </div>

              <q-list separator>
                <q-item 
                  v-for="param in getParametersByCategory(cat)" 
                  :key="param.key"
                  class="q-py-md"
                >
                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      {{ param.label }}
                      <q-badge v-if="!param.editable" color="grey" class="q-ml-sm">
                        Solo lectura
                      </q-badge>
                    </q-item-label>
                    <q-item-label caption>{{ param.description }}</q-item-label>
                    <q-item-label caption class="text-grey-6">
                      Key: <code>{{ param.key }}</code>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side style="min-width: 300px;">
                    <!-- Input según tipo de dato -->
                    <template v-if="param.data_type === 'boolean'">
                      <q-toggle
                        v-model="editedValues[param.key]"
                        :disable="!param.editable"
                        :true-value="'true'"
                        :false-value="'false'"
                        color="positive"
                        label=""
                      />
                    </template>

                    <template v-else-if="param.data_type === 'number'">
                      <q-input
                        v-model="editedValues[param.key]"
                        :disable="!param.editable"
                        type="number"
                        outlined
                        dense
                        style="width: 150px;"
                      />
                    </template>

                    <template v-else-if="param.key.includes('email')">
                      <q-input
                        v-model="editedValues[param.key]"
                        :disable="!param.editable"
                        outlined
                        dense
                        style="width: 280px;"
                        hint="Separar múltiples emails con coma"
                      />
                    </template>

                    <template v-else-if="param.key === 'email_mode'">
                      <q-select
                        v-model="editedValues[param.key]"
                        :options="[
                          { label: 'Test (solo emails de prueba)', value: 'test' },
                          { label: 'Producción (destinatarios reales)', value: 'production' }
                        ]"
                        :disable="!param.editable"
                        emit-value
                        map-options
                        outlined
                        dense
                        style="width: 280px;"
                      />
                    </template>

                    <template v-else>
                      <q-input
                        v-model="editedValues[param.key]"
                        :disable="!param.editable"
                        outlined
                        dense
                        style="width: 280px;"
                      />
                    </template>
                  </q-item-section>

                  <q-item-section side>
                    <q-icon 
                      v-if="isModified(param.key)" 
                      name="edit" 
                      color="warning"
                    >
                      <q-tooltip>Modificado</q-tooltip>
                    </q-icon>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Información adicional -->
    <q-card flat bordered class="q-mt-md bg-grey-1">
      <q-card-section>
        <div class="text-subtitle2 text-grey-8">
          <q-icon name="info" class="q-mr-sm" />
          Información
        </div>
        <ul class="q-mt-sm text-caption text-grey-7">
          <li><strong>SLA ILV/Inspecciones:</strong> Define los días para enviar recordatorios automáticos de reportes abiertos.</li>
          <li><strong>Modo Email:</strong> En modo "test", todos los correos se envían solo a los emails de prueba configurados.</li>
          <li><strong>Los cambios requieren reiniciar el backend</strong> para que los schedulers tomen los nuevos valores.</li>
        </ul>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const $q = useQuasar();

const loading = ref(true);
const saving = ref(false);
const parameters = ref([]);
const editedValues = ref({});
const originalValues = ref({});
const selectedCategory = ref('general');

const categories = computed(() => {
  return [...new Set(parameters.value.map(p => p.category))];
});

const hasChanges = computed(() => {
  return Object.keys(editedValues.value).some(key => 
    editedValues.value[key] !== originalValues.value[key]
  );
});

onMounted(async () => {
  await loadParameters();
});

async function loadParameters() {
  loading.value = true;
  try {
    const response = await api.get('/system-config/parameters');
    
    // Flatten the grouped response
    parameters.value = response.data.flatMap(group => group.parameters);
    
    // Initialize edited values
    parameters.value.forEach(param => {
      editedValues.value[param.key] = param.value;
      originalValues.value[param.key] = param.value;
    });

    // Set first category as selected
    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0];
    }
  } catch (error) {
    console.error('Error loading parameters:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los parámetros',
    });
  } finally {
    loading.value = false;
  }
}

function getParametersByCategory(category) {
  return parameters.value.filter(p => p.category === category);
}

function getCategoryLabel(category) {
  const labels = {
    general: 'General',
    ilv: 'ILV',
    inspecciones: 'Inspecciones',
    notificaciones: 'Notificaciones',
    reportes: 'Reportes',
  };
  return labels[category] || category;
}

function getCategoryIcon(category) {
  const icons = {
    general: 'settings',
    ilv: 'report_problem',
    inspecciones: 'checklist',
    notificaciones: 'notifications',
    reportes: 'assessment',
  };
  return icons[category] || 'label';
}

function isModified(key) {
  return editedValues.value[key] !== originalValues.value[key];
}

async function saveAllChanges() {
  saving.value = true;
  
  try {
    // Collect only modified parameters
    const updates = Object.keys(editedValues.value)
      .filter(key => isModified(key))
      .map(key => ({
        key,
        value: String(editedValues.value[key]),
      }));

    if (updates.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No hay cambios para guardar',
      });
      return;
    }

    await api.put('/system-config/parameters', updates);

    // Update original values
    updates.forEach(({ key, value }) => {
      originalValues.value[key] = value;
    });

    $q.notify({
      type: 'positive',
      message: `${updates.length} parámetro(s) actualizado(s) correctamente`,
      caption: 'Algunos cambios pueden requerir reiniciar el backend',
    });
  } catch (error) {
    console.error('Error saving parameters:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar los parámetros',
      caption: error.response?.data?.message || 'Error desconocido',
    });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}
</style>
