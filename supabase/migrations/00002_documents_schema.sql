/**
 * @file 00002_documents_schema.sql
 * @description Database schema for documents and templates.
 * Creates tables for demand letters, templates, and source files.
 */

-- =============================================================================
-- DOCUMENT STATUS ENUM
-- =============================================================================
CREATE TYPE document_status AS ENUM ('draft', 'generated', 'edited', 'exported');

-- =============================================================================
-- TEMPLATES TABLE
-- Firm-specific demand letter templates
-- =============================================================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_firm_id ON templates USING btree (firm_id);
CREATE INDEX idx_templates_created_by ON templates USING btree (created_by);

-- =============================================================================
-- DOCUMENTS TABLE
-- Demand letters (generated documents)
-- =============================================================================
CREATE TABLE documents (
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

-- Indexes
CREATE INDEX idx_documents_firm_id ON documents USING btree (firm_id);
CREATE INDEX idx_documents_created_by ON documents USING btree (created_by);
CREATE INDEX idx_documents_status ON documents USING btree (status);
CREATE INDEX idx_documents_updated_at ON documents USING btree (updated_at DESC);

-- =============================================================================
-- SOURCE_FILES TABLE
-- Uploaded source documents for letter generation
-- =============================================================================
CREATE TABLE source_files (
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

-- Indexes
CREATE INDEX idx_source_files_document_id ON source_files USING btree (document_id);
CREATE INDEX idx_source_files_firm_id ON source_files USING btree (firm_id);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_files ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES - TEMPLATES
-- =============================================================================

-- Users can view templates from their firm
CREATE POLICY templates_select_firm ON templates
  FOR SELECT
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
  );

-- Admins and attorneys can create templates
CREATE POLICY templates_insert_admin_attorney ON templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid()) 
        AND fu.role IN ('admin', 'attorney')
    )
    AND created_by = (SELECT auth.uid())
  );

-- Admins and attorneys can update templates in their firm
CREATE POLICY templates_update_admin_attorney ON templates
  FOR UPDATE
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid()) 
        AND fu.role IN ('admin', 'attorney')
    )
  );

-- Admins and attorneys can delete templates in their firm
CREATE POLICY templates_delete_admin_attorney ON templates
  FOR DELETE
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid()) 
        AND fu.role IN ('admin', 'attorney')
    )
  );

-- =============================================================================
-- RLS POLICIES - DOCUMENTS
-- =============================================================================

-- Users can view documents from their firm
CREATE POLICY documents_select_firm ON documents
  FOR SELECT
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
  );

-- All firm members can create documents
CREATE POLICY documents_insert_firm ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
    AND created_by = (SELECT auth.uid())
  );

-- All firm members can update documents in their firm
CREATE POLICY documents_update_firm ON documents
  FOR UPDATE
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
  );

-- All firm members can delete documents in their firm
CREATE POLICY documents_delete_firm ON documents
  FOR DELETE
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
  );

-- =============================================================================
-- RLS POLICIES - SOURCE_FILES
-- =============================================================================

-- Users can view source files from their firm
CREATE POLICY source_files_select_firm ON source_files
  FOR SELECT
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
  );

-- All firm members can upload source files
CREATE POLICY source_files_insert_firm ON source_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
    AND uploaded_by = (SELECT auth.uid())
  );

-- All firm members can delete source files in their firm
CREATE POLICY source_files_delete_firm ON source_files
  FOR DELETE
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
  );

-- =============================================================================
-- TRIGGERS FOR updated_at
-- =============================================================================
CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

