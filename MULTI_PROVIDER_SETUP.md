# Multi-Provider AI Setup Guide

This guide explains how to configure and use multiple AI providers with customizable settings.

## Supported Providers

- **OpenAI** - GPT-5 Nano, GPT-4.5 Turbo, GPT-4 Turbo
- **Anthropic** - Claude Opus 4.6, Claude Sonnet 4.5, Claude Haiku 4.5
- **Google** - Gemini 3.1 Flash, Gemini 3 Flash, Gemini 2 Flash
- **Groq** - Mixtral 8x7B, Llama 3.3 70B
- **Open Router** - Meta Llama 3.3 70B, Mistral 7B
- **Cerebras** - Llama 3.1 70B
- **Custom Endpoint** - Any OpenAI-compatible API endpoint

## Environment Setup

### 1. Add API Keys to .env

Add your API keys for the providers you want to use:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google
GOOGLE_API_KEY=...

# Groq
GROQ_API_KEY=gsk_...

# Open Router
OPENROUTER_API_KEY=sk-or-...

# Cerebras
CEREBRAS_API_KEY=...
```

**Note:** These environment variables are optional. Users can also set their API keys through the AI Settings modal in the application UI.

### 2. Database Migration

The application uses a new `aiSettings` table to store per-user AI configurations. Run the database migration:

```bash
npm run db:migrate
# or
pnpm db:migrate
```

## Using Multi-Provider Support

### For Users

1. **Access AI Settings:** Click the settings icon (⚙️) next to the model selector in the chat
2. **Select Provider:** Choose your preferred AI provider from the dropdown
3. **Select Model:** Pick a model from the selected provider
4. **Enter API Key:** Provide your API key (if not using environment variables)
5. **Configure Parameters:**
   - **Temperature:** Controls creativity (0-2)
   - **Top P:** Controls diversity (0-1)
   - **Max Tokens:** Maximum response length
6. **Custom Endpoint:** For Open Router, Cerebras, or custom endpoints, provide the base URL
7. **Set as Default:** Make this your default configuration for all chats
8. **Save Settings:** Click "Save Settings"

### For Developers

#### Provider Configuration Structure

```typescript
interface ProviderConfig {
  provider: string           // 'openai', 'anthropic', 'google', 'groq', 'openrouter', 'cerebras', 'custom'
  model: string             // Full model identifier (e.g., 'openai/gpt-5-nano')
  apiKey?: string          // User-provided API key (optional if using env vars)
  customEndpoint?: string  // Required for custom endpoints
  temperature?: number     // 0-2, default: 0
  topP?: number           // 0-1, default: 1
  maxTokens?: number      // Default: 4096
  customSettings?: object  // Provider-specific settings
}
```

#### Using Dynamic Provider Selection

The chat API now automatically uses the user's selected provider:

```typescript
// In server/api/chats/[id].post.ts
import { getModelFromProvider, getProviderFromModel } from '~/server/utils/providers'

// Get user's settings
const userSettings = await db.query.aiSettings.findFirst({
  where: eq(schema.aiSettings.userId, userId)
})

// Create dynamic model instance
const modelConfig = {
  provider: getProviderFromModel(model),
  model,
  apiKey: userSettings?.apiKey,
  // ... other settings
}

const dynamicModel = getModelFromProvider(modelConfig)
const result = streamText({ model: dynamicModel, ... })
```

## API Endpoints

### Get User AI Settings

```bash
GET /api/users/ai-settings
```

Returns an array of user's AI setting configurations.

### Save/Update AI Settings

```bash
POST /api/users/ai-settings
Content-Type: application/json

{
  "provider": "openai",
  "model": "openai/gpt-5-nano",
  "apiKey": "sk-...",
  "temperature": 0.7,
  "topP": 0.9,
  "maxTokens": 4096,
  "customEndpoint": null,
  "customSettings": {},
  "isDefault": true
}
```

### Delete AI Settings

```bash
DELETE /api/users/ai-settings?id=<setting-id>
```

## Security Considerations

1. **API Key Storage:** API keys are stored securely in the database and encrypted at rest
2. **Per-User Configuration:** Each user has their own isolated AI settings
3. **Environment Variable Fallback:** If a user hasn't configured an API key, the system will fall back to environment variables
4. **CSRF Protection:** All API calls include CSRF token validation

## Provider-Specific Notes

### OpenAI
- Requires `OPENAI_API_KEY`
- Models: `openai/gpt-5-nano`, `openai/gpt-4.5-turbo`, `openai/gpt-4-turbo`

### Anthropic
- Requires `ANTHROPIC_API_KEY`
- Models: `anthropic/claude-opus-4.6`, `anthropic/claude-sonnet-4.5`, `anthropic/claude-haiku-4.5`
- Supports extended thinking (automatically configured)

### Google
- Requires `GOOGLE_API_KEY`
- Models: `google/gemini-3.1-flash`, `google/gemini-3-flash`, `google/gemini-2-flash`

### Groq
- Requires `GROQ_API_KEY`
- Models: `groq/mixtral-8x7b-32768`, `groq/llama-3.3-70b-versatile`
- Known for extremely fast inference

### Open Router
- Requires `OPENROUTER_API_KEY`
- Custom endpoint: `https://openrouter.ai/api/v1` (set automatically)
- Access to 200+ models across multiple providers

### Cerebras
- Requires `CEREBRAS_API_KEY`
- Custom endpoint: `https://api.cerebras.ai/v1` (set automatically)
- Models: `cerebras/llama-3.1-70b`

### Custom Endpoint
- No built-in API key requirement
- Requires custom endpoint URL
- Must be OpenAI-compatible API

## Models Configuration

All supported models are defined in `shared/utils/models.ts`:

```typescript
export const MODELS = [
  { label: 'GPT-5 Nano', value: 'openai/gpt-5-nano', provider: 'openai', icon: '...' },
  // ... more models
]

export const PROVIDERS = [
  { label: 'OpenAI', value: 'openai', icon: '...' },
  // ... more providers
]
```

Add new models by updating this file and the provider factory in `server/utils/providers.ts`.

## Troubleshooting

### "Invalid model" error
- Ensure the model is in the `MODELS` list in `shared/utils/models.ts`
- Check that the provider is correctly configured

### API Key not working
- Verify the API key is correct and has the necessary permissions
- Check that the API key is for the selected provider
- Ensure the provider is supported

### Custom endpoint connection issues
- Verify the endpoint URL is correct
- Check that the endpoint is OpenAI-compatible
- Ensure the API key has access to the endpoint

### Settings not saving
- Check browser console for error messages
- Verify you're authenticated
- Ensure the API endpoint is accessible

## Adding a New Provider

1. **Add provider to `PROVIDERS` in `shared/utils/models.ts`**
2. **Add models to `MODELS` in `shared/utils/models.ts`**
3. **Update `getModelFromProvider()` in `server/utils/providers.ts`**
4. **Add API key to `.env.example`**
5. **Install provider SDK if needed** (e.g., `@ai-sdk/provider`)
6. **Test with a chat message**

Example:

```typescript
// shared/utils/models.ts
export const PROVIDERS = [
  // ...existing providers...
  { label: 'MyProvider', value: 'myprovider', icon: 'i-mdi-api' }
]

export const MODELS = [
  // ...existing models...
  { label: 'MyModel v1', value: 'myprovider/mymodel-v1', provider: 'myprovider', icon: 'i-mdi-api' }
]

// server/utils/providers.ts
import { myprovider } from '@ai-sdk/myprovider'

export function getModelFromProvider(config: ProviderConfig) {
  // ...existing cases...
  case 'myprovider':
    return myprovider(config.model, {
      apiKey: config.apiKey || process.env.MYPROVIDER_API_KEY
    })
}
```

## Database Schema

The `aiSettings` table stores user configurations:

```sql
CREATE TABLE ai_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  api_key TEXT NOT NULL,
  temperature INTEGER DEFAULT 0,
  top_p INTEGER DEFAULT 1,
  max_tokens INTEGER DEFAULT 4096,
  custom_endpoint TEXT,
  custom_settings TEXT,
  is_default INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```
