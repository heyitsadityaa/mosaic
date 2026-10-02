import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

/**
 * Origins allowed to make credentialed cross-origin requests.
 *
 * Native builds send no `Origin` header and are unaffected by CORS, but the
 * Expo web target and any browser-based OAuth redirect do send one, and
 * Better Auth's cookie-based sessions require `credentials: true`.
 */
const corsOrigins = (
	process.env.CORS_ORIGINS ??
	"http://localhost:8081,http://localhost:19006,http://localhost:3000"
)
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bodyParser: false
	});
	app.setGlobalPrefix("api");
	app.enableVersioning({ type: VersioningType.URI });
	app.enableCors({
		origin: corsOrigins,
		credentials: true
	});
	await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
