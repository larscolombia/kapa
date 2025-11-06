<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-10 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Administrar Maestros ILV</div>
            <p class="text-grey-6">CRUD de maestros/catálogos ILV (En desarrollo)</p>
          </q-card-section>
          <q-card-section>
            <div class="text-center">
              <q-icon name="construction" size="4rem" color="orange" />
              <div class="text-h6 q-mt-md">En Desarrollo</div>
              <p class="text-grey-6">
                Gestión de catálogos: severidad, áreas, causas, etc.<br>
                53 maestros ya están cargados en la base de datos.
              </p>
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
// Admin de maestros - próxima implementación
</script>