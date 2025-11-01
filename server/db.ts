import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set - PostgreSQL features will be unavailable');
  console.warn('   Application will run in localStorage-only mode');
  console.warn('   For multi-device sync, add a PostgreSQL database on Railway');
}

export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = pool ? drizzle({ client: pool, schema }) : null;
