import { db, habit, habitEntries } from "@mosaic/db";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { and, asc, eq, gte, isNotNull, isNull, lte, sum } from "drizzle-orm";
import { addDays, isDateOnly, todayInTimeZone } from "../../common/time.js";
import type { CreateHabitDto } from "./dto/create-habit.dto.js";
import type { HeatmapQueryDto } from "./dto/heatmap-query.dto.js";
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

	async findOne(userId: string, habitId: string) {
		const [row] = await db
			.select()
			.from(habit)
			.where(and(eq(habit.id, habitId), eq(habit.userId, userId)));
		if (!row) throw new NotFoundException();
		return row;
	}

	async getHeatmap(
		userId: string,
		timeZone: string,
		habitId: string,
		query: HeatmapQueryDto,
	) {
		await this.findOne(userId, habitId);

		if (query.from === undefined && query.to === undefined) {
			const to = todayInTimeZone(timeZone);
			return this.heatmapRows(userId, habitId, addDays(to, -90), to);
		}

		if (query.from === undefined || query.to === undefined) {
			throw new BadRequestException("from and to must be provided together");
		}

		if (!isDateOnly(query.from) || !isDateOnly(query.to)) {
			throw new BadRequestException("from and to must be valid dates");
		}

		if (query.from > query.to) {
			throw new BadRequestException("from must not be after to");
		}

		return this.heatmapRows(userId, habitId, query.from, query.to);
	}

	private heatmapRows(
		userId: string,
		habitId: string,
		from: string,
		to: string,
	) {
		return db
			.select({
				date: habitEntries.entryDate,
				value: sum(habitEntries.durationSecs).mapWith(Number),
			})
			.from(habitEntries)
			.where(
				and(
					eq(habitEntries.userId, userId),
					eq(habitEntries.habitId, habitId),
					isNotNull(habitEntries.durationSecs),
					gte(habitEntries.entryDate, from),
					lte(habitEntries.entryDate, to),
				),
			)
			.groupBy(habitEntries.entryDate)
			.orderBy(asc(habitEntries.entryDate));
	}

	async update(userId: string, habitId: string, dto: UpdateHabitDto) {
		const [row] = await db
			.update(habit)
			.set({
				...(dto.name !== undefined && { name: dto.name }),
				...(dto.color !== undefined && { color: dto.color }),
			})
			.where(and(eq(habit.id, habitId), eq(habit.userId, userId)))
			.returning();
		if (!row) throw new NotFoundException();
	}

	async remove(userId: string, habitId: string) {
		const [row] = await db
			.update(habit)
			.set({ archivedAt: new Date() })
			.where(and(eq(habit.id, habitId), eq(habit.userId, userId)))
			.returning();
		if (!row) throw new NotFoundException();
	}
}
