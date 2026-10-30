import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import type { SessionUser } from "../../common/session.js";
import { CreateHabitDto } from "./dto/create-habit.dto.js";
import { HeatmapQueryDto } from "./dto/heatmap-query.dto.js";
import { UpdateHabitDto } from "./dto/update-habit.dto.js";
import { HabitsService } from "./habits.service.js";

@Controller({ path: "habits", version: "1" })
export class HabitsController {
	constructor(private readonly habitsService: HabitsService) {}

	@Post()
	create(
		@Session() session: SessionUser,
		@Body() createHabitDto: CreateHabitDto,
	) {
		return this.habitsService.create(session.user.id, createHabitDto);
	}

	@Get()
	findAll(@Session() session: SessionUser) {
		return this.habitsService.findAll(session.user.id);
	}

	@Get(":habitId/heatmap")
	getHeatmap(
		@Session() session: SessionUser,
		@Param("habitId", ParseUUIDPipe) habitId: string,
		@Query() query: HeatmapQueryDto,
	) {
		return this.habitsService.getHeatmap(
			session.user.id,
			session.user.timezone,
			habitId,
			query,
		);
	}

	@Get(":habitId")
	findOne(
		@Param("habitId", ParseUUIDPipe) habitId: string,
		@Session() session: SessionUser,
	) {
		return this.habitsService.findOne(session.user.id, habitId);
	}

	@Patch(":habitId")
	@HttpCode(204)
	async update(
		@Param("habitId", ParseUUIDPipe) habitId: string,
		@Body() updateHabitDto: UpdateHabitDto,
		@Session() session: SessionUser,
	) {
		await this.habitsService.update(session.user.id, habitId, updateHabitDto);
	}

	@Delete(":habitId")
	@HttpCode(204)
	async remove(
		@Param("habitId", ParseUUIDPipe) habitId: string,
		@Session() session: SessionUser,
	) {
		await this.habitsService.remove(session.user.id, habitId);
	}
}
