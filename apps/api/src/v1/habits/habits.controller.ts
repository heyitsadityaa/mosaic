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
} from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { CreateHabitDto } from "./dto/create-habit.dto.js";
import { UpdateHabitDto } from "./dto/update-habit.dto.js";
import { HabitsService } from "./habits.service.js";

type SessionUser = { user: { id: string } };

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

	@Get(":id")
	findOne(
		@Param("id", ParseUUIDPipe) id: string,
		@Session() session: SessionUser,
	) {
		return this.habitsService.findOne(session.user.id, id);
	}

	@Patch(":id")
	@HttpCode(204)
	async update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateHabitDto: UpdateHabitDto,
		@Session() session: SessionUser,
	) {
		await this.habitsService.update(session.user.id, id, updateHabitDto);
	}

	@Delete(":id")
	@HttpCode(204)
	async remove(
		@Param("id", ParseUUIDPipe) id: string,
		@Session() session: SessionUser,
	) {
		await this.habitsService.remove(session.user.id, id);
	}
}
