# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

10xCards to aplikacja webowa umożliwiająca automatyczne generowanie fiszek edukacyjnych przy użyciu sztucznej inteligencji. Aplikacja rozwiązuje problem czasochłonności tworzenia wysokiej jakości fiszek, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition (powtarzanie w odstępach czasu).

Główne funkcje produktu:
- Generowanie fiszek przez AI na podstawie wprowadzonego tekstu
- Manualne tworzenie fiszek
- Przeglądanie, edycja i usuwanie fiszek
- System kont użytkowników
- Integracja z algorytmem powtórek

MVP skupia się na podstawowej funkcjonalności, oferując minimalistyczny interfejs i zaspokajając główne potrzeby użytkowników: szybkie tworzenie wysokiej jakości fiszek i efektywne uczenie się z ich wykorzystaniem.

## 2. Problem użytkownika

Użytkownicy napotykają następujące problemy podczas korzystania z fiszek edukacyjnych:

1. Manualne tworzenie fiszek jest czasochłonne, co zniechęca do korzystania z tej metody nauki.
2. Tworzenie wysokiej jakości fiszek wymaga umiejętności identyfikacji kluczowych informacji i przekształcania ich w formę pytań i odpowiedzi.
3. Brak czasu na regularne tworzenie i aktualizowanie kolekcji fiszek.

10xCards rozwiązuje te problemy poprzez:
- Automatyzację procesu tworzenia fiszek przy użyciu AI
- Zapewnienie łatwego interfejsu do przeglądania i edycji wygenerowanych fiszek
- Integrację z algorytmem powtórek, który optymalizuje proces nauki

## 3. Wymagania funkcjonalne

### 3.1 Generowanie fiszek przez AI
- Aplikacja umożliwia wprowadzenie tekstu edukacyjnego o długości 1000-10000 znaków
- AI automatycznie generuje fiszki z treścią na przód i tył
- Użytkownik ma możliwość akceptacji, odrzucenia lub edycji każdej wygenerowanej fiszki
- System zapisuje tylko zaakceptowane fiszki

### 3.2 Manualne tworzenie fiszek
- Prosty formularz z polami "Przód" i "Tył"
- Możliwość zapisania nowej fiszki w bazie danych użytkownika

### 3.3 Zarządzanie fiszkami
- Przeglądanie zapisanych fiszek
- Edycja istniejących fiszek
- Usuwanie fiszek

### 3.4 System kont użytkowników
- Rejestracja użytkownika z e-mailem i hasłem
- Logowanie do istniejącego konta
- Przechowywanie fiszek przypisanych do konta użytkownika i aktulnego postępu w sesji

### 3.5 System nauki
- Implementacja gotowego algorytmu powtórek (open source)
- Zdefiniowany przebieg sesji nauki:
  - Przygotowanie sesji
  - Pokazanie przodu fiszki
  - Użytkownik odkrywa tył fiszki
  - Użytkownik ocenia stopień przyswojenia
  - System planuje przyszłe powtórki na podstawie oceny
- Przejście do następnej fiszki

## 4. Granice produktu

### 4.1 Co NIE wchodzi w zakres MVP
- Własny, zaawansowany algorytm powtórek (zamiast tego integracja z istniejącym rozwiązaniem)
- Import wielu formatów (PDF, DOCX, itp.)
- Współdzielenie zestawów fiszek między użytkownikami
- Integracje z innymi platformami edukacyjnymi
- Aplikacje mobilne (na początek tylko web)
- Kategoryzacja/tagowanie fiszek
- Grupowanie fiszek w zestawy/kolekcje
- Funkcje eksportu fiszek
- Preferencje użytkownika dotyczące typów generowanych fiszek

### 4.2 Ograniczenia techniczne
- Integracja z zewnętrznym API AI (prawdopodobnie OpenRouterAPI)
- Wykorzystanie gotowej biblioteki open source z algorytmem powtórek
- Minimalistyczny interfejs dla MVP
- Prosta baza danych do przechowywania fiszek i kont użytkowników i statystyk potrzebnych do mierzenia kryteriów sukcesu.

## 5. Historyjki użytkowników

### US-001: Rejestracja użytkownika
Jako nowy użytkownik, chcę utworzyć konto w aplikacji, aby móc przechowywać moje fiszki.

Kryteria akceptacji:
- Użytkownik może wprowadzić adres e-mail i hasło
- System informuje użytkownika o ewentualnych błędach walidacji
- Po pomyślnej rejestracji, system automatycznie loguje użytkownika
- Użytkownik otrzymuje potwierdzenie utworzenia konta

### US-002: Logowanie użytkownika
Jako zarejestrowany użytkownik, chcę zalogować się do mojego konta, aby uzyskać dostęp do moich fiszek.

Kryteria akceptacji:
- Użytkownik może wprowadzić adres e-mail i hasło
- System weryfikuje poprawność danych logowania
- System informuje użytkownika o błędnych danych logowania
- Po poprawnym zalogowaniu, użytkownik jest przekierowany do głównego widoku aplikacji

### US-003: Generowanie fiszek przez AI
Jako użytkownik, chcę wygenerować fiszki przez AI na podstawie wprowadzonego tekstu, aby zaoszczędzić czas na ich manualnym tworzeniu.

Kryteria akceptacji:
- Użytkownik może wprowadzić tekst o długości 1000-10000 znaków
- System wyświetla informację o minimalnej/maksymalnej długości tekstu
- Użytkownik może kliknąć przycisk "Generuj fiszki"
- System wyświetla informację o trwającym procesie generowania
- Po zakończeniu generowania, system prezentuje listę wygenerowanych fiszek

### US-004: Przeglądanie wygenerowanych fiszek
Jako użytkownik, chcę przeglądać fiszki wygenerowane przez AI, aby ocenić ich jakość.

Kryteria akceptacji:
- System prezentuje listę wygenerowanych fiszek z widoczną treścią na przodzie i tyle
- Użytkownik może przeglądać fiszki jedna po drugiej
- Interfejs jasno rozdziela treść przodu i tyłu fiszki
- System wyświetla łączną liczbę wygenerowanych fiszek
- Istnieje możliwość nawigacji między fiszkami

### US-005: Akceptacja/odrzucanie/edycja wygenerowanych fiszek
Jako użytkownik, chcę mieć możliwość akceptacji, odrzucenia lub edycji wygenerowanych fiszek, aby zapisać tylko te, które uważam za wartościowe.

Kryteria akceptacji:
- Dla każdej fiszki dostępne są opcje: akceptuj, odrzuć, edytuj
- Po kliknięciu "Akceptuj", fiszka jest zapisywana w bazie danych użytkownika
- Po kliknięciu "Odrzuć", fiszka jest usuwana z listy
- Po kliknięciu "Edytuj", system umożliwia edycję treści przodu i tyłu fiszki
- Po edycji, użytkownik może zapisać zmiany lub anulować edycję

### US-006: Manualne tworzenie fiszek
Jako użytkownik, chcę manualnie tworzyć fiszki, aby dodać specyficzne informacje, których nie wygenerowało AI.

Kryteria akceptacji:
- Dostępny jest prosty formularz z polami "Przód" i "Tył"
- Użytkownik może wprowadzić treść na przód i tył fiszki
- System waliduje, czy oba pola zostały wypełnione
- Po kliknięciu "Zapisz", fiszka jest dodawana do bazy danych użytkownika
- Użytkownik otrzymuje potwierdzenie zapisania fiszki

### US-007: Przeglądanie zapisanych fiszek
Jako użytkownik, chcę przeglądać moje zapisane fiszki, aby zobaczyć, jakie materiały mam do nauki.

Kryteria akceptacji:
- System wyświetla listę wszystkich zapisanych fiszek użytkownika
- Dla każdej fiszki widoczna jest treść przodu
- Po kliknięciu na fiszkę, użytkownik może zobaczyć treść tyłu
- Interfejs umożliwia wygodne przeglądanie wielu fiszek

### US-008: Edycja istniejących fiszek
Jako użytkownik, chcę edytować moje istniejące fiszki, aby poprawić ich treść lub zaktualizować informacje.

Kryteria akceptacji:
- Użytkownik może wybrać fiszkę do edycji
- System wyświetla formularz z aktualnymi treściami przodu i tyłu
- Użytkownik może zmienić treść obu pól
- Po kliknięciu "Zapisz", zmiany są zapisywane w bazie danych
- Użytkownik otrzymuje potwierdzenie zapisania zmian

### US-009: Usuwanie fiszek
Jako użytkownik, chcę usuwać fiszki, których już nie potrzebuję.

Kryteria akceptacji:
- Użytkownik może wybrać fiszkę do usunięcia
- System wyświetla prośbę o potwierdzenie usunięcia
- Po potwierdzeniu, fiszka jest usuwana z bazy danych
- Użytkownik otrzymuje potwierdzenie usunięcia fiszki
- Istnieje możliwość anulowania operacji usuwania

### US-010: Rozpoczęcie sesji nauki
Jako użytkownik, chcę rozpocząć sesję nauki, aby efektywnie uczyć się z moich fiszek.

Kryteria akceptacji:
- Użytkownik może kliknąć przycisk "Rozpocznij naukę"
- System przygotowuje sesję nauki na podstawie algorytmu powtórek
- System informuje użytkownika o liczbie fiszek w sesji
- Użytkownik może rozpocząć naukę lub anulować sesję
- Sesja nauki rozpoczyna się od pierwszej fiszki

### US-011: Ocenianie stopnia przyswojenia fiszki
Jako użytkownik, chcę oceniać stopień przyswojenia każdej fiszki, aby system mógł planować przyszłe powtórki.

Kryteria akceptacji:
- Po odkryciu tyłu fiszki, system pokazuje opcje oceny (np. "Trudne", "Dobre", "Łatwe")
- Użytkownik może wybrać jedną z opcji oceny
- System zapisuje ocenę i aktualizuje harmonogram powtórek dla tej fiszki
- Po ocenie, system prezentuje następną fiszkę lub kończy sesję
- Użytkownik otrzymuje informację o pozostałej liczbie fiszek w sesji

### US-012: Zakończenie sesji nauki
Jako użytkownik, chcę otrzymać podsumowanie po zakończeniu sesji nauki.

Kryteria akceptacji:
- Po przeglądnięciu wszystkich fiszek w sesji, system wyświetla podsumowanie
- Podsumowanie zawiera informacje o liczbie przeglądniętych fiszek
- Podsumowanie zawiera informacje o ocenach przyznanych fiszkom
- Użytkownik może wrócić do głównego widoku aplikacji
- Użytkownik może rozpocząć nową sesję nauki

### US-013: Wylogowanie użytkownika
Jako zalogowany użytkownik, chcę wylogować się z aplikacji, aby zabezpieczyć moje konto.

Kryteria akceptacji:
- Użytkownik może kliknąć przycisk "Wyloguj"
- System kończy sesję użytkownika
- Użytkownik jest przekierowany do strony logowania
- Po wylogowaniu, dostęp do fiszek użytkownika jest niemożliwy bez ponownego zalogowania
- System wyświetla komunikat potwierdzający wylogowanie

### US-014: Obsługa błędów generowania AI
Jako użytkownik, chcę otrzymać informację w przypadku błędu generowania fiszek przez AI.

Kryteria akceptacji:
- W przypadku błędu generowania, system wyświetla przyjazny komunikat o błędzie
- Komunikat zawiera informację o możliwych przyczynach błędu
- Użytkownik ma możliwość ponowienia próby generowania
- System nie zawiesza się w przypadku błędu
- Dane wprowadzone przez użytkownika są zachowane

## 6. Metryki sukcesu

### 6.1 Metryki produktowe
- 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkownika (bez edycji lub po edycji)
- Użytkownicy tworzą 75% fiszek z wykorzystaniem AI (w przeciwieństwie do manualnego tworzenia)