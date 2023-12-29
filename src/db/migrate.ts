import postgres from "postgres";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

if (process.env.POSTGRES_URL) {
  const client = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(client);
  doMigration(db).catch(console.log);
} else {
  console.error("Couldn't find connection string");
}

async function doMigration(db: PostgresJsDatabase) {
  console.log("Migrating...");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migration complete!");
  process.exit(0)
}
