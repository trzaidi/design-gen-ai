# Caption Archive / Caption Arena

Week 4 extends the Week 3 Next.js and Supabase app. Public visitors browse captions; Google-authenticated members create AI captions and vote on them.

## Routes

| Route | Access | Behavior |
| --- | --- | --- |
| `/` | Public | Archive, vote totals, rotating daily NYC/campus scene |
| `/login` | Public | Google OAuth |
| `/privacy` | Public | Privacy policy |
| `/profile` | Signed in | User-owned name and avatar editing |
| `/vote` | Signed in, complete profile | Up/down voting, undo, New/Top browsing |
| `/create` | Signed in, complete profile | Scene + tone → AI caption → saved prompt → public entry |

Server actions independently verify the user through Supabase Auth; RLS protects direct database access. Each user has one vote per caption. The initial vote inserts a row; later votes change that row, and undo removes it. Individual votes are private. A private trigger updates a public read-only aggregate table.

## Configuration

Use Node 22 or later. Install with `npm ci`.

Set these in `.env.local` for local development and in the existing Vercel project for deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `AI_GATEWAY_API_KEY` for local development (server-only)
- `AI_GATEWAY_MODEL` optionally overrides the default text model

Vercel deployments can use their automatic request-context OIDC token instead of a Gateway API key. The token need not exist in `process.env`; `@vercel/oidc` reads the request context first. Enable AI Gateway for the existing `taiz` team and ensure it has a usable allowance. OIDC authenticates requests; it does not grant credits. Never commit secrets or expose an AI key through a `NEXT_PUBLIC_` variable.

The verified default model is `google/gemini-3.5-flash-lite`. Members get 10 generation attempts in a rolling 24-hour window, enforced in Postgres with serialized reservations. A private administrator-managed allowance grants the owner unlimited generations; clients can only read their own effective limit and cannot change it. Failed provider requests also consume an attempt. Captions are capped at 512 output tokens, calls time out after 25 seconds, and automatic retries are disabled. Generated captions, input scenes, exact prompts, tone, and model are persisted. The generator explains that submissions become public.

## Database

The two migrations under `supabase/migrations` extend the existing Week 3 schema. They have been applied to the existing `DesignGenAI` project. Do not replace the database or rerun the initial migration against the same project. The six original captions and existing profiles are preserved.

- `captions`: public content reads; authenticated insert of owned content tied to a generation reservation. No client update/delete.
- `generation_requests`: owner-only reads and inserts; no client changes to identity or timestamps.
- `votes`: owner-only reads, inserts, value updates, and deletes. Composite primary key prevents duplicate votes.
- `caption_stats`: public aggregate reads; private triggers write totals.
- `profiles`: existing Week 3 owner policies, with no anonymous grants.

Every application table has RLS enabled. Supabase-managed system schemas retain their platform policies. The app does not use a service-role key.

## Validation

`npm run lint`, `npx tsc --noEmit`, and `npm run build`.

`supabase/tests/week-04-permissions.sql` tests public reads, denied anonymous writes, owned mutations, duplicate prevention, private records, aggregate integrity, and quota enforcement. All test changes roll back. It has passed in isolated Postgres with the same migrations and Supabase-style Auth functions. Live anonymous REST checks also confirm public archive reads and private-table/write denial. The live SQL test runner returned an expired request-state error, so authenticated mutation checks on the deployed app remain part of the final smoke test.

## Product rationale and PM feedback

The audience is a chronically online Columbia student discovering NYC. Familiar campus/city scenes reduce the effort needed to generate relatable content. A daily scene offers a reason to return; New/Top views make fresh submissions and community favorites easy to find. Tone controls improve on a one-style caption generator, while visible prompts make the AI input transparent.

PM feedback accounts for half the assignment rubric. No actual PM feedback has been provided yet. Record the exact feedback, the change made, the verification result, and the resulting commit in `docs/pm-feedback.md`. These design decisions must not be represented as PM feedback.

## Deployment / submission

The existing repository is linked to Vercel. A push to its production branch triggers deployment. After it becomes Ready, verify the public home page in Incognito, the login gate on `/vote` and `/create`, AI generation, saved prompts, voting, vote persistence after refresh, and vote isolation across two accounts. Deployment Protection must be off. Submit the unique deployment URL tied to the commit, not a moving production alias.

## Meme images

All six original archive captions have associated pictures in `public/memes`. The bowling picture comes from the user; the other five are generated illustrations presented as photographs and labeled AI-generated on the cards. Images preserve their full frames on desktop and mobile. Their paths and generation prompts are saved in Supabase, with provenance and exact prompts also recorded in `docs/meme-image-prompts.json`.

The caption generator can choose an existing gallery photo. Its verified description is used in the AI prompt, and the photo path is saved with the new caption. Users can also keep the original text-only scene workflow.

## AI authentication diagnosis

`GET /api/health/ai` returns only whether a Gateway API key or existing Vercel request-context OIDC token is available. It returns no credential values or user data and does not call the model. Authentication availability does not verify provider credits or model access.

`npm run test:auth` covers the regression where a deployed request has an OIDC header but no environment token. Authenticated mutations still require verified Supabase identity and a complete profile. Missing AI authentication returns before reserving a generation attempt. Provider failures log only HTTP status, with safe user-facing messages.

## Direct Gemini free-tier connection

Create a Gemini API key in Google AI Studio for a free-tier project. In the existing Vercel project, save the key as a Production/Preview Secret named `GEMINI_API_KEY`, then redeploy. Never paste the key into chat or commit it. `GEMINI_MODEL` can optionally override the verified default `gemini-3.5-flash-lite`.

When the Gemini key is present, the app sends the caption prompt directly to Google's Gemini API using `@ai-sdk/google`; it does not use the Gateway allowance for that request. The Gateway connection remains available when Gemini is not configured. Provider errors do not cause automatic switching to a paid provider. Google's free-tier limits and availability apply, and free-tier content may be used to improve Google products as disclosed on the privacy page.

`/api/health/ai` checks the selected connection through a read-only metadata call. It returns only readiness status, never secret values, account balances, or user data. A metadata check cannot confirm generation quota availability. The exact prompt and selected model are still saved with every successful caption.
