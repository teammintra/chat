export const PROVIDERS = [
  { label: 'OpenAI', value: 'openai', icon: 'i-simple-icons-openai' },
  { label: 'Anthropic', value: 'anthropic', icon: 'i-simple-icons-anthropic' },
  { label: 'Google', value: 'google', icon: 'i-simple-icons-google' },
  { label: 'Groq', value: 'groq', icon: 'i-simple-icons-groq' },
  { label: 'Open Router', value: 'openrouter', icon: 'i-mdi-api' },
  { label: 'Cerebras', value: 'cerebras', icon: 'i-mdi-api' },
  { label: 'Custom Endpoint', value: 'custom', icon: 'i-mdi-api' }
]

export const MODELS = [
  // OpenAI
  { label: 'GPT-5 Nano', value: 'openai/gpt-5-nano', provider: 'openai', icon: 'i-simple-icons-openai' },
  { label: 'GPT-4.5 Turbo', value: 'openai/gpt-4.5-turbo', provider: 'openai', icon: 'i-simple-icons-openai' },
  { label: 'GPT-4 Turbo', value: 'openai/gpt-4-turbo', provider: 'openai', icon: 'i-simple-icons-openai' },
  
  // Anthropic
  { label: 'Claude Opus 4.6', value: 'anthropic/claude-opus-4.6', provider: 'anthropic', icon: 'i-simple-icons-anthropic' },
  { label: 'Claude Sonnet 4.5', value: 'anthropic/claude-sonnet-4.5', provider: 'anthropic', icon: 'i-simple-icons-anthropic' },
  { label: 'Claude Haiku 4.5', value: 'anthropic/claude-haiku-4.5', provider: 'anthropic', icon: 'i-simple-icons-anthropic' },
  
  // Google
  { label: 'Gemini 3.1 Flash', value: 'google/gemini-3.1-flash', provider: 'google', icon: 'i-simple-icons-google' },
  { label: 'Gemini 3 Flash', value: 'google/gemini-3-flash', provider: 'google', icon: 'i-simple-icons-google' },
  { label: 'Gemini 2 Flash', value: 'google/gemini-2-flash', provider: 'google', icon: 'i-simple-icons-google' },
  
  // Groq
  { label: 'Mixtral 8x7B', value: 'groq/mixtral-8x7b-32768', provider: 'groq', icon: 'i-simple-icons-groq' },
  { label: 'Llama 3.3 70B', value: 'groq/llama-3.3-70b-versatile', provider: 'groq', icon: 'i-simple-icons-groq' },
  
  // Open Router
  { label: 'Meta Llama 3.3 70B', value: 'openrouter/meta-llama/llama-3.3-70b-instruct', provider: 'openrouter', icon: 'i-mdi-api' },
  { label: 'Mistral 7B', value: 'openrouter/mistralai/mistral-7b-instruct', provider: 'openrouter', icon: 'i-mdi-api' },
  
  // Cerebras
  { label: 'Llama 3.1 70B', value: 'cerebras/llama-3.1-70b', provider: 'cerebras', icon: 'i-mdi-api' }
]
