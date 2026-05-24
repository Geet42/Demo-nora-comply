import { createServerClient } from "@supabase/ssr";

/**
 * Service-role client. Server-only. Bypasses Row-Level Security.
 * Use ONLY in server actions / route handlers / cron jobs, never expose to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Service role not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }
  return createServerClient(url, serviceKey, {
    cookies: { get: () => undefined, set: () => {}, remove: () => {} },
  });
}
