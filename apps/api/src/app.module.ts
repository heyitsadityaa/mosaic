import { auth } from "@mosaic/auth/server";
import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { EntriesModule } from "./v1/entries/entries.module.js";
import { HabitsModule } from "./v1/habits/habits.module.js";
import { HealthModule } from "./v1/health/health.module.js";

@Module({
	imports: [
		AuthModule.forRoot({ auth }),
		HealthModule,
		HabitsModule,
		EntriesModule,
	],
})
export class AppModule {}
