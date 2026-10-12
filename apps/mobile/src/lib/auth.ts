import { expoClient } from "@better-auth/expo/client";
import { createClient } from "@mosaic/auth";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_BETTER_AUTH_URL;

if (!baseURL) {
	throw new Error("EXPO_PUBLIC_BETTER_AUTH_URL is not configured");
}

/**
 * Single auth client for the app. The factory itself lives in `@mosaic/auth`
 * so other clients (e.g. a future desktop app) share the same configuration;
 * this module only supplies the Expo platform plugin and storage.
 */
export const authClient = createClient({
	baseURL,
	plugins: [expoClient({ storage: SecureStore })],
});
