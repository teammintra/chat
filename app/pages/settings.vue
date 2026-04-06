<script setup lang="ts">
import { PROVIDERS, MODELS } from '#shared/utils/models'

definePageMeta({
  layout: 'default'
})

const toast = useToast()
const { user, loggedIn } = useUserSession()
const { model } = useModels()

// Redirect if not logged in
watchEffect(() => {
  if (!loggedIn.value) {
    navigateTo('/')
  }
})

const loading = ref(false)
const saving = ref(false)
const settingId = ref<string | null>(null)

const formData = ref({
  provider: 'anthropic',
  model: 'anthropic/claude-haiku-4.5',
  apiKey: '',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 4096,
  customEndpoint: '',
  isDefault: true
})

const availableModels = computed(() =>
  MODELS.filter(m => m.provider === formData.value.provider)
)

const showCustomEndpoint = computed(() =>
  ['openrouter', 'cerebras', 'custom', 'groq'].includes(formData.value.provider)
)

// When provider changes, auto-select the first model for that provider
watch(() => formData.value.provider, (newProvider) => {
  const first = MODELS.find(m => m.provider === newProvider)
  if (first) formData.value.model = first.value
})

async function loadSettings() {
  try {
    loading.value = true
    const data = await $fetch<any[]>('/api/users/ai-settings')
    if (Array.isArray(data) && data.length > 0) {
      const s = data[0]
      settingId.value = s.id
      formData.value = {
        provider: s.provider,
        model: s.model,
        apiKey: s.apiKey,
        temperature: s.temperature ?? 0.7,
        topP: s.topP ?? 0.9,
        maxTokens: s.maxTokens ?? 4096,
        customEndpoint: s.customEndpoint ?? '',
        isDefault: s.isDefault ?? true
      }
    }
  } catch {
    // no settings yet, use defaults
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  try {
    saving.value = true

    if (!formData.value.apiKey) {
      toast.add({ description: 'API key is required', icon: 'i-lucide-alert-circle', color: 'error' })
      return
    }

    const response = await $fetch<any>('/api/users/ai-settings', {
      method: 'POST',
      body: formData.value
    })

    settingId.value = response.id
    model.value = formData.value.model

    toast.add({ description: 'AI settings saved', icon: 'i-lucide-check-circle', color: 'success' })
  } catch {
    toast.add({ description: 'Failed to save settings', icon: 'i-lucide-alert-circle', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteSettings() {
  if (!settingId.value) return
  try {
    await $fetch(`/api/users/ai-settings?id=${settingId.value}`, { method: 'DELETE' })
    settingId.value = null
    formData.value.apiKey = ''
    toast.add({ description: 'Settings cleared', icon: 'i-lucide-trash-2', color: 'success' })
  } catch {
    toast.add({ description: 'Failed to delete settings', icon: 'i-lucide-alert-circle', color: 'error' })
  }
}

onMounted(loadSettings)
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          to="/"
          aria-label="Back"
        />
        <div>
          <h1 class="text-xl font-semibold text-highlighted">Settings</h1>
          <p class="text-sm text-muted">Manage your AI provider configuration</p>
        </div>
      </div>

      <UTabs
        :items="[
          { label: 'AI Provider', slot: 'ai', icon: 'i-lucide-cpu' },
          { label: 'Account', slot: 'account', icon: 'i-lucide-user' }
        ]"
        variant="link"
        class="w-full"
      >
        <!-- AI Provider Tab -->
        <template #ai>
          <div v-if="loading" class="flex items-center justify-center py-16">
            <UIcon name="i-lucide-loader-2" class="animate-spin size-6 text-muted" />
          </div>

          <div v-else class="space-y-6 pt-4">
            <!-- Provider -->
            <UFormField label="Provider" name="provider">
              <USelectMenu
                v-model="formData.provider"
                :items="PROVIDERS"
                value-key="value"
                option-attribute="label"
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- Model -->
            <UFormField label="Model" name="model">
              <USelectMenu
                v-model="formData.model"
                :items="availableModels"
                value-key="value"
                option-attribute="label"
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- API Key -->
            <UFormField label="API Key" name="apiKey" :hint="formData.provider === 'openai' ? 'platform.openai.com' : formData.provider === 'anthropic' ? 'console.anthropic.com' : formData.provider === 'google' ? 'aistudio.google.com' : formData.provider === 'groq' ? 'console.groq.com' : 'Provider dashboard'">
              <UInput
                v-model="formData.apiKey"
                type="password"
                placeholder="sk-..."
                size="md"
                class="w-full"
                icon="i-lucide-key"
              />
            </UFormField>

            <!-- Custom Endpoint -->
            <UFormField v-if="showCustomEndpoint" label="Custom Base URL" name="customEndpoint">
              <UInput
                v-model="formData.customEndpoint"
                type="url"
                placeholder="https://api.example.com/v1"
                size="md"
                class="w-full"
                icon="i-lucide-link"
              />
            </UFormField>

            <USeparator />

            <!-- Temperature -->
            <UFormField
              label="Temperature"
              name="temperature"
              :description="`${formData.temperature.toFixed(2)} — Controls randomness. Higher = more creative.`"
            >
              <USlider
                v-model="formData.temperature"
                :min="0"
                :max="2"
                :step="0.05"
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- Top P -->
            <UFormField
              label="Top P"
              name="topP"
              :description="`${formData.topP.toFixed(2)} — Nucleus sampling threshold.`"
            >
              <USlider
                v-model="formData.topP"
                :min="0"
                :max="1"
                :step="0.05"
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- Max Tokens -->
            <UFormField label="Max Tokens" name="maxTokens">
              <UInput
                v-model.number="formData.maxTokens"
                type="number"
                :min="256"
                :max="128000"
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- Actions -->
            <div class="flex items-center justify-between pt-2">
              <UButton
                v-if="settingId"
                color="error"
                variant="soft"
                icon="i-lucide-trash-2"
                :disabled="saving"
                @click="deleteSettings"
              >
                Clear Settings
              </UButton>
              <div v-else />

              <UButton
                icon="i-lucide-save"
                :loading="saving"
                @click="saveSettings"
              >
                Save Settings
              </UButton>
            </div>
          </div>
        </template>

        <!-- Account Tab -->
        <template #account>
          <div class="pt-4 space-y-4">
            <div class="flex items-center gap-4 p-4 rounded-xl border border-default bg-elevated/50">
              <UAvatar
                :src="user?.avatar"
                :alt="user?.name || user?.username"
                size="lg"
              />
              <div>
                <p class="font-medium text-highlighted">{{ user?.name || user?.username }}</p>
                <p class="text-sm text-muted">{{ user?.email }}</p>
              </div>
            </div>
            <p class="text-sm text-muted">Connected via GitHub. Account details are managed through your GitHub profile.</p>
          </div>
        </template>
      </UTabs>
    </div>
  </div>
</template>
