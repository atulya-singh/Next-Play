/*
  Supabase SQL Schema
  ===================

  -- tasks table
  create table tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    status text not null default 'todo'
      check (status in ('todo', 'in_progress', 'in_review', 'done')),
    priority text not null default 'normal'
      check (priority in ('low', 'normal', 'high')),
    due_date date,
    user_id uuid not null references auth.users(id) on delete cascade,
    position float8 not null default 0,
    created_at timestamptz not null default now()
  );

  create index idx_tasks_user_status on tasks(user_id, status);

  -- labels table
  create table labels (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    color text not null,
    user_id uuid not null references auth.users(id) on delete cascade
  );

  -- task_labels join table
  create table task_labels (
    task_id uuid not null references tasks(id) on delete cascade,
    label_id uuid not null references labels(id) on delete cascade,
    primary key (task_id, label_id)
  );

  -- comments table
  create table comments (
    id uuid primary key default gen_random_uuid(),
    task_id uuid not null references tasks(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    body text not null,
    created_at timestamptz not null default now()
  );

  -- RLS policies

  alter table tasks enable row level security;
  create policy "Users can view their own tasks"
    on tasks for select using (auth.uid() = user_id);
  create policy "Users can insert their own tasks"
    on tasks for insert with check (auth.uid() = user_id);
  create policy "Users can update their own tasks"
    on tasks for update using (auth.uid() = user_id);
  create policy "Users can delete their own tasks"
    on tasks for delete using (auth.uid() = user_id);

  alter table labels enable row level security;
  create policy "Users can view their own labels"
    on labels for select using (auth.uid() = user_id);
  create policy "Users can insert their own labels"
    on labels for insert with check (auth.uid() = user_id);
  create policy "Users can update their own labels"
    on labels for update using (auth.uid() = user_id);
  create policy "Users can delete their own labels"
    on labels for delete using (auth.uid() = user_id);

  alter table task_labels enable row level security;
  create policy "Users can view their own task_labels"
    on task_labels for select using (
      exists (select 1 from tasks where tasks.id = task_labels.task_id and tasks.user_id = auth.uid())
    );
  create policy "Users can insert their own task_labels"
    on task_labels for insert with check (
      exists (select 1 from tasks where tasks.id = task_labels.task_id and tasks.user_id = auth.uid())
    );
  create policy "Users can delete their own task_labels"
    on task_labels for delete using (
      exists (select 1 from tasks where tasks.id = task_labels.task_id and tasks.user_id = auth.uid())
    );

  alter table comments enable row level security;
  create policy "Users can view comments on their tasks"
    on comments for select using (
      exists (select 1 from tasks where tasks.id = comments.task_id and tasks.user_id = auth.uid())
    );
  create policy "Users can insert comments on their tasks"
    on comments for insert with check (
      exists (select 1 from tasks where tasks.id = comments.task_id and tasks.user_id = auth.uid())
    );
  create policy "Users can update their own comments"
    on comments for update using (auth.uid() = user_id);
  create policy "Users can delete their own comments"
    on comments for delete using (auth.uid() = user_id);
*/

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
