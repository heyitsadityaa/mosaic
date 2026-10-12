import { fileURLToPath } from "node:url";
import { expo } from "@better-auth/expo";
import { account, db, session, user, verification } from "@mosaic/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { config } from "dotenv";

config({ path: fileURLToPath(new URL("../.env.local", import.meta.url)) });

export type Auth = ReturnType<typeof betterAuth>;
export type Session = Auth["$Infer"]["Session"];

const secret = process.env.BETTER_AUTH_SECRET;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!secret) {
	throw new Error("BETTER_AUTH_SECRET is not configured");
}

if (!clientId) {
	throw new Error("GOOGLE_CLIENT_ID is not configured");
}

if (!clientSecret) {
	throw new Error("GOOGLE_CLIENT_SECRET is not configured");
}

export const auth = betterAuth({
	secret,
	user: {
		additionalFields: {
			// Placeholder until the client reports the device's IANA timezone.
			// `input: false` keeps this server-owned: the default is applied on
			// create and any client attempt to set it is rejected.
			timezone: {
				type: "string",
				required: true,
				input: false,
				defaultValue: "Asia/Kolkata",
			},
		},
	},
	plugins: [expo()],
	database: drizzleAdapter(db, {
		provider: "pg",
		// Required: the adapter validates the store against this schema, and
		// `drizzle-orm/neon-http` does not expose one on the db instance.
		schema: { account, session, user, verification },
	}),
	trustedOrigins: [
		// Must match the "scheme" in apps/mobile/app.json. Better Auth only
		// appends the session cookie to a deep-link redirect when the location
		// is a trusted origin, so a stale scheme here silently breaks OAuth on
		// device: the browser completes, the app returns with no session.
		"com.mosaic.mobile://",

		// Development mode - Expo's exp:// scheme with local IP ranges
		...(process.env.NODE_ENV === "development"
			? [
					"exp://", // Trust any host of the exp:// scheme
					"exp://**", // Trust all Expo URLs (wildcard matching)
				]
			: []),
	],
	socialProviders: {
		google: {
			clientId: clientId,
			clientSecret: clientSecret,
		},
	},
	advanced: {
		database: {
			generateId: "uuid",
		},
	},
});
