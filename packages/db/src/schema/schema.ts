import { integer, pgTable, varchar, uuid } from "drizzle-orm/pg-core";

export const appUsersTable = pgTable("app_user", {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
});
