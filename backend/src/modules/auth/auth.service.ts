import type { VerifiedIdentity } from '../../auth/strategies'
import { prisma } from '../../prisma'

const findOrCreate = async (provider: string, identity: VerifiedIdentity) => {
  const row = await prisma.authIdentity.upsert({
    where: { provider_externalId: { provider, externalId: identity.externalId } },
    update: {},
    create: {
      provider,
      externalId: identity.externalId,
      user: { create: { name: identity.profile.name, avatarUrl: identity.profile.avatarUrl } },
    },
    include: { user: true },
  })
  return row.user
}

let devUserId: string | null = null

/** Заглушка авторизации: фиксированный dev-пользователь (provider 'web'). */
const getDevUserId = async (): Promise<string> => {
  if (devUserId) {
    return devUserId
  }
  const user = await findOrCreate('web', { externalId: 'dev', profile: { name: 'Алиса' } })
  devUserId = user.id
  return devUserId
}

export const authService = { findOrCreate, getDevUserId }
