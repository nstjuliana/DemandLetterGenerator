/**
 * @file 00004_fix_rls_recursion.sql
 * @description Fixes infinite recursion in RLS policies for firm_users table.
 * The original policies caused recursion by referencing firm_users within firm_users policies.
 */

-- =============================================================================
-- DROP PROBLEMATIC POLICIES
-- =============================================================================

-- Drop the recursive firm_users policies
DROP POLICY IF EXISTS firm_users_select_firm_members ON firm_users;
DROP POLICY IF EXISTS firm_users_select_own ON firm_users;
DROP POLICY IF EXISTS firm_users_insert_own ON firm_users;
DROP POLICY IF EXISTS firm_users_update_admin ON firm_users;
DROP POLICY IF EXISTS firm_users_delete_admin ON firm_users;

-- =============================================================================
-- CREATE HELPER FUNCTION TO AVOID RECURSION
-- =============================================================================

-- This function runs with SECURITY DEFINER to bypass RLS when checking firm membership
CREATE OR REPLACE FUNCTION get_user_firm_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT firm_id FROM public.firm_users WHERE user_id = p_user_id LIMIT 1;
$$;

-- Function to check if user is admin of a firm
CREATE OR REPLACE FUNCTION is_firm_admin(p_user_id UUID, p_firm_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.firm_users 
    WHERE user_id = p_user_id 
      AND firm_id = p_firm_id 
      AND role = 'admin'
  );
$$;

-- =============================================================================
-- RECREATE FIRM_USERS POLICIES WITHOUT RECURSION
-- =============================================================================

-- Users can view all members of their firm (using helper function)
CREATE POLICY firm_users_select_members ON firm_users
  FOR SELECT
  TO authenticated
  USING (
    firm_id = get_user_firm_id((SELECT auth.uid()))
    OR user_id = (SELECT auth.uid())
  );

-- Users can insert their own firm membership
CREATE POLICY firm_users_insert_own ON firm_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Admins can update firm members' roles (using helper function)
CREATE POLICY firm_users_update_admin ON firm_users
  FOR UPDATE
  TO authenticated
  USING (is_firm_admin((SELECT auth.uid()), firm_id));

-- Admins can delete firm members (using helper function)
CREATE POLICY firm_users_delete_admin ON firm_users
  FOR DELETE
  TO authenticated
  USING (is_firm_admin((SELECT auth.uid()), firm_id));

-- =============================================================================
-- FIX FIRMS POLICIES THAT ALSO HAD RECURSION ISSUES
-- =============================================================================

DROP POLICY IF EXISTS firms_select_members ON firms;
DROP POLICY IF EXISTS firms_update_admin ON firms;

-- Users can view their firm (using helper function)
CREATE POLICY firms_select_members ON firms
  FOR SELECT
  TO authenticated
  USING (
    id = get_user_firm_id((SELECT auth.uid()))
    OR invite_code IS NOT NULL  -- Allow viewing any firm by invite code for joining
  );

-- Admins can update their firm (using helper function)
CREATE POLICY firms_update_admin ON firms
  FOR UPDATE
  TO authenticated
  USING (is_firm_admin((SELECT auth.uid()), id));

