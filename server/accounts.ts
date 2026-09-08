import type { Request, Response } from 'express';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';
import { randomUUID } from 'node:crypto';
import { firebaseAdmin } from './firebaseAdmin';
import { normalizeUsername, parentEmail, tokenAmount, ValidationError } from '../src/lib/accountValidation';

class AccountError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
function requiredText(value: unknown, field: string, max = 120): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new AccountError(400, `Enter a valid ${field}.`);
  return value.trim();
}
function passwordValue(value: unknown): string {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) throw new AccountError(400, 'Password must be 8–128 characters.');
  return value;
}

export async function createParent(auth: Auth, db: Firestore, input: Record<string, unknown>) {
  const username = normalizeUsername(requiredText(input.username, 'username', 32));
  const email = parentEmail(username);
  const password = passwordValue(input.password);
  const parentName = requiredText(input.parentName, 'parent name');
  const childName = requiredText(input.childName, 'child name');
  const phone = input.contactPhone == null ? null : requiredText(input.contactPhone || '0', 'phone number', 40);
  const tokens = tokenAmount(input.beeTokens ?? 0);
  for (const key of ['enableSpellingBee', 'enableAiFeatures']) {
    if (input[key] !== undefined && typeof input[key] !== 'boolean') throw new AccountError(400, 'Access flags must be true or false.');
  }
  const ref = db.collection('parent_profiles').doc(username);
  if ((await ref.get()).exists) throw new AccountError(409, 'That username already exists.');
  const user = await auth.createUser({ email, password, displayName: childName });
  try {
    await ref.create({ user_id: user.uid, username, parent_name: parentName, child_name: childName,
      contact_phone: phone, activation_code: 'BEE-' + randomUUID(), spelling_bee_enabled: input.enableSpellingBee ?? false,
      ai_features_enabled: input.enableAiFeatures ?? false, bee_tokens: tokens, created_at: new Date().toISOString() });
  } catch (error) {
    // Never leave an unusable Auth account after a failed profile create.
    await auth.deleteUser(user.uid);
    throw error;
  }
  return { userId: user.uid, username };
}

export function createAccountsHandler(services = firebaseAdmin) {
  return async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed.' }); }
    try {
      const authorization = req.headers.authorization;
      if (!authorization?.startsWith('Bearer ')) throw new AccountError(401, 'Please sign in again.');
      const { auth, db } = services();
      let identity;
      try { identity = await auth.verifyIdToken(authorization.slice(7), true); }
      catch (err) {
        const code = (err as { code?: string }).code;
        if (code?.startsWith('auth/') && !['auth/internal-error', 'auth/insufficient-permission', 'auth/invalid-credential'].includes(code)) {
          throw new AccountError(401, 'Your session has ended. Please sign in again.');
        }
        throw err;
      }
      const email = identity.email?.toLowerCase();
      if (!email) throw new AccountError(403, 'Staff access required.');
      const staff = (await db.collection('staff_users').doc(email).get()).data();
      if (staff?.user_id !== identity.uid || staff?.active !== true || !['admin', 'staff'].includes(staff.role)) {
        throw new AccountError(403, 'Staff access required.');
      }
      const input = req.body;
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AccountError(400, 'Invalid request.');
      if (input.action === 'create') {
        return res.json({ success: true, ...await createParent(auth, db, input) });
      }
      if (input.action === 'clear_leaderboard') {
        if (staff.role !== 'admin') throw new AccountError(403, 'Administrator access required.');
        const records = await db.collection('spelling_bee_leaderboard').get();
        // BulkWriter handles collections larger than a single 500-write batch.
        const writer = db.bulkWriter();
        await Promise.all(records.docs.map(record => writer.delete(record.ref)));
        await writer.close();
        return res.json({ success: true });
      }
      if (!['update_password', 'delete'].includes(input.action)) throw new AccountError(400, 'Unsupported account action.');
      const username = normalizeUsername(requiredText(input.username, 'username', 32));
      parentEmail(username);
      const ref = db.collection('parent_profiles').doc(username);
      const profile = (await ref.get()).data();
      if (!profile) throw new AccountError(404, 'Parent account no longer exists.');
      // Bind every credential mutation to the actual parent Auth identity.
      let user;
      try { user = await auth.getUser(profile.user_id); }
      catch (err) { if ((err as { code?: string }).code !== 'auth/user-not-found' || input.action !== 'delete') throw err; }
      if (user && user.email !== parentEmail(username)) throw new AccountError(409, 'Account identity does not match this profile.');
      if (input.action === 'update_password') {
        await auth.updateUser(profile.user_id, { password: passwordValue(input.password) });
        await auth.revokeRefreshTokens(profile.user_id);
        const refreshed = await auth.getUser(profile.user_id);
        await ref.update({ password: FieldValue.delete(), auth_valid_after: Math.floor(new Date(refreshed.tokensValidAfterTime!).getTime() / 1000), updated_at: new Date().toISOString() });
      } else {
        // Disable first; retries can finish cleanup without allowing login to a half-deleted account.
        if (user) { await auth.updateUser(user.uid, { disabled: true }); await auth.revokeRefreshTokens(user.uid); }
        await ref.update({ disabled: true });
        const linked = await Promise.all([
          db.collection('devices').where('owner_user_id', '==', profile.user_id).get(),
          db.collection('activation_requests').where('user_id', '==', profile.user_id).get(),
        ]);
        const writer = db.bulkWriter();
        await Promise.all(linked.flatMap(snapshot => snapshot.docs.map(record => writer.delete(record.ref))));
        await writer.close();
        if (user) await auth.deleteUser(user.uid);
        await ref.delete();
      }
      return res.json({ success: true });
    } catch (error) {
      if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
      if (error instanceof AccountError) return res.status(error.status).json({ error: error.message });
      const code = (error as { code?: string | number }).code;
      if (code === 'auth/email-already-exists' || code === 6) return res.status(409).json({ error: 'That account already exists.' });
      if (code === 'auth/user-not-found') return res.status(409).json({ error: 'This account needs Firebase Auth setup. Contact the administrator.' });
      if (code === 'auth/invalid-password') return res.status(400).json({ error: 'Please use a stronger password.' });
      console.error('Account service failed:', code || 'configuration-or-service-error');
      return res.status(503).json({ error: 'Account service unavailable. Please check Firebase server configuration and try again.' });
    }
  };
}
export default createAccountsHandler();
