<template>
  <q-dialog v-model="internalIsOpen" persistent :full-width="props.isFullWidth">
    <q-card style="width: 800px">
      <q-bar :class="`bg-${props.color}`" class="text-white q-py-lg text-weight-bold">
        <div>{{ props.title }}</div>
        <q-space />
        <q-btn dense flat icon="close" @click="closeModal">
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section>
        <slot></slot>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: false,
  },
  isFullWidth: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:isOpen']);

const internalIsOpen = ref(props.isOpen);

watch(
  () => props.isOpen,
  (newValue) => {
    internalIsOpen.value = newValue;
  }
);

const closeModal = () => {
  internalIsOpen.value = false;
  emit('update:isOpen', false);
};

</script>
