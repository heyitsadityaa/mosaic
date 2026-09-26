import { Module } from "@nestjs/common";
import { HealthModule } from "./v1/health/health.module.js";

@Module({
	imports: [HealthModule],
})
export class AppModule {}
