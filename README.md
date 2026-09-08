# Little Bee MPT4 Module

Interactive worksheet portal for Little Bee Centre.

## URLs

- Child worksheet: `/`
- Staff program-access dashboard: `/admin`

## Accounts and data

Firebase Authentication handles parent and staff login. Application data is stored in the named Firestore database configured in `src/lib/firebase.ts`. Staff access requires an active `staff_users` document whose `user_id` matches the Firebase Authentication UID.

The browser obtains short-lived ID tokens directly from Firebase Authentication and refreshes once after an expired-token response. It does not create or persist its own JWT.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` only when local overrides are needed. Set `VITE_USE_FIREBASE_EMULATORS=true` to use the local Firebase emulators.

## Firebase

Deploy the checked-in Firestore rules and indexes with:

```bash
npm exec firebase deploy --only firestore --project gen-lang-client-0767360605
```

Staff provisioning and authentication migration scripts are in `scripts/`. They run in dry-run mode unless their documented apply flag is supplied.
