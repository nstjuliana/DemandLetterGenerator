# Phase 0: Setup

**Status:** Not Started  
**Goal:** Establish project foundation with a deployable "Hello World" application

---

## Overview

This phase creates the barebones project structure with all tooling configured. By the end, we'll have a running Next.js application deployed to Vercel with Supabase connected—not yet functional, but ready for feature development.

---

## Deliverables

- [ ] Next.js 14 project with TypeScript configured
- [ ] Tailwind CSS + shadcn/ui initialized
- [ ] Supabase project created and connected
- [ ] Basic authentication scaffold
- [ ] Vercel deployment pipeline
- [ ] CI/CD with GitHub Actions
- [ ] Project documentation and configuration files

---

## Features

### 0.1 Initialize Next.js Project

Create the foundational Next.js application with all required tooling.

**Steps:**
1. Run `npx create-next-app@latest` with TypeScript, Tailwind, App Router, and src directory
2. Configure path aliases in `tsconfig.json` (`@/*` → `./src/*`)
3. Set up ESLint and Prettier with project rules
4. Create `.env.example` with required environment variables
5. Initialize Git repository with `.gitignore`

**Acceptance Criteria:**
- `npm run dev` starts the application on localhost:3000
- TypeScript compilation succeeds with no errors
- ESLint passes with no warnings

---

### 0.2 Configure Tailwind CSS + shadcn/ui

Set up the styling foundation with design system components.

**Steps:**
1. Verify Tailwind CSS is configured (from create-next-app)
2. Run `npx shadcn@latest init` with New York style, Slate base color
3. Install core shadcn components: Button, Input, Card, Dialog, Dropdown Menu
4. Create `src/lib/utils.ts` with `cn()` utility function
5. Configure CSS variables for theming in `globals.css`

**Acceptance Criteria:**
- shadcn/ui Button renders correctly on homepage
- Dark mode toggle works (if configured)
- CSS variables are defined for primary, secondary, muted colors

---

### 0.3 Create Supabase Project

Set up the backend infrastructure for auth, database, and storage.

**Steps:**
1. Create new Supabase project at supabase.com
2. Enable Email/Password authentication in Supabase dashboard
3. Create storage buckets: `source-documents`, `generated-letters`
4. Copy project URL and anon key to `.env.local`
5. Install `@supabase/supabase-js` and `@supabase/ssr` packages

**Acceptance Criteria:**
- Supabase project is accessible via dashboard
- Environment variables are set and not committed to git
- Storage buckets exist and are configured as private

---

### 0.4 Implement Supabase Client Setup

Create the Supabase client utilities for browser and server usage.

**Steps:**
1. Create `src/lib/supabase/client.ts` for browser client
2. Create `src/lib/supabase/server.ts` for server component client
3. Create `src/lib/supabase/middleware.ts` for auth session refresh
4. Add middleware to `src/middleware.ts` for protected routes
5. Add file headers and JSDoc comments per project rules

**Acceptance Criteria:**
- Browser client can be imported and used in client components
- Server client works in server components and API routes
- Middleware refreshes auth session on each request

---

### 0.5 Create Basic Page Structure

Set up the initial routing structure with placeholder pages.

**Steps:**
1. Create `src/app/(auth)/login/page.tsx` with "Login" placeholder
2. Create `src/app/(auth)/signup/page.tsx` with "Signup" placeholder
3. Create `src/app/(dashboard)/dashboard/page.tsx` with "Dashboard" placeholder
4. Create `src/app/(dashboard)/layout.tsx` with basic shell
5. Update `src/app/page.tsx` as landing page with navigation to login

**Acceptance Criteria:**
- All routes are accessible and render placeholder content
- Route groups `(auth)` and `(dashboard)` are properly structured
- Navigation between pages works

---

### 0.6 Deploy to Vercel

Establish the production deployment pipeline.

**Steps:**
1. Push repository to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Trigger initial deployment
5. Verify deployment at production URL

**Acceptance Criteria:**
- Application deploys successfully to Vercel
- Production URL is accessible
- Environment variables are properly configured
- "Hello World" landing page displays

---

### 0.7 Set Up GitHub Actions CI

Create continuous integration workflow for code quality.

**Steps:**
1. Create `.github/workflows/ci.yml`
2. Configure jobs: lint, type-check, build
3. Set workflow to run on push to main and pull requests
4. Add build status badge to README
5. Test workflow with a commit

**Acceptance Criteria:**
- CI runs on every push and PR
- Build fails if TypeScript errors exist
- Build fails if ESLint errors exist

---

## File Checklist

After this phase, the following files should exist:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts
├── middleware.ts
.github/
└── workflows/
    └── ci.yml
.env.example
.env.local (gitignored)
```

---

## Dependencies to Install

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui will install these
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot
npm install lucide-react
```

---

## Environment Variables

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Definition of Done

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes
- [ ] Application is deployed to Vercel
- [ ] GitHub Actions CI is green
- [ ] All placeholder pages are accessible
- [ ] Supabase connection is verified (can be tested in browser console)

