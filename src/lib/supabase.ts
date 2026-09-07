import { createClient } from '@supabase/supabase-js';

function sanitizeConfig(value?: string, defaultValue = ''): string {
  const trimmed = (value || '').trim();
  if (
    !trimmed ||
    trimmed.includes('YOUR_PROJECT') ||
    trimmed.includes('YOUR_PUBLISHABLE_KEY') ||
    trimmed.includes('not-configured')
  ) {
    return defaultValue;
  }
  return trimmed;
}

const supabaseUrl = sanitizeConfig(
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  'https://yneayotsllbfslziwijm.supabase.co'
);

const supabaseKey = sanitizeConfig(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'sb_publishable_d8LQQOSBMM-opWxRA5mTWg_XuwCVTKP'
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== 'https://not-configured.invalid' &&
  supabaseKey !== 'not-configured'
);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function getFunctionErrorMessage(error: any, data?: any): Promise<string> {
  if (data?.error && typeof data.error === 'string') {
    return data.error;
  }
  if (error) {
    if (error.context) {
      try {
        const cloned = typeof error.context.clone === 'function' ? error.context.clone() : error.context;
        if (typeof cloned.json === 'function') {
          const body = await cloned.json();
          if (body?.error && typeof body.error === 'string') return body.error;
          if (body?.message && typeof body.message === 'string') return body.message;
        }
      } catch {
        // try text
        try {
          const text = await error.context.text();
          if (text) return text;
        } catch {
          // ignore
        }
      }
    }

    if (error.message) {
      if (error.message.includes('non-2xx status code')) {
        return 'The account service encountered an issue processing this request. Please check staff permissions.';
      }
      return error.message;
    }
  }

  return 'Unable to complete the account action. Please try again.';
}

export function isClockSkewError(err: any): boolean {
  if (!err) return false;
  const msg = (
    typeof err === 'string'
      ? err
      : err?.message || err?.error_description || err?.msg || ''
  ).toLowerCase();
  const code = (err?.code || '').toString();
  return (
    code === 'PGRST303' ||
    msg.includes('jwt issued at future') ||
    msg.includes('issued at future') ||
    msg.includes('issued in the future') ||
    msg.includes('token is not yet valid')
  );
}

export async function withClockSkewRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 4,
  delayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      const result: any = await operation();
      if (result && result.error && isClockSkewError(result.error) && attempt < maxRetries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      return result;
    } catch (err: any) {
      if (isClockSkewError(err) && attempt < maxRetries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

