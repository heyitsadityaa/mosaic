import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

config({ path: fileURLToPath(new URL("../.env.local", import.meta.url)) });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is not configured");
}

export const db = drizzle({ client: neon(databaseUrl) });

export * from "./schema/auth-schema.js";
export * from "./schema/schema.js";
