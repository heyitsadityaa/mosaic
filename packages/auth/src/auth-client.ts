import type { BetterAuthClientPlugin } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import type { auth } from "./auth.js";

type InferredFields = ReturnType<typeof inferAdditionalFields<typeof auth>>;

type AuthClientOptions<Plugins extends BetterAuthClientPlugin[] = []> = {
	baseURL: string;
	/**
	 * Platform-specific plugins, e.g. `expoClient` or a desktop Tauri plugin.
	 *
	 * `Plugins` is a type parameter rather than a bare `BetterAuthClientPlugin[]`
	 * on purpose: the client infers its whole API surface from the plugin tuple,
	 * so widening it to the base type erases that inference.
	 */
	plugins?: Plugins;
};

export const createClient = <Plugins extends BetterAuthClientPlugin[] = []>({
	baseURL,
	plugins,
}: AuthClientOptions<Plugins>) =>
	createBetterAuthClient({
		baseURL,
		plugins: [inferAdditionalFields<typeof auth>(), ...(plugins ?? [])] as [
			InferredFields,
			...Plugins,
		],
	});
