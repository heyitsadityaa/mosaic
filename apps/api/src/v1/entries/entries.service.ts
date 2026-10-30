import { db, habitEntries } from "@mosaic/db";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import {
	dateInTimeZone,
	isDateOnly,
	todayInTimeZone,
} from "../../common/time.js";
import { HabitsService } from "../habits/habits.service.js";
import type { CreateEntryDto } from "./dto/create-entry.dto.js";
import type { ListEntriesQueryDto } from "./dto/list-entries-query.dto.js";
import type { UpdateEntryDto } from "./dto/update-entry.dto.js";

const entryColumns = {
	id: habitEntries.id,
	habitId: habitEntries.habitId,
	happenedAt: habitEntries.happenedAt,
	entryDate: habitEntries.entryDate,
	durationSecs: habitEntries.durationSecs,
	createdAt: habitEntries.createdAt,
	updatedAt: habitEntries.updatedAt,
};

@Injectable()
export class EntriesService {
	constructor(private readonly habitsService: HabitsService) {}

	async create(
		userId: string,
		timeZone: string,
		habitId: string,
		dto: CreateEntryDto,
	) {
		const habit = await this.habitsService.findOne(userId, habitId);
		if (habit.valueType !== "timer") {
			throw new BadRequestException("Only timer habits accept entries");
		}

		const now = new Date();

		const [row] = await db
			.insert(habitEntries)
			.values({
				userId,
				habitId,
				happenedAt: now,
				entryDate: dateInTimeZone(now, timeZone),
				durationSecs: dto.durationSecs,
			})
			.returning(entryColumns);

		return row;
	}

	async findAll(
		userId: string,
		timeZone: string,
		habitId: string,
		query: ListEntriesQueryDto,
	) {
		await this.habitsService.findOne(userId, habitId);
		const { from, to } = this.resolveRange(query.from, query.to, timeZone);

		return db
			.select(entryColumns)
			.from(habitEntries)
			.where(
				and(
					eq(habitEntries.userId, userId),
					eq(habitEntries.habitId, habitId),
					gte(habitEntries.entryDate, from),
					lte(habitEntries.entryDate, to),
				),
			)
			.orderBy(desc(habitEntries.happenedAt), desc(habitEntries.createdAt));
	}

	async update(
		userId: string,
		timeZone: string,
		habitId: string,
		id: string,
		dto: UpdateEntryDto,
	) {
		const row = await this.findOwnedEntry(userId, habitId, id);
		this.assertToday(row.entryDate, timeZone);

		await db
			.update(habitEntries)
			.set({ durationSecs: dto.durationSecs })
			.where(
				and(
					eq(habitEntries.id, id),
					eq(habitEntries.habitId, habitId),
					eq(habitEntries.userId, userId),
				),
			);
	}

	async remove(userId: string, timeZone: string, habitId: string, id: string) {
		const row = await this.findOwnedEntry(userId, habitId, id);
		this.assertToday(row.entryDate, timeZone);

		await db
			.delete(habitEntries)
			.where(
				and(
					eq(habitEntries.id, id),
					eq(habitEntries.habitId, habitId),
					eq(habitEntries.userId, userId),
				),
			);
	}

	private async findOwnedEntry(userId: string, habitId: string, id: string) {
		const [row] = await db
			.select()
			.from(habitEntries)
			.where(
				and(
					eq(habitEntries.id, id),
					eq(habitEntries.habitId, habitId),
					eq(habitEntries.userId, userId),
				),
			);

		if (!row) throw new NotFoundException();
		return row;
	}

	private assertToday(entryDate: string, timeZone: string) {
		if (entryDate !== todayInTimeZone(timeZone)) {
			throw new ConflictException("Only today's entries can be changed");
		}
	}

	private resolveRange(
		from: string | undefined,
		to: string | undefined,
		timeZone: string,
	) {
		if (from === undefined && to === undefined) {
			const today = todayInTimeZone(timeZone);
			return { from: today, to: today };
		}

		if (from === undefined || to === undefined) {
			throw new BadRequestException("from and to must be provided together");
		}

		if (!isDateOnly(from) || !isDateOnly(to)) {
			throw new BadRequestException("from and to must be valid dates");
		}

		if (from > to) {
			throw new BadRequestException("from must not be after to");
		}

		return { from, to };
	}
}
