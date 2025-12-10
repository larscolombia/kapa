<template>
  <div class="form-renderer">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <template v-for="field in schema.fields" :key="field.id">
        <render-field
          :field="field"
          :model-value="modelValue[field.key]"
          :all-values="modelValue"
          :readonly="readonly"
          @update:model-value="updateField(field.key, $event)"
        />
      </template>

      <!-- Botón de envío si no es readonly -->
      <div v-if="!readonly && showSubmitButton" class="q-mt-lg">
        <q-btn
          type="submit"
          color="primary"
          :label="submitButtonText"
          :loading="submitting"
          icon="send"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import RenderField from './RenderField.vue';

const props = defineProps({
  schema: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  showSubmitButton: {
    type: Boolean,
    default: true,
  },
  submitButtonText: {
    type: String,
    default: 'Enviar',
  },
  submitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const updateField = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
};

const onSubmit = () => {
  emit('submit', props.modelValue);
};
</script>

<style scoped>
.form-renderer {
  max-width: 800px;
  margin: 0 auto;
}
</style>
