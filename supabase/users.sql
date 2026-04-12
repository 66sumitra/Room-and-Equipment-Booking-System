-- SQL schema proposal for custom users table and relation to profiles
-- Run this in your Supabase SQL editor before using the new auth flow.

-- 1) Core users table for email/password login
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  role text not null default 'user',
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- 2) Example: seed an initial admin user (replace email/password and name)
-- NOTE: You must replace the password_hash with a bcrypt hash generated offline
-- (the application will NOT generate this seed for you).
-- insert into public.users (id, email, password_hash, name, role)
-- values (
--   gen_random_uuid(),
--   'admin@example.com',
--   '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
--   'ระบบผู้ดูแล',
--   'admin'
-- );

