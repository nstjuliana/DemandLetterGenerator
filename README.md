# Demand Letter Generator

[![CI](https://github.com/nstjuliana/DemandLetterGenerator/actions/workflows/ci.yml/badge.svg)](https://github.com/nstjuliana/DemandLetterGenerator/actions/workflows/ci.yml)

AI-powered demand letter generation for law firms. Built with Next.js, Supabase, and Anthropic Claude.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Supabase
- **AI:** Anthropic Claude
- **Database:** PostgreSQL (Supabase)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/nstjuliana/DemandLetterGenerator.git
   cd DemandLetterGenerator
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local` with Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and sign in

3. Click "New Project" and import your GitHub repository

4. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)

5. Click "Deploy"

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | For admin operations |
| `ANTHROPIC_API_KEY` | Anthropic API key (server-only) | For AI features |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API route handlers
│   └── ...
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   └── utils.ts           # General utilities
└── middleware.ts          # Auth middleware
```

## License

Proprietary - Steno

