import { db, habit } from "@mosaic/db";
import { Injectable, NotFoundException } from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";
import type { CreateHabitDto } from "./dto/create-habit.dto.js";
import type { UpdateHabitDto } from "./dto/update-habit.dto.js";

@Injectable()
export class HabitsService {
	async create(userId: string, dto: CreateHabitDto) {
		const [row] = await db
			.insert(habit)
			.values({
				userId,
				name: dto.name,
				valueType: dto.valueType,
				options: dto.options ?? null,
				color: dto.color ?? null,
			})
			.returning();
		return row;
	}

	findAll(userId: string) {
		return db
			.select()
			.from(habit)
			.where(and(eq(habit.userId, userId), isNull(habit.archivedAt)));
	}

	async findOne(userId: string, id: string) {
		const [row] = await db
			.select()
			.from(habit)
			.where(and(eq(habit.id, id), eq(habit.userId, userId)));
		if (!row) throw new NotFoundException();
		return row;
	}

	async update(userId: string, id: string, dto: UpdateHabitDto) {
		const [row] = await db
			.update(habit)
			.set({
				...(dto.name !== undefined && { name: dto.name }),
				...(dto.color !== undefined && { color: dto.color }),
			})
			.where(and(eq(habit.id, id), eq(habit.userId, userId)))
			.returning();
		if (!row) throw new NotFoundException();
	}

	async remove(userId: string, id: string) {
		const [row] = await db
			.update(habit)
			.set({ archivedAt: new Date() })
			.where(and(eq(habit.id, id), eq(habit.userId, userId)))
			.returning();
		if (!row) throw new NotFoundException();
	}
}
