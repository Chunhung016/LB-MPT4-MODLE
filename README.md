# Little Bee MPT4 Module

Interactive worksheet portal for Little Bee Centre.

## URLs

- Child worksheet: `/`
- Staff program-access dashboard: `/admin`

## Manual Spelling Bee access

1. Open English on the child's device and note the 8-character device access code.
2. A staff member signs in at `/admin`.
3. Search for the device code, add the parent/child names, and switch **Spelling Bee** on.
4. Tap **Check access** on the child's device. The Spelling Bee bubble appears immediately.
5. Switching it off hides the bubble again on the next refresh (the app also checks automatically every 12 seconds).

The dashboard stores grants in Supabase. Row-level security keeps customer details available only to approved staff, and every grant or revoke is recorded in the audit log.

## First staff account

Create the staff user in **Supabase Dashboard → Authentication → Users**, then approve its UUID in the SQL editor:

```sql
insert into public.staff_users (user_id, display_name, role)
values ('AUTH-USER-UUID', 'Staff Name', 'admin');
```

Do not place the service-role or secret key in browser code. The app uses only the public publishable key; database policies enforce access.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when setting up a new machine. The current Vercel-linked environment is already configured locally.

## Database

Supabase migrations are stored in `supabase/migrations`. Apply pending migrations with the pinned Supabase CLI version used by this project:

```bash
npx --yes supabase@2.116.0 db push --db-url "YOUR_PERCENT_ENCODED_DATABASE_URL"
```
