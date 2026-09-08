import 'dotenv/config';
import { FieldValue } from 'firebase-admin/firestore';
import { firebaseAdmin } from '../server/firebaseAdmin';
import { parentEmail } from '../src/lib/accountValidation';

// One-time privileged migration of existing Firestore profiles. Never run from a browser.
// Existing UIDs, balances and entitlements are preserved. No default passwords are introduced.
const { auth, db } = firebaseAdmin();
const apply = process.argv.includes('--apply');
const profiles = await db.collection('parent_profiles').get();
for (const record of profiles.docs) {
  const data = record.data();
  try {
    const email = parentEmail(record.id);
    if (!data.user_id || data.username !== record.id) throw new Error('Invalid profile identity; manual review required.');
    let user;
    try { user = await auth.getUser(data.user_id); }
    catch (err) { if ((err as { code?: string }).code !== 'auth/user-not-found') throw err; }
    if (user && user.email !== email) throw new Error('UID/email mismatch; manual review required.');
    if (!user) {
      if (typeof data.password !== 'string' || data.password.length < 8) throw new Error('No usable legacy password. Arrange a password reset; profile was not changed.');
      if (apply) user = await auth.createUser({ uid: data.user_id, email, password: data.password });
    }
    if (apply) await record.ref.update({ password: FieldValue.delete(), contact_phone: data.contact_phone ?? null });
    console.log(`${record.id}: ${apply ? 'migrated' : 'ready'}`);
  } catch (err) {
    console.error(`${record.id}: ${(err as { code?: string }).code || (err as Error).message}`);
    process.exitCode = 1;
  }
}
