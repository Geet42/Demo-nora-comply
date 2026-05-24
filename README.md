# Nora Comply · Prototype

Next.js 14 prototype for Nora Comply, matching the cosmic aesthetic of noracomply.com. Built on the exact stack from the pitch: Next.js, Supabase, Vercel, React PDF, and Resend.

This iteration adds four production-grade features:

1. Real Supabase authentication (sign up, sign in, sign out, route protection)
2. "Register AI System" form wired to Supabase with automatic obligation seeding
3. Vercel cron job for the weekly Resend digest
4. Evidence file upload to Supabase Storage with content hashing and signed URLs

Every feature falls back gracefully to demo mode if env vars aren't set, so the prototype always runs.

---

## Project structure

```
nora-comply/
├── app/
│   ├── page.tsx                       Cosmic landing page
│   ├── login/
│   │   ├── page.tsx                   Sign in / sign up (real Supabase auth)
│   │   └── actions.ts                 signIn, signUp, signOut server actions
│   ├── dashboard/
│   │   ├── layout.tsx                 Sidebar + topbar shell
│   │   ├── page.tsx                   Main dashboard (reads from Supabase)
│   │   ├── systems/
│   │   │   ├── page.tsx               AI systems list
│   │   │   └── actions.ts             registerSystem server action
│   │   └── obligations/
│   │       ├── page.tsx               Obligations list
│   │       └── actions.ts             uploadEvidence, getEvidenceSignedUrl
│   ├── api/
│   │   ├── generate-pdf/route.ts      React PDF evidence pack
│   │   ├── send-digest/route.ts       Manual digest trigger
│   │   └── cron/weekly-digest/route.ts Vercel cron handler
│   └── globals.css                    Theme tokens + cosmic background
├── components/
│   ├── landing/                       Logo, FeatureGrid, ComplianceMap, Footer
│   └── dashboard/                     Sidebar, Topbar, StatCards, RegisterSystemButton, UploadEvidenceButton, etc.
├── lib/
│   ├── supabase/server.ts             Supabase server client
│   ├── supabase/client.ts             Supabase browser client
│   ├── auth.ts                        getUserCompanyId, isDemoMode helpers
│   ├── data.ts                        fetchSystems / fetchObligations / fetchActivities
│   ├── demo-data.ts                   Fallback data
│   └── pdf/EvidencePack.tsx           React PDF document template
├── middleware.ts                      Refreshes Supabase sessions + route guards
├── supabase/schema.sql                Tables, RLS, storage bucket, storage policies
├── vercel.json                        Cron schedule
└── .env.example
```

---

## Step 1 · Run it locally (5 minutes, no accounts needed)

Demo data is built in. The prototype runs without Supabase or Resend.

```bash
node --version            # need v18+
npm install
cp .env.example .env.local
npm run dev
```

Open:
- `http://localhost:3000` for the cosmic landing page
- `http://localhost:3000/dashboard` for the product (demo data)
- `http://localhost:3000/login` for the auth screen (will show a friendly error if Supabase isn't configured yet)

---

## Step 2 · Connect Supabase (unlocks auth, registration, evidence upload)

### 2.1 Create the project

1. Sign in at `https://supabase.com`.
2. New project. Pick an EU region (Frankfurt / Ireland). This matters for GDPR Article 44.
3. Set a strong DB password and save it.
4. Wait two minutes for it to provision.

### 2.2 Run the schema

1. In Supabase, open the SQL Editor.
2. Paste the whole contents of `supabase/schema.sql` and click Run.

This sets up:
- The five tables (`companies`, `memberships`, `ai_systems`, `obligations`, `evidence`, `activities`)
- Row-level security policies on every table (tenant isolation enforced at the DB)
- A private storage bucket called `evidence`
- Storage policies that only let users read/write paths under their own company prefix

### 2.3 Wire up env vars

In Supabase: Project Settings → API. Copy:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (never expose to the browser — only used by the cron job)

Paste into `.env.local` and restart `npm run dev`.

### 2.4 Test auth and the register-system form

1. Go to `/login`, switch to "Create one", make a workspace.
2. You'll be redirected to `/dashboard`.
3. Click "+ Register AI System" in the topbar. Fill the form, pick a risk level, submit.
4. Refresh the page. Your system appears in the table. Obligations have been auto-seeded based on risk level. An activity row records who did it and when.

### 2.5 Test evidence upload

1. Go to the dashboard.
2. In the "EU AI Act Compliance" panel, each obligation has an inline "+ Upload evidence" link.
3. Click it, pick a PDF, submit. The file is SHA-256 hashed, stored under `companies/{your-company-id}/obligations/{obligation-id}/v1-{hash}.pdf`, and recorded in the `evidence` table with version, hash, and uploader.
4. Verify in Supabase: Storage → evidence bucket → you'll see the file in its company-scoped folder.

If you try to access another company's storage path, the storage RLS policy returns nothing. Try it from the SQL editor as a different user if you want to satisfy yourself.

---

## Step 3 · Connect Resend and turn on the weekly digest

### 3.1 Resend setup

1. Sign up at `https://resend.com`.
2. Add `noracomply.com` as a sending domain and add the DNS records in GoDaddy.
3. Wait for verification (usually 10 minutes).
4. Create an API key. Paste into `.env.local`:
   ```
   RESEND_API_KEY=re_xxxx
   RESEND_FROM_EMAIL=noreply@noracomply.com
   ```

### 3.2 Test the manual digest

```bash
curl -X POST http://localhost:3000/api/send-digest \
  -H "Content-Type: application/json" \
  -d '{"to":"your.real.email@example.com"}'
```

You should receive the dark-themed digest in your inbox within seconds.

### 3.3 Turn on the Vercel cron

`vercel.json` already declares the schedule:

```json
{
  "crons": [
    { "path": "/api/cron/weekly-digest", "schedule": "0 8 * * 1" }
  ]
}
```

That's every Monday at 08:00 UTC. After you deploy to Vercel (next step), the cron runs automatically.

Set a `CRON_SECRET` env var in Vercel so the URL can't be triggered by anyone else:

```bash
# Generate a random secret
openssl rand -hex 32
```

Paste it into Vercel's environment variables as `CRON_SECRET`. The route checks `Authorization: Bearer <CRON_SECRET>`, which Vercel attaches automatically to cron calls.

When the cron fires, it looks up every workspace owner in Supabase, fetches each one's email via the admin API, and sends them a workspace-personalised digest. If Supabase isn't configured, it sends a single test digest to `DIGEST_TEST_RECIPIENT`.

---

## Step 4 · Deploy to Vercel

```bash
git init
git add .
git commit -m "Nora Comply prototype with auth, registration, cron, evidence upload"
git remote add origin https://github.com/YOUR-USERNAME/nora-comply.git
git push -u origin main
```

1. `https://vercel.com` → Add New Project → pick the repo.
2. Paste every env var from `.env.local`, plus `CRON_SECRET`.
3. Set Functions region to `fra1` or `dub1` (EU).
4. Deploy.

After ~90 seconds you have a live URL. Cron starts automatically on the next scheduled tick.

Connect the `noracomply.com` domain in Vercel → Settings → Domains, then update DNS in GoDaddy as instructed.

---

## How each new feature works (architecture explained)

### Real Supabase auth

- `middleware.ts` runs on every request. It refreshes the Supabase session cookie and protects `/dashboard/*` by redirecting unauthenticated users to `/login`.
- Sign in and sign up are Next.js **server actions** in `app/login/actions.ts`. The browser submits a form, Next runs the action on the server, talks to Supabase, then redirects.
- Sign up also creates a `companies` row and a `memberships` row with role `owner` so the user has a workspace immediately.
- In production this would be a database trigger on `auth.users` insert, but doing it in the action keeps everything in one readable place during the prototype phase.

### Register AI System

- Modal form in `components/dashboard/RegisterSystemButton.tsx`.
- Submits to `app/dashboard/systems/actions.ts → registerSystem`.
- That action does three things in sequence:
  1. Inserts the AI system row, scoped to the user's company.
  2. Looks up the standard obligations for that risk level (from `OBLIGATION_TEMPLATES`) and bulk-inserts them.
  3. Writes an activity-log row.
- `revalidatePath` tells Next to re-render the dashboard, so the new system appears without a manual refresh.
- The `OBLIGATION_TEMPLATES` map is the seed of the rules engine. In production it lives in the database and gets updated as the regulator publishes new guidance.

### Vercel cron

- `vercel.json` declares a cron schedule. Vercel handles the timing.
- Every Monday at 08:00 UTC, Vercel makes a GET request to `/api/cron/weekly-digest` with an `Authorization: Bearer <CRON_SECRET>` header.
- The route verifies the secret, fetches every workspace owner via the Supabase admin client (service role, bypasses RLS — only used server-side), and sends a personalised email through Resend.
- Free Vercel plans support up to 2 crons; we're using 1, leaving headroom.

### Evidence upload with signed URLs

- Form in `components/dashboard/UploadEvidenceButton.tsx`, action in `app/dashboard/obligations/actions.ts → uploadEvidence`.
- Flow:
  1. Read the file into a `Uint8Array`.
  2. SHA-256 hash the bytes. First 16 hex chars go into the filename for human-readable integrity proof.
  3. Verify the target obligation belongs to the user's company (defense in depth on top of RLS).
  4. Compute the next version number for that obligation.
  5. Build a path like `companies/{companyId}/obligations/{obligationId}/v3-{hash}.pdf` and upload to the private `evidence` bucket.
  6. Record the row in the `evidence` table with the full hash, version, and uploader.
  7. Log an activity entry.
- To **view** a file, the app calls `getEvidenceSignedUrl(path, 300)`, which returns a Supabase signed URL valid for 5 minutes. The path-prefix check ensures users can only sign their own company's files even if they somehow construct a foreign path.
- Storage RLS policies in `schema.sql` enforce the same rule at the database level. App-layer check is belt; storage policy is suspenders.

---

## Defending each piece on the call

If they ask **"how do you stop one customer reading another's data?"**:

> Row-level security in Postgres. Every table has a `company_id` and an RLS policy that scopes queries to `select company_id from memberships where user_id = auth.uid()`. Even if a request came with a stolen anon key, the database itself would refuse to return another company's rows. Same pattern for storage: bucket policies parse the path prefix and check membership.

If they ask **"what if Resend goes down on Monday morning?"**:

> The cron returns a 500. Vercel surfaces it in the dashboard, and our error monitoring picks it up. The digest is non-critical; we'd retry on the next tick or send a delayed batch. For genuinely critical email (breach notifications) we'd use a queue with retries and a fallback provider, but that's not needed yet.

If they ask **"how would you handle evidence integrity in an audit?"**:

> Every uploaded file is SHA-256 hashed, the hash is stored in the database, and the hash appears in the filename. Versions are append-only — uploading a new file for the same obligation creates `v2`, not an overwrite. So when an auditor asks "is this the file you had on June 12?", we can match the hash from our database against the file in storage and prove it hasn't been altered.

---

## Where to extend next

- Trigger on `auth.users` to auto-create company + membership (replaces the manual insert in `signUp`)
- Per-obligation evidence list with the signed-URL viewer
- Reviewer assignment + sign-off workflow on evidence
- Per-system detail page showing all obligations
- Replace static deadlines with `obligations.due_at`
- Add `next-safe-action` for typed server-action validation
