/**
 * @file 00001_initial_schema.sql
 * @description Initial database schema for Demand Letter Generator.
 * Creates firms, profiles, and firm_users tables with RLS policies.
 */

-- =============================================================================
-- FIRMS TABLE
-- Law firms that users belong to
-- =============================================================================
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for invite code lookups
CREATE INDEX idx_firms_invite_code ON firms USING btree (invite_code);

-- =============================================================================
-- PROFILES TABLE
-- Extended user data linked to auth.users
-- =============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- USER ROLE ENUM
-- =============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'attorney', 'paralegal');

-- =============================================================================
-- FIRM_USERS TABLE
-- Junction table for firm memberships with roles
-- =============================================================================
CREATE TABLE firm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'paralegal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(firm_id, user_id)
);

-- Indexes for RLS performance
CREATE INDEX idx_firm_users_firm_id ON firm_users USING btree (firm_id);
CREATE INDEX idx_firm_users_user_id ON firm_users USING btree (user_id);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_users ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES - PROFILES
-- =============================================================================

-- Users can view their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Users can insert their own profile (during signup)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- =============================================================================
-- RLS POLICIES - FIRM_USERS
-- =============================================================================

-- Users can view their own firm memberships
CREATE POLICY firm_users_select_own ON firm_users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can view other members of their firm
CREATE POLICY firm_users_select_firm_members ON firm_users
  FOR SELECT
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
  );

-- Users can insert their own firm membership (joining a firm)
CREATE POLICY firm_users_insert_own ON firm_users
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins can update firm members' roles
CREATE POLICY firm_users_update_admin ON firm_users
  FOR UPDATE
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid()) AND fu.role = 'admin'
    )
  );

-- Admins can delete firm members
CREATE POLICY firm_users_delete_admin ON firm_users
  FOR DELETE
  TO authenticated
  USING (
    firm_id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid()) AND fu.role = 'admin'
    )
  );

-- =============================================================================
-- RLS POLICIES - FIRMS
-- =============================================================================

-- Users can view firms they belong to
CREATE POLICY firms_select_members ON firms
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid())
    )
  );

-- Anyone authenticated can view a firm by invite_code (for joining)
CREATE POLICY firms_select_by_invite ON firms
  FOR SELECT
  TO authenticated
  USING (invite_code IS NOT NULL);

-- Authenticated users can create firms
CREATE POLICY firms_insert_authenticated ON firms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can update their firm
CREATE POLICY firms_update_admin ON firms
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT fu.firm_id 
      FROM firm_users fu 
      WHERE fu.user_id = (SELECT auth.uid()) AND fu.role = 'admin'
    )
  );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to automatically create a profile on user signup
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

-- Trigger to call handle_new_user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER firms_updated_at
  BEFORE UPDATE ON firms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

