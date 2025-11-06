<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-6 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Cierre de Reporte ILV</div>
            <p class="text-grey-6">Página pública para cierre vía token (En desarrollo)</p>
          </q-card-section>
          <q-card-section>
            <div class="text-center">
              <q-icon name="construction" size="4rem" color="orange" />
              <div class="text-h6 q-mt-md">En Desarrollo</div>
              <p class="text-grey-6">
                ⚠️ IMPORTANTE: Esta página NO requiere login<br>
                Valida token desde URL y permite cerrar reportes
              </p>
              <div class="q-mt-md">
                <strong>Token desde URL:</strong> {{ $route.query.token || 'No presente' }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Cierre público sin login - próxima implementación crítica
</script>