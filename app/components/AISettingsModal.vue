<script setup lang="ts">
import { PROVIDERS, MODELS } from '#shared/utils/models'
import type { AISettings } from '~/types'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const toast = useToast()
const { provider, model } = useModels()
const loading = ref(false)
const saving = ref(false)

const settings = ref<AISettings | null>(null)
const formData = ref({
  provider: provider.value,
  model: model.value,
  apiKey: '',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 4096,
  customEndpoint: '',
  customSettings: {} as Record<string, any>,
  isDefault: false
})

const selectedProvider = computed(() => {
  return PROVIDERS.find(p => p.value === formData.value.provider)
})

const availableModels = computed(() => {
  return MODELS.filter(m => m.provider === formData.value.provider)
})

const showCustomEndpoint = computed(() => {
  return formData.value.provider === 'openrouter' || formData.value.provider === 'cerebras' || formData.value.provider === 'custom'
})

async function loadSettings() {
  try {
    loading.value = true
    const data = await $fetch('/api/users/ai-settings')
    if (Array.isArray(data) && data.length > 0) {
      settings.value = data[0]
      Object.assign(formData.value, {
        provider: settings.value.provider,
        model: settings.value.model,
        apiKey: settings.value.apiKey,
        temperature: settings.value.temperature,
        topP: settings.value.topP,
        maxTokens: settings.value.maxTokens,
        customEndpoint: settings.value.customEndpoint || '',
        customSettings: settings.value.customSettings ? JSON.parse(settings.value.customSettings as any) : {},
        isDefault: settings.value.isDefault
      })
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    toast.add({
      description: 'Failed to load AI settings',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  try {
    saving.value = true

    if (!formData.value.apiKey && formData.value.provider !== 'custom') {
      toast.add({
        description: 'API key is required',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })
      return
    }

    const response = await $fetch('/api/users/ai-settings', {
      method: 'POST',
      body: {
        ...formData.value,
        customSettings: Object.keys(formData.value.customSettings).length > 0 ? formData.value.customSettings : undefined
      }
    })

    settings.value = response
    isOpen.value = false

    toast.add({
      description: 'AI settings saved successfully',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    toast.add({
      description: 'Failed to save AI settings',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

async function deleteSettings() {
  try {
    if (!settings.value?.id) return

    await $fetch(`/api/users/ai-settings?id=${settings.value.id}`, {
      method: 'DELETE'
    })

    settings.value = null
    formData.value = {
      provider: 'openai',
      model: 'openai/gpt-5-nano',
      apiKey: '',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 4096,
      customEndpoint: '',
      customSettings: {},
      isDefault: false
    }

    toast.add({
      description: 'AI settings deleted',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (error) {
    console.error('Failed to delete settings:', error)
    toast.add({
      description: 'Failed to delete AI settings',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    loadSettings()
  }
})
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-2xl' }">
    <UCard
      :ui="{
        body: { padding: 'p-6' },
        header: { padding: 'px-6 py-4' }
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">AI Settings</h2>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            size="sm"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="animate-spin" />
      </div>

      <div v-else class="space-y-5">
        <!-- Provider Selection -->
        <div>
          <label class="block text-sm font-medium mb-2">Provider</label>
          <USelectMenu
            v-model="formData.provider"
            :items="PROVIDERS"
            value-key="value"
            option-attribute="label"
            size="md"
          />
        </div>

        <!-- Model Selection -->
        <div>
          <label class="block text-sm font-medium mb-2">Model</label>
          <USelectMenu
            v-model="formData.model"
            :items="availableModels"
            value-key="value"
            option-attribute="label"
            size="md"
          />
        </div>

        <!-- API Key -->
        <div>
          <label class="block text-sm font-medium mb-2">API Key</label>
          <UInput
            v-model="formData.apiKey"
            type="password"
            placeholder="Enter your API key"
            size="md"
          />
          <p class="text-xs text-gray-500 mt-1">Your API key will be encrypted and stored securely</p>
        </div>

        <!-- Custom Endpoint (for OpenRouter, Cerebras, Custom) -->
        <div v-if="showCustomEndpoint">
          <label class="block text-sm font-medium mb-2">Custom Endpoint</label>
          <UInput
            v-model="formData.customEndpoint"
            type="url"
            placeholder="https://api.example.com/v1"
            size="md"
          />
        </div>

        <!-- Temperature -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Temperature: {{ formData.temperature.toFixed(2) }}
          </label>
          <URange
            v-model="formData.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            size="md"
          />
          <p class="text-xs text-gray-500 mt-1">Higher values make output more creative (0-2)</p>
        </div>

        <!-- Top P -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Top P: {{ formData.topP.toFixed(2) }}
          </label>
          <URange
            v-model="formData.topP"
            :min="0"
            :max="1"
            :step="0.05"
            size="md"
          />
          <p class="text-xs text-gray-500 mt-1">Controls diversity of outputs (0-1)</p>
        </div>

        <!-- Max Tokens -->
        <div>
          <label class="block text-sm font-medium mb-2">Max Tokens</label>
          <UInput
            v-model.number="formData.maxTokens"
            type="number"
            :min="1"
            :max="128000"
            size="md"
          />
        </div>

        <!-- Default Setting -->
        <div class="flex items-center">
          <UCheckbox
            v-model="formData.isDefault"
            label="Set as default AI configuration"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <UButton
            v-if="settings"
            color="error"
            variant="soft"
            icon="i-lucide-trash-2"
            @click="deleteSettings"
            :disabled="saving"
          >
            Delete
          </UButton>
          <div class="flex gap-3">
            <UButton
              color="neutral"
              variant="soft"
              @click="isOpen = false"
              :disabled="saving"
            >
              Cancel
            </UButton>
            <UButton
              icon="i-lucide-check"
              @click="saveSettings"
              :loading="saving"
            >
              Save Settings
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
