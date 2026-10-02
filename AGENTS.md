# Agent guidance

Use the installed `turbo` package in `node_modules` and the repository skill at
`.agents/skills/turborepo/SKILL.md` as the primary references for TurboRepo work
in this repository.

## Skill reference

Use the skill that matches the task and read its `SKILL.md` before making changes.
The files below are the authoritative instructions; this section is only a routing index.

### Expo and React Native

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

- `expo-overview` - Entry point for any Expo, EAS, Expo Go, or `expo-*` task. Load this first, then follow its routing guidance: `.agents/skills/expo-overview/SKILL.md`
- `expo-router` - File-based routes, stacks, tabs, links, headers, search, modals, and form sheets: `.agents/skills/expo-router/SKILL.md`
- `expo-project-structure` - Folder layout and scaffolding for a new Expo app: `.agents/skills/expo-project-structure/SKILL.md`
- `expo-native-ui` - Native-feeling screens, HIG styling, semantic colors, controls, SF Symbols, media, and responsive layout: `.agents/skills/expo-native-ui/SKILL.md`
- `expo-ui` - `@expo/ui` native SwiftUI/Jetpack Compose components such as sheets, lists, toggles, sliders, pickers, menus, and form groups: `.agents/skills/expo-ui/SKILL.md`
- `expo-design-system` - Theme tokens, reusable components, styling-library integration, and design-system drift audits: `.agents/skills/expo-design-system/SKILL.md`
- `expo-data-fetching` - API requests, React Query/SWR, caching, auth, offline behavior, loaders, and loading/error/empty/content states: `.agents/skills/expo-data-fetching/SKILL.md`
- `expo-dom` - Expo DOM components and incremental web-to-native migration: `.agents/skills/expo-dom/SKILL.md`
- `expo-module` - Native Expo modules and views in Swift, Kotlin, and TypeScript, including config plugins and autolinking: `.agents/skills/expo-module/SKILL.md`
- `expo-dev-client` - Local or internal development clients for native-code testing: `.agents/skills/expo-dev-client/SKILL.md`
- `expo-upgrade` - Expo SDK upgrades and dependency compatibility fixes: `.agents/skills/expo-upgrade/SKILL.md`
- `expo-skill-eval` - Evaluate Expo skills for triggering, generated code, static checks, and runtime screenshots: `.agents/skills/expo-skill-eval/SKILL.md`

### EAS delivery and observability

- `eas-app-stores` - EAS builds and submissions for TestFlight, the App Store, and Google Play: `.agents/skills/eas-app-stores/SKILL.md`
- `eas-update` - OTA updates, channels, branches, runtime versions, publishing, and debugging updates that do not appear: `.agents/skills/eas-update/SKILL.md`
- `eas-update-insights` - Adoption, launches, crashes, payload size, and rollout health for published updates: `.agents/skills/eas-update-insights/SKILL.md`
- `eas-observe` - Expo Observe instrumentation, route metrics, custom events, error reporting, and metric queries: `.agents/skills/eas-observe/SKILL.md`
- `eas-workflows` - EAS workflow YAML and Expo/EAS CI/CD pipelines: `.agents/skills/eas-workflows/SKILL.md`

### Animation and UI craft

- `animate` - Design and implement web animations, transitions, curves, timing, and interruption behavior: `.agents/skills/animate/SKILL.md`
- `animate-expo` or `expo-animation` - Design and implement React Native/Expo motion with Reanimated, gestures, haptics, and reduced-motion support: `.agents/skills/animate-expo/SKILL.md` or `.agents/skills/expo-animation/SKILL.md`
- `animation-vocabulary` - Name an animation or motion pattern from a vague description; read-only: `.agents/skills/animation-vocabulary/SKILL.md`
- `find-animation-opportunities` - Identify worthwhile animation opportunities without implementing them; read-only: `.agents/skills/find-animation-opportunities/SKILL.md`
- `review-animations` - Review existing motion against a high craft bar and flag problems: `.agents/skills/review-animations/SKILL.md`
- `improve-animations` - Audit a codebase's motion and produce a prioritized implementation plan; read-only: `.agents/skills/improve-animations/SKILL.md`
- `emil-design-eng` - UI polish, component design, animation decisions, and interaction details: `.agents/skills/emil-design-eng/SKILL.md`
- `pick-ui-library` - Choose a library for a frontend need such as charts, command menus, virtualization, drag and drop, toasts, or state; explicitly invoked only: `.agents/skills/pick-ui-library/SKILL.md`
- `prototype` - Build multiple live UI alternatives behind a visual picker; explicitly invoked only: `.agents/skills/prototype/SKILL.md`

### Repository and agent tooling

- `turborepo` - Monorepo structure, task pipelines, dependencies, caching, filters, and affected builds: `.agents/skills/turborepo/SKILL.md`

When two skills overlap, start with the broader entry point and follow its sibling-skill guidance. For example, use `expo-overview` first for Expo work, `expo-router` for navigation, `expo-native-ui` for platform styling, and `expo-animation` for motion.

### Better Auth

- `better-auth-best-practices` - Configure Better Auth server and client, database adapters, sessions, plugins, and environment variables: `.agents/skills/better-auth-best-practices/SKILL.md`
- `better-auth-security-best-practices` - Harden Better Auth with rate limiting, CSRF protection, trusted origins, secure sessions, token encryption, and audit logging: `.agents/skills/better-auth-security-best-practices/SKILL.md`
- `create-auth` - Scaffold Better Auth for TypeScript/JavaScript apps, including adapters, route handlers, OAuth providers, and auth UI: `.agents/skills/create-auth/SKILL.md`

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
