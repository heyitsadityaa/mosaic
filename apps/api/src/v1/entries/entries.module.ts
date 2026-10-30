import { Module } from "@nestjs/common";
import { HabitsModule } from "../habits/habits.module.js";
import { EntriesController } from "./entries.controller.js";
import { EntriesService } from "./entries.service.js";

@Module({
	imports: [HabitsModule],
	controllers: [EntriesController],
	providers: [EntriesService],
})
export class EntriesModule {}
