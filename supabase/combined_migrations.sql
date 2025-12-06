-- ============================================================================
-- COMBINED MIGRATIONS FOR DEMAND LETTER GENERATOR
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- =============================================================================
-- MIGRATION 1: INITIAL SCHEMA (firms, profiles, firm_users)
-- =============================================================================

-- FIRMS TABLE
CREATE TABLE IF NOT EXISTS firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_firms_invite_code ON firms USING btree (invite_code);

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER ROLE ENUM
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'attorney', 'paralegal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- FIRM_USERS TABLE
CREATE TABLE IF NOT EXISTS firm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'paralegal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(firm_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_firm_users_firm_id ON firm_users USING btree (firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_users_user_id ON firm_users USING btree (user_id);

-- ENABLE RLS
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_users ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - PROFILES
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- RLS POLICIES - FIRM_USERS
DROP POLICY IF EXISTS firm_users_select_own ON firm_users;
CREATE POLICY firm_users_select_own ON firm_users
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS firm_users_select_firm_members ON firm_users;
CREATE POLICY firm_users_select_firm_members ON firm_users
  FOR SELECT TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS firm_users_insert_own ON firm_users;
CREATE POLICY firm_users_insert_own ON firm_users
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS firm_users_update_admin ON firm_users;
CREATE POLICY firm_users_update_admin ON firm_users
  FOR UPDATE TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()) AND fu.role = 'admin'));

DROP POLICY IF EXISTS firm_users_delete_admin ON firm_users;
CREATE POLICY firm_users_delete_admin ON firm_users
  FOR DELETE TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()) AND fu.role = 'admin'));

-- RLS POLICIES - FIRMS
DROP POLICY IF EXISTS firms_select_members ON firms;
CREATE POLICY firms_select_members ON firms
  FOR SELECT TO authenticated
  USING (id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS firms_select_by_invite ON firms;
CREATE POLICY firms_select_by_invite ON firms
  FOR SELECT TO authenticated
  USING (invite_code IS NOT NULL);

DROP POLICY IF EXISTS firms_insert_authenticated ON firms;
CREATE POLICY firms_insert_authenticated ON firms
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS firms_update_admin ON firms;
CREATE POLICY firms_update_admin ON firms
  FOR UPDATE TO authenticated
  USING (id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()) AND fu.role = 'admin'));

-- FUNCTIONS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS firms_updated_at ON firms;
CREATE TRIGGER firms_updated_at
  BEFORE UPDATE ON firms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- MIGRATION 2: DOCUMENTS SCHEMA
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('draft', 'generated', 'edited', 'exported');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_firm_id ON templates USING btree (firm_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates USING btree (created_by);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  status document_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_firm_id ON documents USING btree (firm_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents USING btree (status);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents USING btree (updated_at DESC);

CREATE TABLE IF NOT EXISTS source_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  storage_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_files_document_id ON source_files USING btree (document_id);
CREATE INDEX IF NOT EXISTS idx_source_files_firm_id ON source_files USING btree (firm_id);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_files ENABLE ROW LEVEL SECURITY;

-- RLS - TEMPLATES
DROP POLICY IF EXISTS templates_select_firm ON templates;
CREATE POLICY templates_select_firm ON templates
  FOR SELECT TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS templates_insert_admin_attorney ON templates;
CREATE POLICY templates_insert_admin_attorney ON templates
  FOR INSERT TO authenticated
  WITH CHECK (
    firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()) AND fu.role IN ('admin', 'attorney'))
    AND created_by = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS templates_update_admin_attorney ON templates;
CREATE POLICY templates_update_admin_attorney ON templates
  FOR UPDATE TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()) AND fu.role IN ('admin', 'attorney')));

DROP POLICY IF EXISTS templates_delete_admin_attorney ON templates;
CREATE POLICY templates_delete_admin_attorney ON templates
  FOR DELETE TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()) AND fu.role IN ('admin', 'attorney')));

-- RLS - DOCUMENTS
DROP POLICY IF EXISTS documents_select_firm ON documents;
CREATE POLICY documents_select_firm ON documents
  FOR SELECT TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS documents_insert_firm ON documents;
CREATE POLICY documents_insert_firm ON documents
  FOR INSERT TO authenticated
  WITH CHECK (
    firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()))
    AND created_by = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS documents_update_firm ON documents;
CREATE POLICY documents_update_firm ON documents
  FOR UPDATE TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS documents_delete_firm ON documents;
CREATE POLICY documents_delete_firm ON documents
  FOR DELETE TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid())));

-- RLS - SOURCE_FILES
DROP POLICY IF EXISTS source_files_select_firm ON source_files;
CREATE POLICY source_files_select_firm ON source_files
  FOR SELECT TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS source_files_insert_firm ON source_files;
CREATE POLICY source_files_insert_firm ON source_files
  FOR INSERT TO authenticated
  WITH CHECK (
    firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()))
    AND uploaded_by = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS source_files_delete_firm ON source_files;
CREATE POLICY source_files_delete_firm ON source_files
  FOR DELETE TO authenticated
  USING (firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid())));

DROP TRIGGER IF EXISTS templates_updated_at ON templates;
CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS documents_updated_at ON documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- MIGRATION 3: ACTION HISTORY
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE action_type AS ENUM ('generated', 'edited', 'exported');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action action_type NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_logs_document_id ON action_logs USING btree (document_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_user_id ON action_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_created_at ON action_logs USING btree (created_at DESC);

ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS action_logs_select_firm ON action_logs;
CREATE POLICY action_logs_select_firm ON action_logs
  FOR SELECT TO authenticated
  USING (
    document_id IN (
      SELECT d.id FROM documents d 
      WHERE d.firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS action_logs_insert_firm ON action_logs;
CREATE POLICY action_logs_insert_firm ON action_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT d.id FROM documents d 
      WHERE d.firm_id IN (SELECT fu.firm_id FROM firm_users fu WHERE fu.user_id = (SELECT auth.uid()))
    )
    AND user_id = (SELECT auth.uid())
  );

CREATE OR REPLACE FUNCTION log_document_action(
  p_document_id UUID,
  p_action action_type,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.action_logs (document_id, user_id, action, metadata)
  VALUES (p_document_id, auth.uid(), p_action, p_metadata)
  RETURNING id INTO v_log_id;
  
  UPDATE public.documents
  SET status = p_action::text::public.document_status
  WHERE id = p_document_id;
  
  RETURN v_log_id;
END;
$$;

CREATE OR REPLACE VIEW document_latest_action AS
SELECT DISTINCT ON (document_id)
  document_id,
  action,
  user_id,
  created_at
FROM action_logs
ORDER BY document_id, created_at DESC;

-- ============================================================================
-- DONE! All tables and policies created successfully.
-- ============================================================================

