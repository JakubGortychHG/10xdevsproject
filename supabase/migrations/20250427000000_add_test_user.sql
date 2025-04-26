-- Migration: Add Test User
-- Description: Creates a test user for development purposes
-- Author: AI Assistant
-- Date: 2024-04-27

-- Insert test user into auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, -- Our DEFAULT_USER_ID
    '00000000-0000-0000-0000-000000000000'::uuid,
    'test@example.com',
    '$2a$10$Q7RNHL46r7uNyxXm2K97EOz6FYyZFqT8QKV2Ho8FSVxkLvNhIEKXG', -- hashed 'password123'
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Insert corresponding identity
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    jsonb_build_object(
        'sub', '00000000-0000-0000-0000-000000000000',
        'email', 'test@example.com'
    ),
    'email',
    'test@example.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING; 