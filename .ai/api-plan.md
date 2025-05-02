# REST API Plan

## 1. Resources
- **Users** - Maps to `users` table (managed by Supabase Auth)
- **Flashcards** - Maps to `flashcards` table
- **Generations** - Maps to `generations` table
- **Generation Error Logs** - Maps to `generation_error_logs` table

## 2. Endpoints

### Flashcards
#### Get All Flashcards
- **Method:** GET
- **Path:** `/api/flashcards`
- **Description:** Retrieve all flashcards for the authenticated user
- **Query Parameters:**
  - `limit` (integer, optional): Number of flashcards to return (default: 50)
  - `offset` (integer, optional): Pagination offset (default: 0)
  - `source` (string, optional): Filter by source ('ai-full', 'ai-edited', 'manual')
  - `sort` (string, optional): Sort field ('created_at', 'updated_at')
  - `order` (string, optional): Sort order ('asc', 'desc')
- **Response:**
```json
{
  "flashcards": [
    {
      "id": "integer",
      "front": "string",
      "back": "string",
      "source": "string",
      "created_at": "string",
      "updated_at": "string",
      "generation_id": "integer | null"
    }
  ],
  "total": "integer",
  "limit": "integer",
  "offset": "integer"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

#### Get Single Flashcard
- **Method:** GET
- **Path:** `/api/flashcards/:id`
- **Description:** Retrieve a specific flashcard by its ID
- **Response:**
```json
{
  "id": "integer",
  "front": "string",
  "back": "string",
  "source": "string",
  "created_at": "string",
  "updated_at": "string",
  "generation_id": "integer | null"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 404 Not Found

#### Create Single Flashcard
- **Method:** POST
- **Path:** `/api/flashcard`
- **Description:** Create a new flashcard manually or using AI
- **Request Payload:**
```json
{
  "front": "string",
  "back": "string",
  "source": "string", // "manual" or "ai"
  "generation_id": "integer | null" // Required when source is "ai-full" or "ai-edited"
}
```
- **Response:**
```json
{
  "id": "integer",
  "front": "string",
  "back": "string",
  "source": "string", // "manual", "ai-full", or "ai-edited"
  "created_at": "string",
  "updated_at": "string",
  "generation_id": "integer | null" // Present only when source is "ai-full" or "ai-edited"
}
```
- **Success Codes:** 201 Created
- **Error Codes:** 
  - 400 Bad Request (invalid data)
  - 401 Unauthorized

#### Create Multiple Flashcards
- **Method:** POST
- **Path:** `/api/flashcards`
- **Description:** Create multiple flashcards in a single request
- **Request Payload:**
```json
{
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "source": "string", // "manual", "ai-full", or "ai-edited"
      "generation_id": "integer | null" // Required when source is "ai-full" or "ai-edited"
    }
  ]
}
```
- **Response:**
```json
{
  "flashcards": [
    {
      "id": "integer",
      "front": "string",
      "back": "string",
      "source": "string", // "manual", "ai-full", or "ai-edited"
      "created_at": "string",
      "updated_at": "string",
      "generation_id": "integer | null"
    }
  ],
  "created_count": "integer"
}
```
- **Success Codes:** 201 Created
- **Error Codes:** 
  - 400 Bad Request (invalid data)
  - 401 Unauthorized

#### Update Flashcard
- **Method:** PATCH
- **Path:** `/api/flashcards/:id`
- **Description:** Update a single flashcard
- **Request Payload:**
```json
{
  "front": "string",
  "back": "string"
}
```
- **Response:**
```json
{
  "id": "integer",
  "front": "string",
  "back": "string",
  "source": "string",
  "created_at": "string",
  "updated_at": "string",
  "generation_id": "integer | null"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 
  - 400 Bad Request (invalid data)
  - 401 Unauthorized
  - 404 Not Found

#### Delete Flashcard
- **Method:** DELETE
- **Path:** `/api/flashcards/:id`
- **Description:** Delete a single flashcard
- **Response:**
```json
{
  "success": true
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 
  - 401 Unauthorized
  - 404 Not Found

### Generations
#### Generate Flashcards
- **Method:** POST
- **Path:** `/api/generations`
- **Description:** Generate flashcards proposals using AI based on provided text
- **Request Payload:**
```json
{
  "source_text": "string"
}
```
- **Response:**
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
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request (source text too short/long), 401 Unauthorized, 429 Too Many Requests

#### Get Generation Details
- **Method:** GET
- **Path:** `/api/generations/:id`
- **Description:** Get details about a specific generation
- **Response:**
```json
{
  "id": "integer",
  "generated_count": "integer",
  "accepted_unedited_count": "integer",
  "accepted_edited_count": "integer",
  "source_text_length": "integer",
  "generation_duration": "integer",
  "model": "string | null",
  "created_at": "string"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 404 Not Found

#### Get All Generations
- **Method:** GET
- **Path:** `/api/generations`
- **Description:** Get a list of all generations for the authenticated user
- **Query Parameters:**
  - `limit` (integer, optional): Number of generations to return (default: 20)
  - `offset` (integer, optional): Pagination offset (default: 0)
- **Response:**
```json
{
  "generations": [
    {
      "id": "integer",
      "generated_count": "integer",
      "accepted_unedited_count": "integer",
      "accepted_edited_count": "integer",
      "source_text_length": "integer",
      "generation_duration": "integer",
      "model": "string | null",
      "created_at": "string"
    }
  ],
  "total": "integer",
  "limit": "integer",
  "offset": "integer"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

#### Accept or Reject Generated Flashcards
- **Method:** POST
- **Path:** `/api/generations/:id/process`
- **Description:** Process generated flashcards (accept as-is, accept with edits, or reject)
- **Request Payload:**
```json
{
  "accepted_flashcards": [
    {
      "id": "integer",
      "front": "string",
      "back": "string",
      "status": "string" // "accept" or "edit"
    }
  ],
  "rejected_flashcard_ids": ["integer"]
}
```
- **Response:**
```json
{
  "success": true,
  "stats": {
    "accepted_unedited_count": "integer",
    "accepted_edited_count": "integer"
  }
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found

## 3. Authentication and Authorization
- **Authentication Method:** JWT-based authentication provided by Supabase Auth
- **Implementation Details:**
  - Client sends credentials to Supabase Auth endpoints
  - Upon successful authentication, a JWT is returned
  - JWT must be included in the Authorization header for all authenticated requests
  - The middleware loads Supabase client into request context for API routes

- **Authorization Rules:**
  - Users can only access their own flashcards
  - Users can only access their own generations
  - Row-level security in Supabase ensures data isolation

## 4. Validation and Business Logic
### Flashcards
- **Validation Rules:**
  - `front` field: Required, max 200 characters
  - `back` field: Required, max 500 characters
  - `source` field: Must be one of: 'manual', 'ai-full', 'ai-edited'
  - Single create/update: Validate individual flashcard fields
  - Batch create: Validate each flashcard in the array
  - Update: Only one flashcard can be modified at a time
  - Delete: Only one flashcard can be deleted at a time

### Text Processing
- **Validation Rules:**
  - `source_text`: Required, must be between 1000-10000 characters
  - `source_text_hash`: Computed for duplicate detection.
  - Rate limiting applies to AI processing requests

### Business Logic Implementation:
- **Flashcard Creation:**
  1. Validate request payload
  2. Create flashcard with provided content
  3. Set appropriate source value
  4. Create generation record if source is 'ai'
  5. Return created flashcard data

- **AI Text Processing:**
  1. Validate source text length
  2. Call OpenRouter API to generate content
  3. Return suggested flashcard content
  4. Include generation statistics

- **Single Flashcard Operations:**
  1. Update:
     - Verify flashcard ownership
     - Validate new content
     - If updating AI-generated flashcard, update source to 'ai-edited'
     - Update timestamp via trigger
  2. Delete:
     - Verify flashcard ownership
     - Remove single record
     - Maintain referential integrity with generations table