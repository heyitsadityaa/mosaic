import { IsInt, Min } from "class-validator";

export class CreateEntryDto {
	@IsInt()
	@Min(1)
	durationSecs!: number;
}
