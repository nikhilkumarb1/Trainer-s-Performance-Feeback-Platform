import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Creating tables...");
  
  // Create tables directly from schema
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS "users" (
      "id" SERIAL PRIMARY KEY,
      "username" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "full_name" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'trainee'
    )`);
    console.log("Users table created");

    await db.execute(`CREATE TABLE IF NOT EXISTS "trainers" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL REFERENCES "users" ("id"),
      "department" TEXT NOT NULL,
      "specialty" TEXT NOT NULL
    )`);
    console.log("Trainers table created");

    await db.execute(`CREATE TABLE IF NOT EXISTS "sessions" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "trainer_id" INTEGER NOT NULL REFERENCES "trainers" ("id"),
      "date" TIMESTAMP NOT NULL DEFAULT now(),
      "description" TEXT NOT NULL
    )`);
    console.log("Sessions table created");

    await db.execute(`CREATE TABLE IF NOT EXISTS "feedback" (
      "id" SERIAL PRIMARY KEY,
      "session_id" INTEGER NOT NULL REFERENCES "sessions" ("id"),
      "trainee_id" INTEGER NOT NULL REFERENCES "users" ("id"),
      "overall_rating" INTEGER NOT NULL,
      "knowledge_rating" INTEGER NOT NULL,
      "communication_rating" INTEGER NOT NULL,
      "materials_rating" INTEGER NOT NULL,
      "engagement_rating" INTEGER NOT NULL,
      "comments" TEXT,
      "strengths" TEXT[],
      "improvements" TEXT[],
      "sentiment_score" INTEGER,
      "created_at" TIMESTAMP NOT NULL DEFAULT now()
    )`);
    console.log("Feedback table created");

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => console.log("Migration completed"))
  .catch((err) => console.error("Migration failed:", err));