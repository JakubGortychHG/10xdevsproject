import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

export default function UserInfo() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Ładowanie...</span>
      </div>
    );
  }

  if (!user) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        Status: niezalogowany
      </span>
      <div className="h-4 w-px bg-muted-foreground/25" />
        <a href="/auth/login" className="text-sm text-primary hover:underline">
        Zaloguj się
      </a>
      <span className="text-muted-foreground mx-2">|</span>
      <a 
        href="/auth/register"
        className="text-sm text-primary hover:underline"
      >
        Zarejestruj się
      </a>
    </div>
  );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        Zalogowany jako: {" "}
        <span className="font-medium text-foreground">{user.email}</span>
      </span>
      <div className="h-4 w-px bg-muted-foreground/25" />
      <button
        onClick={signOut}
        className="text-sm text-primary hover:underline"
      >
        Wyloguj się
      </button>
    </div>
  );
} 