/**
 * @file 00003_action_history.sql
 * @description Database schema for document action history.
 * Tracks actions like generated, edited, exported on documents.
 */

-- =============================================================================
-- ACTION TYPE ENUM
-- =============================================================================
CREATE TYPE action_type AS ENUM ('generated', 'edited', 'exported');

-- =============================================================================
-- ACTION_LOGS TABLE
-- History of actions performed on documents
-- =============================================================================
CREATE TABLE action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action action_type NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_action_logs_document_id ON action_logs USING btree (document_id);
CREATE INDEX idx_action_logs_user_id ON action_logs USING btree (user_id);
CREATE INDEX idx_action_logs_created_at ON action_logs USING btree (created_at DESC);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES - ACTION_LOGS
-- =============================================================================

-- Users can view action logs for documents in their firm
CREATE POLICY action_logs_select_firm ON action_logs
  FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT d.id 
      FROM documents d 
      WHERE d.firm_id IN (
        SELECT fu.firm_id 
        FROM firm_users fu 
        WHERE fu.user_id = (SELECT auth.uid())
      )
    )
  );

-- Users can insert action logs for documents in their firm
CREATE POLICY action_logs_insert_firm ON action_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT d.id 
      FROM documents d 
      WHERE d.firm_id IN (
        SELECT fu.firm_id 
        FROM firm_users fu 
        WHERE fu.user_id = (SELECT auth.uid())
      )
    )
    AND user_id = (SELECT auth.uid())
  );

-- =============================================================================
-- FUNCTION TO LOG DOCUMENT ACTIONS
-- =============================================================================
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
  
  -- Update document status based on action
  UPDATE public.documents
  SET status = p_action::text::public.document_status
  WHERE id = p_document_id;
  
  RETURN v_log_id;
END;
$$;

-- =============================================================================
-- VIEW FOR LATEST DOCUMENT ACTION
-- =============================================================================
CREATE OR REPLACE VIEW document_latest_action AS
SELECT DISTINCT ON (document_id)
  document_id,
  action,
  user_id,
  created_at
FROM action_logs
ORDER BY document_id, created_at DESC;

