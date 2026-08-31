import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://yneayotsllbfslziwijm.supabase.co'
)?.trim() as string;

const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_d8LQQOSBMM-opWxRA5mTWg_XuwCVTKP'
)?.trim() as string;

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

