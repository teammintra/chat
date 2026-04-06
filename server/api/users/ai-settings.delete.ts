import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

defineRouteMeta({
  openAPI: {
    description: 'Delete user AI settings.',
    tags: ['users', 'ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { id } = await getValidatedQuery(event, z.object({
    id: z.string()
  }).parse)

  const setting = await db.query.aiSettings.findFirst({
    where: (t) => eq(t.id, id)
  })

  if (!setting || setting.userId !== session.user.id) {
    throw createError({ statusCode: 404, statusMessage: 'AI setting not found' })
  }

  await db.delete(schema.aiSettings).where(eq(schema.aiSettings.id, id))

  return { success: true }
})
