import { auth } from './firebase';
import { authenticatedRequest } from './authenticatedRequest';

export async function manageParentAccount(body: Record<string, unknown>) {
  await auth.authStateReady();
  return authenticatedRequest(auth.currentUser, '/api/accounts', body);
}
