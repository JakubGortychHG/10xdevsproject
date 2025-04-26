# API Endpoint Implementation Plan: Generate Flashcards

## 1. Overview of the Endpoint
The endpoint enables authenticated users to generate flashcard proposals using AI based on provided text content. It processes the input text through an AI model via OpenRouter.ai, creates a generation record, and returns generated flashcard proposals.

## 2. Request Details
- HTTP Method: POST  
- Path: `/api/generations`  
- Authorization Header: `Authorization: Bearer <JWT>`  

### Parameters in Body (JSON)
- Required:  
  - `source_text` (string): Text content to generate flashcards from
    - Minimum length: 1000 characters
    - Maximum length: 10000 characters

```json
{
  "source_text": "string"
}
```

## 3. Types Used
- `GenerateFlashcardsCommand` (src/types.ts)
- `FlashcardProposalDto` (src/types.ts)
- `GenerationCreateResponseDto` (src/types.ts)
- `Generation` (src/types.ts)

## 4. Response Details
- Status Codes:  
  - **201 Created** – generation completed successfully  
  - **400 Bad Request** – invalid source text length  
  - **401 Unauthorized** – missing or invalid token  
  - **429 Too Many Requests** – rate limit exceeded  
  - **500 Internal Server Error** – AI service or database failure  

- Body (JSON for 201):
```json
{
  "generation_id": "integer",
  "flashcards_proposals": [
    {
      "id": "integer",
      "front": "string",
      "back": "string",
      "source": "ai-full"
    }
  ],
  "stats": {
    "generated_count": "integer",
    "source_text_length": "integer",
    "generation_duration": "integer"
  }
}
```

## 5. Data Flow
1. Client sends POST request with JWT token and source text.
2. Middleware (`src/middleware/index.ts`):
   - Validates JWT and provides Supabase context
   - Checks rate limiting for AI generations
3. In API handler (`src/pages/api/generations.ts`):
   - Parse and validate request body using Zod
   - Get `user.id` from `context.locals.supabase.auth.getUser()`
   - Calculate text hash for duplicate detection
   - Call service `generateFlashcards(sourceText, userId)`
4. In service (`src/lib/services/generationService.ts`):
   - Start timing the generation
   - Create generation record in database
   - Call OpenRouter.ai API with optimized prompt
   - Parse AI response into flashcard proposals
   - Update generation record with results
   - Return generation data and proposals
5. Handler formats and returns response with 201 code

## 6. Security Considerations
- **Authorization:** JWT validation via Supabase Auth
- **Rate Limiting:** Prevent abuse of AI service
  - Per user limits
  - Global service limits
- **Input Validation:** 
  - Text length constraints
  - Content safety checks
- **API Key Security:**
  - OpenRouter.ai key stored in environment variables
  - Key never exposed to client
- **RLS:** Supabase policies ensure user can only access own generations

## 7. Error Handling
| Status Code | Scenario                                    | Action                                         |
|-------------|---------------------------------------------|------------------------------------------------|
| 400         | Source text < 1000 chars                    | Return "Text too short" error                  |
| 400         | Source text > 10000 chars                   | Return "Text too long" error                   |
| 401         | Missing/invalid JWT                         | Return authentication error                     |
| 429         | Rate limit exceeded                         | Return limit details and retry-after header     |
| 500         | AI service error                            | Log error, return generic message              |
| 500         | Database error                              | Log error, return generic message              |

Error Logging:
- All AI service errors logged to `generation_error_logs` table
- Include:
  - Error code and message
  - Source text hash
  - Text length
  - Model information

## 8. Performance Considerations
- **Rate Limiting:**
  - Implement token bucket algorithm
  - Store limits in Redis/memory cache
- **Caching:**
  - Cache similar text generations (via text hash)
  - Cache AI service responses
- **Database:**
  - Batch insert for flashcard proposals
  - Use proper indexes on `user_id` and `source_text_hash`
- **AI Optimization:**
  - Optimize prompts for efficiency
  - Set appropriate token limits
  - Handle timeouts gracefully

## 9. Implementation Steps
1. Create Zod validation schema (`src/lib/schemas/generationSchemas.ts`):
   - Source text validation
   - Response validation
2. Implement rate limiting middleware:
   - Add rate limit checks
   - Configure limits in environment
3. Create OpenRouter.ai service (`src/lib/services/aiService.ts`):
   - IMPORTANT: During development we will use mocks instead sening real prompts.
   - API client setup
   - Prompt engineering
   - Response parsing
4. Implement generation service (`src/lib/services/generationService.ts`):
   - Database operations
   - AI service integration
   - Error handling
5. Add API route handler (`src/pages/api/generations.ts`):
   - Request validation
   - Service coordination
   - Response formatting
6. Add error logging service:
   - Database logging
   - Error categorization
7. Create and test Supabase RLS policies
8. Update API documentation