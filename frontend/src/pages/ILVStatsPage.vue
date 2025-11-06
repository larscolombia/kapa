<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-10 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Estadísticas ILV</div>
            <p class="text-grey-6">Gráficas y estadísticas de reportes ILV (En desarrollo)</p>
          </q-card-section>
          <q-card-section>
            <div class="text-center">
              <q-icon name="construction" size="4rem" color="orange" />
              <div class="text-h6 q-mt-md">En Desarrollo</div>
              <p class="text-grey-6">Próximamente: gráficas con Chart.js/ApexCharts</p>
              <q-btn 
                color="primary" 
                label="Volver a Dashboard" 
                @click="$router.push({ name: 'ilvDashboard' })"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Estadísticas avanzadas - próxima implementación
</script>