import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  CLOUDFARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFARE_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFARE_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFARE_BUCKET: z.string().optional(),
  CLOUDFARE_PUBLIC_URL: z.string().url().optional(),
})

export const env = envSchema.parse(process.env)
