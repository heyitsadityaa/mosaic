import { Type } from "class-transformer";
import {
	IsArray,
	IsEnum,
	IsHexColor,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateIf,
	ValidateNested,
} from "class-validator";

export enum HabitValueType {
	Timer = "timer",
	Binary = "binary",
	Number = "number",
	Options = "options",
}

export class HabitOption {
	@IsString()
	@IsNotEmpty()
	id!: string;

	@IsString()
	@IsNotEmpty()
	label!: string;
}

export class CreateHabitDto {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsEnum(HabitValueType)
	valueType!: HabitValueType;

	@IsOptional()
	@ValidateIf(
		(dto) => dto.valueType === HabitValueType.Options,
	)
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => HabitOption)
	options?: HabitOption[];

	@IsOptional()
	@IsHexColor()
	color?: string;
}
