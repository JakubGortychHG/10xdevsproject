import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro:middleware";
import { AuthService } from "../lib/services/authService";

import { supabaseClient } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

export const onRequest: MiddlewareHandler = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});

export const onRequestAuth = defineMiddleware(
  async ({ locals, cookies, url, request, redirect }, next) => {
    // Initialize auth service
    const authService = AuthService.getInstance();
    authService.initializeClient({ cookies, headers: request.headers });

    // Skip auth check for public paths
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    // Check if user is authenticated
    const user = await authService.getUser();

    if (user) {
      // Add user to locals for use in routes
      locals.user = {
        id: user.id,
        email: user.email,
      };
      return next();
    }

    // If API request, return 401
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // For page requests, redirect to login
    return redirect("/auth/login");
  }
); 