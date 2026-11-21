# AcadeX – Deployment Guide

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | >= 20.x | Required for local development |
| npm | >= 10.x | Included with Node.js 20 |
| Supabase account | — | Free tier supports development |
| Resend account | — | Free tier (100 emails/day) is sufficient for testing |
| Vercel account | — | Free tier supports deployment |

---

## 1. Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/acadex.git
cd acadex
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=<your-resend-api-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these values:**
- Supabase keys: Supabase Dashboard → Project Settings → API
- Resend key: Resend Dashboard → API Keys

### Step 4: Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL editor
3. Run migrations in order:

```bash
# Using Supabase CLI (recommended)
npx supabase db push

# Or manually run each migration file in the SQL editor
# supabase/migrations/001_profiles.sql through 028_team_chat.sql
```

### Step 5: Seed the Database (Optional)

```bash
npx supabase db seed
```

This creates sample data: departments, academic years, test users.

### Step 6: Create Initial Admin User

1. In Supabase Dashboard → Authentication → Users → Invite user
2. Set the user's email and password
3. In the SQL editor, manually set their role:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@yourcollege.edu';
```

### Step 7: Start the Development Server

```bash
npm run dev
```

Access at: `http://localhost:3000`

---

## 2. Supabase Configuration

### Storage Bucket

Create the storage bucket for file uploads:

```sql
-- In Supabase SQL editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('acadex-artefacts', 'acadex-artefacts', false);
```

Then set storage policies to allow authenticated uploads:

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'acadex-artefacts');

CREATE POLICY "Service role can read all"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'acadex-artefacts');
```

### Auth Settings

In Supabase Dashboard → Authentication → Settings:

1. **Site URL**: Set to your production URL (e.g., `https://acadex.vercel.app`)
2. **Redirect URLs**: Add `https://acadex.vercel.app/auth/callback`
3. **Email confirmations**: Enable for security
4. **MFA**: Enable TOTP under Authentication → MFA

---

## 3. Vercel Deployment

### Step 1: Connect Repository

1. Log in to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — accept defaults

### Step 2: Configure Environment Variables

In Vercel Project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon key>` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service role key>` | Production, Preview |
| `RESEND_API_KEY` | `<resend key>` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://acadex.vercel.app` | Production |

> ⚠️ Never set `SUPABASE_SERVICE_ROLE_KEY` in Development environment if using Vercel preview links shared publicly.

### Step 3: Deploy

```bash
# Push to main branch to trigger automatic deployment
git push origin main
```

Vercel runs `npm run build` and deploys to production automatically.

### Step 4: Verify Build

After deployment, visit the Vercel dashboard and confirm:
- Build succeeded (green checkmark)
- No TypeScript errors in build logs
- Preview URL loads the application

---

## 4. Resend Email Setup

### Step 1: Verify Your Domain

In the Resend dashboard:
1. Go to Domains → Add Domain
2. Enter your domain (e.g., `acadex.app`)
3. Add the provided DNS records to your domain registrar:
   - MX record
   - TXT record (SPF)
   - CNAME record (DKIM)
4. Click Verify

Emails sent from `noreply@acadex.app` will only succeed after domain verification.

### Local Testing

For local development, use Resend's onboarding address which requires no domain:

```env
# In .env.local for testing
# In src/server/notifications/index.ts, temporarily use:
from: "AcadeX <onboarding@resend.dev>"
```

> Note: Emails from `onboarding@resend.dev` can only be sent to the email address registered with your Resend account.

---

## 5. Cron Job Setup

The deadline reminder cron job (`/api/cron/deadline-reminders`) must be triggered on a schedule.

### Using Vercel Cron (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/deadline-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This triggers daily at 8:00 AM UTC.

### Securing the Cron Endpoint

Add a secret to prevent unauthorized triggers:

```env
CRON_SECRET=your-random-secret-here
```

In `/api/cron/deadline-reminders/route.ts`:
```typescript
const auth = request.headers.get('authorization');
if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

In `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/deadline-reminders",
    "schedule": "0 8 * * *"
  }]
}
```
Vercel automatically sets the `Authorization: Bearer <CRON_SECRET>` header.

---

## 6. Database Backup

### Automated Backup (GitHub Actions)

The `.github/workflows/db-backup.yml` workflow runs on a schedule to backup the Supabase database.

Configure repository secrets in GitHub → Settings → Secrets:
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`
- `BACKUP_STORAGE_URL` (e.g., S3 bucket URL)

### Manual Backup

```bash
# Using Supabase CLI
npx supabase db dump --file backup-$(date +%Y%m%d).sql
```

---

## 7. Running Migrations in Production

Always run the pre-migration check before applying new migrations:

```bash
bash scripts/pre-migration-check.sh
```

Then apply via Supabase CLI:

```bash
npx supabase db push --linked
```

Or apply manually via the Supabase SQL editor by running only the new migration files.

---

## 8. Build & Type Checking

Before deploying:

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Production build (also runs type check)
npm run build
```

All three must pass with zero errors.

---

## 9. Health Checks

After deploying, verify:

| Check | Method |
|-------|--------|
| Login page loads | Visit `/login` |
| API health | Visit `/api/auth/session` → should return 401 |
| Database connected | Try logging in with a valid user |
| Storage working | Upload a test file |
| Email working | Trigger a notification and check delivery |

---

## 10. Rollback Procedure

If a deployment causes issues:

1. In Vercel dashboard → Deployments → find the last good deployment
2. Click the three-dot menu → **Promote to Production**
3. This instantly reverts the production deployment

For database migrations:
- Supabase does not auto-rollback migrations
- Each migration file should include a corresponding rollback SQL
- Apply rollback SQL manually in the SQL editor if needed
- Full recovery instructions: `docs/recovery-runbook.md`

---

## 11. Environment-Specific Notes

### Development

- Use `npm run dev` (Turbopack enabled)
- Hot reload is active
- Supabase local or remote instance both work
- Email retries may fail (expected without verified domain)

### Preview (Vercel PR Deployments)

- Auto-generated URL per pull request
- Uses same Supabase project (consider a staging project for teams)
- Email sending may be limited

### Production

- Runs `npm run build` → `npm start`
- Vercel serverless functions handle API routes
- Logs available in Vercel Dashboard → Functions

---

*Last Updated: November 2026 | Author: Naren SJ*
