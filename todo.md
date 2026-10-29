# TODOs

## In `@/`

- [x] Setup up biome organizeImport on save and similar formatting options.

## In `@docs/decisions`

- [ ] Do a Back-of-envelop Estimation on 10K MAU in `back-of-envelope.md`. [Ref: Back-of-the-envelope Estimation](https://bytebytego.com/courses/system-design-interview/back-of-the-envelope-estimation)

## In `@package/auth`

- [ ] Add correct schema in `@package/auth/schema.ts` and custom column called timezone in `@package/auth/auth-schema.ts` users table which will be done in `@package/auth/src/auth.ts`.
- [ ] Writing e2e test for testing auth.

## In `@package/db`

- [x] Complete schema/schema.ts and db:push.
- [ ] Writing e2e to test db connection and seeding data.

## In `@apps/api`

- [ ] Setting up nestjs project.
- [ ] Give a read: [https://docs.nestjs.com/cli/monorepo](https://docs.nestjs.com/cli/monorepo)
- [ ] Figure out what happens with tsconfig.json because theirs a tsconfig.base.json in root.
- [ ] endpoint design and most of it part is yet to be done. (Refer: docs/overview.canvas)

## In `@apps/mobile`

- [ ] Fix the `react-hooks/set-state-in-effect` lint error in `src/hooks/use-color-scheme.web.ts` by using `useSyncExternalStore` (or add a justified suppression).
- [ ] Bundle Inter and JetBrains Mono, then apply `font-sans`/`font-mono` so the UI matches the DESIGN.md typography.
- [ ] Configure Biome to allow the `@tailwind` at-rules in `src/global.css` instead of removing the directives.
- [ ] Review the unrelated config/dependency changes: `biome.json` `organizeImports: "off"`, unused `tailwindcss-animate`, `pnpm-workspace.yaml` `onlyBuiltDependencies`, and the redundant direct `react-native-css-interop` dependency.
- [ ] Sign-in polish: use theme tokens for the `ActivityIndicator`, friendly error copy instead of `Failed to fetch`, a `RETRYING…` state for the retry action, and remove the `sm:h-14` Button size workaround.
- [ ] Clean up `apps/mobile/src/app/(authenticated)` and `apps/mobile/src/components`: migrate the remaining screens from `ThemedText`/`ThemedView` and legacy `Colors` to the NativeWind theme tokens; remove stale or unused routes/components and delete starter/demo components that are no longer required (e.g., `animated-icon*`, `hint-row`, `web-badge`, `external-link`, `ui/collapsible`), while keeping shared UI that is still used. Also remove `components.json` if the shadcn CLI is not part of the workflow.

## In `@package/mobile-ui`
