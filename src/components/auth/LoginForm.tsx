import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from "astro:env/client";

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
      // Create Supabase client with explicit cookie options
      const supabase = createBrowserClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_KEY,
        {
          cookieOptions: {
            path: "/",
            secure: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 dni
          },
        },
      );

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: result.data.email,
          password: result.data.password,
        },
      );

      if (authError) {
        console.error("LoginForm: Authentication error:", authError.message);
        setGeneralError(authError.message);
        return;
      }

      if (data.user) {
        // Dodatkowa próba synchronizacji sesji przed przekierowaniem
        if (data.session) {
          try {
            // Można spróbować ręcznie ustawić sesję
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
          } catch (err) {
            console.error("LoginForm: Error setting session manually:", err);
          }
        }
        
        // Dodaj małe opóźnienie przed przekierowaniem, aby dać czas na zapisanie sesji
        setTimeout(() => {
          // Redirect to returnTo or home page
          window.location.href = returnTo;
        }, 500);
      }
    } catch (err) {
      console.error("LoginForm: Unexpected error:", err);
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
