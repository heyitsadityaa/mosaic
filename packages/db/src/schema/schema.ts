import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import {
	boolean,
	date,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

export const habit = pgTable("habit", {
	id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	valueType: text("value_type").notNull(), // 'timer' | 'binary' | 'number' | 'options'
	options: jsonb("options").$type<{ id: string; label: string }[]>(),
	color: text("color"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const habitEntries = pgTable(
	"habit_entries",
	{
		id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
		habitId: uuid("habit_id")
			.notNull()
			.references(() => habit.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		happenedAt: timestamp("happened_at", { withTimezone: true }).notNull(),
		entryDate: date("entry_date").notNull(),
		durationSecs: integer("duration_secs"),
		isDone: boolean("is_done"),
		count: integer("count"),
		optionValue: text("option_value"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("habit_entries_index_0").on(table.habitId, table.entryDate),
		index("habit_entries_index_1").on(table.userId, table.entryDate),
	],
);

export const habitRelations = relations(habit, ({ one, many }) => ({
	user: one(user, {
		fields: [habit.userId],
		references: [user.id],
	}),
	entries: many(habitEntries),
}));

export const habitEntriesRelations = relations(habitEntries, ({ one }) => ({
	habit: one(habit, {
		fields: [habitEntries.habitId],
		references: [habit.id],
	}),
	user: one(user, {
		fields: [habitEntries.userId],
		references: [user.id],
	}),
}));
