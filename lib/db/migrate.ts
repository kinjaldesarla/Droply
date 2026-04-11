import { migrate } from "drizzle-orm/neon-http/migrator"
import {drizzle} from 'drizzle-orm/neon-http'
import {neon} from'@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({path:".env"})
if(!process.env.DATABASE_URL){
    throw new Error("Database url is not set in env ")
}

async function runMigration() {
    console.log("🔄 Starting database migration...");

  try {
    // Create a Neon SQL connection
    const sql = neon(process.env.DATABASE_URL!);

    // Initialize Drizzle with the connection
    const db = drizzle(sql);

    // Run migrations from the drizzle folder
    console.log("📂 Running migrations from ./drizzle folder");
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("✅ Database migration completed successfully!");
  } catch (error) {
        console.log("Error can while running migrations")
        console.error(error);
        process.exit(1)
    }
}
runMigration();