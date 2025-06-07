import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from "astro:env/client";

// Konfiguracja ciasteczek zgodnie z wytycznymi
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 dni
};

const parseCookieHeader = (
  cookieHeader: string,
): { name: string; value: string }[] => {
  if (!cookieHeader) return [];

  return cookieHeader
    .split(";")
    .map((cookie) => {
      const [name, ...rest] = cookie.split("=").map((c) => c.trim());
      const value = rest.join("=");
      return { name, value };
    })
    .filter((cookie) => cookie.name && cookie.value);
};

export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_KEY) {
    throw new Error(
      "Missing Supabase environment variables. Check .env file and ensure variables are properly configured",
    );
  }

  const supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_KEY,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options),
          );
        },
      },
      global: {
        headers: {
          "X-Client-Info": "10xCards/1.0",
        },
        fetch: (url, options = {}) => {
          // Add timeout for Cloudflare Workers
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(5000), // 5 second timeout
          }).catch((error) => {
            if (error.name === "TimeoutError") {
              throw new Error("Network timeout - please try again");
            }
            throw error;
          });
        },
      },
      auth: {
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
        debug: false,
      },
    },
  );

  return supabase;
};
