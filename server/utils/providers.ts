import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'

export interface ProviderConfig {
  provider: string
  model: string
  apiKey?: string
  customEndpoint?: string
  temperature?: number
  topP?: number
  maxTokens?: number
  customSettings?: Record<string, any>
}

export function getModelFromProvider(config: ProviderConfig) {
  const { provider, model, apiKey, customEndpoint } = config

  switch (provider) {
    case 'openai':
      return openai(model, {
        apiKey: apiKey || process.env.OPENAI_API_KEY
      })

    case 'anthropic':
      return anthropic(model, {
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY
      })

    case 'google':
      return google(model, {
        apiKey: apiKey || process.env.GOOGLE_API_KEY
      })

    case 'groq':
      // Groq uses OpenAI-compatible API
      return openai(model, {
        apiKey: apiKey || process.env.GROQ_API_KEY,
        baseURL: customEndpoint || 'https://api.groq.com/openai/v1'
      })

    case 'openrouter':
      return openai(model, {
        apiKey: apiKey || process.env.OPENROUTER_API_KEY,
        baseURL: customEndpoint || 'https://openrouter.ai/api/v1',
        defaultQuery: { extra_headers: { 'HTTP-Referer': 'http://localhost:3000' } }
      })

    case 'cerebras':
      return openai(model, {
        apiKey: apiKey || process.env.CEREBRAS_API_KEY,
        baseURL: customEndpoint || 'https://api.cerebras.ai/v1'
      })

    case 'custom':
      if (!customEndpoint) {
        throw new Error('Custom endpoint is required for custom provider')
      }
      return openai(model, {
        apiKey: apiKey,
        baseURL: customEndpoint
      })

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

export function getProviderFromModel(modelValue: string): string {
  const parts = modelValue.split('/')
  return parts[0] || 'openai'
}
