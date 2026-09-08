import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';
import { parentEmail, normalizeUsername } from '../src/lib/accountValidation';

// Input and results belong in ignored private/, never in the repository.
const input = process.argv[2];
if (!input) throw new Error('Usage: npx tsx scripts/create-students.ts private/students.json [--apply]');
const rows = JSON.parse(readFileSync(input, 'utf8')) as Array<{ username: string; password: string; childName: string; parentName: string; contactPhone: string }>;
if (!Array.isArray(rows) || rows.length > 100) throw new Error('Expected an array of up to 100 students.');
const usernames = new Set<string>();
for (const row of rows) {
  parentEmail(row.username);
  if (usernames.has(normalizeUsername(row.username)) || row.password.length < 8) throw new Error('Duplicate username or short password.');
  usernames.add(normalizeUsername(row.username));
}
if (!process.argv.includes('--apply')) {
  console.log(`Validated ${rows.length} student accounts. Add --apply to create them in ${config.projectId}.`);
} else {
  const app = initializeApp(config, 'student-provisioning');
  const auth = getAuth(app);
  const db = getFirestore(app, config.firestoreDatabaseId);
  const results: Array<{ username: string; status: string }> = [];
  try {
    for (const row of rows) {
      const username = normalizeUsername(row.username);
      let created = false;
      let profileSaved = false;
      try {
        let user;
        try {
          user = (await createUserWithEmailAndPassword(auth, parentEmail(username), row.password)).user;
          created = true;
        } catch (error) {
          if ((error as { code?: string }).code !== 'auth/email-already-in-use') throw error;
          // A rerun verifies the requested credentials; it never resets another existing account.
          user = (await signInWithEmailAndPassword(auth, parentEmail(username), row.password)).user;
        }
        const ref = doc(db, 'parent_profiles', username);
        let existing;
        try { existing = await getDoc(ref); }
        catch (error) {
          // Secured rules deny reads of missing profiles. A create still enforces uniqueness atomically.
          if ((error as { code?: string }).code !== 'permission-denied') throw error;
        }
        if (existing?.exists()) {
          if (existing.data().user_id !== user.uid) throw new Error('Existing profile has a different owner; manual migration required.');
          results.push({ username, status: 'verified-existing' });
        } else {
          await setDoc(ref, { user_id: user.uid, username, child_name: row.childName, parent_name: row.parentName,
            contact_phone: row.contactPhone, activation_code: 'BEE-' + crypto.randomUUID(), spelling_bee_enabled: false,
            ai_features_enabled: false, bee_tokens: 0, created_at: new Date().toISOString() });
          results.push({ username, status: 'created' });
        }
        profileSaved = true;
        await signInWithEmailAndPassword(auth, parentEmail(username), row.password);
        console.log(username + ': credentials verified');
      } catch (error) {
        if (created && !profileSaved && auth.currentUser) await deleteUser(auth.currentUser).catch(() => undefined);
        const message = (error as { code?: string }).code || (error instanceof Error ? error.message : 'failed');
        results.push({ username, status: message });
        console.error(username + ': ' + message);
        process.exitCode = 1;
      }
    }
    mkdirSync('private', { recursive: true });
    writeFileSync('private/student-provisioning-results.json', JSON.stringify(results, null, 2));
  } finally { await deleteApp(app); }
}
