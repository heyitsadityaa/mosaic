import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import type { auth } from "./auth.js";

type AuthClientOptions = {
    baseURL: string;
};

export const createClient = ({ baseURL }: AuthClientOptions) =>
    createBetterAuthClient({
        baseURL,
        plugins: [inferAdditionalFields<typeof auth>()],
    });