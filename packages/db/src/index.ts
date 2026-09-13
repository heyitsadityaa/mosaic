import { neon } from "@neondatabase/serverless";
import { config } from 'dotenv';
import { drizzle } from "drizzle-orm/neon-http";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
}

export const db = drizzle({ client: neon(databaseUrl) })