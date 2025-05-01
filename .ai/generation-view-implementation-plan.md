# Plan implementacji widoku Generowania Fiszek

## 1. Przegląd
Widok "Generowanie Fiszek" (`/generate`) umożliwia użytkownikom wklejenie tekstu źródłowego, na podstawie którego sztuczna inteligencja wygeneruje propozycje fiszek. Użytkownik może następnie przejrzeć te propozycje, zaakceptować je, odrzucić lub edytować przed finalnym zapisaniem wybranych fiszek w swojej kolekcji. Widok ten realizuje kluczową funkcjonalność aplikacji, automatyzując proces tworzenia fiszek.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką: `/generate`

## 3. Struktura komponentów
```
GenerationPage (Astro/React Root)
├── SourceTextInputForm (React)
│   ├── Textarea (Shadcn/ui)
│   ├── Label (Shadcn/ui)
│   └── Button (Shadcn/ui - "Generuj fiszki")
├── LoadingIndicator (React - pokazany warunkowo)
│   └── Skeleton (Shadcn/ui) [...]
├── FlashcardProposalList (React - pokazany warunkowo)
│   └── FlashcardProposalCard (React - mapowany)
│       ├── Card (Shadcn/ui)
│       ├── CardContent (Shadcn/ui)
│       ├── Button (Shadcn/ui - "Akceptuj")
│       ├── Button (Shadcn/ui - "Odrzuć")
│       └── Button (Shadcn/ui - "Edytuj")
├── SaveActions (React - pokazany warunkowo)
│   ├── Button (Shadcn/ui - "Zapisz zaakceptowane")
│   └── Button (Shadcn/ui - "Zapisz wszystkie")
└── ErrorDisplay (React - Toasty via Shadcn/ui Toaster)
```

## 4. Szczegóły komponentów

### `GenerationPage` (Astro Component / React Container)
- **Opis:** Główny kontener strony `/generate`. Zarządza stanem widoku, obsługuje wywołania API i renderuje komponenty podrzędne. Może być komponentem Astro renderującym główny komponent React lub komponentem React pełniącym rolę kontenera.
- **Główne elementy:** `SourceTextInputForm`, `LoadingIndicator`, `FlashcardProposalList`, `SaveActions`. Wykorzystuje `Toaster` z Shadcn/ui do wyświetlania powiadomień.
- **Obsługiwane interakcje:** Przekazuje zdarzenia z komponentów podrzędnych do logiki zarządzania stanem (np. custom hooka `useGenerationView`).
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji.
- **Typy:** Używa stanu opisanego w sekcji "Zarządzanie stanem".
- **Propsy:** Brak (jest komponentem najwyższego poziomu dla tego widoku).

### `SourceTextInputForm` (React Component)
- **Opis:** Formularz zawierający pole `textarea` na tekst źródłowy oraz przycisk "Generuj fiszki". Wykorzystuje `react-hook-form` i `zod` do walidacji.
- **Główne elementy:** `Label`, `Textarea`, `Button` (wszystko z Shadcn/ui), komunikaty o błędach walidacji.
- **Obsługiwane interakcje:** `onSubmit` - wywołuje funkcję przekazaną przez propsy (np. `handleGenerateSubmit` z hooka).
- **Obsługiwana walidacja:** Długość tekstu źródłowego musi być między 1000 a 10000 znaków. Wyświetla błędy walidacji. Przycisk "Generuj" jest nieaktywny podczas ładowania.
- **Typy:** `GenerateFlashcardsCommand` (dla danych formularza).
- **Propsy:**
    - `onSubmit: (data: GenerateFlashcardsCommand) => void`
    - `isLoading: boolean`
    - `initialText?: string` (do przywrócenia tekstu po błędzie)

### `LoadingIndicator` (React Component)
- **Opis:** Wyświetla stan ładowania podczas generowania fiszek, używając komponentów `Skeleton` z Shadcn/ui, aby naśladować wygląd listy propozycji.
- **Główne elementy:** Wiele komponentów `Skeleton` ułożonych w strukturę przypominającą `FlashcardProposalCard`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

### `FlashcardProposalList` (React Component)
- **Opis:** Renderuje listę komponentów `FlashcardProposalCard` na podstawie otrzymanych danych lub `LoadingIndicator`, jeśli dane są ładowane.
- **Główne elementy:** Lista (`ul` lub `div`) zawierająca zmapowane komponenty `FlashcardProposalCard`.
- **Obsługiwane interakcje:** Przekazuje akcje (accept, reject, edit) z `FlashcardProposalCard` do handlera w komponencie nadrzędnym/hooku.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardProposalViewModel[]`.
- **Propsy:**
    - `proposals: FlashcardProposalViewModel[]`
    - `onAccept: (id: string) => void`
    *   `onReject: (id: string) => void`
    *   `onEdit: (id: string) => void`

### `FlashcardProposalCard` (React Component)
- **Opis:** Wyświetla pojedynczą propozycję fiszki (front/back) wraz z przyciskami akcji ("Akceptuj", "Odrzuć", "Edytuj"). Odzwierciedla wizualnie status propozycji (oczekująca, zaakceptowana, odrzucona, edytowana).
- **Główne elementy:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `Button` (wszystko z Shadcn/ui). Wyświetla `front` i `back`. Style przycisków/karty zmieniają się w zależności od statusu.
- **Obsługiwane interakcje:** Kliknięcie przycisków "Akceptuj", "Odrzuć", "Edytuj" wywołuje odpowiednie funkcje przekazane przez propsy (`onAccept`, `onReject`, `onEdit`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardProposalViewModel`.
- **Propsy:**
    - `proposal: FlashcardProposalViewModel`
    - `onAccept: (id: string) => void`
    - `onReject: (id: string) => void`
    - `onEdit: (id: string) => void`

### `EditProposalModal` (React Component)
- **Opis:** Modal (dialog) do edycji treści (front/back) wybranej propozycji fiszki. Używa komponentu `Dialog` z Shadcn/ui. Zawiera przyciski "Zapisz zmiany" i "Anuluj".
- **Główne elementy:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Label`, `Textarea` (dla front i back), `DialogFooter`, `Button` (wszystko z Shadcn/ui).
- **Obsługiwane interakcje:**
    - Zapisanie zmian: Waliduje pola, wywołuje `onSave` z ID i nową treścią.
    - Anulowanie: Wywołuje `onCancel`.
- **Obsługiwana walidacja:** Długość frontu (<= 200 znaków), długość tyłu (<= 500 znaków). Wyświetla błędy walidacji wewnątrz modala. Przycisk "Zapisz zmiany" nieaktywny, jeśli walidacja nie przechodzi.
- **Typy:** `FlashcardProposalViewModel` (do inicjalizacji pól).
- **Propsy:**
    - `isOpen: boolean`
    - `proposal: FlashcardProposalViewModel | null` (propozycja do edycji)
    - `onSave: (id: string, updatedFront: string, updatedBack: string) => void`
    - `onCancel: () => void`

### `SaveActions` (React Component)
- **Opis:** Kontener na przyciski akcji zapisu: "Zapisz zaakceptowane" i opcjonalnie "Zapisz wszystkie".
- **Główne elementy:** `Button` z Shadcn/ui.
- **Obsługiwane interakcje:** Kliknięcie przycisków wywołuje `onSaveAccepted` lub `onSaveAll`. Przyciski są nieaktywne, jeśli nic nie jest gotowe do zapisania lub trwa proces zapisu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:**
    - `canSaveAccepted: boolean`
    - `canSaveAll: boolean` // Jeśli zaimplementowano
    - `isSaving: boolean`
    - `onSaveAccepted: () => void`
    - `onSaveAll?: () => void` // Jeśli zaimplementowano

### `ErrorDisplay` (React Component / Service Integration)
- **Opis:** Odpowiada za wyświetlanie błędów API (generowania, zapisu) oraz innych powiadomień, najczęściej za pomocą komponentu `Toast` z Shadcn/ui. Dla błędów generowania powinien oferować opcję ponowienia próby.
- **Główne elementy:** Wykorzystuje `useToast` hook z Shadcn/ui do dynamicznego pokazywania toastów.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Spróbuj ponownie" na toście błędu generowania wywołuje odpowiednią funkcję.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Przyjmuje obiekt błędu lub komunikat.
- **Propsy:** Zintegrowany poprzez wywołania funkcji (np. `toast()`) z hooka/komponentu nadrzędnego.

## 5. Typy
Oprócz typów zdefiniowanych w `src/types.ts` (szczególnie `GenerateFlashcardsCommand`, `GenerationCreateResponseDto`, `FlashcardProposalDto`, `FlashcardCreateDto`, `FlashcardDto`, `Source`), kluczowy będzie nowy typ ViewModel:

- **`FlashcardProposalViewModel`**:
    - `id: string`: Unikalny identyfikator propozycji w stanie UI (generowany po stronie klienta, np. `crypto.randomUUID()`), ponieważ propozycje z API nie mają ID.
    - `front: string`: Aktualny tekst przodu fiszki (oryginalny lub edytowany).
    - `back: string`: Aktualny tekst tyłu fiszki (oryginalny lub edytowany).
    - `originalFront: string`: Początkowy tekst przodu otrzymany z API.
    - `originalBack: string`: Początkowy tekst tyłu otrzymany z API.
    - `status: 'pending' | 'accepted' | 'rejected' | 'edited'`: Śledzi akcję użytkownika dla tej propozycji.
        - `pending`: Stan początkowy.
        - `accepted`: Użytkownik kliknął "Akceptuj". Gotowa do zapisu z `source: 'ai-full'`.
        - `rejected`: Użytkownik kliknął "Odrzuć". Zostanie pominięta przy zapisie.
        - `edited`: Użytkownik edytował i zapisał zmiany w modalu. Gotowa do zapisu z `source: 'ai-edited'`.
    - `generation_id: number`: ID generacji otrzymane z `POST /api/generations`, potrzebne do zapisu fiszki (`FlashcardCreateDto`).

## 6. Zarządzanie stanem
Zalecane jest użycie customowego hooka React (np. `useGenerationView`) do zarządzania logiką i stanem tego widoku.

- **Hook `useGenerationView`**:
    - **Stan wewnętrzny:**
        - `sourceText: string`: Tekst z `textarea`.
        - `isLoading: boolean`: Stan ładowania podczas generowania.
        - `isSaving: boolean`: Stan ładowania podczas zapisywania.
        - `proposals: FlashcardProposalViewModel[]`: Lista propozycji fiszek.
        - `generationId: number | null`: ID bieżącej generacji.
        - `error: Error | null`: Obiekt błędu API.
        - `editingProposalId: string | null`: ID propozycji aktualnie edytowanej w modalu.
    - **Funkcje eksponowane:**
        - `handleGenerateSubmit(data: GenerateFlashcardsCommand)`: Wywołuje `POST /api/generations`, aktualizuje stan.
        - `handleAcceptProposal(id: string)`: Zmienia status propozycji na `'accepted'`.
        - `handleRejectProposal(id: string)`: Zmienia status propozycji na `'rejected'`.
        - `handleEditProposal(id: string)`: Ustawia `editingProposalId`.
        - `handleCancelEdit()`: Czyści `editingProposalId`.
        - `handleSaveChanges(id: string, updatedFront: string, updatedBack: string)`: Aktualizuje propozycję i jej status na `'edited'`.
        - `handleSaveAccepted()`: Filtruje propozycje (`'accepted'`, `'edited'`), wywołuje `POST /api/flashcards` dla każdej, zarządza stanem `isSaving`.
        - `handleSaveAll()`: Oznacza wszystkie `'pending'` jako `'accepted'`, następnie wywołuje `handleSaveAccepted()`.
        - `handleRetryGeneration()`: Czyści błąd i ponawia `handleGenerateSubmit`.
    - **Wartości pochodne eksponowane:**
        - `proposalToEdit: FlashcardProposalViewModel | undefined`
        - `canSaveAccepted: boolean`
        - `canSaveAll: boolean`

## 7. Integracja API

- **Generowanie fiszek:**
    - **Endpoint:** `POST /api/generations`
    - **Żądanie:** `GenerateFlashcardsCommand` (`{ source_text: string }`)
    - **Odpowiedź:** `GenerationCreateResponseDto` (`{ generation_id, flashcards_proposals, stats }`)
    - **Obsługa:** Wywoływane przez `handleGenerateSubmit`. Odpowiedź mapowana na `FlashcardProposalViewModel[]`.
- **Zapisywanie fiszek:**
    - **Endpoint:** `POST /api/flashcards` (wywoływany wielokrotnie)
    - **Żądanie:** `FlashcardCreateDto` (`{ front, back, source, generation_id }`) dla każdej zaakceptowanej/edytowanej propozycji.
        - `source` będzie `'ai-full'` dla zaakceptowanych, `'ai-edited'` dla edytowanych.
        - `generation_id` pochodzi z odpowiedzi `POST /api/generations`.
    - **Odpowiedź:** `FlashcardDto` (dla każdej zapisanej fiszki).
    - **Obsługa:** Wywoływane przez `handleSaveAccepted`/`handleSaveAll`. Należy obsłużyć potencjalne błędy dla każdej z osobna lub zbiorczo. **Uwaga:** Aktualna implementacja backendu obsługuje tylko pojedyncze tworzenie fiszek. Rozwiązaniem jest sekwencyjne/równoległe (z uwagą na rate limit) wywoływanie API lub (preferowane) modyfikacja backendu do obsługi tablicy fiszek.

## 8. Interakcje użytkownika
- **Wprowadzenie tekstu i generowanie:** Użytkownik wprowadza tekst (walidacja długości), klika "Generuj fiszki". Widok pokazuje ładowanie, następnie listę propozycji lub błąd.
- **Przeglądanie i akcje:** Użytkownik przegląda karty. Kliknięcie "Akceptuj"/"Odrzuć"/"Edytuj" zmienia stan wizualny karty i wewnętrzny status propozycji.
- **Edycja:** Kliknięcie "Edytuj" otwiera modal. Użytkownik edytuje tekst (walidacja długości), klika "Zapisz zmiany" (modal się zamyka, karta zaktualizowana) lub "Anuluj" (modal się zamyka, bez zmian).
- **Zapisywanie:** Użytkownik klika "Zapisz zaakceptowane" (lub "Zapisz wszystkie"). Widok pokazuje ładowanie zapisu. Po zakończeniu wyświetla sukces lub błąd (toast).

## 9. Warunki i walidacja
- **Długość tekstu źródłowego:** 1000-10000 znaków (walidacja w `SourceTextInputForm` za pomocą Zod). Blokuje wysłanie formularza.
- **Długość edytowanego frontu:** max 200 znaków (walidacja w `EditProposalModal`). Blokuje zapis w modalu.
- **Długość edytowanego tyłu:** max 500 znaków (walidacja w `EditProposalModal`). Blokuje zapis w modalu.
- **Aktywność przycisku "Generuj":** Nieaktywny, gdy `isLoading` jest `true` lub tekst źródłowy jest nieprawidłowy.
- **Aktywność przycisków "Zapisz":** Nieaktywne, gdy `isSaving` jest `true` lub nie ma żadnych propozycji ze statusem `'accepted'` lub `'edited'` (dla "Zapisz zaakceptowane") lub `'pending'` (dla "Zapisz wszystkie").

## 10. Obsługa błędów
- **Błąd generowania (`POST /api/generations`):**
    - Wyświetlić toast (Shadcn/ui) z przyjaznym komunikatem (np. "Nie udało się wygenerować fiszek.") i opcją "Spróbuj ponownie" (`US-014`).
    - Zachować wprowadzony tekst źródłowy w `textarea`.
    - Zalogować szczegóły błędu do konsoli/systemu monitorowania.
- **Błąd zapisu (`POST /api/flashcards`):**
    - Wyświetlić toast z komunikatem (np. "Wystąpił błąd podczas zapisywania fiszek.").
    - Ponieważ zapis odbywa się per fiszka (obecnie), należy rozważyć strategię: zatrzymać przy pierwszym błędzie czy próbować zapisać wszystkie i zgłosić zbiorczy wynik? (Sugerowane: próbować zapisać wszystkie).
    - Zalogować szczegóły błędu.
    - Opcjonalnie: zachować niezapisane fiszki w widoku do ponownej próby zapisu.
- **Błędy walidacji:** Obsługiwane lokalnie w formularzach (`SourceTextInputForm`, `EditProposalModal`) przez wyświetlanie komunikatów przy odpowiednich polach.

## 11. Kroki implementacji
1.  **Utworzenie strony:** Stwórz plik strony Astro (`src/pages/generate.astro`).
2.  **Struktura komponentu głównego:** W pliku Astro lub w dedykowanym komponencie React (`GenerationPage`), zaimplementuj podstawową strukturę i import potrzebnych komponentów Shadcn/ui (`Card`, `Button`, `Textarea`, `Dialog`, `Skeleton`, `Toast`).
3.  **Implementacja `useGenerationView` hook:** Stwórz hook do zarządzania stanem (`useState`, `useReducer`) i logiką (handlery akcji, wywołania API).
4.  **Implementacja `SourceTextInputForm`:** Stwórz komponent formularza z `textarea` i przyciskiem, używając `react-hook-form` i `zod` do walidacji długości tekstu. Połącz `onSubmit` z `handleGenerateSubmit` z hooka.
5.  **Implementacja `LoadingIndicator`:** Stwórz komponent wyświetlający szkielety interfejsu.
6.  **Implementacja `FlashcardProposalList` i `FlashcardProposalCard`:** Stwórz komponenty do wyświetlania listy propozycji. `FlashcardProposalCard` powinien renderować front/back i przyciski akcji, połączone z odpowiednimi handlerami z hooka (`handleAcceptProposal`, `handleRejectProposal`, `handleEditProposal`). Wizualnie odzwierciedlaj status propozycji (`proposal.status`).
7.  **Implementacja `EditProposalModal`:** Stwórz komponent modala używając `Dialog` z Shadcn/ui. Dodaj pola `textarea` dla frontu i tyłu, walidację długości i przyciski "Zapisz zmiany" / "Anuluj", połączone z handlerami `handleSaveChanges` i `handleCancelEdit`.
8.  **Implementacja `SaveActions`:** Stwórz komponent z przyciskami "Zapisz zaakceptowane" / "Zapisz wszystkie", połączone z handlerami `handleSaveAccepted` / `handleSaveAll`. Deaktywuj przyciski w zależności od stanu (`isSaving`, `canSaveAccepted`, `canSaveAll`).
9.  **Integracja API:** Zaimplementuj logikę wywołań API w `useGenerationView` (`fetch` lub biblioteka typu `axios`/`ky`) dla endpointów `/api/generations` i `/api/flashcards`. Pamiętaj o obsłudze wielokrotnych wywołań dla zapisu fiszek.
10. **Obsługa błędów i powiadomień:** Zintegruj `useToast` z Shadcn/ui w `useGenerationView` lub `GenerationPage` do wyświetlania toastów sukcesu i błędów. Dodaj logikę retry dla błędów generowania.
11. **Styling:** Użyj Tailwind CSS i klas Shadcn/ui do stylizacji komponentów zgodnie z projektem.
12. **Testowanie:** Przetestuj wszystkie przepływy użytkownika, walidacje i obsługę błędów. 