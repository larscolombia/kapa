<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-md-10 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Detalle del Reporte #{{ $route.params.id }}</div>
            <p class="text-grey-6">Vista detallada del reporte ILV (En desarrollo)</p>
          </q-card-section>
          <q-card-section>
            <div class="text-center">
              <q-icon name="construction" size="4rem" color="orange" />
              <div class="text-h6 q-mt-md">En Desarrollo</div>
              <p class="text-grey-6">
                Esta funcionalidad estará disponible pronto.<br>
                El backend está completamente implementado.
              </p>
              <q-btn 
                color="primary" 
                label="Volver a Reportes" 
                @click="$router.push({ name: 'ilvReportes' })"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Vista y edición de reportes - próxima implementación
</script>