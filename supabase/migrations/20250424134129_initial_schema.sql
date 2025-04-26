-- Migration: Initial Schema Setup
-- Description: Creates the initial tables, relationships, and security policies for the 10xCards MVP
-- Author: AI Assistant
-- Date: 2024-04-24
-- Note: The users table is managed by Supabase Auth and is not created in this migration

-- Create generations table
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(100),
    generated_count integer not null,
    accepted_unedited_count integer not null default 0,
    accepted_edited_count integer not null default 0,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create flashcards table
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar(20) not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references generations(id) on delete set null,
    user_id uuid not null references auth.users(id) on delete cascade
);

-- Create generation_error_logs table
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create indexes
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_generations_user_id on generations(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- Create updated_at trigger function
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger trg_generations_set_updated_at
    before update on generations
    for each row
    execute function set_updated_at();

create trigger trg_flashcards_set_updated_at
    before update on flashcards
    for each row
    execute function set_updated_at();

-- Enable Row Level Security
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- RLS Policies for flashcards table
comment on table flashcards is 'Flashcards created by users';
create policy "Users can view own flashcards" on flashcards
    for select using (auth.uid() = user_id);
create policy "Users can create own flashcards" on flashcards
    for insert with check (auth.uid() = user_id);
create policy "Users can update own flashcards" on flashcards
    for update using (auth.uid() = user_id);
create policy "Users can delete own flashcards" on flashcards
    for delete using (auth.uid() = user_id);

-- RLS Policies for generations table
comment on table generations is 'Records of AI-generated flashcard batches';
create policy "Users can view own generations" on generations
    for select using (auth.uid() = user_id);
create policy "Users can create own generations" on generations
    for insert with check (auth.uid() = user_id);
create policy "Users can update own generations" on generations
    for update using (auth.uid() = user_id);
create policy "Users can delete own generations" on generations
    for delete using (auth.uid() = user_id);

-- RLS Policies for generation_error_logs table
comment on table generation_error_logs is 'Error logs from flashcard generation attempts';
create policy "Users can view own error logs" on generation_error_logs
    for select using (auth.uid() = user_id);
create policy "Users can create own error logs" on generation_error_logs
    for insert with check (auth.uid() = user_id);
-- Note: Update and Delete policies are intentionally omitted as error logs should be immutable 