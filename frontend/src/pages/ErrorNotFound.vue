<template>
  <div class="fullscreen bg-secondary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        Oops. parece que la pagina que estas buscando no existe
      </div>

      <q-btn class="q-mt-xl" color="white" text-color="secondary" unelevated to="/" label="Regresar" no-caps />
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'ErrorNotFound'
});
</script>
