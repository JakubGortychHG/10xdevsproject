import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

const parseCookieHeader = (cookieHeader: string): { name: string; value: string }[] => {
  if (!cookieHeader) return [];
  
  return cookieHeader.split(";")
    .map(cookie => {
      const [name, ...rest] = cookie.split("=").map(c => c.trim());
      const value = rest.join("=");
      return { name, value };
    })
    .filter(cookie => cookie.name && cookie.value);
};

export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Check .env file and ensure variables are prefixed with PUBLIC_"
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookieOptions,
      cookies: {
        getAll() {
          const cookieHeader = context.headers.get("Cookie");
          return parseCookieHeader(cookieHeader ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  return supabase;
}; 