import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

defineRouteMeta({
  openAPI: {
    description: 'Create or update user AI settings.',
    tags: ['users', 'ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string(),
    temperature: z.number().optional().default(0.7),
    topP: z.number().optional().default(0.9),
    maxTokens: z.number().optional().default(4096),
    customEndpoint: z.string().optional(),
    customSettings: z.record(z.any()).optional(),
    isDefault: z.boolean().optional().default(false)
  }).parse)

  // If setting as default, unset other defaults for this user
  if (body.isDefault) {
    await db.update(schema.aiSettings)
      .set({ isDefault: false })
      .where(eq(schema.aiSettings.userId, session.user.id))
  }

  const existing = await db.query.aiSettings.findFirst({
    where: (t) => eq(t.userId, session.user.id)
  })

  if (existing) {
    const updated = await db.update(schema.aiSettings)
      .set({
        ...body,
        customSettings: body.customSettings ? JSON.stringify(body.customSettings) : null
      })
      .where(eq(schema.aiSettings.id, existing.id))
      .returning()

    return updated[0]
  } else {
    const created = await db.insert(schema.aiSettings)
      .values({
        userId: session.user.id,
        ...body,
        customSettings: body.customSettings ? JSON.stringify(body.customSettings) : null
      })
      .returning()

    return created[0]
  }
})
