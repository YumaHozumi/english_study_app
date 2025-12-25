import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local for Next.js projects
config({ path: '.env.local' });

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'turso',
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
    },
});
