# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- **Package manager**: `pnpm` (v10.30.1)
- **Dev server**: `pnpm dev` (runs on port 3000, loads `.env.local` via dotenv-cli)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint` (ESLint with `@tanstack/eslint-config`)
- **Format check**: `pnpm format` (Prettier)
- **Fix lint + format**: `pnpm check` (runs `prettier --write` then `eslint --fix`)
- **Run all tests**: `pnpm test` (Vitest)
- **Run a single test**: `pnpm vitest run path/to/test.ts`
- **Convex dev server**: `npx convex dev` (must be running alongside the dev server)
- **Add shadcn component**: `pnpm dlx shadcn@latest add <component>`

## Architecture

This is a **TanStack Start** (React 19) full-stack app with file-based routing, a **Convex** real-time backend, and **Clerk** authentication. It uses Vite 7 with the React Compiler (`babel-plugin-react-compiler`).

### Provider nesting order (in `src/routes/__root.tsx`)

ClerkProvider → ConvexProvider → PostHogProvider → TanStackQueryProvider → {children}

Each integration has its own provider module under `src/integrations/<name>/provider.tsx`. The router is created in `src/router.tsx` with TanStack Query context injected via `src/integrations/tanstack-query/root-provider.tsx`.

### Routing

File-based routing in `src/routes/`. The route tree is auto-generated at `src/routeTree.gen.ts` — never edit this file. Key app routes:

- `/` — Home page (conference landing)
- `/schedule` — Conference schedule
- `/speakers`, `/speakers.$slug` — Speaker listing and detail
- `/talks`, `/talks.$slug` — Talk listing and detail
- `/api/remy-chat` — Server-side POST handler for the AI chat assistant

Routes under `src/routes/demo/` are scaffolded examples and can be safely deleted.

### Content Collections

Speaker and talk content is managed as markdown files in `content/speakers/` and `content/talks/`, defined in `content-collections.ts`. Collections generate typed data imported as `allSpeakers` and `allTalks` from `content-collections`. Slugs are auto-generated from the `name` (speakers) or `title` (talks) field.

### AI Assistant ("Remy")

The AI chat feature uses `@tanstack/ai` with multi-provider support (Anthropic, OpenAI, Gemini, Ollama — first available key wins). Server-side chat logic is in `src/routes/api.remy-chat.ts`. Tool definitions live in `src/lib/conference-tools.ts`. The client hook is `src/lib/conference-ai-hook.ts`.

### Convex Backend

Convex functions live in `convex/`. Schema is in `convex/schema.ts`. Files in `convex/_generated/` are auto-generated — never edit them. The Convex client is bridged to TanStack Query via `@convex-dev/react-query` (see `src/integrations/convex/provider.tsx`).

### Sentry Instrumentation

Server-side Sentry is initialized in `instrument.server.mjs` (loaded via `NODE_OPTIONS='--import'`). Wrap server function internals with `Sentry.startSpan({ name: '...' }, async () => { ... })` using `import * as Sentry from '@sentry/tanstackstart-react'`.

### i18n

ParaglideJS handles localization. Messages are in `messages/` (currently `en.json`, `de.json`). Generated output goes to `src/paraglide/` (auto-generated, do not edit). The Vite plugin and router rewrite hooks handle localized URLs.

### Environment Variables

Type-safe env vars via T3Env in `src/env.ts`. Client-side vars must be prefixed with `VITE_`. Required `.env.local` vars:

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk auth
- `VITE_CONVEX_URL`, `CONVEX_DEPLOYMENT` — Convex
- `VITE_POSTHOG_KEY` — PostHog analytics (optional)
- `VITE_SENTRY_DSN` — Sentry error tracking (optional)
- AI provider keys: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` (at least one for Remy, or use local Ollama)

## Code Conventions

- **Path aliases**: `@/*` and `#/*` both resolve to `./src/*`
- **Styling**: Tailwind CSS v4 with `tailwindcss-animate`. Custom dark theme with copper/gold palette defined in `src/styles.css`. Use `cn()` from `src/lib/utils.ts` for conditional class merging
- **Fonts**: Playfair Display (display/headings via `font-display`) and Cormorant Garamond (body via `font-body`)
- **UI components**: shadcn/ui (new-york style, no RSC). Components in `src/components/ui/` — these have relaxed lint rules
- **Prettier**: no semicolons, single quotes, trailing commas
- **React 19**: Use `ref` as a regular prop (no `forwardRef`). Use `use()` instead of `useContext()`
- **Composition patterns**: Prefer compound components over boolean prop proliferation. Lift state into provider components. See `skills/vercel-composition-patterns/AGENTS.md` for detailed guidance
