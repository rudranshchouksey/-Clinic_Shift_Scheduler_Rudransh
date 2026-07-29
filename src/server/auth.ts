import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  database: {
    // Basic setup, configure as needed based on Prisma
    provider: 'postgresql',
    url: process.env.DATABASE_URL as string,
  },
  emailAndPassword: {
    enabled: true,
  },
})
