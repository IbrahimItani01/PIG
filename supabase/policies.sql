-- Supabase RLS policies for PIG. Run after Prisma migrations.
alter table public.users enable row level security;
alter table public.prompt_evaluations enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.prompt_test_runs enable row level security;
alter table public.usage_events enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can read own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read own evaluations"
on public.prompt_evaluations for select
using (auth.uid() = "userId");

create policy "Users can insert own evaluations"
on public.prompt_evaluations for insert
with check (auth.uid() = "userId");

create policy "Users can delete own evaluations"
on public.prompt_evaluations for delete
using (auth.uid() = "userId");

create policy "Users can read own versions"
on public.prompt_versions for select
using (
  exists (
    select 1 from public.prompt_evaluations e
    where e.id = "evaluationId" and e."userId" = auth.uid()
  )
);

create policy "Users can insert own versions"
on public.prompt_versions for insert
with check (
  exists (
    select 1 from public.prompt_evaluations e
    where e.id = "evaluationId" and e."userId" = auth.uid()
  )
);

create policy "Users can read own test runs"
on public.prompt_test_runs for select
using (
  exists (
    select 1 from public.prompt_evaluations e
    where e.id = "evaluationId" and e."userId" = auth.uid()
  )
);

create policy "Users can insert own test runs"
on public.prompt_test_runs for insert
with check (
  exists (
    select 1 from public.prompt_evaluations e
    where e.id = "evaluationId" and e."userId" = auth.uid()
  )
);

create policy "Users can read own usage"
on public.usage_events for select
using (auth.uid() = "userId");

create policy "Users can read own subscription"
on public.subscriptions for select
using (auth.uid() = "userId");
