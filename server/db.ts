import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import pg from 'pg';
const { Pool: PgPool } = pg;
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set - PostgreSQL features will be unavailable');
  console.warn('   Application will run in localStorage-only mode');
  console.warn('   For multi-device sync, add a PostgreSQL database on Railway');
}

// Detect if using Neon (Replit) or standard PostgreSQL (Railway)
const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech') || 
                       process.env.DATABASE_URL?.includes('neon.tech') ||
                       process.env.DATABASE_URL?.includes('helium');

let pool: NeonPool | PgPool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  if (isNeonDatabase) {
    // Use Neon WebSocket driver for Replit/Neon databases
    console.log('📦 Using Neon serverless driver (WebSocket)');
    neonConfig.webSocketConstructor = ws;
    const neonPool = new NeonPool({ connectionString: process.env.DATABASE_URL });
    pool = neonPool;
    db = drizzleNeon(neonPool, { schema });
  } else {
    // Use standard pg driver for Railway/standard PostgreSQL
    console.log('📦 Using standard PostgreSQL driver (TCP)');
    const pgPool = new PgPool({ connectionString: process.env.DATABASE_URL });
    pool = pgPool;
    db = drizzlePg(pgPool, { schema });
  }
}

export { pool, db };
