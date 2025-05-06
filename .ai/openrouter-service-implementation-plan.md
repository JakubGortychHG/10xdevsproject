# OpenRouter Service Implementation Plan

## 1. Opis usługi

OpenRouter Service to moduł, który zapewnia ujednolicony interfejs do komunikacji z różnymi modelami LLM poprzez API OpenRouter.ai. Usługa ta umożliwia wysyłanie zapytań do modeli AI, obsługę strukturyzowanych odpowiedzi i zarządzanie kontekstem konwersacji.

### Cele główne

1. Ułatwienie dostępu do różnych modeli AI (OpenAI, Anthropic, Google, itp.)
2. Standaryzacja komunikacji z różnymi modelami AI
3. Optymalizacja kosztów poprzez inteligentny wybór modeli
4. Bezpieczne zarządzanie kluczami API
5. Obsługa zaawansowanych funkcji API, takich jak strukturyzowane odpowiedzi

## 2. Opis konstruktora

```typescript
class OpenRouterService {
  constructor({
    apiKey,
    defaultModel = 'anthropic/claude-3-opus-20240229',
    baseUrl = 'https://openrouter.ai/api/v1',
    defaultParams = {
      temperature: 0.7,
      max_tokens: 1000
    }
  }: OpenRouterServiceConfig) {
    // Inicjalizacja usługi
  }
}
```

### Interfejs konfiguracji

```typescript
interface OpenRouterServiceConfig {
  apiKey: string;
  defaultModel?: string;
  baseUrl?: string;
  defaultParams?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}
```

## 3. Publiczne metody i pola

### `async chat(params: ChatParams): Promise<ChatResponse>`

Główna metoda do wysyłania zapytań do modeli AI.

```typescript
interface ChatParams {
  messages: Message[];
  model?: string;
  responseFormat?: ResponseFormat;
  stream?: boolean;
  params?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | ContentPart[];
  name?: string;
}

interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high';
  };
}

interface ResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: object;
  };
}
```

### `setDefaultModel(model: string): void`

Ustawia domyślny model używany przez serwis.

### `setDefaultParams(params: object): void`

Aktualizuje domyślne parametry używane w zapytaniach.

### `getAvailableModels(): Promise<Model[]>`

Pobiera listę dostępnych modeli z API OpenRouter.

```typescript
interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}
```

## 4. Prywatne metody i pola

### `private async makeRequest(endpoint: string, data: object): Promise<any>`

Obsługuje niskopoziomową komunikację HTTP z API OpenRouter.

### `private validateResponseFormat(format: ResponseFormat): void`

Sprawdza poprawność schematu odpowiedzi.

### `private handleStreamingResponse(response: Response): AsyncGenerator<ChatResponse>`

Obsługuje strumieniowe odpowiedzi od API.

### `private parseResponse(response: any): ChatResponse`

Przetwarza odpowiedź z API na format używany przez aplikację.

### `private countTokens(messages: Message[]): number`

Szacuje liczbę tokenów w przesyłanych wiadomościach.

## 5. Obsługa błędów

### Typy błędów

1. `OpenRouterAuthError` - Błędy związane z autoryzacją
2. `OpenRouterRateLimitError` - Błędy związane z ograniczeniami częstotliwości zapytań
3. `OpenRouterNetworkError` - Błędy sieci i połączenia
4. `OpenRouterModelError` - Błędy związane z modelami (niedostępność, etc.)
5. `OpenRouterFormatError` - Błędy związane z formatowaniem odpowiedzi
6. `OpenRouterContentError` - Błędy związane z moderacją treści

### Przykładowa implementacja obsługi błędów

```typescript
class OpenRouterError extends Error {
  constructor(message: string, public code: string, public status?: number) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

class OpenRouterAuthError extends OpenRouterError {
  constructor(message: string, status?: number) {
    super(message, 'auth_error', status);
    this.name = 'OpenRouterAuthError';
  }
}

// Analogiczne implementacje dla pozostałych typów błędów
```

## 6. Kwestie bezpieczeństwa

1. **Zarządzanie kluczami API**
   - Klucze API powinny być przechowywane w zmiennych środowiskowych
   - Nie powinny być umieszczane w kodzie źródłowym ani logach

2. **Bezpieczne przetwarzanie danych**
   - Dane wrażliwe powinny być odpowiednio filtrowane przed zapisem lub logowaniem
   - Implementacja powinna sanityzować dane wejściowe

3. **Limitowanie kosztów**
   - Implementacja powinna zapewniać mechanizmy limitowania wydatków
   - Możliwość ustawienia budżetów miesięcznych/dziennych

4. **Monitorowanie użycia**
   - Logowanie wykorzystania API z informacjami o kosztach
   - Alerty przy przekroczeniu progów wykorzystania

## 7. Plan wdrożenia krok po kroku

### 1. Przygotowanie środowiska

```bash
# Instalacja wymaganych zależności
npm install axios
```

### 2. Implementacja podstawowej struktury usługi

Utwórz plik `src/lib/services/openrouter.ts`:

```typescript
import axios, { AxiosError, AxiosInstance } from 'axios';

// Definicje typów (jak opisane w sekcjach powyżej)

export class OpenRouterService {
  private client: AxiosInstance;
  private defaultModel: string;
  private defaultParams: any;

  constructor(config: OpenRouterServiceConfig) {
    // Implementacja konstruktora
  }

  // Implementacja metod publicznych i prywatnych
}
```

### 3. Implementacja metody chat

Rozszerz klasę o główną metodę `chat`:

```typescript
async chat(params: ChatParams): Promise<ChatResponse> {
  try {
    // Przygotowanie parametrów zapytania
    const requestBody = {
      model: params.model || this.defaultModel,
      messages: params.messages,
      stream: params.stream || false,
      response_format: params.responseFormat,
      ...this.defaultParams,
      ...params.params
    };

    // Obsługa strumieniowa vs standardowa
    if (requestBody.stream) {
      return this.handleStreamingChat(requestBody);
    }

    // Standardowe zapytanie
    const response = await this.makeRequest('/chat/completions', requestBody);
    return this.parseResponse(response);
  } catch (error) {
    // Obsługa błędów
    this.handleError(error);
  }
}
```

### 4. Implementacja obsługi błędów

Dodaj obsługę błędów:

```typescript
private handleError(error: any): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data as any;

    if (status === 401 || status === 403) {
      throw new OpenRouterAuthError(data?.error?.message || 'Authorization error', status);
    }
    
    if (status === 429) {
      throw new OpenRouterRateLimitError(data?.error?.message || 'Rate limit exceeded', status);
    }
    
    // Obsługa pozostałych typów błędów
  }
  
  throw new OpenRouterError('Unknown error occurred', 'unknown_error');
}
```

### 5. Implementacja strukturyzowanych odpowiedzi

Przykład wykorzystania `response_format`:

```typescript
// Losowy przykład użycia
const contactInfoSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string', nullable: true }
  },
  required: ['name', 'email']
};

const response = await openRouterService.chat({
  messages: [
    { role: 'system', content: 'Wyodrębnij informacje kontaktowe z tekstu użytkownika.' },
    { role: 'user', content: 'Mam na imię Jan Kowalski, mój email to jan@example.com, a telefon 123-456-789.' }
  ],
  responseFormat: {
    type: 'json_schema',
    json_schema: {
      name: 'contact_info',
      strict: true,
      schema: contactInfoSchema
    }
  }
});
```

### 6. Utworzenie hooka React dla integracji z UI

Utwórz plik `src/lib/hooks/useOpenRouter.ts`:

```typescript
import { useState, useCallback } from 'react';
import { OpenRouterService } from '../services/openrouter';

export function useOpenRouter(service: OpenRouterService) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (
    messages: Message[],
    options?: Omit<ChatParams, 'messages'>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await service.chat({
        messages,
        ...options
      });
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  return {
    sendMessage,
    isLoading,
    error
  };
}
```

### 7. Konfiguracja dostawcy usługi

Utwórz plik `src/lib/providers/OpenRouterProvider.tsx`:

```typescript
import React, { createContext, useContext } from 'react';
import { OpenRouterService } from '../services/openrouter';

const OpenRouterContext = createContext<OpenRouterService | null>(null);

export function OpenRouterProvider({ 
  children,
  apiKey,
  defaultModel,
  defaultParams
}: { 
  children: React.ReactNode;
  apiKey: string;
  defaultModel?: string;
  defaultParams?: any;
}) {
  const service = React.useMemo(() => new OpenRouterService({
    apiKey,
    defaultModel,
    defaultParams
  }), [apiKey, defaultModel, defaultParams]);

  return (
    <OpenRouterContext.Provider value={service}>
      {children}
    </OpenRouterContext.Provider>
  );
}

export function useOpenRouterService() {
  const context = useContext(OpenRouterContext);
  if (!context) {
    throw new Error('useOpenRouterService must be used within an OpenRouterProvider');
  }
  return context;
}
```

### 8. Integracja z main.tsx lub App.tsx

```typescript
// W głównym pliku aplikacji
import { OpenRouterProvider } from './lib/providers/OpenRouterProvider';

function App() {
  return (
    <OpenRouterProvider
      apiKey={import.meta.env.VITE_OPENROUTER_API_KEY}
      defaultModel="anthropic/claude-3-opus-20240229"
    >
      {/* Komponenty aplikacji */}
    </OpenRouterProvider>
  );
}
```

### 9. Konfiguracja zabezpieczeń i zarządzania kosztami

Dodaj do `.env`:

```
OPENROUTER_COST_LIMIT_DAILY=5.00 # Limit dzienny w USD
```

I zaimplementuj mechanizm limitowania kosztów w serwisie. 