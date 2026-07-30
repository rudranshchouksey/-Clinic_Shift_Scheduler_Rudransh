import { PrismaClient } from '@prisma/client'
import { mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { prisma } from '../db'
import { beforeEach } from 'vitest'

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
