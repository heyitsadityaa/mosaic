import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller({ path: "health", version: "1" })
export class HealthController {
	@Get()
	@AllowAnonymous()
	check() {
		return { status: "ok" };
	}
}
