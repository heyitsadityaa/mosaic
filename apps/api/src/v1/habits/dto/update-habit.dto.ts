import {
	IsHexColor,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class UpdateHabitDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string;

	@IsOptional()
	@IsHexColor()
	color?: string;
}