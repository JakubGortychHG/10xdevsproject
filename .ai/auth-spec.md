# Specyfikacja architektury modułu autentykacji

## 1. Architektura interfejsu użytkownika

### 1.1 Nowe strony Astro (src/pages)

- `src/pages/auth/login.astro` - Strona logowania
  - Renderowana server-side dla SEO i wydajności
  - Integracja z komponentem `LoginForm`
  - Obsługa przekierowania zalogowanych użytkowników do `/generate`
  - Obsługa parametrów URL dla komunikatów (np. po wylogowaniu)
  - Zachowanie wprowadzonych danych w przypadku błędu

- `src/pages/auth/register.astro` - Strona rejestracji
  - Renderowana server-side
  - Integracja z komponentem `RegisterForm`
  - Obsługa przekierowania zalogowanych użytkowników
  - Po udanej rejestracji automatyczne logowanie i przekierowanie do `/generate`
  - Zachowanie wprowadzonych danych w przypadku błędu

- `src/pages/auth/reset-password.astro` - Strona resetowania hasła
  - Renderowana server-side
  - Integracja z komponentami `RequestPasswordResetForm` i `ResetPasswordForm`
  - Obsługa tokenów resetowania w URL

### 1.2 Nowe komponenty React (src/components/auth)

- `src/components/auth/LoginForm.tsx`
  - Formularz logowania z walidacją client-side
  - Pola: email, hasło
  - Integracja z Supabase Auth
  - Obsługa błędów i komunikatów
  - Link do resetowania hasła
  - Przekierowanie po udanym logowaniu

- `src/components/auth/RegisterForm.tsx`
  - Formularz rejestracji z walidacją client-side
  - Pola: email, hasło, potwierdzenie hasła
  - Integracja z Supabase Auth
  - Obsługa błędów i komunikatów
  - Przekierowanie po udanej rejestracji

- `src/components/auth/RequestPasswordResetForm.tsx`
  - Formularz żądania resetu hasła
  - Pole: email
  - Integracja z Supabase Auth
  - Obsługa komunikatów sukcesu/błędu

- `src/components/auth/ResetPasswordForm.tsx`
  - Formularz ustawiania nowego hasła
  - Pola: nowe hasło, potwierdzenie
  - Integracja z Supabase Auth
  - Obsługa tokenów z URL
  - Przekierowanie po udanym resecie

- `src/components/auth/LogoutButton.tsx`
  - Przycisk wylogowania
  - Integracja z Supabase Auth
  - Obsługa przekierowania po wylogowaniu

### 1.3 Modyfikacje istniejących komponentów

- `src/layouts/Layout.astro`
  - Dodanie komponentu `LogoutButton` dla zalogowanych użytkowników
  - Warunkowe renderowanie linków nawigacji
  - Obsługa stanu sesji użytkownika

- `src/components/Welcome.astro`
  - Dostosowanie treści dla zalogowanych/niezalogowanych
  - Dodanie linków do logowania/rejestracji dla niezalogowanych

### 1.4 Walidacja i komunikaty

Walidacja client-side:
- Email: format, wymagane pole
- Hasło: min. 8 znaków, wymagane znaki specjalne
- Potwierdzenie hasła: zgodność z hasłem

Komunikaty błędów:
- Nieprawidłowe dane logowania
- Użytkownik już istnieje
- Nieprawidłowy format danych
- Błędy serwera
- Token resetowania wygasł/jest nieprawidłowy

## 2. Logika backendowa

### 2.1 Endpointy API (src/pages/api/auth)

- `POST /api/auth/login`
  - Obsługa logowania
  - Walidacja danych wejściowych
  - Integracja z Supabase Auth
  - Zwracanie tokenu sesji

- `POST /api/auth/register`
  - Obsługa rejestracji
  - Walidacja danych wejściowych
  - Integracja z Supabase Auth
  - Utworzenie profilu użytkownika

- `POST /api/auth/logout`
  - Wylogowanie użytkownika
  - Usunięcie sesji
  - Przekierowanie

- `POST /api/auth/reset-password/request`
  - Żądanie resetowania hasła
  - Wysłanie emaila z linkiem

- `POST /api/auth/reset-password/confirm`
  - Potwierdzenie resetowania hasła
  - Walidacja tokenu
  - Aktualizacja hasła

### 2.2 Middleware (src/middleware)

- Rozszerzenie istniejącego middleware o:
  - Weryfikację sesji użytkownika
  - Przekierowania dla chronionych ścieżek
  - Obsługę tokenów CSRF
  - Logowanie błędów auth

### 2.3 Serwisy (src/lib/services)

- `src/lib/services/auth.service.ts`
  - Inicjalizacja klienta Supabase Auth
  - Metody pomocnicze dla operacji auth
  - Obsługa sesji i tokenów
  - Walidacja danych

- `src/lib/services/user.service.ts`
  - Zarządzanie profilem użytkownika
  - Integracja z bazą danych
  - Obsługa dodatkowych danych użytkownika

### 2.4 Modele i typy (src/lib/schemas)

- `src/lib/schemas/auth.ts`
  - Interfejsy DTO dla operacji auth
  - Schematy walidacji Zod
  - Typy odpowiedzi API

## 3. System autentykacji

### 3.1 Integracja z Supabase Auth

- Konfiguracja Supabase Auth:
  - Email/hasło jako główna metoda
  - Konfiguracja szablonów email
  - Ustawienia bezpieczeństwa (długość sesji, limity prób)

- Przepływ autentykacji:
  1. Inicjalizacja klienta w `src/lib/supabase.ts`
  2. Obsługa sesji w middleware
  3. Integracja z komponentami React
  4. Zarządzanie stanem auth w aplikacji

### 3.2 Bezpieczeństwo

- Zabezpieczenia:
  - CSRF tokens
  - Rate limiting
  - Walidacja tokenów
  - Bezpieczne przechowywanie sesji
  - Szyfrowanie wrażliwych danych

### 3.3 Obsługa sesji

- Zarządzanie sesją:
  - Przechowywanie w Astro
  - Synchronizacja z Supabase
  - Odświeżanie tokenów
  - Czyszczenie po wylogowaniu

### 3.4 Przepływy użytkownika

1. Rejestracja:
   - Wypełnienie formularza
   - Walidacja danych
   - Utworzenie konta
   - Automatyczne logowanie
   - Przekierowanie do `/generate`
   - W przypadku błędu zachowanie wprowadzonych danych

2. Logowanie:
   - Wprowadzenie danych
   - Weryfikacja
   - Utworzenie sesji
   - Przekierowanie do `/generate` lub poprzedniej strony
   - W przypadku błędu zachowanie wprowadzonych danych

3. Wylogowanie:
   - Kliknięcie przycisku
   - Usunięcie sesji
   - Przekierowanie do strony głównej
   - Wyświetlenie komunikatu

4. Reset hasła:
   - Żądanie resetu (email)
   - Otrzymanie linku
   - Wprowadzenie nowego hasła
   - Automatyczne logowanie
   - Przekierowanie do `/generate`

### 3.5 Dostęp dla niezalogowanych użytkowników

- Niezalogowani użytkownicy mają dostęp do:
  - Generowania fiszek przez AI (bez możliwości zapisu)
  - Przeglądania wygenerowanych fiszek
  - Stron logowania i rejestracji
  - Strony resetowania hasła

- Wymagane logowanie dla:
  - Zapisywania wygenerowanych fiszek
  - Edycji i usuwania fiszek
  - Dostępu do zapisanych fiszek
  - Sesji nauki
  - Profilu użytkownika 