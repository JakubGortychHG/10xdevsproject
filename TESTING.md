# Testy dla 10xCards

## Środowisko testowe

Projekt 10xCards wykorzystuje następujące narzędzia do testowania:

### Testy jednostkowe

- **Vitest** jako framework testowy
- **React Testing Library** do testowania komponentów React
- **Supertest** do testowania endpointów API Astro
- **MSW (Mock Service Worker)** do zaawansowanego mockowania API

### Testy E2E (End-to-End)

- **Playwright** jako główny framework do testów E2E
- Headless Chrome/Firefox dla testów w środowisku CI/CD

## Uruchamianie testów

### Testy jednostkowe

```bash
# Uruchomienie testów jednostkowych
npm test

# Uruchomienie testów w trybie watch
npm run test:watch

# Uruchomienie testów z interfejsem UI
npm run test:ui

# Uruchomienie testów z pomiarem pokrycia kodu
npm run test:coverage
```

### Testy E2E

```bash
# Uruchomienie testów E2E (wszystkie przeglądarki)
npm run test:e2e

# Uruchomienie testów E2E dla konkretnej przeglądarki
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Uruchomienie testów E2E z interfejsem UI
npm run test:e2e:ui
```

## Struktura testów

- `src/components/__tests__/` - testy jednostkowe dla komponentów
- `src/lib/__tests__/` - testy jednostkowe dla usług i funkcji pomocniczych
- `src/pages/api/__tests__/` - testy dla API endpointów
- `e2e/` - testy End-to-End

## Mockowanie zewnętrznych zależności

W projekcie wykorzystujemy MSW (Mock Service Worker) do mockowania żądań API. Pliki konfiguracyjne znajdują się w:

- `src/test/mocks/server.ts` - główny serwer MSW
- `src/test/mocks/handlers.ts` - definicje obsługi żądań API

## Konfiguracja testów

### Vitest (testy jednostkowe)

Konfiguracja znajduje się w pliku `vitest.config.ts`. Główne ustawienia:
- Środowisko testowe: jsdom (symuluje przeglądarkę)
- Plik konfiguracyjny: `src/test/setup.ts`
- Testy są wykrywane automatycznie w plikach `*.test.ts` i `*.spec.ts`

### Playwright (testy E2E)

Konfiguracja znajduje się w pliku `playwright.config.ts`. Główne ustawienia:
- URL aplikacji: http://localhost:3000
- Uruchamianie serwera: `npm run dev`
- Przeglądarki testowe: Chrome, Firefox, Safari oraz mobilne wersje Chrome i Safari

## Najlepsze praktyki

1. Pisz testy przed implementacją funkcjonalności (TDD)
2. Testuj tylko zachowanie, nie implementację
3. Używaj najmniejszej możliwej liczby asercji w jednym teście
4. Używaj sensownych nazw dla testów
5. Preferuj `data-testid` zamiast selektorów CSS
6. Traktuj testy E2E jako testy całego systemu, a nie poszczególnych komponentów

## Dokumentacja

- [Dokumentacja Vitest](https://vitest.dev/)
- [Dokumentacja React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Dokumentacja MSW](https://mswjs.io/docs/)
- [Dokumentacja Playwright](https://playwright.dev/docs/intro) 