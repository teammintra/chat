import { MODELS, PROVIDERS } from '#shared/utils/models'

export function useModels() {
  const model = useCookie<string>('model', { default: () => 'anthropic/claude-haiku-4.5' })
  const provider = computed(() => {
    const parts = model.value.split('/')
    return parts[0] || 'anthropic'
  })

  const modelsByProvider = computed(() => {
    return MODELS.filter(m => m.provider === provider.value)
  })

  return {
    models: MODELS,
    model,
    provider,
    providers: PROVIDERS,
    modelsByProvider
  }
}
