import { Test, type TestingModule } from "@nestjs/testing";
import { EntriesController } from "./entries.controller.js";
import { EntriesService } from "./entries.service.js";
import { HabitsService } from "../habits/habits.service.js";

describe("EntriesController", () => {
	let controller: EntriesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [EntriesController],
			providers: [EntriesService, HabitsService],
		}).compile();

		controller = module.get<EntriesController>(EntriesController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
