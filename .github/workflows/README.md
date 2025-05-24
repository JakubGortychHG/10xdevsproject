# CI/CD Workflows

Ten katalog zawiera workflow GitHub Actions dla projektu 10xCards.

## Dostępne workflow

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Wyzwalacze:**
- Push na branch `master`
- Pull Request do branch `master`
- Ręczne uruchomienie (`workflow_dispatch`)

**Zadania:**

#### Test Job
- Sprawdza kod z repozytorium
- Konfiguruje Node.js (wersja z `.nvmrc`)
- Instaluje zależności (`npm ci`)
- Uruchamia linter (`npm run lint`)
- Wykonuje testy jednostkowe (`npm run test`)
- Generuje raport pokrycia testami (`npm run test:coverage`)

#### Build Job
- Uruchamia się tylko po pomyślnym zakończeniu testów
- Buduje aplikację w wersji produkcyjnej (`npm run build`)
- Zapisuje artefakty buildu (katalog `dist/`) na 7 dni

### 2. E2E Tests (`e2e-tests.yml`)

**Wyzwalacze:**
- Ręczne uruchomienie (`workflow_dispatch`)
- Codziennie o 2:00 UTC (harmonogram)

**Zadania:**
- Instaluje przeglądarki Playwright
- Buduje aplikację
- Uruchamia serwer preview
- Wykonuje testy E2E
- W przypadku błędów zapisuje raporty testów

## Konfiguracja

### Wymagane pliki
- `.nvmrc` - określa wersję Node.js
- `package.json` - zawiera skrypty: `lint`, `test`, `test:coverage`, `build`, `preview`, `test:e2e`

### Używane akcje GitHub
- `actions/checkout@v4` - pobieranie kodu
- `actions/setup-node@v4` - konfiguracja Node.js
- `actions/upload-artifact@v4` - zapisywanie artefaktów

## Uruchamianie

### Automatyczne
- Workflow `ci-cd.yml` uruchamia się automatycznie przy każdym push na `master`
- Workflow `e2e-tests.yml` uruchamia się codziennie o 2:00 UTC

### Ręczne
1. Przejdź do zakładki "Actions" w repozytorium GitHub
2. Wybierz odpowiedni workflow
3. Kliknij "Run workflow"
4. Wybierz branch i kliknij "Run workflow"

## Monitoring

### Artefakty
- Build files (7 dni) - pliki produkcyjne z `dist/`
- Playwright reports (7 dni) - raporty testów E2E w przypadku błędów

### Statusy
- ✅ Zielony - wszystkie testy przeszły pomyślnie
- ❌ Czerwony - wystąpiły błędy w testach lub buildzie
- 🟡 Żółty - workflow w trakcie wykonywania 