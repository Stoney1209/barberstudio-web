import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://barber:barber@127.0.0.1:5432/barberstudio',
  },
});
