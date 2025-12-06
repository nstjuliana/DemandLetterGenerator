# Phase 1: Foundation

**Status:** Not Started  
**Depends On:** Phase 0 (Setup)  
**Goal:** Implement authentication, database schema, and basic navigation

---

## Overview

This phase establishes the user management foundation. Users can sign up, log in, create or join firms, and navigate the protected dashboard. The database schema supports the full application but only auth-related tables are actively used.

---

## Deliverables

- [ ] Complete database schema with migrations
- [ ] User authentication (signup, login, logout)
- [ ] Firm creation and management
- [ ] Role-based access control (Admin, Attorney, Paralegal)
- [ ] Protected dashboard with navigation
- [ ] User profile and settings pages

---

## Features

### 1.1 Create Database Schema

Define all tables needed for the application with proper relationships and RLS.

**Steps:**
1. Create migration `00001_initial_schema.sql` with firms, profiles, roles tables
2. Create migration `00002_documents_schema.sql` with documents, templates tables
3. Create migration `00003_action_history.sql` with action_logs table
4. Enable Row Level Security on all tables
5. Create RLS policies for firm-based data isolation

**Acceptance Criteria:**
- All migrations apply successfully via Supabase CLI
- RLS is enabled on every table
- Foreign key relationships are properly defined

**Schema Overview:**
```sql
-- firms: Law firms that users belong to
-- profiles: Extended user data (linked to auth.users)
-- firm_users: Junction table with roles
-- documents: Demand letters
-- templates: Firm-specific templates
-- source_files: Uploaded source documents
-- action_logs: Document action history
```

---

### 1.2 Implement Signup Flow

Allow new users to create an account and either create or join a firm.

**Steps:**
1. Create `src/components/forms/signup-form.tsx` with email/password fields
2. Implement signup API using Supabase Auth
3. Create firm selection/creation step after email verification
4. Create profile record and firm_user association on completion
5. Redirect to dashboard on successful signup

**Acceptance Criteria:**
- User can sign up with email and password
- Email verification is sent (if enabled)
- User must create or join a firm before accessing dashboard
- Profile and firm association are created in database

---

### 1.3 Implement Login Flow

Allow existing users to authenticate and access the application.

**Steps:**
1. Create `src/components/forms/login-form.tsx` with email/password fields
2. Implement login using Supabase Auth `signInWithPassword`
3. Handle login errors with user-friendly messages
4. Redirect to dashboard on successful login
5. Implement "Forgot Password" link (Supabase built-in)

**Acceptance Criteria:**
- User can log in with valid credentials
- Invalid credentials show clear error message
- Successful login redirects to dashboard
- Session persists across page refreshes

---

### 1.4 Implement Auth Middleware

Protect dashboard routes and handle session management.

**Steps:**
1. Update `src/middleware.ts` to check authentication status
2. Redirect unauthenticated users to login page
3. Redirect authenticated users away from auth pages
4. Create `src/hooks/use-auth.ts` hook for auth state
5. Create `src/hooks/use-firm.ts` hook for current firm context

**Acceptance Criteria:**
- Unauthenticated users cannot access `/dashboard/*` routes
- Authenticated users are redirected from `/login` to `/dashboard`
- Auth state is accessible via `useAuth()` hook
- Current firm is accessible via `useFirm()` hook

---

### 1.5 Build Dashboard Layout

Create the main application shell with navigation and user menu.

**Steps:**
1. Create `src/components/layout/header.tsx` with logo and user menu
2. Create `src/components/layout/sidebar.tsx` with navigation links
3. Create `src/components/layout/user-menu.tsx` with profile, settings, logout
4. Update `src/app/(dashboard)/layout.tsx` to use layout components
5. Implement logout functionality

**Acceptance Criteria:**
- Dashboard has consistent header and sidebar
- Navigation links to Dashboard, Letters, Templates
- User menu shows current user and logout option
- Logout clears session and redirects to login

---

### 1.6 Create Dashboard Home Page

Build the main dashboard view with action buttons and placeholder content.

**Steps:**
1. Update `src/app/(dashboard)/dashboard/page.tsx` with layout
2. Add "Create New Template" button (Admin/Attorney only)
3. Add "Create New Demand Letter" button (all roles)
4. Add placeholder for "Recent Documents" list
5. Implement role-based visibility for buttons

**Acceptance Criteria:**
- Dashboard displays welcome message with user name
- Action buttons are visible based on user role
- Clicking buttons navigates to respective pages (placeholder for now)
- Page is responsive on mobile

---

### 1.7 Implement Settings Page

Allow users to view and update their profile.

**Steps:**
1. Create `src/app/(dashboard)/settings/page.tsx`
2. Display user profile information (name, email, role)
3. Create profile update form for editable fields
4. Show firm information (read-only for non-admins)
5. Add Admin-only section for firm management

**Acceptance Criteria:**
- User can view their profile information
- User can update their display name
- Admins can see firm management options
- Changes persist to database

---

## Database Migrations

### Migration: 00001_initial_schema.sql

```sql
-- Firms table
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Firm memberships with roles
CREATE TYPE user_role AS ENUM ('admin', 'attorney', 'paralegal');

CREATE TABLE firm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'paralegal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(firm_id, user_id)
);

-- Enable RLS
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies (firm_users governs access)
CREATE POLICY profiles_select ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_update ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY firm_users_select ON firm_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY firms_select ON firms FOR SELECT TO authenticated
  USING (id IN (SELECT firm_id FROM firm_users WHERE user_id = auth.uid()));
```

---

## File Checklist

New files after this phase:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Updated with form
│   │   ├── signup/page.tsx         # Updated with form
│   │   └── layout.tsx              # Auth layout
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx      # Updated with content
│   │   ├── settings/page.tsx       # New
│   │   └── layout.tsx              # Updated with shell
│   └── api/
│       └── auth/
│           └── callback/route.ts   # OAuth callback (if needed)
├── components/
│   ├── forms/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── profile-form.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       ├── nav-menu.tsx
│       └── user-menu.tsx
├── hooks/
│   ├── use-auth.ts
│   └── use-firm.ts
└── types/
    └── database.ts                 # Generated types
supabase/
└── migrations/
    ├── 00001_initial_schema.sql
    ├── 00002_documents_schema.sql
    └── 00003_action_history.sql
```

---

## Dependencies to Install

```bash
# Form handling
npm install react-hook-form @hookform/resolvers zod

# Date utilities (for timestamps)
npm install date-fns
```

---

## Definition of Done

- [ ] User can sign up with email/password
- [ ] User can log in and logout
- [ ] User must be associated with a firm
- [ ] Dashboard is protected and only accessible when authenticated
- [ ] Navigation works between all pages
- [ ] User role is displayed and governs UI visibility
- [ ] Settings page allows profile updates
- [ ] All database tables exist with RLS enabled
- [ ] Supabase types are generated and imported

