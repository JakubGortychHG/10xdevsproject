-- Migration: Drop RLS Policies
-- Description: Removes all previously defined RLS policies from tables
-- Author: AI Assistant
-- Date: 2024-04-26

-- Drop RLS Policies for flashcards table
drop policy if exists "Users can view own flashcards" on flashcards;
drop policy if exists "Users can create own flashcards" on flashcards;
drop policy if exists "Users can update own flashcards" on flashcards;
drop policy if exists "Users can delete own flashcards" on flashcards;

-- Drop RLS Policies for generations table
drop policy if exists "Users can view own generations" on generations;
drop policy if exists "Users can create own generations" on generations;
drop policy if exists "Users can update own generations" on generations;
drop policy if exists "Users can delete own generations" on generations;

-- Drop RLS Policies for generation_error_logs table
drop policy if exists "Users can view own error logs" on generation_error_logs;
drop policy if exists "Users can create own error logs" on generation_error_logs;

-- Disable Row Level Security on all tables
alter table flashcards disable row level security;
alter table generations disable row level security;
alter table generation_error_logs disable row level security; 