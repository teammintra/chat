export interface AISettings {
  id: string
  userId: string
  provider: string
  model: string
  apiKey: string
  temperature: number
  topP: number
  maxTokens: number
  customEndpoint?: string
  customSettings?: string | Record<string, any>
  isDefault: boolean
  createdAt: Date
}

export interface Model {
  label: string
  value: string
  provider: string
  icon: string
}

export interface Provider {
  label: string
  value: string
  icon: string
}
