import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Get cookie header
    const cookieHeader = request.headers.get("Cookie");

    // Parse cookies manually for debugging
    const parsedCookies = cookieHeader
      ? cookieHeader
          .split(";")
          .map((cookie) => {
            const [name, ...rest] = cookie.split("=").map((c) => c.trim());
            return { name, value: rest.join("=") };
          })
          .filter((cookie) => cookie.name && cookie.value)
      : [];

    // Create Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Try to get user
    let userInfo = null;
    let authError = null;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        authError = {
          name: error.name,
          message: error.message,
          status: error.status,
        };
      } else {
        userInfo = data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              created_at: data.user.created_at,
              last_sign_in_at: data.user.last_sign_in_at,
            }
          : null;
      }
    } catch (error) {
      authError = {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
      };
    }

    // Get session info
    let sessionInfo = null;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        sessionInfo = {
          access_token: session.access_token ? "present" : "missing",
          refresh_token: session.refresh_token ? "present" : "missing",
          expires_at: session.expires_at,
          expires_in: session.expires_in,
          token_type: session.token_type,
        };
      }
    } catch {
      // Session error will be included in debug info
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: "cloudflare",
      cookies: {
        header_present: !!cookieHeader,
        header_length: cookieHeader?.length || 0,
        parsed_count: parsedCookies.length,
        supabase_cookies: parsedCookies.filter(
          (c) =>
            c.name.includes("supabase") ||
            c.name.includes("sb-") ||
            c.name.includes("auth"),
        ),
        all_cookie_names: parsedCookies.map((c) => c.name),
      },
      auth: {
        user: userInfo,
        error: authError,
        session: sessionInfo,
      },
      headers: {
        user_agent: request.headers.get("User-Agent") || "unknown",
        origin: request.headers.get("Origin") || "unknown",
        referer: request.headers.get("Referer") || "unknown",
      },
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify(
        {
          error: "Debug endpoint failed",
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
};
