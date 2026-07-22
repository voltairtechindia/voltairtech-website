-- =====================================================================
-- Migration 0030: CC/BCC + attachments on lead emails, and the private
-- `lead-assets` Storage bucket that holds the attachable files.
--
--   · lead_emails.cc / .bcc      — extra recipients, sent verbatim.
--   · lead_emails.attachments    — jsonb [{path,name,size}] pointing into the
--                                  lead-assets bucket; files are downloaded
--                                  and attached at send time.
--   · lead_campaigns.attachments — same shape; stamped onto every OPENER the
--                                  campaign queues (follow-ups stay bare).
--   · storage bucket lead-assets — PRIVATE, 10 MB/file, pdf + png/jpeg/webp.
--                                  Only the admin's service key touches it.
--
-- Run in the Supabase SQL editor. Safe to re-run.
-- =====================================================================

alter table lead_emails
    add column if not exists cc          text[] not null default '{}',
    add column if not exists bcc         text[] not null default '{}',
    add column if not exists attachments jsonb  not null default '[]'::jsonb;

comment on column lead_emails.cc is 'Extra visible recipients.';
comment on column lead_emails.bcc is 'Hidden copies (e.g. your own CRM inbox).';
comment on column lead_emails.attachments is
    'Files from the lead-assets bucket: [{"path","name","size"}], attached at send time.';

alter table lead_campaigns
    add column if not exists attachments jsonb not null default '[]'::jsonb;

comment on column lead_campaigns.attachments is
    'Attached to every opener this campaign queues (follow-ups stay attachment-free).';

-- The private bucket for attachable assets (brochures, one-pagers, price
-- sheets). Service-key access only — no public URLs, no RLS policies needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'lead-assets',
    'lead-assets',
    false,
    10485760, -- 10 MB
    array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
    set file_size_limit    = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;
