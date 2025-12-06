# Project Rules

**Project:** Demand Letter Generator  
**Organization:** Steno

---

## Overview

This document defines the coding standards, file organization, and conventions for the Demand Letter Generator project. These rules are designed to create an **AI-first codebase** that is modular, scalable, and easy for both humans and AI tools to navigate and understand.

---

## Core Principles

### 1. AI-First Development

- **Modular architecture** — Small, focused files with single responsibilities
- **Self-documenting code** — Clear naming, comprehensive comments, file headers
- **Predictable structure** — Consistent patterns that AI tools can learn and apply
- **Explicit over implicit** — Avoid magic; make dependencies and data flow obvious

### 2. File Size Limit

**Maximum 500 lines per file.** This ensures:
- Files are easily digestible by AI context windows
- Code remains focused and single-purpose
- Reviews and debugging are manageable
- Refactoring is encouraged naturally

If a file approaches 500 lines, split it into logical sub-modules.

### 3. Documentation Requirements

Every file must include:
- **File header** — Purpose, exports, dependencies
- **Function documentation** — JSDoc/TSDoc for all exported functions
- **Inline comments** — For complex logic only (not obvious code)

---

## Directory Structure

```
demand-letter-generator/
├── .github/                      # GitHub workflows and templates
│   └── workflows/
│       └── ci.yml
├── _docs/                        # Project documentation
│   ├── PRD_Steno_Demand_Letter_Generator.md
│   ├── user-flow.md
│   ├── tech-stack.md
│   └── project-rules.md
├── public/                       # Static assets
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth route group (unprotected)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          # Dashboard route group (protected)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── letters/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── templates/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                  # API Route Handlers
│   │   │   ├── auth/
│   │   │   │   └── callback/
│   │   │   │       └── route.ts
│   │   │   ├── documents/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   ├── refine/
│   │   │   │   └── route.ts
│   │   │   ├── export/
│   │   │   │   └── route.ts
│   │   │   └── templates/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   ├── loading.tsx           # Global loading state
│   │   ├── error.tsx             # Global error boundary
│   │   ├── not-found.tsx         # 404 page
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── forms/                # Form components
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   └── template-form.tsx
│   │   ├── editor/               # TipTap editor components
│   │   │   ├── demand-letter-editor.tsx
│   │   │   ├── template-editor.tsx
│   │   │   ├── editor-toolbar.tsx
│   │   │   └── variable-picker.tsx
│   │   ├── chat/                 # AI chat components
│   │   │   ├── chat-panel.tsx
│   │   │   ├── chat-message.tsx
│   │   │   └── chat-input.tsx
│   │   ├── documents/            # Document-related components
│   │   │   ├── document-list.tsx
│   │   │   ├── document-card.tsx
│   │   │   ├── document-upload.tsx
│   │   │   └── status-badge.tsx
│   │   ├── layout/               # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── nav-menu.tsx
│   │   │   └── user-menu.tsx
│   │   └── shared/               # Shared/generic components
│   │       ├── loading-spinner.tsx
│   │       ├── error-message.tsx
│   │       └── confirm-dialog.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-firm.ts
│   │   ├── use-documents.ts
│   │   ├── use-templates.ts
│   │   └── use-editor.ts
│   ├── lib/                      # Core utilities and services
│   │   ├── supabase/             # Supabase clients and utilities
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── admin.ts
│   │   ├── ai/                   # AI/LLM integration
│   │   │   ├── anthropic.ts
│   │   │   ├── prompts.ts
│   │   │   └── streaming.ts
│   │   ├── documents/            # Document processing
│   │   │   ├── parser.ts
│   │   │   ├── chunker.ts
│   │   │   └── types.ts
│   │   ├── export/               # Export utilities
│   │   │   ├── docx.ts
│   │   │   └── converter.ts
│   │   ├── storage/              # File storage utilities
│   │   │   ├── upload.ts
│   │   │   └── download.ts
│   │   ├── utils.ts              # General utilities (cn, etc.)
│   │   └── constants.ts          # App constants
│   ├── stores/                   # Zustand stores
│   │   ├── index.ts              # Combined store export
│   │   ├── slices/
│   │   │   ├── editor-slice.ts
│   │   │   ├── chat-slice.ts
│   │   │   └── ui-slice.ts
│   │   └── types.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── database.ts           # Supabase generated types
│   │   ├── api.ts                # API request/response types
│   │   ├── editor.ts             # Editor-related types
│   │   └── index.ts              # Re-exports
│   └── validations/              # Zod schemas
│       ├── auth.ts
│       ├── documents.ts
│       ├── templates.ts
│       └── index.ts
├── supabase/                     # Supabase local config
│   ├── config.toml
│   ├── migrations/               # Database migrations
│   │   ├── 00001_initial_schema.sql
│   │   └── ...
│   └── seed.sql                  # Seed data for development
├── .env.example                  # Environment variable template
├── .env.local                    # Local environment (gitignored)
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
└── README.md
```

---

## Naming Conventions

### Files and Directories

| Type | Convention | Example |
|------|------------|---------|
| **Directories** | kebab-case | `document-upload/`, `ai-chat/` |
| **React Components** | kebab-case | `document-card.tsx`, `chat-panel.tsx` |
| **Hooks** | kebab-case with `use-` prefix | `use-auth.ts`, `use-documents.ts` |
| **Utilities** | kebab-case | `parser.ts`, `streaming.ts` |
| **Types** | kebab-case | `database.ts`, `api.ts` |
| **Constants** | kebab-case | `constants.ts` |
| **Zustand Slices** | kebab-case with `-slice` suffix | `editor-slice.ts` |
| **Validations** | kebab-case | `documents.ts`, `templates.ts` |
| **API Routes** | `route.ts` in directory | `api/generate/route.ts` |
| **Page Components** | `page.tsx` in directory | `dashboard/page.tsx` |
| **Layouts** | `layout.tsx` | `(dashboard)/layout.tsx` |

### Code Identifiers

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `DocumentCard`, `ChatPanel` |
| **Functions** | camelCase | `parseDocument`, `generateLetter` |
| **Hooks** | camelCase with `use` prefix | `useAuth`, `useDocuments` |
| **Variables** | camelCase | `documentList`, `isLoading` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `API_TIMEOUT` |
| **Types/Interfaces** | PascalCase | `Document`, `TemplateFormData` |
| **Enums** | PascalCase (members too) | `UserRole.Admin` |
| **Database tables** | snake_case | `demand_letters`, `firm_users` |
| **Database columns** | snake_case | `created_at`, `firm_id` |
| **CSS classes** | kebab-case (Tailwind) | `bg-primary`, `text-muted-foreground` |

### Special Naming Rules

1. **Boolean variables** — Use `is`, `has`, `can`, `should` prefixes
   ```typescript
   const isLoading = true
   const hasPermission = user.role === 'admin'
   const canEdit = hasPermission && !isArchived
   ```

2. **Event handlers** — Use `handle` prefix or `on` for props
   ```typescript
   // Internal handler
   const handleSubmit = () => {}
   
   // Prop callback
   interface Props {
     onSubmit: () => void
     onChange: (value: string) => void
   }
   ```

3. **Async functions** — Verb-first, describe action
   ```typescript
   async function fetchDocuments() {}
   async function createTemplate() {}
   async function uploadFile() {}
   ```

---

## File Structure Standards

### File Header Template

Every file must start with a descriptive header:

```typescript
/**
 * @file document-card.tsx
 * @description Displays a single document in the document list with status badge,
 * title, and action buttons. Used in dashboard and letters pages.
 * 
 * @exports DocumentCard - Main component
 * @exports DocumentCardSkeleton - Loading skeleton variant
 */
```

### Component File Structure

```typescript
/**
 * @file chat-panel.tsx
 * @description AI chat interface for refining demand letters. Displays message
 * history and provides input for sending refinement instructions to Claude.
 * 
 * @exports ChatPanel - Main chat panel component
 */

'use client'

// 1. External imports (React, libraries)
import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'

// 2. Internal imports (components, hooks, utils)
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores'
import { cn } from '@/lib/utils'

// 3. Types (if not imported)
import type { ChatMessage } from '@/types'

// 4. Constants (file-specific)
const MAX_MESSAGE_LENGTH = 2000

// 5. Types/Interfaces (component-specific)
interface ChatPanelProps {
  /** The document ID to refine */
  documentId: string
  /** Called when document content is updated */
  onContentUpdate: (content: string) => void
  /** Additional CSS classes */
  className?: string
}

// 6. Main component
/**
 * AI chat interface for document refinement.
 * 
 * @param props - Component props
 * @param props.documentId - ID of the document being refined
 * @param props.onContentUpdate - Callback when AI updates the document
 * @param props.className - Optional CSS classes
 * 
 * @example
 * ```tsx
 * <ChatPanel
 *   documentId="123"
 *   onContentUpdate={(content) => setContent(content)}
 * />
 * ```
 */
export function ChatPanel({ 
  documentId, 
  onContentUpdate,
  className 
}: ChatPanelProps) {
  // State
  const [input, setInput] = useState('')
  
  // Store
  const messages = useAppStore((state) => state.messages)
  const addMessage = useAppStore((state) => state.addMessage)
  
  // Mutations
  const refineMutation = useMutation({
    mutationFn: async (message: string) => {
      // Implementation
    },
  })
  
  // Handlers
  const handleSubmit = useCallback(() => {
    if (!input.trim()) return
    addMessage({ role: 'user', content: input })
    refineMutation.mutate(input)
    setInput('')
  }, [input, addMessage, refineMutation])
  
  // Render
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Component JSX */}
    </div>
  )
}

// 7. Sub-components (if small, otherwise separate file)
function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div className={cn(
      'p-3 rounded-lg',
      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
    )}>
      {message.content}
    </div>
  )
}

// 8. Skeleton/Loading variant (if applicable)
/**
 * Loading skeleton for ChatPanel.
 */
export function ChatPanelSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Skeleton JSX */}
    </div>
  )
}
```

### Hook File Structure

```typescript
/**
 * @file use-documents.ts
 * @description React Query hooks for document CRUD operations.
 * Provides data fetching, caching, and mutations for demand letters.
 * 
 * @exports useDocuments - Fetch all documents for current firm
 * @exports useDocument - Fetch single document by ID
 * @exports useCreateDocument - Create new document mutation
 * @exports useUpdateDocument - Update document mutation
 * @exports useDeleteDocument - Delete document mutation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Document, CreateDocumentInput, UpdateDocumentInput } from '@/types'

// Query key factory for consistency
const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (firmId: string) => [...documentKeys.lists(), firmId] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
}

/**
 * Fetches all documents for the current firm.
 * 
 * @param firmId - The firm ID to fetch documents for
 * @returns Query result with documents array
 * 
 * @example
 * ```tsx
 * const { data: documents, isLoading } = useDocuments(firmId)
 * ```
 */
export function useDocuments(firmId: string) {
  return useQuery({
    queryKey: documentKeys.list(firmId),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('firm_id', firmId)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data as Document[]
    },
    enabled: !!firmId,
  })
}

/**
 * Fetches a single document by ID.
 * 
 * @param id - The document ID
 * @returns Query result with document data
 */
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Document
    },
    enabled: !!id,
  })
}

/**
 * Creates a new document.
 * Invalidates the documents list on success.
 */
export function useCreateDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: CreateDocumentInput) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('documents')
        .insert(input)
        .select()
        .single()
      
      if (error) throw error
      return data as Document
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}
```

### API Route Structure

```typescript
/**
 * @file route.ts (app/api/generate/route.ts)
 * @description API endpoint for generating demand letters using Claude AI.
 * Accepts document IDs and optional template, returns streamed AI response.
 * 
 * @method POST - Generate a new demand letter
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDemandLetter } from '@/lib/ai/anthropic'
import { parseDocument } from '@/lib/documents/parser'
import { GenerateRequestSchema } from '@/validations/documents'

/**
 * POST /api/generate
 * 
 * Generates a demand letter from source documents using AI.
 * 
 * @param request - Next.js request object
 * @returns Streamed AI response or error JSON
 * 
 * @example Request body:
 * ```json
 * {
 *   "documentIds": ["uuid-1", "uuid-2"],
 *   "templateId": "uuid-template" // optional
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Validate request body
    const body = await request.json()
    const parsed = GenerateRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { documentIds, templateId } = parsed.data

    // 3. Fetch documents
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .in('id', documentIds)

    if (docsError || !documents?.length) {
      return NextResponse.json(
        { error: 'Documents not found' },
        { status: 404 }
      )
    }

    // 4. Parse documents and generate
    const contents = await Promise.all(
      documents.map((doc) => parseDocument(doc.storage_path))
    )

    // 5. Stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateDemandLetter(contents.join('\n\n'))) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Utility File Structure

```typescript
/**
 * @file parser.ts
 * @description Document parsing utilities using LangChain loaders.
 * Extracts text content from PDF, DOCX, DOC, and TXT files.
 * 
 * @exports parseDocument - Parse a single document from storage
 * @exports parseDocuments - Parse multiple documents
 * @exports getSupportedMimeTypes - Get list of supported file types
 */

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'

// Types
type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/msword'
  | 'text/plain'

interface ParseResult {
  /** Extracted text content */
  content: string
  /** Document metadata */
  metadata: {
    fileName: string
    mimeType: SupportedMimeType
    pageCount: number
    charCount: number
  }
}

// Constants
const SUPPORTED_MIME_TYPES: SupportedMimeType[] = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]

/**
 * Returns the list of supported MIME types for document parsing.
 * 
 * @returns Array of supported MIME type strings
 */
export function getSupportedMimeTypes(): readonly SupportedMimeType[] {
  return SUPPORTED_MIME_TYPES
}

/**
 * Parses a document and extracts text content.
 * 
 * @param buffer - File contents as Buffer
 * @param mimeType - MIME type of the file
 * @param fileName - Original file name
 * @returns Parsed content and metadata
 * @throws Error if file type is unsupported
 * 
 * @example
 * ```ts
 * const result = await parseDocument(buffer, 'application/pdf', 'contract.pdf')
 * console.log(result.content) // Extracted text
 * ```
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: SupportedMimeType,
  fileName: string
): Promise<ParseResult> {
  // Validate mime type
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`)
  }

  const blob = new Blob([buffer], { type: mimeType })
  let loader

  // Select appropriate loader
  switch (mimeType) {
    case 'application/pdf':
      loader = new PDFLoader(blob)
      break
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      loader = new DocxLoader(blob)
      break
    case 'application/msword':
      loader = new DocxLoader(blob, { type: 'doc' })
      break
    case 'text/plain':
      return {
        content: buffer.toString('utf-8'),
        metadata: {
          fileName,
          mimeType,
          pageCount: 1,
          charCount: buffer.length,
        },
      }
    default:
      throw new Error(`No loader for type: ${mimeType}`)
  }

  const docs = await loader.load()
  const content = docs.map((d) => d.pageContent).join('\n\n')

  return {
    content,
    metadata: {
      fileName,
      mimeType,
      pageCount: docs.length,
      charCount: content.length,
    },
  }
}

/**
 * Parses multiple documents in parallel.
 * 
 * @param files - Array of file objects with buffer, mimeType, and fileName
 * @returns Array of parse results
 */
export async function parseDocuments(
  files: Array<{ buffer: Buffer; mimeType: SupportedMimeType; fileName: string }>
): Promise<ParseResult[]> {
  return Promise.all(
    files.map((file) => parseDocument(file.buffer, file.mimeType, file.fileName))
  )
}
```

---

## Import Order Convention

Organize imports in the following order, separated by blank lines:

```typescript
// 1. React imports
import { useState, useEffect, useCallback } from 'react'

// 2. Next.js imports
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 3. External library imports (alphabetical)
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 4. Internal absolute imports - components
import { Button } from '@/components/ui/button'
import { DocumentCard } from '@/components/documents/document-card'

// 5. Internal absolute imports - hooks
import { useAuth } from '@/hooks/use-auth'
import { useDocuments } from '@/hooks/use-documents'

// 6. Internal absolute imports - lib/utils
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// 7. Internal absolute imports - stores
import { useAppStore } from '@/stores'

// 8. Internal absolute imports - types
import type { Document, Template } from '@/types'

// 9. Relative imports (avoid when possible)
import { helperFunction } from './helpers'

// 10. Style imports (rare, usually just globals.css in layout)
import './component.css'
```

---

## Component Guidelines

### Server vs Client Components

```typescript
// Default: Server Component (no directive needed)
// Use for: Data fetching, static content, SEO-critical content
export default async function DocumentsPage() {
  const documents = await fetchDocuments()
  return <DocumentList documents={documents} />
}

// Client Component: Add 'use client' directive
// Use for: Interactivity, hooks, browser APIs, event handlers
'use client'

export function DocumentCard({ document }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  return (/* ... */)
}
```

### When to Use Client Components

- useState, useEffect, or other React hooks
- Event handlers (onClick, onChange, etc.)
- Browser-only APIs (localStorage, window, etc.)
- Third-party libraries that use browser APIs
- Interactive forms
- Real-time updates

### Component Size Guidelines

| Complexity | Guideline |
|------------|-----------|
| **Simple** (< 50 lines) | Single file, may include small sub-components |
| **Medium** (50-150 lines) | Single file, extract hooks if logic is reusable |
| **Complex** (150-300 lines) | Consider splitting into sub-components |
| **Very Complex** (> 300 lines) | Must split into multiple files |

---

## State Management Rules

### When to Use Each

| State Type | Tool | Use For |
|------------|------|---------|
| **Server State** | TanStack Query | API data, database records |
| **Client State** | Zustand | UI state, form state, app-wide client state |
| **Local State** | useState | Component-specific, ephemeral state |
| **URL State** | useSearchParams | Filters, pagination, shareable state |
| **Form State** | react-hook-form | Complex forms with validation |

### Zustand Store Rules

1. **Use slices pattern** for organization
2. **One store** for the entire application
3. **Granular selectors** to prevent unnecessary rerenders
4. **Action names** for devtools debugging

```typescript
// ✅ Good: Granular selector
const isDirty = useAppStore((state) => state.isDirty)

// ❌ Bad: Selects entire store
const store = useAppStore()
```

---

## API Design Rules

### Request/Response Format

```typescript
// Success response
{
  "success": true,
  "data": { /* response data */ }
}

// Error response
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE", // optional
  "details": { /* validation errors, etc. */ } // optional
}
```

### HTTP Status Codes

| Code | Use For |
|------|---------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation errors, bad request |
| 401 | Not authenticated |
| 403 | Not authorized (authenticated but forbidden) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, etc.) |
| 500 | Server error |

### Validation with Zod

Always validate request bodies:

```typescript
// validations/documents.ts
export const GenerateRequestSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1, 'At least one document required'),
  templateId: z.string().uuid().optional(),
})

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
```

---

## Database Conventions

### Table Naming

- Use **snake_case** for tables and columns
- Use **plural nouns** for table names: `documents`, `templates`, `firms`
- Include standard timestamps: `created_at`, `updated_at`
- Use `id` as primary key (UUID)

### Standard Columns

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- ... other columns
);
```

### RLS Policy Naming

Format: `{table}_{action}_{role}`

```sql
-- Examples
CREATE POLICY documents_select_authenticated ON documents FOR SELECT TO authenticated USING (...);
CREATE POLICY documents_insert_authenticated ON documents FOR INSERT TO authenticated WITH CHECK (...);
CREATE POLICY templates_update_admin_attorney ON templates FOR UPDATE TO authenticated USING (...);
```

---

## Testing Conventions

### File Naming

- Test files: `{filename}.test.ts` or `{filename}.test.tsx`
- Test location: Adjacent to source file or in `__tests__` directory

### Test Structure

```typescript
/**
 * @file document-card.test.tsx
 * @description Tests for DocumentCard component
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { DocumentCard } from './document-card'

describe('DocumentCard', () => {
  const mockDocument = {
    id: '123',
    title: 'Test Document',
    status: 'generated',
    updatedAt: new Date().toISOString(),
  }

  it('renders document title', () => {
    render(<DocumentCard document={mockDocument} />)
    expect(screen.getByText('Test Document')).toBeInTheDocument()
  })

  it('displays correct status badge', () => {
    render(<DocumentCard document={mockDocument} />)
    expect(screen.getByText('Generated')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<DocumentCard document={mockDocument} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledWith(mockDocument.id)
  })
})
```

---

## Git Conventions

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/{ticket}-{description}` | `feature/DLG-123-document-upload` |
| Bug Fix | `fix/{ticket}-{description}` | `fix/DLG-456-auth-redirect` |
| Hotfix | `hotfix/{description}` | `hotfix/critical-rls-fix` |
| Chore | `chore/{description}` | `chore/update-dependencies` |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(documents): add document upload component
fix(auth): resolve redirect loop on login
docs(readme): update setup instructions
refactor(editor): extract toolbar into separate component
```

---

## Performance Rules

### Bundle Size

- Lazy load heavy components with `dynamic()`
- Use `next/dynamic` for code splitting
- Analyze bundles regularly with `@next/bundle-analyzer`

### Data Fetching

- Prefer Server Components for initial data
- Use `staleTime` in TanStack Query to reduce refetches
- Implement proper loading states with Suspense

### Images

- Always use `next/image`
- Provide width and height to prevent layout shift
- Use appropriate `sizes` prop for responsive images

---

## Security Rules

1. **Never trust client input** — Always validate server-side
2. **Never expose secrets** — No `NEXT_PUBLIC_` prefix for sensitive values
3. **Use RLS** — Enable on all tables with user data
4. **Validate file uploads** — Check type and size server-side
5. **Use signed URLs** — Never expose storage paths directly
6. **Sanitize output** — Prevent XSS when rendering user content

---

## Checklist for New Files

Before committing a new file, verify:

- [ ] File header with description and exports
- [ ] File under 500 lines
- [ ] Follows naming conventions
- [ ] All exported functions have JSDoc comments
- [ ] Imports are properly ordered
- [ ] Types are defined or imported
- [ ] No hardcoded secrets or sensitive data
- [ ] Proper error handling
- [ ] Loading states (for components)

---

## Quick Reference

### Path Aliases

```typescript
// tsconfig.json paths
{
  "@/*": ["./src/*"]
}

// Usage
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
```

### Common Utilities

```typescript
// Class name merging
import { cn } from '@/lib/utils'
cn('base-class', condition && 'conditional-class', className)

// Date formatting
import { formatDistanceToNow } from 'date-fns'
formatDistanceToNow(new Date(timestamp), { addSuffix: true })

// Debouncing
import { useDebouncedCallback } from 'use-debounce'
const debouncedSave = useDebouncedCallback(save, 1000)
```

### Environment Variables

```bash
# Public (accessible in browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=

# Private (server-only)
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

