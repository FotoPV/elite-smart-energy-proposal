/**
 * Database Migration Runner
 * Runs all Drizzle migration SQL files in order on startup.
 * Safe to run multiple times — uses drizzle_migrations table to track applied migrations.
 */

import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import path from "path";

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("[Migrate] No DATABASE_URL set — skipping migrations.");
    return;
  }

  console.log("[Migrate] Connecting to database...");
  
  let connection: mysql.Connection | null = null;
  
  try {
    connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection);
    
    // Resolve migrations folder relative to this file
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    
    console.log("[Migrate] Running migrations from:", migrationsFolder);
    await migrate(db, { migrationsFolder });
    console.log("[Migrate] ✅ All migrations applied successfully.");
  } catch (error) {
    console.error("[Migrate] ❌ Migration failed:", error);
    // Don't crash the server — app can still run without DB
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
