# ReelFit AI

Premium, single-page Next.js 15 SaaS for fitness coaches who want Instagram Reel ideas in seconds. It ships with:

- Next.js 15 App Router
- Tailwind CSS + shadcn-style accessible components
- Supabase auth + database history
- Stripe Checkout + Customer Portal for the `$9/mo` plan
- Framer Motion micro-interactions
- Dark/light mode
- PWA-ready manifest + service worker

## Features

- Hero-led single-screen UX with bold serif typography and fitness green/orange gradients
- One-click generator with `Goal`, `Style`, and `Duration`
- 5 Reel idea cards per generation with hook, caption, hashtags, SVG thumbnail, copy CTA, and favorites
- Last 10 generations in a responsive dashboard sidebar with regenerate actions
- Freemium flow with `3 free generations/day`
- `Supabase` email/password auth + Google OAuth
- `Stripe` subscription upgrade flow and customer portal
- Guest mode fallback when auth is not configured yet

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in these values in `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

STRIPE_SECRET_KEY=...
STRIPE_PRICE_ID=...
STRIPE_WEBHOOK_SECRET=...
```

4. Start the dev server:

```bash
npm run dev
```

## Supabase setup

1. Create a new Supabase project.
2. Enable Email auth and Google OAuth in `Authentication > Providers`.
3. Run the SQL in [supabase/schema.sql](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/supabase/schema.sql).
4. Add your site URL and local URL to the Supabase redirect allow-list:
   - `http://localhost:3000`
   - `https://your-vercel-domain.vercel.app`
5. Set the Google OAuth redirect URL in Google Cloud to the Supabase callback URL shown in the provider settings.

### Tables

- `public.users`
  - mirrors key auth/account metadata
  - stores `subscription_status`, `generation_count`, Stripe IDs
- `public.ideas`
  - one row per generation
  - stores the 5 generated ideas in `payload jsonb`

## Stripe setup

1. Create a monthly recurring product in Stripe for `$9/mo`.
2. Put the recurring price ID into `STRIPE_PRICE_ID`.
3. Enable the Stripe Billing Portal so the in-app “Manage billing” button has somewhere to send active users.
3. For local webhook testing, run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Recommended Stripe webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Production-ready note

The code is already structured for live mode. When you go live:

- switch from Stripe test keys to live keys
- use your live recurring price ID
- update Supabase OAuth redirect URLs
- update `NEXT_PUBLIC_SITE_URL` to your production domain

## Vercel deployment

Once env vars are added, deployment is one command:

```bash
vercel --prod
```

Recommended Vercel env vars:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_REDIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Then add a Stripe webhook endpoint pointing to:

```text
https://your-domain.com/api/stripe/webhook
```

The project includes [vercel.json](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/vercel.json) and a Node engine requirement in [package.json](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/package.json) so Vercel uses the expected setup.

## Manual launch checklist

1. Add every value from [.env.example](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/.env.example) to Vercel.
2. Run [supabase/schema.sql](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/supabase/schema.sql) in your Supabase SQL editor.
3. Enable Email + Google auth in Supabase and add both local and production redirect URLs.
4. Create the `$9/mo` Stripe price, enable the Billing Portal, and set the webhook events listed above.
5. Deploy with `vercel --prod`.
6. Add the production Stripe webhook endpoint and verify one test checkout before going live.

## Notes on the generator

The current generator uses a fast, deterministic fitness content engine with 10 sample idea templates so the app feels instant and demo-ready out of the box. If you want to swap in a live LLM later, the replacement point is:

- [lib/ai.ts](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/lib/ai.ts)

## Project structure

- [app](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/app)
- [components](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/components)
- [lib](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/lib)
- [supabase/schema.sql](/Users/charles/Documents/Codex/2026-04-23-build-a-premium-modern-web-app/supabase/schema.sql)

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
