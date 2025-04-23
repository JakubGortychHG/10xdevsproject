# Database Schema for 10xCards MVP

## 1. Tables

### users
This table is managed by Supabase Auth.


| Column        | Type                | Constraints                                      |
|---------------|---------------------|--------------------------------------------------|
| id            | UUID                | PRIMARY KEY DEFAULT gen_random_uuid()            |
| email         | VARCHAR(255)        | NOT NULL UNIQUE                                  |
| password_hash | VARCHAR             | NOT NULL                                         |
| created_at    | TIMESTAMPTZ         | NOT NULL DEFAULT now()                           |
| updated_at    | TIMESTAMPTZ         | NOT NULL DEFAULT now() (updated via trigger)     |
| last_login    | TIMESTAMPTZ         |                                                  |

### flashcards
| Column        | Type                | Constraints                                                                            |
|---------------|---------------------|----------------------------------------------------------------------------------------|
| id            | BIGSERIAL           | PRIMARY KEY                                                                            |
| front         | VARCHAR(200)        | NOT NULL                                                                               |
| back          | VARCHAR(500)        | NOT NULL                                                                               |
| source        | VARCHAR(20)         | NOT NULL CHECK (source IN ('ai-full','ai-edited','manual'))                            |
| created_at    | TIMESTAMPTZ         | NOT NULL DEFAULT now()                                                                 |
| updated_at    | TIMESTAMPTZ         | NOT NULL DEFAULT now() (updated via trigger)                                           |
| generation_id | BIGINT              | REFERENCES generations(id) ON DELETE SET NULL                                          |
| user_id       | UUID                | NOT NULL REFERENCES users(id) ON DELETE CASCADE                                        |

### generations
| Column                  | Type           | Constraints                                                                          |
|-------------------------|----------------|--------------------------------------------------------------------------------------|
| id                      | BIGSERIAL      | PRIMARY KEY                                                                          |
| user_id                 | UUID           | NOT NULL REFERENCES users(id) ON DELETE CASCADE                                      |
| model                   | VARCHAR(100)   |                                                                                      |
| generated_count         | INTEGER        | NOT NULL                                                                             |
| accepted_unedited_count | INTEGER        | NOT NULL DEFAULT 0                                                                   |
| accepted_edited_count   | INTEGER        | NOT NULL DEFAULT 0                                                                   |
| source_text_hash        | VARCHAR        | NOT NULL                                                                             |
| source_text_length      | INTEGER        | NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)                           |
| generation_duration     | INTEGER        | NOT NULL                                                                             |
| created_at              | TIMESTAMPTZ    | NOT NULL DEFAULT now()                                                               |
| updated_at              | TIMESTAMPTZ    | NOT NULL DEFAULT now()                                                               |

### generation_error_logs
| Column             | Type         | Constraints                                                                        |
|--------------------|--------------|------------------------------------------------------------------------------------|
| id                 | BIGSERIAL    | PRIMARY KEY                                                                        |
| user_id            | UUID         | NOT NULL REFERENCES users(id) ON DELETE CASCADE                                    |
| model              | VARCHAR      | NOT NULL                                                                           |
| source_text_hash   | VARCHAR      | NOT NULL                                                                           |
| source_text_length | INTEGER      | NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)                         |
| error_code         | VARCHAR(100) | NOT NULL                                                                           |
| error_message      | TEXT         | NOT NULL                                                                           |
| created_at         | TIMESTAMPTZ  | NOT NULL DEFAULT now()                                                             |

## 2. Relationships
- **users** 1—N **flashcards**: `flashcards.user_id → users.id` (ON DELETE CASCADE)
- **users** 1—N **generations**: `generations.user_id → users.id` (ON DELETE CASCADE)
- **generations** 1—N **flashcards**: `flashcards.generation_id → generations.id` (ON DELETE SET NULL)
- **users** 1—N **generation_error_logs**: `generation_error_logs.user_id → users.id` (ON DELETE CASCADE)

## 3. Indexes
- `CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);`
- `CREATE INDEX idx_generations_user_id ON generations(user_id);`
- `CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);`
- `CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);`

## 4. RLS Policies (Supabase)
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own user record" ON users
  FOR ALL USING (id = auth.uid());

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own flashcards" ON flashcards
  FOR SELECT, INSERT, UPDATE, DELETE USING (user_id = auth.uid());

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own generations" ON generations
  FOR SELECT, INSERT, UPDATE, DELETE USING (user_id = auth.uid());

ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can operate on own generation_error_logs" ON generation_error_logs
  FOR SELECT, INSERT, UPDATE, DELETE USING (user_id = auth.uid());
```

## 5. Additional Notes
- **Trigger for `updated_at` on `flashcards`**:
  ```sql
  CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_set_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
  ```
- Similar triggers can be added for **users** and **generations** if automatic timestamp updates are desired. 