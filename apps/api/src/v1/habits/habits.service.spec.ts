import { Test, type TestingModule } from "@nestjs/testing";
import { HabitsService } from "./habits.service.js";

describe("HabitsService", () => {
	let service: HabitsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [HabitsService],
		}).compile();

		service = module.get<HabitsService>(HabitsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
