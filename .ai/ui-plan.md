# Architektura UI dla 10xCards

## 1. Przegląd struktury UI

Interfejs 10xCards oparty jest na dwóch głównych layoutach Astro:  
- **PublicLayout** – dla stron logowania i rejestracji (trasy `/login`, `/register`).  
- **AppLayout** – dla wszystkich chronionych tras, z górnym paskiem nawigacyjnym (desktop) lub wysuwanym drawerem (mobile).  

Interfejs użytkownika jest zbudowany wokół widoku generowania fiszek dostępnego po autoryzacji. Struktura obejmuje widoki uwierzytelniania, generowania fiszek, listy fiszek z modalem edycji, panel oraz widok sesji powtórek. Całość korzysta z responsywnego designu opartego na Tailwind, gotowych komponentów z Shadcn/ui oraz React.

## 2. Lista widoków

### 2.1 Login  
- Ścieżka: `/login`  
- Cel: uwierzytelnienie istniejącego użytkownika  
- Wyświetlane informacje: pola e-mail i hasło, link do rejestracji  
- Komponenty:  
  - Formularz React Hook Form + Zod  
  - Inline error messages  
  - Przycisk "Zaloguj" (disabled podczas ładowania)  
  - Toast na błąd serwera / niepoprawne dane  
- UX / dostępność / bezpieczeństwo:  
  - Atrybuty `aria-label`, poprawne focus management  
  - Ochrona przed brute-force (loki błędów)
  - obsługa klawiatury

### 2.2 Rejestracja  
- Ścieżka: `/register`  
- Cel: utworzenie nowego konta  
- Wyświetlane informacje: pola e-mail i hasło (+ potwierdzenie hasła)  
- Komponenty:  
  - Formularz React Hook Form + Zod (walidacja formatu e-mail, długości hasła)  
  - Inline error messages  
  - Przycisk "Zarejestruj się"  
  - Toast potwierdzający sukces lub błąd  
- UX / dostępność / bezpieczeństwo:  
  - Silna walidacja haseł  
  - Po rejestracji automatyczne przekierowanie do `/generate"
  - obsługa klawiwatury

### 2.3 Generowanie fiszek  
- Ścieżka: `/generate`  
- Cel: generowanie propozycji fiszek przez AI oraz ich rewizja przez uytkownika
- Wyświetlane informacje:  
  - Pole `textarea` z walidacją długości (1000–10000 znaków)  
  - Przycisk "Generuj fiszki"  
  - Podczas ładowania: skeletony kart  
  - Lista propozycji AI: front/back, status (oczekuje)
  - przyciski akceptacji, edycji lub odrzucenia kazdej fiszki
  - Pod listą: przyciski "Zapisz zaakceptowane" i "Zapisz wszystkie"  
- Komponenty:  
  - Formularz React Hook Form + Zod  
  - SkeletonFlashcardCard  
  - FlashcardProposalCard z opcjami: Akceptuj / Odrzuć / Edytuj  
  - EditProposalModal (aria-dialog, focus trap)  
  - Toasty błędów generowania (przyciski retry)  
- UX / dostępność / bezpieczeństwo:  
  - Zapobieganie wielokrotnemu wysyłaniu  
  - Zachowanie tekstu wejściowego po błędzie  
  - Czytelne komunikaty o ograniczeniach długości

### 2.4 Moje fiszki  
- Ścieżka: `/flashcards`  
- Cel: przegląd, tworzenie manualne, edycja i usuwanie zapisanych fiszek  
- Wyświetlane informacje:  
  - Lista kart z widocznym frontem  
  - Paginacja "Poprzednia" / "Następna"  
  - Przyciski: "Dodaj fiszkę" i "Usuń fiszkę"
- Komponenty:  
  - FlashcardsList  
  - PaginationControls  
  - CreateFlashcardModal (front/back)  
  - EditFlashcardModal  
  - DeleteFlashcardModal (confirmation)  
  - EmptyState i ErrorState  
- UX / dostępność / bezpieczeństwo:  
  - Modalne focus trap  
  - Inline validation (front ≤ 200 znaków, back ≤ 500 znaków)  
  - Ochrona RLS w API (brak dostępu do cudzych fiszek)

### 2.5 Sesja nauki  
- Ścieżka: `/learning/session`  
- Cel: przeprowadzenie sesji spaced repetition  
- Flow i wyświetlane stany:  
  1. Ekran przygotowania (info o liczbie fiszek, przycisk "Rozpocznij")  
  2. FlashcardView: front + przycisk "Pokaż odpowiedź"  
  3. Po odkryciu: przyciski oceny ("Trudne", "Dobre", "Łatwe")  
  4. Po ostatniej fiszce: podsumowanie sesji (stats + przycisk "Zakończ" / "Nowa sesja")  
- Komponenty:  
  - SessionPreparation  
  - FlashcardView  
  - RatingControls  
  - SessionSummary  
  - Toasty na błędy API (optimistic updates)  
- UX / dostępność / bezpieczeństwo:  
  - Klawiaturowe skróty do ocen  
  - Feedback wizualny przy ocenie  
  - Obsługa przerwanego network (retry)

### 2.6 Profil  
- Ścieżka: `/profile`  
- Cel: zmiana hasła  
- Wyświetlane informacje: pola stare hasło, nowe hasło, potwierdzenie  
- Komponenty:  
  - Formularz React Hook Form + Zod  
  - Inline error messages  
  - Przycisk "Zmień hasło"  
  - Toast sukcesu lub błędu  
  - Przycisk wylogowania
- UX / dostępność / bezpieczeństwo:  
  - Silna walidacja nowego hasła  
  - Ochrona przed CSRF
  - Bezpieczne wylogowanie

### 2.7 Modal edycji fiszek
- Ścieżka: Wyświetlany nad widokiem listy fiszek
- Cel: Umożliwienie edycji fiszek z walidacją danych bez zapisu w czasie rzeczywistym
- Wyświetlane informacje:
  - Formularz edycji fiszki
  - Pola "Przód" oraz "Tył"
  - Komunikaty walidacyjne pod polami
  - Przyciski "Zapisz" i "Anuluj"
- Komponenty:
  - Modal z focus trap i role="dialog"
  - Formularz React Hook Form + Zod
  - FormInput dla pól front/back
  - Przyciski akcji
- UX / dostępność / bezpieczeństwo:
  - Intuicyjny interfejs modalu
  - Pełna dostępność dla czytników ekranu (ARIA labels)
  - Walidacja danych po stronie klienta
  - Obsługa klawiatury (Esc do zamknięcia)
  - Focus trap dla modalu
  - Blokada scrollowania body

### 2.8 Globalne komponenty wspólne  
- **Header/Nav** – nawigacja desktop + hamburger → drawer mobile  
- **ToastContainer** – toasty pod nagłówkiem  
- **ErrorBoundary** – globalne przechwytywanie błędów  
- **SkeletonCard** – placeholdery w Generuj  
- **Modal** – edycja/usuwanie/propozycje AI

## 3. Mapa podróży użytkownika

1. Nowy użytkownik → `/register` → walidacja → auto-login → redirect `/generate`.  
2. Istniejący użytkownik → `/login` → walidacja → redirect `/generate`.  
3. Na `/generate`:  
   a. Wprowadzenie tekstu → walidacja długości → "Generuj fiszki".  
   b. Skeletony → API → lista propozycji.  
   c. Akceptuj/Odrzuć/Edycja modalu → budowa listy do zapisu.  
   d. "Zapisz zaakceptowane" i "Zapisz wszystkie" → POST `/api/generations/:id/process` → dodanie do `/flashcards`.  
4. Przejście do `/flashcards` → przegląd → "Dodaj fiszkę" (modal) lub Edytuj/Delete.  
5. Użytkownik klika "Sesja nauki" → `/learning/session` → przygotowanie → kolejno front, reveal, ocena → podsumowanie.  
6. W razie potrzeby `/profile` → zmiana hasła.  
7. "Wyloguj" w nav → czyszczenie JWT → redirect `/login`.
8. W przypadku błędów (np. walidacji, problemów z API) użytkownik otrzymuje komunikaty inline.

## 4. Układ i struktura nawigacji

- **Desktop**: stały pasek w górze (`AppLayout`) z linkami:  
  `[Generuj fiszki] [Moje fiszki] [Sesja nauki] [Profil] [Wyloguj]`  
- **Mobile**: ikona hamburger → wysuwany drawer z tymi samymi pozycjami.  
- Nieautoryzowany ruch do tras chronionych → Astro Middleware `/src/middleware/index.ts` → redirect `/login`.

## 5. Kluczowe komponenty

- Formularze uwierzytelnienia: Komponenty logowania i rejestracji z obsługą walidacji.
- Komponent generowania fiszek: Z polem tekstowym i przyciskiem uruchamiającym proces generacji, z wskaźnikiem ładowania.
- Lista fiszek: Interaktywny komponent wyświetlający listę fiszek z opcjami edycji i usuwania.
- Modal edycji: Komponent umożliwiający edycję fiszek z walidacją danych przed zatwierdzeniem.
- Toast notifications: Komponent do wyświetlania komunikatów o sukcesach oraz błędach.
- Menu Nawigacji: Elementy nawigacyjne ułatwiające przemieszczanie się między widokami.
- Komponent sesji powtórek: Interaktywny układ wyświetlania fiszek podczas sesji nauki z mechanizmem oceny.