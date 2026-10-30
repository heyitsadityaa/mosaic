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
import { CreateEntryDto } from "./dto/create-entry.dto.js";
import { ListEntriesQueryDto } from "./dto/list-entries-query.dto.js";
import { UpdateEntryDto } from "./dto/update-entry.dto.js";
import { EntriesService } from "./entries.service.js";

@Controller({ path: "entries", version: "1" })
export class EntriesController {
	constructor(private readonly entriesService: EntriesService) {}

	@Post(":habitId")
	create(
		@Session() session: SessionUser,
		@Param("habitId", ParseUUIDPipe) habitId: string,
		@Body() createEntryDto: CreateEntryDto,
	) {
		return this.entriesService.create(
			session.user.id,
			session.user.timezone,
			habitId,
			createEntryDto,
		);
	}

	@Get(":habitId")
	findAll(
		@Session() session: SessionUser,
		@Param("habitId", ParseUUIDPipe) habitId: string,
		@Query() query: ListEntriesQueryDto,
	) {
		return this.entriesService.findAll(
			session.user.id,
			session.user.timezone,
			habitId,
			query,
		);
	}

	@Patch(":habitId/:id")
	@HttpCode(204)
	async update(
		@Session() session: SessionUser,
		@Param("habitId", ParseUUIDPipe) habitId: string,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateEntryDto: UpdateEntryDto,
	) {
		await this.entriesService.update(
			session.user.id,
			session.user.timezone,
			habitId,
			id,
			updateEntryDto,
		);
	}

	@Delete(":habitId/:id")
	@HttpCode(204)
	async remove(
		@Session() session: SessionUser,
		@Param("habitId", ParseUUIDPipe) habitId: string,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		await this.entriesService.remove(
			session.user.id,
			session.user.timezone,
			habitId,
			id,
		);
	}
}
