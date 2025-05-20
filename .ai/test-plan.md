# Plan Testów dla Aplikacji 10xCards

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji "10xCards", której celem jest umożliwienie użytkownikom generowania fiszek edukacyjnych na podstawie dostarczonego tekstu, z wykorzystaniem modeli AI poprzez OpenRouter.ai oraz zarządzanie tymi fiszkami. Aplikacja wykorzystuje nowoczesny stos technologiczny oparty na Astro, React, TypeScript, Tailwind CSS, Shadcn/ui oraz Supabase jako backend.

### 1.2. Cele Testowania

Główne cele procesu testowania to:

*   Weryfikacja, czy aplikacja spełnia zdefiniowane wymagania funkcjonalne i niefunkcjonalne.
*   Zapewnienie wysokiej jakości i niezawodności aplikacji przed jej wdrożeniem.
*   Wykrycie i zaraportowanie defektów oraz ryzyk związanych z oprogramowaniem.
*   Potwierdzenie, że wszystkie kluczowe ścieżki użytkownika działają poprawnie.
*   Ocena bezpieczeństwa, wydajności i użyteczności aplikacji.
*   Zapewnienie spójności i poprawności działania integracji z usługami zewnętrznymi (Supabase, OpenRouter.ai).

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami:

*   **Moduł Uwierzytelniania:**
    *   Rejestracja nowego użytkownika.
    *   Logowanie istniejącego użytkownika.
    *   Wylogowywanie.
    *   Proces resetowania hasła.
    *   Ochrona tras wymagających uwierzytelnienia.
    *   Wyświetlanie informacji o zalogowanym użytkowniku.
*   **Moduł Generowania Fiszki:**
    *   Wprowadzanie tekstu źródłowego przez użytkownika.
    *   Wysyłanie żądania generowania fiszek do backendu (i dalej do OpenRouter.ai).
    *   Wyświetlanie propozycji wygenerowanych fiszek.
    *   Możliwość edycji treści (awers/rewers) proponowanych fiszek.
    *   Zapisywanie wybranych/zmodyfikowanych fiszek w bazie danych użytkownika (Supabase).
    *   Obsługa błędów podczas generowania i zapisywania.
*   **Zarządzanie Fiszkami:**
    *   Wyświetlanie listy zapisanych fiszek użytkownika.
    *   Możliwość przeglądania, edycji i usuwania istniejących fiszek (CRUD).
*   **Interfejs Użytkownika (UI) i Użyteczność (UX):**
    *   Poprawność wyświetlania elementów UI na różnych urządzeniach (responsywność - jeśli dotyczy).
    *   Intuicyjność nawigacji i przepływów użytkownika.
    *   Spójność wizualna i zgodność z projektem (Tailwind, Shadcn/ui).
    *   Obsługa wskaźników ładowania i komunikatów o błędach.
*   **API Backendu (Astro Endpoints):**
    *   Poprawność działania endpointów API (`/api/auth/*`, `/api/generations`, `/api/flashcard`, `/api/flashcards`).
    *   Walidacja danych wejściowych.
    *   Poprawność formatu odpowiedzi.
    *   Obsługa błędów i kodów statusu HTTP.
*   **Middleware:**
    *   Poprawność działania logiki middleware (np. zarządzanie sesją, ochrona tras).
    *   Działanie mechanizmu rate limiting.

### 2.2. Funkcjonalności wyłączone z testów (jeśli dotyczy):

*   (Na tym etapie zakłada się pełne pokrycie kluczowych funkcjonalności. Ewentualne wyłączenia mogą wynikać z ograniczeń czasowych/zasobowych i powinny być jasno zdefiniowane.)
*   Testy komponentów biblioteki Shadcn/ui w izolacji (zakładamy ich poprawność).
*   Bezpośrednie testowanie infrastruktury Supabase i OpenRouter.ai (testujemy integrację z nimi).
*   Szczegółowe testy wydajnościowe (chyba że zostaną zidentyfikowane problemy).
*   Testy penetracyjne (wymagają specjalistycznych narzędzi i wiedzy).
*   Kompatybilność ze starszymi lub niszowymi przeglądarkami.
*   Testowanie samego frameworka Astro lub biblioteki React (chyba że w kontekście integracji).

## 3. Typy Testów do Przeprowadzenia

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania małych, izolowanych fragmentów kodu (funkcje, komponenty React, hooki, moduły TypeScript).
    *   **Narzędzia:** Vitest/Jest, React Testing Library.
    *   **Zakres:** Logika biznesowa w serwisach (`src/lib/services`), funkcje pomocnicze (`src/lib/utils`), niestandardowe hooki React (`src/lib/hooks`), schematy walidacji (`src/lib/schemas`), logika komponentów React (`.tsx`). Mockowanie zależności (np. Supabase client, OpenRouter API).
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja współpracy między różnymi modułami i komponentami aplikacji oraz integracji z usługami zewnętrznymi.
    *   **Narzędzia:** Vitest/Jest, React Testing Library, Supertest (dla API Astro), mocki dla usług zewnętrznych.
    *   **Zakres:**
        *   Interakcja komponentów React i Astro.
        *   Logika przepływu danych między UI a backendem (API Astro).
        *   Integracja z Supabase (mockowany klient Supabase, weryfikacja poprawności zapytań i obsługi odpowiedzi).
        *   Integracja z OpenRouter.ai (mockowane API, weryfikacja kontraktu).
        *   Testowanie endpointów API Astro (`src/pages/api/`) pod kątem logiki, walidacji i odpowiedzi.
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Symulacja rzeczywistych scenariuszy użytkownika, weryfikacja przepływów w całej aplikacji z perspektywy użytkownika.
    *   **Narzędzia:** Playwright lub Cypress.
    *   **Zakres:** Kluczowe ścieżki użytkownika: rejestracja, logowanie, generowanie fiszki od początku do końca, zarządzanie fiszkami, reset hasła.
*   **Testy API (bezpośrednie):**
    *   **Cel:** Dokładne testowanie endpointów API Astro niezależnie od UI.
    *   **Narzędzia:** Postman, Insomnia, lub narzędzia programistyczne (np. Supertest w ramach testów integracyjnych).
    *   **Zakres:** Weryfikacja metod HTTP, parametrów żądania, nagłówków, treści żądania/odpowiedzi, kodów statusu, walidacji, autoryzacji, rate limiting.
*   **Testy Użyteczności (Usability Tests):**
    *   **Cel:** Ocena łatwości obsługi, intuicyjności i ogólnego doświadczenia użytkownika.
    *   **Metody:** Testy korytarzowe, obserwacja użytkowników (nawet nieformalna).
    *   **Zakres:** Nawigacja, zrozumiałość interfejsu, przepływy zadań.
*   **Testy Wydajności (Performance Tests - podstawowe):**
    *   **Cel:** Identyfikacja potencjalnych wąskich gardeł i ocena czasu odpowiedzi dla krytycznych operacji.
    *   **Narzędzia:** Narzędzia deweloperskie przeglądarki (Lighthouse, Performance tab), k6 (dla API).
    *   **Zakres:** Czas ładowania stron, czas odpowiedzi API generowania fiszek.
*   **Testy Bezpieczeństwa (Security Tests - podstawowe):**
    *   **Cel:** Identyfikacja podstawowych podatności.
    *   **Metody:** Przegląd kodu pod kątem typowych błędów bezpieczeństwa (OWASP Top 10), użycie automatycznych skanerów zależności (np. `npm audit`), podstawowe testy penetracyjne dla uwierzytelniania i autoryzacji.
    *   **Zakres:** Uwierzytelnianie, autoryzacja (ochrona tras, RLS w Supabase), walidacja danych wejściowych (ochrona przed XSS, Injection).
*   **Testy Kompatybilności (Cross-Browser/Cross-Device - jeśli dotyczy):**
    *   **Cel:** Zapewnienie poprawnego działania aplikacji na różnych przeglądarkach i urządzeniach.
    *   **Zakres:** Najpopularniejsze przeglądarki (Chrome, Firefox, Safari, Edge) i ewentualnie responsywność na urządzeniach mobilnych (jeśli jest to cel projektu).

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### 4.1. Uwierzytelnianie

#### 4.1.1. AUTH_001: Pomyślna rejestracja nowego użytkownika
*   **Opis:** Weryfikacja możliwości zarejestrowania nowego konta użytkownika z poprawnymi danymi.
*   **Kroki Testowe:**
    1.  Przejdź na stronę rejestracji.
    2.  Wypełnij formularz poprawnymi danymi (unikalny email, silne hasło, pasujące potwierdzenie hasła).
    3.  Kliknij przycisk "Zarejestruj".
*   **Oczekiwany Rezultat:**
    1.  Użytkownik zostaje pomyślnie zarejestrowany w systemie.
    2.  Użytkownik zostaje przekierowany na stronę logowania lub bezpośrednio do panelu aplikacji (zalogowany).
    3.  W bazie danych Supabase (tabela `auth.users` lub podobna) pojawia się nowy rekord użytkownika.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E, Integracyjny

#### 4.1.2. AUTH_002: Rejestracja z istniejącym adresem email
*   **Opis:** Weryfikacja obsługi próby rejestracji konta z adresem email, który już istnieje w systemie.
*   **Kroki Testowe:**
    1.  Przejdź na stronę rejestracji.
    2.  Wypełnij formularz, używając adresu email, który jest już zarejestrowany.
    3.  Podaj dowolne hasło i potwierdzenie hasła.
    4.  Kliknij przycisk "Zarejestruj".
*   **Oczekiwany Rezultat:**
    1.  Wyświetlany jest czytelny komunikat błędu informujący, że podany adres email jest już zajęty.
    2.  Użytkownik nie zostaje zarejestrowany.
    3.  W bazie danych nie pojawia się nowy rekord użytkownika dla tego adresu email.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E, Integracyjny

#### 4.1.3. AUTH_003: Rejestracja z niepasującymi hasłami
*   **Opis:** Weryfikacja walidacji formularza rejestracyjnego, gdy podane hasło i jego potwierdzenie nie są identyczne.
*   **Kroki Testowe:**
    1.  Przejdź na stronę rejestracji.
    2.  Wypełnij formularz (unikalny email).
    3.  Wprowadź hasło w polu "hasło".
    4.  Wprowadź inne hasło w polu "potwierdź hasło".
    5.  Kliknij przycisk "Zarejestruj".
*   **Oczekiwany Rezultat:**
    1.  Wyświetlany jest komunikat błędu informujący o niepasujących hasłach.
    2.  Użytkownik nie zostaje zarejestrowany.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E, Jednostkowy (dla logiki walidacji formularza)

#### 4.1.4. AUTH_004: Pomyślne logowanie
*   **Opis:** Weryfikacja możliwości zalogowania się do aplikacji przy użyciu poprawnych danych uwierzytelniających.
*   **Kroki Testowe:**
    1.  Upewnij się, że istnieje zarejestrowany użytkownik z znanymi danymi logowania.
    2.  Przejdź na stronę logowania.
    3.  Wprowadź poprawny email i hasło zarejestrowanego użytkownika.
    4.  Kliknij przycisk "Zaloguj".
*   **Oczekiwany Rezultat:**
    1.  Użytkownik zostaje pomyślnie zalogowany.
    2.  Użytkownik zostaje przekierowany na stronę główną aplikacji (lub panel użytkownika).
    3.  Wyświetlane są elementy UI dostępne tylko dla zalogowanych użytkowników (np. informacja o użytkowniku, opcja wylogowania, dostęp do chronionych sekcji).
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E, Integracyjny

#### 4.1.5. AUTH_005: Logowanie z niepoprawnym hasłem
*   **Opis:** Weryfikacja obsługi próby logowania z poprawnym adresem email, ale niepoprawnym hasłem.
*   **Kroki Testowe:**
    1.  Przejdź na stronę logowania.
    2.  Wprowadź poprawny email zarejestrowanego użytkownika.
    3.  Wprowadź niepoprawne hasło.
    4.  Kliknij przycisk "Zaloguj".
*   **Oczekiwany Rezultat:**
    1.  Wyświetlany jest komunikat błędu informujący o niepoprawnych danych logowania (bez precyzowania, czy błąd dotyczy emaila czy hasła).
    2.  Użytkownik nie zostaje zalogowany.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E, Integracyjny

#### 4.1.6. AUTH_006: Logowanie z nieistniejącym użytkownikiem
*   **Opis:** Weryfikacja obsługi próby logowania z adresem email, który nie jest zarejestrowany w systemie.
*   **Kroki Testowe:**
    1.  Przejdź na stronę logowania.
    2.  Wprowadź adres email, który nie istnieje w bazie danych użytkowników.
    3.  Wprowadź dowolne hasło.
    4.  Kliknij przycisk "Zaloguj".
*   **Oczekiwany Rezultat:**
    1.  Wyświetlany jest komunikat błędu informujący o niepoprawnych danych logowania.
    2.  Użytkownik nie zostaje zalogowany.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E, Integracyjny

#### 4.1.7. AUTH_007: Pomyślne wylogowanie
*   **Opis:** Weryfikacja funkcjonalności wylogowania użytkownika z aplikacji.
*   **Kroki Testowe:**
    1.  Zaloguj się do aplikacji jako dowolny użytkownik.
    2.  Znajdź i kliknij przycisk/link "Wyloguj".
*   **Oczekiwany Rezultat:**
    1.  Użytkownik zostaje wylogowany.
    2.  Użytkownik zostaje przekierowany na stronę logowania lub stronę główną (publiczną).
    3.  Elementy UI dostępne tylko dla zalogowanych użytkowników znikają lub stają się nieaktywne.
    4.  Sesja użytkownika po stronie serwera (jeśli dotyczy) zostaje unieważniona.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E

#### 4.1.8. AUTH_008: Dostęp do chronionej strony przez niezalogowanego użytkownika
*   **Opis:** Weryfikacja, czy niezalogowany użytkownik jest poprawnie przekierowywany przy próbie dostępu do zasobów wymagających uwierzytelnienia.
*   **Kroki Testowe:**
    1.  Upewnij się, że jesteś wylogowany z aplikacji.
    2.  Spróbuj przejść bezpośrednio pod URL strony, która wymaga zalogowania (np. `/dashboard`).
*   **Oczekiwany Rezultat:**
    1.  Użytkownik zostaje automatycznie przekierowany na stronę logowania.
    2.  Chroniona strona nie jest wyświetlana ani jej zawartość nie jest ładowana.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E, Middleware

#### 4.1.9. AUTH_009: Pomyślny proces resetowania hasła
*   **Opis:** Weryfikacja całego przepływu resetowania zapomnianego hasła przez użytkownika.
*   **Kroki Testowe:** (Mogą się różnić w zależności od implementacji)
    1.  Przejdź na stronę "Zapomniałem hasła" / "Resetuj hasło".
    2.  Wprowadź adres email zarejestrowanego użytkownika.
    3.  Kliknij przycisk "Wyślij link do resetowania" / "Resetuj hasło".
    4.  Sprawdź skrzynkę emailową pod kątem wiadomości z linkiem do resetowania hasła.
    5.  Kliknij w link resetujący hasło (lub skopiuj token).
    6.  Na stronie ustawiania nowego hasła, wprowadź nowe hasło i jego potwierdzenie.
    7.  Kliknij przycisk "Ustaw nowe hasło" / "Zapisz".
*   **Oczekiwany Rezultat:**
    1.  Użytkownik otrzymuje email z instrukcjami/linkiem do resetowania hasła.
    2.  Link/token jest ważny i pozwala na przejście do formularza zmiany hasła.
    3.  Po pomyślnym ustawieniu nowego hasła, użytkownik otrzymuje potwierdzenie.
    4.  Użytkownik może zalogować się do aplikacji przy użyciu nowego hasła.
    5.  Stare hasło przestaje być aktywne.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E

### 4.2. Generowanie Fiszki

#### 4.2.1. GEN_001: Pomyślne wygenerowanie i zapisanie fiszki
*   **Opis:** Weryfikacja podstawowego przepływu generowania fiszek na podstawie tekstu źródłowego i ich zapisania.
*   **Kroki Testowe:**
    1.  Zaloguj się do aplikacji.
    2.  Przejdź na stronę/moduł generowania fiszek.
    3.  Wprowadź poprawny tekst źródłowy w odpowiednie pole (np. kilka zdań, akapit).
    4.  Kliknij przycisk "Generuj fiszki" (lub podobny).
    5.  Poczekaj na przetworzenie żądania i wyświetlenie propozycji fiszek.
    6.  (Opcjonalnie) Dokonaj selekcji lub drobnych edycji w proponowanych fiszkach.
    7.  Kliknij przycisk "Zapisz wybrane fiszki" (lub podobny).
*   **Oczekiwany Rezultat:**
    1.  Po kliknięciu "Generuj fiszki", wyświetlany jest wskaźnik ładowania.
    2.  Propozycje fiszek (np. awers/rewers) są poprawnie wyświetlane na podstawie tekstu źródłowego.
    3.  Po kliknięciu "Zapisz", wybrane fiszki są zapisywane w bazie danych powiązanej z kontem użytkownika.
    4.  Użytkownik otrzymuje potwierdzenie zapisania fiszek (np. komunikat, przekierowanie na listę fiszek).
    5.  Zapisane fiszki są widoczne na liście fiszek użytkownika.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E, Integracyjny

#### 4.2.2. GEN_002: Generowanie fiszek z pustego tekstu źródłowego
*   **Opis:** Weryfikacja obsługi próby generowania fiszek bez podania tekstu źródłowego.
*   **Kroki Testowe:**
    1.  Przejdź na stronę/moduł generowania fiszek.
    2.  Pozostaw pole tekstowe na tekst źródłowy puste.
    3.  Kliknij przycisk "Generuj fiszki".
*   **Oczekiwany Rezultat:**
    1.  Przycisk "Generuj fiszki" jest nieklikalny.
    2.  Żądanie generowania fiszek nie jest wysyłane do backendu/API.
    3.  Nie są generowane żadne propozycje fiszek.
*   **Priorytet:** Średni
*   **Typ Testu:** E2E, Jednostkowy (dla walidacji formularza)

#### 4.2.3. GEN_003: Edycja propozycji fiszki przed zapisaniem
*   **Opis:** Weryfikacja możliwości edycji treści (awers/rewers) wygenerowanych propozycji fiszek przed ich finalnym zapisaniem.
*   **Kroki Testowe:**
    1.  Zaloguj się i wygeneruj propozycje fiszek (zgodnie z GEN_001, kroki 1-5).
    2.  Gdy pojawią się propozycje, wybierz jedną z nich i aktywuj tryb edycji (np. klikając ikonę edycji, dwuklik).
    3.  Zmodyfikuj treść awersu i/lub rewersu wybranej propozycji.
    4.  Zatwierdź zmiany w edytowanej propozycji (np. klikając przycisk "Zapisz zmiany", odklikując pole edycji).
    5.  Zapisz wszystkie (lub wybrane) fiszki, w tym tę zmodyfikowaną.
*   **Oczekiwany Rezultat:**
    1.  Użytkownik może modyfikować treść wygenerowanych propozycji.
    2.  Zmiany wprowadzone w trybie edycji są widoczne w interfejsie przed finalnym zapisem.
    3.  Zapisana fiszka w bazie danych odzwierciedla zmodyfikowaną treść, a nie oryginalnie wygenerowaną.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E

#### 4.2.4. GEN_004: Obsługa błędu API podczas generowania (np. błąd OpenRouter)
*   **Opis:** Weryfikacja, jak aplikacja obsługuje błędy zwracane przez zewnętrzne API (np. OpenRouter.ai) podczas procesu generowania fiszek.
*   **Kroki Testowe:** (Wymaga możliwości symulacji/mockowania błędu po stronie API OpenRouter lub backendu aplikacji)
    1.  Zaloguj się do aplikacji.
    2.  Przejdź na stronę generowania fiszek.
    3.  Wprowadź tekst źródłowy.
    4.  (Konfiguracja testu) Symuluj odpowiedź błędu z API OpenRouter (np. kod 500, przekroczony limit, zły format zapytania).
    5.  Kliknij przycisk "Generuj fiszki".
*   **Oczekiwany Rezultat:**
    1.  Użytkownikowi wyświetlany jest przyjazny komunikat o błędzie (np. "Nie udało się wygenerować fiszek. Spróbuj ponownie później.").
    2.  Aplikacja nie ulega awarii (nie crashuje).
    3.  W konsoli deweloperskiej mogą być widoczne szczegółowe logi błędu (dla celów debugowania).
    4.  Użytkownik może ponowić próbę generowania.
*   **Priorytet:** Wysoki
*   **Typ Testu:** Integracyjny (z mockowanym błędem API)

#### 4.2.5. GEN_005: Anulowanie generowania (jeśli jest taka opcja)
*   **Opis:** Weryfikacja funkcjonalności anulowania długotrwałego procesu generowania fiszek (jeśli zaimplementowano taką możliwość).
*   **Kroki Testowe:**
    1.  Zaloguj się, przejdź na stronę generowania.
    2.  Wprowadź tekst źródłowy, który potencjalnie może generować wiele fiszek lub zająć więcej czasu.
    3.  Kliknij "Generuj fiszki".
    4.  Jeśli podczas procesu generowania widoczny jest przycisk "Anuluj" lub podobny, kliknij go.
*   **Oczekiwany Rezultat:**
    1.  Proces generowania fiszek zostaje przerwany.
    2.  Wskaźnik ładowania znika.
    3.  Aplikacja powraca do stanu umożliwiającego użytkownikowi podjęcie innych działań (np. edycję tekstu źródłowego, rozpoczęcie nowego generowania).
    4.  Nie są wysyłane dalsze żądania do backendu związane z anulowanym procesem.
*   **Priorytet:** Średni
*   **Typ Testu:** E2E

### 4.3. Zarządzanie Fiszkami (CRUD)

#### 4.3.1. CRUD_001: Wyświetlanie listy zapisanych fiszek
*   **Opis:** Weryfikacja poprawnego wyświetlania listy fiszek zapisanych przez zalogowanego użytkownika.
*   **Kroki Testowe:**
    1.  Zaloguj się do aplikacji.
    2.  Upewnij się, że użytkownik ma zapisane co najmniej kilka fiszek (jeśli nie, wygeneruj i zapisz je wcześniej).
    3.  Przejdź na stronę/sekcję aplikacji, gdzie wyświetlana jest lista fiszek użytkownika (np. "Moje fiszki", "Biblioteka").
*   **Oczekiwany Rezultat:**
    1.  Wszystkie zapisane fiszki należące do zalogowanego użytkownika są poprawnie wyświetlane.
    2.  Wyświetlane informacje dla każdej fiszki są kompletne (np. awers, rewers, data utworzenia - w zależności od projektu UI).
    3.  Jeśli zaimplementowano paginację lub nieskończone przewijanie, działa ono poprawnie dla większej liczby fiszek.
    4.  Nie są wyświetlane fiszki należące do innych użytkowników.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E

#### 4.3.2. CRUD_002: Edycja istniejącej fiszki
*   **Opis:** Weryfikacja możliwości modyfikacji treści istniejącej, zapisanej fiszki.
*   **Kroki Testowe:**
    1.  Zaloguj się i przejdź do listy zapisanych fiszek.
    2.  Wybierz jedną z istniejących fiszek i aktywuj tryb jej edycji (np. klikając przycisk "Edytuj").
    3.  Zmodyfikuj treść awersu i/lub rewersu fiszki.
    4.  Zapisz wprowadzone zmiany (np. klikając przycisk "Zapisz", "Zatwierdź").
*   **Oczekiwany Rezultat:**
    1.  Zmiany wprowadzone w fiszce są odzwierciedlone na liście fiszek (po odświeżeniu lub dynamicznie).
    2.  Zmodyfikowana treść fiszki jest poprawnie zapisana w bazie danych Supabase.
    3.  Po ponownym załadowaniu strony/listy fiszek, zmodyfikowana treść jest nadal widoczna.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E

#### 4.3.3. CRUD_003: Usuwanie istniejącej fiszki
*   **Opis:** Weryfikacja możliwości usunięcia zapisanej fiszki przez użytkownika.
*   **Kroki Testowe:**
    1.  Zaloguj się i przejdź do listy zapisanych fiszek.
    2.  Wybierz jedną z istniejących fiszek.
    3.  Kliknij przycisk/ikonę "Usuń" powiązaną z tą fiszką.
    4.  Jeśli system wyświetla monit o potwierdzenie usunięcia, potwierdź operację.
*   **Oczekiwany Rezultat:**
    1.  Wybrana fiszka znika z listy wyświetlanych fiszek.
    2.  Fiszka zostaje usunięta z bazy danych Supabase (lub oznaczona jako usunięta, w zależności od strategii).
    3.  Po ponownym załadowaniu strony/listy fiszek, usunięta fiszka nie jest już widoczna.
*   **Priorytet:** Wysoki
*   **Typ Testu:** E2E

#### 4.3.4. CRUD_004: Próba dostępu do fiszek innego użytkownika
*   **Opis:** Weryfikacja zabezpieczeń uniemożliwiających dostęp do fiszek należących do innego użytkownika (test autoryzacji i RLS).
*   **Kroki Testowe:** (Wymaga co najmniej dwóch kont użytkowników: UżytkownikA i UżytkownikB, oraz znajomości ID fiszki należącej do UżytkownikaB)
    1.  Zaloguj się jako UżytkownikA.
    2.  Spróbuj uzyskać dostęp do fiszki należącej do UżytkownikaB poprzez bezpośrednie odwołanie się do jej ID (np. przez zmodyfikowanie URL, wysłanie spreparowanego żądania API do edycji/usunięcia fiszki UżytkownikaB).
*   **Oczekiwany Rezultat:**
    1.  Dostęp do fiszki UżytkownikaB jest zablokowany dla UżytkownikaA.
    2.  Aplikacja wyświetla odpowiedni komunikat o braku uprawnień (np. błąd 403 Forbidden, błąd 404 Not Found) lub przekierowuje UżytkownikaA.
    3.  UżytkownikA nie może wyświetlić, edytować ani usunąć fiszki należącej do UżytkownikaB.
*   **Priorytet:** Wysoki
*   **Typ Testu:** Integracyjny (API), Bezpieczeństwa

## 5. Środowisko Testowe

*   **Środowisko Deweloperskie (Lokalne):**
    *   System operacyjny: Zgodny z systemami deweloperów (np. macOS, Windows, Linux).
    *   Przeglądarki: Najnowsze wersje Chrome, Firefox.
    *   Narzędzia: Node.js, npm/pnpm, edytor kodu, narzędzia deweloperskie przeglądarki.
    *   Baza danych: Lokalna instancja Supabase (jeśli używana) lub deweloperskie konto Supabase.
    *   Klucze API: Deweloperskie klucze API dla OpenRouter.ai (z limitami).
*   **Środowisko Testowe/Staging (CI/CD):**
    *   System operacyjny: Kontener Dockerowy (np. na DigitalOcean lub w GitHub Actions).
    *   Przeglądarki: Headless Chrome/Firefox dla testów E2E.
    *   Baza danych: Dedykowana instancja Supabase dla środowiska testowego (z danymi testowymi).
    *   Klucze API: Dedykowane klucze API dla środowiska testowego.
    *   Konfiguracja: Zbliżona do produkcyjnej.
*   **Środowisko Produkcyjne:**
    *   Infrastruktura: DigitalOcean.
    *   Baza danych: Produkcyjna instancja Supabase.
    *   Klucze API: Produkcyjne klucze API.
    *   (Testy na produkcji powinny być ograniczone do smoke testów po wdrożeniu).

## 6. Narzędzia do Testowania

*   **Framework do testów jednostkowych i integracyjnych (JS/TS):** Vitest (preferowany ze względu na szybkość i kompatybilność z Vite/Astro) lub Jest.
*   **Biblioteka do testowania komponentów React:** React Testing Library.
*   **Framework do testów E2E:** Playwright (preferowany ze względu na nowoczesność, szybkość i możliwości) lub Cypress.
*   **Narzędzie do testowania API (manualne/eksploracyjne):** Postman, Insomnia.
*   **Narzędzie do automatyzacji testów API (w kodzie):** Supertest (dla testów endpointów Astro w ramach testów integracyjnych), lub klient HTTP w Playwright/Cypress.
*   **CI/CD:** GitHub Actions (do automatycznego uruchamiania testów).
*   **Kontrola wersji:** Git, GitHub.
*   **Zarządzanie zadaniami i błędami:** Narzędzie typu Jira, Trello, GitHub Issues.
*   **Narzędzia deweloperskie przeglądarki:** Do debugowania, inspekcji, profilowania wydajności.
*   **Narzędzia do mockowania:** Wbudowane w Vitest/Jest, `msw` (Mock Service Worker) dla zaawansowanego mockowania API.

## 7. Harmonogram Testów

(Harmonogram powinien być dostosowany do cyklu rozwoju projektu. Poniżej ogólny zarys.)

*   **Faza Planowania i Przygotowania:** (Trwająca)
    *   Stworzenie i przegląd planu testów.
    *   Konfiguracja środowisk testowych.
    *   Wybór i konfiguracja narzędzi testowych.
*   **Faza Projektowania Testów:** (Równolegle z rozwojem funkcjonalności)
    *   Tworzenie przypadków testowych dla nowych funkcjonalności.
    *   Przygotowywanie danych testowych.
*   **Faza Wykonywania Testów:**
    *   **Testy Jednostkowe i Komponentów Astro:** Wykonywane przez deweloperów podczas kodowania. Integrowane z CI.
    *   **Testy Integracyjne:** Wykonywane po zintegrowaniu komponentów/modułów. Integrowane z CI.
    *   **Testy API:** Wykonywane równolegle z rozwojem API oraz przed testami E2E.
    *   **Testy E2E:** Wykonywane cyklicznie (np. co sprint, przed wydaniem) na stabilnych buildach.
    *   **Testy Użyteczności, Wydajności, Bezpieczeństwa:** Wykonywane w dedykowanych fazach, np. przed większymi wydaniami.
*   **Faza Raportowania i Re-testów:** (Ciągła)
    *   Raportowanie znalezionych błędów.
    *   Weryfikacja poprawek (re-testy).
    *   Testy regresji po wprowadzeniu zmian.
*   **Testy Akceptacyjne Użytkownika (UAT - jeśli dotyczy):** Przed finalnym wdrożeniem.
*   **Smoke Testy po Wdrożeniu:** Krótkie testy weryfikujące kluczowe funkcjonalności na środowisku produkcyjnym.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów dla danej Funkcjonalności/Sprintu):

*   Dostępna dokumentacja wymagań/specyfikacja funkcjonalności.
*   Funkcjonalność zaimplementowana i przekazana do testów (build na środowisku testowym).
*   Środowisko testowe gotowe i skonfigurowane.
*   Podstawowe testy jednostkowe wykonane przez deweloperów (pass rate > 95%).

### 8.2. Kryteria Zakończenia Testów (Gotowości do Wdrożenia):

*   Wszystkie zdefiniowane przypadki testowe dla krytycznych i wysokich priorytetów zostały wykonane.
*   Pokrycie testami (np. kodu, wymagań) osiągnęło zdefiniowany poziom (np. 80% dla testów jednostkowych, 100% pokrycia kluczowych ścieżek E2E).
*   Brak otwartych błędów krytycznych (blokujących).
*   Liczba otwartych błędów o wysokim priorytecie nie przekracza ustalonego progu (np. 0-1).
*   Błędy o średnim i niskim priorytecie są udokumentowane i zaakceptowane do potencjalnej poprawy w przyszłości.
*   Pomyślnie zakończone testy regresji.
*   Wyniki testów udokumentowane i zaakceptowane przez interesariuszy (np. Product Owera).

## 9. Role i Odpowiedzialności w Procesie Testowania

*   **Deweloperzy:**
    *   Odpowiedzialni za pisanie i wykonywanie testów jednostkowych i komponentów Astro.
    *   Współpraca przy tworzeniu i wykonywaniu testów integracyjnych.
    *   Naprawianie błędów zgłoszonych przez testerów.
    *   Dbanie o jakość kodu i testowalność.
*   **Inżynier QA / Tester:**
    *   Odpowiedzialny za stworzenie i utrzymanie planu testów.
    *   Projektowanie, przygotowywanie i wykonywanie testów integracyjnych, E2E, API, użyteczności, wydajności, bezpieczeństwa.
    *   Automatyzacja testów (szczególnie E2E i API).
    *   Raportowanie błędów i śledzenie ich statusu.
    *   Weryfikacja poprawek i przeprowadzanie testów regresji.
    *   Komunikacja z zespołem deweloperskim i Product Ownerem na temat jakości.
*   **Product Owner / Menedżer Projektu:**
    *   Definiowanie wymagań i kryteriów akceptacji.
    *   Priorytetyzacja funkcjonalności i błędów.
    *   Uczestnictwo w testach akceptacyjnych użytkownika (UAT).
    *   Podejmowanie decyzji o wdrożeniu na podstawie wyników testów.
*   **DevOps (jeśli dotyczy):**
    *   Konfiguracja i utrzymanie środowisk testowych i CI/CD.
    *   Wsparcie w automatyzacji procesów testowych.

## 10. Procedury Raportowania Błędów

*   **Narzędzie do śledzenia błędów:** GitHub Issues (lub inne dedykowane narzędzie).
*   **Proces zgłaszania błędu:**
    1.  **Weryfikacja:** Upewnij się, że błąd jest powtarzalny i nie został już zgłoszony.
    2.  **Tytuł:** Krótki, zwięzły opis problemu.
    3.  **Opis:**
        *   **Kroki do odtworzenia (Steps to Reproduce):** Szczegółowa, numerowana lista kroków.
        *   **Obserwowany rezultat (Actual Result):** Co się stało.
        *   **Oczekiwany rezultat (Expected Result):** Co powinno się stać.
        *   **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny, użyte dane testowe.
        *   **Zrzuty ekranu/Nagrania wideo:** Jeśli pomagają zilustrować problem.
        *   **Logi:** Jeśli relevantne (np. logi konsoli przeglądarki, logi serwera API).
    4.  **Priorytet/Waga (Severity/Priority):**
        *   **Krytyczny (Blocker):** Uniemożliwia dalsze testowanie kluczowych funkcjonalności, powoduje awarię systemu.
        *   **Wysoki (High):** Poważny błąd w kluczowej funkcjonalności, brak obejścia.
        *   **Średni (Medium):** Błąd w mniej istotnej funkcjonalności lub istnieje obejście dla błędu wysokiego.
        *   **Niski (Low):** Drobny błąd kosmetyczny, literówka, niewielki problem z UX.
    5.  **Przypisanie:** Przypisz błąd do odpowiedniej osoby/zespołu (jeśli znane) lub pozostaw do triażu.
*   **Cykl życia błędu:**
    *   `Nowy (New/Open)` -> `W Analizie (In Progress/Analysis)` -> `Do Poprawy (To Be Fixed)` -> `W Weryfikacji (In Verification/Resolved)` -> `Zamknięty (Closed)` LUB `Odrzucony (Rejected)` LUB `Otwarty Ponownie (Reopened)`.
*   **Regularny przegląd błędów (Bug Triage):** Spotkania zespołu w celu omówienia, priorytetyzacji i przypisania nowych błędów. 