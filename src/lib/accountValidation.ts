export const normalizeUsername = (username: string) => username.trim().toLowerCase();
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;
export class ValidationError extends Error {}
export function parentEmail(username: string): string {
  const normalized = normalizeUsername(username);
  if (!USERNAME_PATTERN.test(normalized)) throw new ValidationError('Username must be 3–32 letters, numbers, dots, dashes, or underscores.');
  return `${normalized}@parents.littlebee.app`;
}
export function tokenAmount(value: unknown, allowZero = true): number {
  const amount = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  if (!Number.isSafeInteger(amount) || amount < (allowZero ? 0 : 1) || amount > 1_000_000) {
    throw new ValidationError('Enter a whole Bee Token amount between ' + (allowZero ? '0' : '1') + ' and 1,000,000.');
  }
  return amount;
}
