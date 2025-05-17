import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro:middleware";
import { AuthService } from "../lib/services/authService";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/generate",
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/generations",
];

// Helper function to check if path is public
const isPublicPath = (pathname: string): boolean => {
  // Check exact matches
  if (PUBLIC_PATHS.includes(pathname)) return true;
  
  // Check if it's login with parameters
  if (pathname.startsWith("/auth/login")) return true;
  
  return false;
};

export const onRequest: MiddlewareHandler = defineMiddleware(
  async (context, next) => {
    const { cookies, request, locals } = context;
    
    // Initialize auth service
    const authService = AuthService.getInstance();
    authService.initializeClient({ 
      cookies,
      headers: request.headers
    });

    // Store Supabase client in locals for reuse
    locals.supabase = authService.getClient();

    // Skip auth check for public paths
    if (isPublicPath(context.url.pathname)) {
      return next();
    }

    // IMPORTANT: Always get user session first before any other operations
    const user = await authService.getUser();

    if (user) {
      // Add user to locals for use in routes
      locals.user = {
        email: user.email,
        id: user.id,
      };
      return next();
    }

    // If API request, return 401
    if (context.url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // For page requests, redirect to login with return URL
    const returnUrl = encodeURIComponent(context.url.pathname);
    return context.redirect(`/auth/login?returnTo=${returnUrl}`);
  },
); 