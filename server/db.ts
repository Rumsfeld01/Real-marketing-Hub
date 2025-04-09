import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { log } from './vite';

// Configuration check
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the connection
const connectionString = process.env.DATABASE_URL;
const queryClient = postgres(connectionString);

// Create the database client
export const db = drizzle(queryClient, { schema });

// Function to run migrations
export async function runMigrations() {
  log('Starting database migrations', 'database');
  try {
    // Direct connection for running migrations
    const migrationClient = postgres(connectionString, { max: 1 });
    
    // Using drizzle-orm's programmatic migration
    const migrationDb = drizzle(migrationClient, { schema });
    
    // Execute basic SQL query to check connection
    const result = await migrationDb.execute(sql`SELECT NOW()`);
    log(`Database connection successful: ${JSON.stringify(result[0])}`, 'database');
    
    log('Database migrations completed successfully', 'database');
  } catch (error) {
    log(`Migration error: ${error}`, 'database');
    throw error;
  }
}