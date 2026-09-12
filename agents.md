# Agent guidance

Use the installed `turbo` package in `node_modules` and the repository skill at
`.agents/skills/turborepo/SKILL.md` as the primary references for TurboRepo work
in this repository.

## Skill reference

Use the skill that matches the task and read its `SKILL.md` before making changes.
The files below are the authoritative instructions; this section is only a routing index.

### Expo and React Native

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
