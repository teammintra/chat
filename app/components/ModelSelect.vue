<script setup lang="ts">
import { PROVIDERS } from '#shared/utils/models'

const { model, models, provider, modelsByProvider } = useModels()
const showSettings = ref(false)
const selectedProvider = ref(provider.value)

watch(provider, (newProvider) => {
  selectedProvider.value = newProvider
})

const filteredModels = computed(() => {
  return models.filter(m => m.provider === selectedProvider.value)
})
</script>

<template>
  <div class="flex items-center gap-1">
    <USelectMenu
      v-model="model"
      :items="models"
      size="sm"
      :icon="models.find(m => m.value === model)?.icon"
      variant="ghost"
      value-key="value"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
      }"
      placeholder="Select model"
    />

    <UButton
      size="sm"
      color="neutral"
      variant="ghost"
      icon="i-lucide-settings"
      aria-label="AI settings"
      @click="showSettings = true"
    />

    <AISettingsModal v-model="showSettings" />
  </div>
</template>
