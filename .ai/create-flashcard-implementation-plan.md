# API Endpoint Implementation Plan: Create Flashcard

## 1. Overview of the Endpoint
The endpoint allows an authenticated user to create individual flashcards in the `flashcards` table in Supabase. It supports both manually added flashcards and those saved based on AI data.

## 2. Request Details
- HTTP Method: POST  
- Path: `/api/flashcards`  
- Authorization Header: `Authorization: Bearer <JWT>`  

### Parameters in Body (JSON)
- Required:  
  - `front` (string): front content, max 200 characters  
  - `back` (string): back content, max 500 characters  
  - `source` (string): flashcard source, one of:  
    - `manual`  
    - `ai-full`  
    - `ai-edited`  
- Optional:  
  - `generation_id` (integer | null): related AI generation session ID (required if `source` = `ai-full` or `ai-edited`, must be `null` for `manual`)

```json
{
  "front": "string",
  "back": "string",
  "source": "manual" | "ai-full" | "ai-edited",
  "generation_id": 123 | null
}
```

## 3. Types Used
- `FlashcardCreateDto`  (src/types.ts)  
- `FlashcardsCreateCommand`  (src/types.ts) – optional for batch-insert  
- `FlashcardDto`  (src/types.ts)

## 4. Response Details
- Status Codes:  
  - **201 Created** – flashcard created successfully  
  - **400 Bad Request** – input validation error  
  - **401 Unauthorized** – missing or invalid token  
  - **500 Internal Server Error** – unexpected server failure or Supabase error

- Body (JSON for 201):
```json
{
  "id": 1,
  "front": "string",
  "back": "string",
  "source": "manual" | "ai-full" | "ai-edited",
  "generation_id": 123 | null,
  "created_at": "2024-XX-XXTXX:XX:XX.ZZZZ",
  "updated_at": "2024-XX-XXTXX:XX:XX.ZZZZ"
}
```

## 5. Data Flow
1. Client sends a POST request with a JWT token.  
2. Middleware (`src/middleware/index.ts`) provides a Supabase instance and authentication context.  
3. In the API handler (`src/pages/api/flashcards.ts`):
   - Parse incoming JSON.  
   - Validate using Zod.  
   - Get `user.id` from `context.locals.supabase.auth.getUser()`.  
   - Call the service `createFlashcard(payload, userId)`.  
4. In the service (`src/lib/services/flashcardService.ts`):
   - Call `supabase.from('flashcards').insert([{ ...payload, user_id: userId }])`.  
   - Handle and throw an error if unsuccessful.  
5. Handler returns the response with a 201 code or appropriate error.

## 6. Security Considerations
- **Authorization:** check the JWT token provided by Supabase Auth.  
- **RLS:** Supabase Row-Level Security enforces `user_id = auth.uid()`.  
- **Validation:** using Zod, early return on invalid data.  
- **SQL Injection:** eliminated by using the Supabase API (parameterized queries).

## 7. Error Handling
| Status Code | Scenario                                      | Description                                    |
|-------------|-------------------------------------------------|-----------------------------------------|
| 400         | Zod validation error                            | Return validation details          |
| 401         | Missing or invalid JWT token                | Unauthorized                            |
| 500         | Supabase error or unexpected failure           | Log to console, return generic message|

- We do not log errors to the `generation_error_logs` table, as the endpoint does not invoke AI.

## 8. Performance Considerations
- Single database insertion — low cost and fast operation.  
- Existing indexes on the `user_id` column speed up the operation.  
- Possibility of batch-creation in the future using `FlashcardsCreateCommand`.

## 9. Implementation Steps
1. Create Zod validation schema (`src/lib/schemas/flashcardSchemas.ts`).  
2. Implement `createFlashcard` service in `src/lib/services/flashcardService.ts`.  
3. Add Astro API route in `src/pages/api/flashcards.ts`.  
4. In the handler:
   - Import Zod, service, and get Supabase from `context.locals`.  
   - Perform parsing, validation, and get `user.id`.  
   - Call the service, return the appropriate code and body.  
5. Check that TS and ESLint do not report errors.  
6. Update documentation in README and components.json. 