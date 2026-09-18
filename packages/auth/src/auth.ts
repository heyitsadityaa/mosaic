import { expo } from "@better-auth/expo";
import { db } from "@mosaic/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";


export type Auth = ReturnType<typeof betterAuth>;
export type Session = Auth["$Infer"]["Session"]

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
            timezone: {
                type: "string",
                required: true,
                defaultValue: "UTC",
            }
        }
    },
    plugins: [expo()],
    database: drizzleAdapter(db, {
        provider: "pg"
    }),
    trustedOrigins: [
        "myapp://",

        // Development mode - Expo's exp:// scheme with local IP ranges
        ...(process.env.NODE_ENV === "development" ? [
            "exp://",                      // Trust any host of the exp:// scheme
            "exp://**",                    // Trust all Expo URLs (wildcard matching)
        ] : [])
    ],
    socialProviders: {
        google: {
            clientId: clientId,
            clientSecret: clientSecret,
        }
    },
    advanced: {
        database: {
            generateId: "uuid"
        }
    }
});