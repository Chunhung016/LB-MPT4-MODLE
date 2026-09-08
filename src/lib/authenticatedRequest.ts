// Firebase owns token issuance, persistence and refresh. Never synthesize or cache a JWT here.
export async function authenticatedRequest(
  user: { getIdToken(forceRefresh?: boolean): Promise<string> } | null,
  url: string,
  body: Record<string, unknown>,
  send: typeof fetch = fetch,
) {
  if (!user) throw new Error('Please sign in again.');
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await user.getIdToken(attempt === 1);
    const response = await send(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    // Only retry an authentication rejection, which happens before any mutation.
    if (response.status === 401 && attempt === 0) continue;
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || `Account service failed (${response.status}).`);
    if (!data?.success) throw new Error('Account service returned an invalid response.');
    return data;
  }
  throw new Error('Your session has ended. Please sign in again.');
}
