<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context: Prompt Intelligent Grader

PIG, short for Prompt Intelligent Grader, is a production-light SaaS app for evaluating, scoring, rewriting, testing, and tracking AI prompts.

Tagline: "Grade your prompts before AI grades your results."

## Always Keep This File Current

When project behavior, architecture, plans, environment variables, billing, data models, integrations, or developer workflows change, update this `AGENTS.md` file in the same change. Future developers and AI agents should be able to read this file first and understand the current project context without rediscovering it from scratch.

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS with owned shadcn-style UI primitives in `components/ui`.
- Supabase Auth and Supabase Postgres.
- Prisma ORM in `prisma/schema.prisma`.
- Vercel AI SDK using Vercel AI Gateway model strings.
- Upstash Redis for rate limiting, with in-memory fallback for local/dev.
- Stripe Checkout, Customer Portal, and webhooks for subscriptions.
- Sentry-ready configuration.
- Vitest for unit tests.

## Required Next.js Workflow

Before writing or changing Next.js app code, read the relevant guide in `node_modules/next/dist/docs/`. This project uses Next.js 16 and the APIs/conventions may differ from prior versions.

Common docs to check:
- Pages/layouts: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- Route handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Environment variables: `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`

Do not initialize database, Redis, Stripe, or other service clients eagerly at module scope. Use lazy getter patterns like `getPrisma()`, `getStripe()`, and the Redis helper.

## Key Directories

- `app/`: App Router pages and route handlers.
- `app/(marketing)/page.tsx`: public landing/pricing page.
- `app/dashboard/page.tsx`: authenticated dashboard.
- `app/billing/page.tsx`: authenticated billing dashboard.
- `app/api/evaluations/route.ts`: evaluation API.
- `app/api/evaluations/[id]/test/route.ts`: prompt test run API.
- `app/api/stripe/checkout/route.ts`: Stripe subscription checkout.
- `app/api/stripe/portal/route.ts`: Stripe Customer Portal.
- `app/api/stripe/webhook/route.ts`: Stripe subscription webhook sync.
- `app/auth/callback/route.ts`: Supabase OAuth/magic-link code exchange callback.
- `app/auth/confirm/route.ts`: Supabase email token-hash confirmation endpoint for SSR email templates.
- `app/api/account/route.ts`: authenticated profile updates, preferred-model updates, and account deletion.
- `components/`: feature and UI components.
- `config/`: product, plan, model, rubric, navigation, and content config.
- `lib/ai/`: model registry, prompt evaluation, prompt testing, schemas, scoring.
- `lib/auth/`: Supabase session helpers and ownership checks.
- `lib/billing/`: plan-to-Stripe mapping and monthly usage enforcement.
- `lib/rate-limit/`: daily abuse throttle via Upstash Redis or memory fallback.
- `lib/stripe/`: lazy Stripe SDK getter.
- `prisma/`: Prisma schema and seed script.

## Plans and Billing

The source of truth for product plans is `config/plans.ts`. Marketing pricing cards, billing cards, Stripe descriptions, limits, and future product copy should stay aligned with this file.

Current plans:
- Free: `$0`, 30 evaluations/month, 10 prompt tests/month, 0 quality model runs, fast models only.
- Pro: `$9/month`, 1,000 evaluations/month, 150 prompt tests/month, 0 quality model runs, fast models only.
- Premium: `$19/month`, 3,000 evaluations/month, 500 prompt tests/month, 150 quality model runs, all supported providers.

Plan descriptions:
- Free: "For trying PIG with lightweight monthly usage, prompt history, and fast model access before upgrading."
- Pro: "For regular prompt improvement work with higher monthly limits, fast model routing, and advanced rewrites."
- Premium: "For power users who need larger monthly quotas, all supported providers, and capped access to quality models."

Stripe products/prices should use the same names, prices, and descriptions as `config/plans.ts`. Do not duplicate plan descriptions in page-local hardcoded strings.
All three plans, including Free, have Stripe recurring Price IDs. New users choose a plan before signup authentication, then `/onboarding/plan` activates the selected plan after the auth callback.

Required Stripe env vars:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_FREE_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_PREMIUM_PRICE_ID`

Billing implementation notes:
- `lib/billing/stripe-plans.ts` maps Stripe price IDs to `Plan`.
- `app/api/stripe/plan/route.ts` is the primary plan-management endpoint. It creates Free Stripe subscriptions, opens Checkout for first paid subscriptions, and updates existing subscription items for upgrades/downgrades.
- `app/api/stripe/checkout/route.ts` is legacy checkout support; prefer `/api/stripe/plan` for plan changes.
- Existing subscribers can also use the Stripe Customer Portal for invoices, payment methods, cancellation, and subscription management.
- `app/api/stripe/webhook/route.ts` persists subscription status, active plan, customer/subscription IDs, price ID, billing period dates, and cancellation fields.
- Subscription schema includes `plan`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAt`, and `canceledAt`.

## Usage Limits

Monthly feature limits are enforced in `lib/billing/usage.ts` using Prisma counts:
- Evaluations count `PromptEvaluation` rows in the current billing period.
- Prompt tests count `PromptTestRun` rows in the current billing period.
- Quality model runs count evaluations and prompt tests whose logical model ID is a quality model.

Paid users use Stripe subscription periods when available. Free users use the calendar month.

Daily limits in `config/rate-limits.ts` and `lib/rate-limit/index.ts` are a secondary abuse throttle, not the main billing quota system.

When a monthly limit is exceeded, the API should return a clear 429 and stop the feature until the next billing period.

## AI Gateway and Models

The app uses Vercel AI Gateway through the AI SDK by passing provider/model strings. The required AI credential is:
- `AI_GATEWAY_API_KEY`

Provider API keys are not required for the normal Gateway path.

Model source of truth is `config/models.ts`.
- Fast models are available on Free/Pro depending on plan config.
- Quality models are Premium only and count toward `monthlyQualityModelRuns`.
- `lib/ai/model-registry.ts` resolves logical model IDs to Gateway model strings.
- `hasAiCredentials()` in `lib/utils/env.ts` intentionally checks only `AI_GATEWAY_API_KEY`.

If no AI Gateway key is configured, local development falls back to deterministic heuristic responses so tests and UI flows still work.

## Environment Variables

Copy `.env.example` to `.env.local` and fill the relevant values.

Important groups:
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Database: `DATABASE_URL`, `DIRECT_URL`
- AI Gateway: `AI_GATEWAY_API_KEY`
- Optional model overrides: `OPENAI_FAST_MODEL`, `OPENAI_QUALITY_MODEL`, `ANTHROPIC_QUALITY_MODEL`, `GEMINI_FAST_MODEL`, `GEMINI_QUALITY_MODEL`
- Redis: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Stripe: listed in "Plans and Billing"
- Sentry: `SENTRY_DSN`
- App URL: `NEXT_PUBLIC_APP_URL`

Never expose server secrets with `NEXT_PUBLIC_`.

## Database and Prisma

Schema is in `prisma/schema.prisma`.

After schema changes:
```bash
npm run prisma:generate
```

Apply DB changes with either:
```bash
npm run prisma:migrate
```

or, for local prototyping:
```bash
npm run prisma:push
```

Seed data:
```bash
npm run seed
```

Prisma commands require both `DATABASE_URL` and `DIRECT_URL` to be set in the shell environment or loaded from `.env.local`.

## Auth and Security

- Supabase middleware protects authenticated dashboard routes.
- Auth UI supports only Google OAuth and passwordless email magic links.
- Email/password login and password reset flows are deprecated; do not add password fields back to the auth UI.
- `components/auth/auth-form.tsx` sends magic links with `signInWithOtp` and starts Google OAuth with `signInWithOAuth`.
- In signup mode, `components/auth/auth-form.tsx` must keep plan selection before Google/email auth and pass the selected plan through the auth callback to `/onboarding/plan`.
- OAuth and PKCE magic-link callbacks are handled by `/auth/callback`.
- If Supabase email templates are customized for server-side token-hash verification, point them to `/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`.
- Configure Google provider and allowed redirect URLs in Supabase Auth. Include local and production URLs for `/auth/callback` and `/auth/confirm`.
- Authenticated users are redirected away from `/login` and `/signup` to `/dashboard`.
- Account management lives on `/settings`: users can update display name, choose an allowed default model, inspect auth/session details, sign out, and delete their account.
- Account deletion requires the user to type their email address, cancels any active Stripe subscription, deletes app data through Prisma cascade relations, and removes the Supabase Auth user through the service-role admin API.
- User avatars use Google/Supabase `avatarUrl` when present and fall back to initials via `components/account/user-avatar.tsx`.
- `app/evaluations/new/page.tsx` orders available models with the user's saved preferred model first.
- `requireUser()` is for server components/pages.
- `requireApiUser()` is for route handlers.
- API inputs are validated with Zod.
- Ownership checks are required before reading/modifying user-owned evaluations.
- Prompt inputs are checked for likely secrets before AI evaluation.
- Service role keys must not be used in client components.
- The Supabase service role key is only for server-side admin actions such as account deletion.
- AI calls happen server-side only.

## UI Conventions

- Prefer existing UI primitives in `components/ui`.
- Use `AppShell` for authenticated app pages.
- Pass the authenticated user into `AppShell` so the sidebar account summary and avatar render consistently.
- Keep product UI dense, practical, and dashboard-oriented.
- Use shared config (`config/plans.ts`, `config/site-content.ts`, `config/models.ts`) instead of duplicating product copy or limits in page code.
- Billing and marketing pricing cards should render plan name, price, description, CTA, and features from plan config.

## Verification Commands

Run these after meaningful changes:
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

If `next build` fails in a sandbox with a Turbopack port-binding permission error, rerun the same build outside the sandbox with approval. That failure can be environment-related rather than code-related.

## Current Production Gaps

- Create live Stripe products/prices that match `config/plans.ts`.
- Set `STRIPE_PRO_PRICE_ID` and `STRIPE_PREMIUM_PRICE_ID`.
- Configure Stripe webhook endpoint and `STRIPE_WEBHOOK_SECRET`.
- Apply the current Prisma schema to the deployed database.
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is configured before enabling account deletion in production.
- Configure Sentry DSN and release tracking if production monitoring is required.
