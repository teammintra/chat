import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    description: 'Get user AI settings.',
    tags: ['users', 'ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const settings = await db.query.aiSettings.findMany({
    where: eq(schema.aiSettings.userId, session.user.id)
  })

  return settings
})
