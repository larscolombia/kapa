<template>
    <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
        <div>
            <div style="font-size: 30vh">
                403
            </div>

            <div class="text-h2" style="opacity:.4">
                Oops. no tienes permisos para acceder a esta pagina
            </div>

            <q-btn class="q-mt-xl" color="white" text-color="primary" unelevated to="/" label="Regresar" no-caps />
        </div>
    </div>
</template>

<script setup>
defineOptions({
    name: 'ErrorUnauthorized'
});
</script>