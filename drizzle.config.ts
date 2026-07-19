import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_URL!,
  },
})
