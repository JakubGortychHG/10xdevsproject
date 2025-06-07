import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { LoggerService } from "../../lib/services/loggerService";

const loginSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

interface LoginFormProps {
  returnTo?: string;
}

export default function LoginForm({ returnTo = "/generate" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Validate form
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const formattedErrors = result.error.format();
      setErrors({
        email: formattedErrors.email?._errors[0],
        password: formattedErrors.password?._errors[0],
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Supabase client with explicit cookie options matching server config
      const supabase = createBrowserClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_KEY,
        {
          cookieOptions: {
            path: "/",
            secure: true,
            sameSite: "lax", // Changed from "strict" to match server config
            maxAge: 60 * 60 * 24 * 7, // 7 dni
          },
        },
      );

      console.log("LoginForm: Attempting login with email:", result.data.email);

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: result.data.email,
          password: result.data.password,
        },
      );

      console.log("LoginForm: Login response:", {
        hasUser: !!data.user,
        hasSession: !!data.session,
        error: authError?.message,
      });

      if (authError) {
        LoggerService.getInstance().error("LoginForm: Authentication error", {
          error: authError.message,
        });
        setGeneralError(authError.message);
        return;
      }

      if (data.user && data.session) {
        console.log("LoginForm: Login successful, setting up session");

        // Force a session refresh to ensure cookies are properly set
        try {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          console.log("LoginForm: Session set successfully");
        } catch (err) {
          console.error("LoginForm: Error setting session:", err);
          LoggerService.getInstance().error(
            "LoginForm: Error setting session manually",
            {
              error: err instanceof Error ? err.message : String(err),
            },
          );
        }

        // Wait longer for cookies to be set in Cloudflare environment
        console.log("LoginForm: Redirecting to:", returnTo);
        setTimeout(() => {
          window.location.href = returnTo;
        }, 1000); // Increased delay for Cloudflare
      } else {
        setGeneralError("Login failed - no user or session data received");
      }
    } catch (err) {
      LoggerService.getInstance().error("LoginForm: Unexpected error", {
        error: err instanceof Error ? err.message : String(err),
      });
      setGeneralError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          disabled={isLoading}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Hasło</Label>
          <a
            href="/auth/reset-password"
            className="text-sm text-primary hover:underline"
          >
            Zapomniałeś hasła?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logowanie...
          </>
        ) : (
          "Zaloguj się"
        )}
      </Button>
    </form>
  );
}
