import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/services/authService";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 400 }
      );
    }

    const authService = AuthService.getInstance();
    authService.initializeClient({ cookies, headers: request.headers });

    const { user, session } = await authService.signIn(result.data.email, result.data.password);

    if (!user || !session) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({ 
        user: {
          id: user.id,
          email: user.email,
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: "Authentication failed" }),
      { status: 500 }
    );
  }
}; 