import { IsInt, Min } from "class-validator";

export class UpdateEntryDto {
	@IsInt()
	@Min(1)
	durationSecs!: number;
}
