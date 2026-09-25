-- ---------------------------------------------------------------------------
-- Migration: 0002_alerts_cron.sql
-- Description: Schedule check-alerts Edge Function every 5 minutes via pg_cron
-- ---------------------------------------------------------------------------

-- Enable pg_cron and pg_net extensions (requires Supabase Database extensions enabled)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Note for Supabase Cloud:
-- 1. Replace YOUR_PROJECT_REF with your actual Supabase project reference.
-- 2. Replace YOUR_ANON_KEY with your project's anon key (or service_role key for internal functions).
-- 3. You can set them via vault or app settings:
--    ALTER DATABASE postgres SET "app.settings.project_ref" = 'your_project_ref';
--    ALTER DATABASE postgres SET "app.settings.anon_key" = 'your_anon_key';

-- Unschedules previous job if it exists to avoid duplicates
do $$
begin
  perform cron.unschedule('check-alerts-every-5-minutes')
  where exists (
    select 1 from cron.job where jobname = 'check-alerts-every-5-minutes'
  );
exception when others then
  -- Ignore if cron.job is not yet accessible
end $$;

-- Schedule the Edge Function invocation every 5 minutes
select cron.schedule(
  'check-alerts-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co/functions/v1/check-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
