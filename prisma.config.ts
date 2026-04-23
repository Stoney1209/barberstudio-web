import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables manually if not already loaded (for local CLI usage)
if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

// HACK for Prisma 7: Force DIRECT_URL during migrations if it hangs on pooler
const isMigrating = process.argv.some(arg => arg.includes('migrate') || arg.includes('db') || arg.includes('push'));
const databaseUrl = (isMigrating && process.env.DIRECT_URL) 
  ? process.env.DIRECT_URL 
  : process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
