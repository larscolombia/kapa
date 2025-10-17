<template>
  <router-view />
</template>

<script setup>
import { onBeforeMount } from 'vue';
import { useAuthStore } from 'src/stores/auth'
onBeforeMount(async () => {
  const authStore = useAuthStore();
  await authStore.validateUser();
})
defineOptions({
  name: 'App'
});
</script>
