import 'dotenv/config';
import { firebaseAdmin } from '../server/firebaseAdmin';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@')) throw new Error('Usage: npx tsx scripts/provision-staff.ts admin@example.com [--apply]');
const { auth, db } = firebaseAdmin();
// Create the Auth identity in Firebase Console first. This command never invents a password or trusts an email prefix.
const user = await auth.getUserByEmail(email);
if (user.disabled) throw new Error('This Auth identity is disabled. Review it in Firebase Console first.');
console.log(`Staff identity verified: ${email} (${user.uid}).`);
if (process.argv.includes('--apply')) {
  await db.collection('staff_users').doc(email).set({ user_id: user.uid, email, display_name: user.displayName || 'Administrator',
    role: 'admin', active: true, created_at: new Date().toISOString() });
  console.log('Administrator access provisioned.');
} else console.log('Dry run. Add --apply to approve administrator access.');
