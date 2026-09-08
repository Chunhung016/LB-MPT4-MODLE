export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-credential': case 'auth/user-not-found': case 'auth/wrong-password':
      return 'Incorrect login details. Please check your email or username and password.';
    case 'auth/email-already-in-use': return 'That account already exists. Please sign in or contact reception.';
    case 'auth/operation-not-allowed': case 'auth/configuration-not-found':
      return 'Email/password sign-in is not enabled. Please contact the administrator.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait before trying again.';
    case 'auth/network-request-failed': case 'unavailable': return 'Unable to connect. Check your connection and try again.';
    case 'auth/user-token-expired': case 'auth/invalid-user-token': case 'auth/user-disabled':
      return 'Your session has ended. Please sign in again.';
    case 'permission-denied': return 'Access denied. Please sign in again or contact the administrator.';
    case 'auth/weak-password': return 'Please use a stronger password with at least 8 characters.';
    default: return error instanceof Error ? error.message : 'Unable to complete the request. Please try again.';
  }
}
