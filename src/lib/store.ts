import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Export empty implementations for backward compatibility so imports don't fail before we fix them
export const candidates = new Map();
export const candidateEvents = new Map();
export const candidateIncidents = new Map();
export function clearStore() {}
export function initializeStore() {}
