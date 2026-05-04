alter table public.vehicles
  add column if not exists insurance_provider text,
  add column if not exists insurance_policy_number text,
  add column if not exists insurance_expires_at timestamptz,
  add column if not exists insurance_document_path text;