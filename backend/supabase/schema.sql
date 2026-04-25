-- Run this in your Supabase SQL editor to set up the database

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null check (role in ('student', 'employer')),
  avatar_url text,
  -- Student fields
  cuny_school text,
  major text,
  skills text[] default '{}',
  bio text,
  resume_url text,
  -- Employer fields
  company_name text,
  website text,
  verified boolean default false,
  -- Stats
  rating numeric default 0,
  completed_projects integer default 0,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Briefs table
create table if not exists briefs (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  skills_required text[] default '{}',
  budget numeric not null check (budget > 0),
  deadline date not null,
  status text check (status in ('open', 'matched', 'in_progress', 'submitted', 'completed')) default 'open',
  payment_intent_id text,
  created_at timestamptz default now()
);

-- Matches table
create table if not exists matches (
  id uuid default gen_random_uuid() primary key,
  brief_id uuid references briefs(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  ai_score numeric default 0.7,
  created_at timestamptz default now(),
  unique (brief_id, student_id)
);

-- Messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_ai_suggestion boolean default false,
  created_at timestamptz default now()
);

-- Submissions table
create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) on delete set null,
  brief_id uuid references briefs(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  file_urls text[] default '{}',
  video_asset_id text,
  notes text,
  status text check (status in ('pending', 'approved', 'revision_requested')) default 'pending',
  submitted_at timestamptz default now()
);

-- Reviews table
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references submissions(id) on delete cascade not null,
  employer_id uuid references profiles(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  rating integer check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now()
);

-- Auto-update student rating on new review
create or replace function update_student_rating()
returns trigger as $$
begin
  update profiles
  set
    rating = (
      select avg(rating) from reviews where student_id = new.student_id
    ),
    completed_projects = (
      select count(*) from reviews where student_id = new.student_id
    )
  where id = new.student_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_review_created
  after insert on reviews
  for each row execute procedure update_student_rating();

-- Row Level Security
alter table profiles enable row level security;
alter table briefs enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table submissions enable row level security;
alter table reviews enable row level security;

-- Profiles: users can read all, but only update their own
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Briefs: anyone can read open briefs, employers manage their own
create policy "briefs_select" on briefs for select using (true);
create policy "briefs_insert" on briefs for insert with check (auth.uid() = employer_id);
create policy "briefs_update" on briefs for update using (auth.uid() = employer_id);

-- Matches: students see their own, employers see matches for their briefs
create policy "matches_select" on matches for select using (
  auth.uid() = student_id or
  auth.uid() in (select employer_id from briefs where id = brief_id)
);
create policy "matches_insert" on matches for insert with check (true);
create policy "matches_update" on matches for update using (
  auth.uid() = student_id or
  auth.uid() in (select employer_id from briefs where id = brief_id)
);

-- Messages
create policy "messages_select" on messages for select using (
  auth.uid() in (
    select student_id from matches where id = match_id
    union
    select employer_id from briefs where id in (
      select brief_id from matches where id = match_id
    )
  )
);
create policy "messages_insert" on messages for insert with check (auth.uid() = sender_id);

-- Submissions
create policy "submissions_select" on submissions for select using (
  auth.uid() = student_id or
  auth.uid() in (select employer_id from briefs where id = brief_id)
);
create policy "submissions_insert" on submissions for insert with check (auth.uid() = student_id);
create policy "submissions_update" on submissions for update using (
  auth.uid() = student_id or
  auth.uid() in (select employer_id from briefs where id = brief_id)
);

-- Reviews
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (auth.uid() = employer_id);

-- Storage bucket for deliverables
insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', true)
on conflict do nothing;

create policy "deliverables_upload" on storage.objects
  for insert with check (bucket_id = 'deliverables' and auth.role() = 'authenticated');
create policy "deliverables_select" on storage.objects
  for select using (bucket_id = 'deliverables');
