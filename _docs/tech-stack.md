# Technology Stack

**Project:** Demand Letter Generator  
**Organization:** Steno

---

## Overview

This document defines the technology stack for the Demand Letter Generator application. Selections are based on the requirements outlined in the PRD and user flow documents. Each section includes best practices, limitations, conventions, and common pitfalls.

---

## Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Auth & Database** | Supabase | Authentication, PostgreSQL database, Row Level Security |
| **Frontend** | Next.js | React meta-framework with SSR, routing, API routes |
| **Backend** | Next.js API Routes | Serverless API endpoints within Next.js |
| **AI/LLM** | Anthropic Claude | Document generation and chat-based refinement |
| **File Storage** | Supabase Storage | Source document uploads, generated files |
| **Rich Text Editor** | TipTap | Template and demand letter editing |
| **Document Export** | docx | Word document (.docx) generation |
| **Document Parsing** | LangChain | Multi-modal document loading and processing |
| **Styling** | Tailwind CSS + shadcn/ui | Utility CSS + accessible component library |
| **State Management** | TanStack Query + Zustand | Server state + client state management |
| **Deployment** | Vercel | Hosting, serverless functions, CI/CD |

---

## Detailed Stack Breakdown

---

### 1. Authentication & Database — Supabase

**Technology:** Supabase

- **Auth:** Email/password authentication with email verification
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Features Used:**
  - User management and session handling
  - RLS policies for firm-based data isolation
  - Real-time subscriptions (future collaboration features)

#### Best Practices

1. **Always use RLS policies** — Never rely solely on application-level security
2. **Wrap functions in SELECT for caching** — Improves RLS performance dramatically
   ```sql
   -- SLOW: Function re-evaluates for every row
   auth.uid() = user_id
   
   -- FAST: Function result is cached
   (SELECT auth.uid()) = user_id
   ```
3. **Add indexes to RLS columns** — Columns used in RLS policies should have B-tree indexes
   ```sql
   CREATE INDEX idx_documents_firm_id ON documents USING btree (firm_id);
   ```
4. **Use `TO authenticated` in policies** — Prevents anonymous users from triggering expensive RLS checks
   ```sql
   CREATE POLICY "user_access" ON documents
   FOR SELECT
   TO authenticated
   USING ((SELECT auth.uid()) = user_id);
   ```
5. **Explicit NULL checks** — Always check `auth.uid() IS NOT NULL` before comparisons
   ```sql
   USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
   ```

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Missing RLS on tables | Data exposed to all authenticated users | Enable RLS on every table with user data |
| Slow RLS queries | Functions re-evaluate per row | Wrap `auth.uid()` and custom functions in `(SELECT ...)` |
| No client-side filters | Database scans entire table | Add `.eq('firm_id', firmId)` to queries even with RLS |
| Joining tables in RLS | Slow subqueries on row columns | Use `col IN (SELECT ...)` instead of `auth.uid() IN (SELECT ... WHERE table.col)` |
| Service role key in client | Full database access exposed | Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser |

#### Limitations

- **Connection pooling:** Supabase has connection limits; use connection pooler for high-traffic apps
- **Edge function cold starts:** First invocation may have ~200ms latency
- **RLS complexity:** Very complex policies can impact query performance
- **Storage limits:** Free tier has 1GB storage; plan for scaling

#### Conventions

```typescript
// File: lib/supabase/client.ts — Browser client
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// File: lib/supabase/server.ts — Server client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

### 2. Frontend Framework — Next.js

**Technology:** Next.js 14+ (App Router)

- **Key Features:**
  - File-based routing
  - Server and Client Components
  - Built-in API routes
  - Optimized image handling
  - Middleware for auth protection

#### Best Practices

1. **Default to Server Components** — Only add `'use client'` when needed (interactivity, hooks, browser APIs)
2. **Colocate data fetching** — Fetch data in Server Components close to where it's used
3. **Use `async/await` for params** — In App Router, `params` is a Promise
   ```typescript
   export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params
     // ...
   }
   ```
4. **Streaming for slow data** — Use `loading.tsx` and Suspense for progressive rendering
5. **Image optimization** — Always use `next/image` for images; configure `remotePatterns`
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       remotePatterns: [
         { protocol: 'https', hostname: '*.supabase.co' },
       ],
     },
   }
   ```

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| `notFound()` in try/catch | Internal error gets caught, 404 doesn't render | Use `unstable_rethrow()` or restructure logic |
| Mixing client/server state | Hydration mismatches | Keep server data in Server Components; use hooks only in Client Components |
| Large client bundles | Slow initial load | Audit with `@next/bundle-analyzer`; dynamic imports for heavy libs |
| Deprecated `images.domains` | Security warnings | Use `images.remotePatterns` instead |
| Missing `loading.tsx` | Poor perceived performance | Add loading states to route segments |

#### Limitations

- **API route timeouts:** Vercel has 10s (Hobby) / 60s (Pro) limits for serverless functions
- **Edge runtime restrictions:** No Node.js APIs (fs, crypto) in Edge functions
- **Build times:** Large apps may have slow builds; use incremental adoption
- **ISR limitations:** On-demand revalidation requires proper cache configuration

#### Conventions

```
src/
├── app/
│   ├── (auth)/                    # Route group (no URL segment)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/               # Protected routes group
│   │   ├── layout.tsx             # Shared layout with auth check
│   │   ├── dashboard/page.tsx
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── letters/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           └── edit/page.tsx
│   ├── api/
│   │   ├── generate/route.ts
│   │   ├── refine/route.ts
│   │   └── export/route.ts
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── not-found.tsx              # 404 page
│   └── error.tsx                  # Error boundary
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── forms/                     # Form components
│   └── shared/                    # Shared components
├── lib/
│   ├── supabase/                  # Supabase clients
│   ├── utils.ts                   # Utility functions
│   └── validations.ts             # Zod schemas
├── hooks/                         # Custom React hooks
├── stores/                        # Zustand stores
└── types/                         # TypeScript types
```

---

### 3. Backend / API — Next.js API Routes

**Technology:** Next.js API Routes (Route Handlers)

- **Runtime:** Node.js runtime (Edge for specific routes if needed)
- **Endpoints:**
  - `/api/generate` — AI document generation
  - `/api/refine` — Chat-based document refinement
  - `/api/export` — Word document export
  - `/api/documents` — Document CRUD operations
  - `/api/templates` — Template CRUD operations

#### Best Practices

1. **Use streaming for AI responses** — Prevents timeout and improves UX
   ```typescript
   export async function POST(req: Request) {
     const stream = await anthropic.messages.stream({ ... })
     return new Response(stream.toReadableStream())
   }
   ```
2. **Validate all inputs with Zod** — Never trust client data
   ```typescript
   import { z } from 'zod'
   
   const schema = z.object({
     templateId: z.string().uuid().optional(),
     documentIds: z.array(z.string().uuid()).min(1),
   })
   ```
3. **Handle errors consistently** — Use standard error response format
4. **Set appropriate cache headers** — For static API responses
5. **Use `NextRequest` and `NextResponse`** — For enhanced functionality

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Function timeout | Long AI operations fail | Use streaming responses; background jobs for heavy tasks |
| Missing auth check | Unauthorized access | Verify session in every route handler |
| Large request bodies | 4.5MB limit on Vercel | Use direct upload to Supabase Storage |
| No rate limiting | API abuse | Implement rate limiting middleware |
| Sync heavy operations | Blocks response | Use `waitUntil()` for background tasks |

#### Limitations

- **Execution time:** 10s (Hobby) / 60s (Pro) on Vercel
- **Payload size:** 4.5MB request body limit
- **Cold starts:** ~250ms for first invocation
- **No WebSocket:** Use Supabase Realtime instead

#### Conventions

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const GenerateSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1),
  templateId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate input
    const body = await req.json()
    const parsed = GenerateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // 3. Business logic...
    
    // 4. Return response
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

### 4. AI/LLM Provider — Anthropic Claude

**Technology:** Anthropic Claude (Claude 3.5 Sonnet)

- **Model:** `claude-sonnet-4-20250514` (or latest)
- **Use Cases:**
  - Initial demand letter generation from source documents
  - Chat-based iterative refinement
  - Template variable extraction suggestions
- **Integration:** Anthropic SDK (`@anthropic-ai/sdk`)

#### Best Practices

1. **Use streaming for long responses** — Better UX and avoids timeouts
   ```typescript
   const stream = await anthropic.messages.stream({
     model: 'claude-sonnet-4-20250514',
     max_tokens: 8192,
     messages: [{ role: 'user', content: prompt }],
   })
   
   for await (const event of stream) {
     // Handle streaming chunks
   }
   ```
2. **Structured prompts with XML tags** — Claude excels at following XML-structured instructions
   ```
   <task>Generate a demand letter</task>
   <context>{{source_documents}}</context>
   <template>{{template_content}}</template>
   <instructions>
   - Use formal legal language
   - Include all facts from source documents
   - Follow the template structure
   </instructions>
   ```
3. **Role assignment in system prompt** — Improves output quality
   ```typescript
   system: "You are an expert legal writer specializing in demand letters. You have perfect attention to detail and always cite specific facts from provided documents."
   ```
4. **Request step-by-step reasoning** — For complex analysis tasks
5. **Handle context window efficiently** — Chunk large documents if needed

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Token limits exceeded | Request fails | Calculate tokens beforehand; chunk documents |
| No streaming | Timeouts on long generation | Always use streaming for generation |
| Vague prompts | Inconsistent output | Use structured XML prompts with clear instructions |
| Missing error handling | Silent failures | Catch API errors; implement retries with backoff |
| Exposing API key | Security breach | Server-side only; use environment variables |

#### Limitations

- **Context window:** 200K tokens (large but not infinite)
- **Rate limits:** Varies by tier; implement queuing for high volume
- **Output length:** 8192 tokens max per response
- **Latency:** First token ~1-2s; full response varies by length
- **Cost:** ~$3/million input tokens, ~$15/million output tokens (Sonnet)

#### Conventions

```typescript
// lib/ai/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateDemandLetter(
  sourceContent: string,
  template?: string
): AsyncGenerator<string> {
  const systemPrompt = `You are an expert legal writer specializing in demand letters. 
You write with precision, clarity, and appropriate legal formality.
Always cite specific facts from the provided source documents.`

  const userPrompt = `
<task>Generate a professional demand letter</task>

<source_documents>
${sourceContent}
</source_documents>

${template ? `<template>\n${template}\n</template>` : ''}

<instructions>
1. Extract all relevant facts from the source documents
2. ${template ? 'Follow the template structure' : 'Use standard demand letter format'}
3. Use formal legal language
4. Include specific dates, amounts, and party names
5. Be assertive but professional
</instructions>
`

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}

export async function refineDocument(
  currentContent: string,
  instruction: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
): AsyncGenerator<string> {
  const messages = [
    ...chatHistory,
    {
      role: 'user' as const,
      content: `
<current_document>
${currentContent}
</current_document>

<instruction>
${instruction}
</instruction>

Apply the instruction to improve the document. Return only the modified document.
`,
    },
  ]

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: 'You are a legal document editor. Apply requested changes precisely while maintaining document integrity.',
    messages,
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}
```

---

### 5. File Storage — Supabase Storage

**Technology:** Supabase Storage

- **Buckets:**
  - `source-documents` — Uploaded case documents (private)
  - `generated-letters` — Saved demand letters (private)
  - `exports` — Temporary export storage (private, auto-expire)
- **Access Control:** RLS policies tied to firm membership

#### Best Practices

1. **Use signed URLs for downloads** — Never expose storage paths directly
   ```typescript
   const { data } = await supabase.storage
     .from('source-documents')
     .createSignedUrl(path, 3600) // 1 hour expiry
   ```
2. **Validate file types server-side** — Don't trust client MIME types
3. **Organize by firm** — Use `{firm_id}/{document_id}` path structure
4. **Set appropriate bucket policies** — Private buckets with RLS
5. **Implement file size limits** — Prevent abuse

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Public buckets | Files accessible to anyone | Use private buckets with signed URLs |
| No path validation | Path traversal attacks | Validate and sanitize file paths |
| Large file uploads | Timeouts, memory issues | Use resumable uploads for files >6MB |
| Missing cleanup | Orphaned files accumulate | Implement cleanup jobs or lifecycle rules |
| Storing sensitive data | Compliance issues | Consider encryption at rest |

#### Limitations

- **File size:** 5GB max per file
- **Bandwidth:** Varies by plan
- **Transformations:** Limited image transformations available
- **No virus scanning:** Must implement separately if needed

#### Conventions

```typescript
// lib/storage/upload.ts
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
  'text/plain',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadSourceDocument(
  file: File,
  firmId: string,
  userId: string
) {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`)
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes`)
  }

  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = `${firmId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('source-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  // Create database record
  const { error: dbError } = await supabase.from('documents').insert({
    firm_id: firmId,
    uploaded_by: userId,
    storage_path: data.path,
    original_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  })

  if (dbError) {
    // Cleanup storage on DB failure
    await supabase.storage.from('source-documents').remove([data.path])
    throw dbError
  }

  return data
}
```

---

### 6. Rich Text Editor — TipTap

**Technology:** TipTap 2.x

- **Extensions:**
  - `@tiptap/starter-kit` — Basic formatting
  - `@tiptap/extension-placeholder` — Empty state hints
  - `@tiptap/extension-highlight` — AI change highlighting
  - `@tiptap/extension-table` — Table support
  - Custom extension for smart variable insertion

#### Best Practices

1. **Debounce saves** — Don't save on every keystroke
   ```typescript
   const debouncedSave = useDebouncedCallback((content) => {
     saveDocument(content)
   }, 1000)
   
   editor.on('update', ({ editor }) => {
     debouncedSave(editor.getJSON())
   })
   ```
2. **Cache serialization results** — Avoid redundant conversions
   ```typescript
   let markdownCache = null
   let lastJSON = null
   
   function getMarkdown() {
     const currentJSON = editor.getJSON()
     if (markdownCache && JSON.stringify(lastJSON) === JSON.stringify(currentJSON)) {
       return markdownCache
     }
     lastJSON = currentJSON
     markdownCache = editor.getMarkdown()
     return markdownCache
   }
   ```
3. **Configure undo/redo depth** — Limit history for performance
   ```typescript
   UndoRedo.configure({ depth: 100 })
   ```
4. **Process large documents in chunks** — For AI operations
5. **Use JSON format for storage** — More efficient than HTML

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Saving on every change | Performance issues, API spam | Debounce saves by 500-1000ms |
| Large document lag | Editor becomes slow | Virtualization; process in chunks |
| Lost undo history | User frustration | Persist history if needed |
| HTML storage | Larger storage, harder to query | Store as JSON; convert to HTML for export |
| No placeholder | Confusing empty state | Use placeholder extension |

#### Limitations

- **Collaborative editing:** Requires TipTap Cloud or Yjs setup
- **Complex tables:** Advanced table features need additional extensions
- **Mobile support:** Touch interactions may need customization
- **Large documents:** Performance degrades with very large content

#### Conventions

```typescript
// components/editor/DemandLetterEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { useDebouncedCallback } from 'use-debounce'

interface Props {
  initialContent?: object
  onSave: (content: object) => void
  placeholder?: string
}

export function DemandLetterEditor({ initialContent, onSave, placeholder }: Props) {
  const debouncedSave = useDebouncedCallback((json: object) => {
    onSave(json)
  }, 1000)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100 },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing your demand letter...',
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
  })

  return (
    <div className="border rounded-lg">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
```

---

### 7. Document Export — docx

**Technology:** `docx` npm package

- **Features:**
  - Programmatic Word document creation
  - Custom styles (fonts, spacing, margins)
  - Headers and footers
  - Page numbering

#### Best Practices

1. **Define reusable styles** — Consistent document formatting
   ```typescript
   const styles = {
     paragraphStyles: [
       {
         id: 'Normal',
         name: 'Normal',
         basedOn: 'Normal',
         next: 'Normal',
         run: { font: 'Times New Roman', size: 24 }, // 12pt
         paragraph: { spacing: { after: 200 } },
       },
     ],
   }
   ```
2. **Map TipTap nodes to docx elements** — Create consistent conversion
3. **Handle images properly** — Convert to base64 or buffer
4. **Add metadata** — Author, title, creation date

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Missing styles | Inconsistent formatting | Define comprehensive style set |
| Large images | Huge file sizes | Compress images before embedding |
| Complex tables | Rendering issues | Simplify table structures |
| Special characters | Encoding problems | Ensure UTF-8 handling |
| No error handling | Silent failures | Wrap in try/catch |

#### Limitations

- **No PDF export:** Need separate library (pdfkit, puppeteer)
- **Complex layouts:** Limited compared to actual Word
- **Images:** Must be embedded, not linked
- **Fonts:** System fonts only; no custom embedding

#### Conventions

```typescript
// lib/export/docx.ts
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'

interface TipTapNode {
  type: string
  content?: TipTapNode[]
  text?: string
  marks?: { type: string }[]
}

export async function convertToDocx(
  json: TipTapNode,
  metadata: { title: string; author: string }
): Promise<Buffer> {
  const children = convertNodes(json.content || [])

  const doc = new Document({
    creator: metadata.author,
    title: metadata.title,
    description: 'Generated demand letter',
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Times New Roman', size: 24 },
          paragraph: { spacing: { after: 200, line: 276 } },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: { font: 'Times New Roman', size: 32, bold: true },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

function convertNodes(nodes: TipTapNode[]): Paragraph[] {
  return nodes.flatMap((node) => {
    switch (node.type) {
      case 'paragraph':
        return new Paragraph({
          children: convertInline(node.content || []),
        })
      case 'heading':
        return new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: convertInline(node.content || []),
        })
      // ... handle other node types
      default:
        return []
    }
  })
}

function convertInline(nodes: TipTapNode[]): TextRun[] {
  return nodes.map((node) => {
    const marks = node.marks || []
    return new TextRun({
      text: node.text || '',
      bold: marks.some((m) => m.type === 'bold'),
      italics: marks.some((m) => m.type === 'italic'),
      underline: marks.some((m) => m.type === 'underline')
        ? { type: 'single' }
        : undefined,
    })
  })
}
```

---

### 8. Document Parsing — LangChain

**Technology:** LangChain.js

- **Packages:**
  - `langchain` — Core framework
  - `@langchain/community` — Document loaders
  - `pdf-parse` — PDF text extraction
  - `mammoth` — DOCX text extraction

#### Best Practices

1. **Use appropriate loader for each file type**
   ```typescript
   import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
   import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
   import { TextLoader } from 'langchain/document_loaders/fs/text'
   ```
2. **Specify metadata fields** — Track source information
3. **Handle loading errors gracefully** — Some documents may fail
4. **Use lazy loading for large files** — Process incrementally
   ```typescript
   for await (const doc of loader.lazyLoad()) {
     // Process one document at a time
   }
   ```
5. **Chunk documents for context window** — Split large documents

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Wrong loader for file type | Parse failures | Detect MIME type; use appropriate loader |
| Large PDF memory | Out of memory | Use lazy loading; process in chunks |
| Scanned PDFs | No text extracted | Use OCR-capable loader or service |
| Missing dependencies | Runtime errors | Install peer dependencies (pdf-parse, mammoth) |
| No error handling | Silent failures | Wrap in try/catch; log failures |

#### Limitations

- **OCR:** Built-in loaders don't handle scanned documents well
- **Complex layouts:** Tables, columns may not parse correctly
- **Password-protected files:** Require password handling
- **Large files:** Memory constraints on serverless

#### Conventions

```typescript
// lib/documents/parser.ts
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/msword'
  | 'text/plain'

export async function parseDocument(
  buffer: Buffer,
  mimeType: SupportedMimeType,
  fileName: string
): Promise<{ content: string; metadata: Record<string, unknown> }> {
  // Create blob from buffer
  const blob = new Blob([buffer], { type: mimeType })
  
  let loader
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
      loader = new TextLoader(blob)
      break
    default:
      throw new Error(`Unsupported file type: ${mimeType}`)
  }

  const docs = await loader.load()
  
  // Combine all pages/sections
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

export async function chunkDocument(
  content: string,
  options?: { chunkSize?: number; chunkOverlap?: number }
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options?.chunkSize ?? 4000,
    chunkOverlap: options?.chunkOverlap ?? 200,
  })

  const chunks = await splitter.splitText(content)
  return chunks
}
```

---

### 9. Styling & UI — Tailwind CSS + shadcn/ui

**Technology:** Tailwind CSS + shadcn/ui

- **Tailwind CSS:** Utility-first styling
- **shadcn/ui:** Accessible component library built on Radix UI

#### Best Practices

1. **Use CSS variables for theming** — Easy dark mode and customization
   ```css
   :root {
     --background: 0 0% 100%;
     --foreground: 222.2 84% 4.9%;
     --primary: 222.2 47.4% 11.2%;
     /* ... */
   }
   
   .dark {
     --background: 222.2 84% 4.9%;
     --foreground: 210 40% 98%;
     /* ... */
   }
   ```
2. **Use `cn()` utility for conditional classes** — Cleaner class merging
   ```typescript
   import { clsx, type ClassValue } from 'clsx'
   import { twMerge } from 'tailwind-merge'
   
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```
3. **Customize shadcn components in-place** — They're your code now
4. **Use consistent spacing scale** — Stick to Tailwind's default scale
5. **Accessibility first** — shadcn/ui components are accessible by default

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Class conflicts | Styles don't apply | Use `cn()` with `tailwind-merge` |
| Overriding component styles | Breaks accessibility | Modify the component file directly |
| Inconsistent colors | Visual inconsistency | Use CSS variables; avoid hardcoded colors |
| Missing dark mode | Poor UX | Implement `dark:` variants consistently |
| Large CSS bundle | Slow load | Configure Tailwind content paths correctly |

#### Limitations

- **Learning curve:** Utility-first is different paradigm
- **Long class strings:** Can be hard to read (use `cn()`)
- **Component updates:** Manual updates from shadcn/ui
- **Design system drift:** Easy to deviate without discipline

#### Conventions

```typescript
// components/ui/button.tsx (shadcn component with customization)
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

---

### 10. State Management — TanStack Query + Zustand

#### TanStack Query (Server State)

**Technology:** TanStack Query v5

- API data fetching and caching
- Optimistic updates for editor saves
- Background refetching
- Loading and error states

##### Best Practices

1. **Include all dependencies in queryKey** — Ensures correct caching
   ```typescript
   // ✅ Good: todoId is in the key
   useQuery({
     queryKey: ['todo', todoId],
     queryFn: () => api.getTodo(todoId),
   })
   
   // ❌ Bad: todoId not in key
   useQuery({
     queryKey: ['todo'],
     queryFn: () => api.getTodo(todoId),
   })
   ```
2. **Use `initialDataUpdatedAt` with cached initial data** — Proper staleness
   ```typescript
   useQuery({
     queryKey: ['todo', todoId],
     queryFn: () => fetchTodo(todoId),
     initialData: () => queryClient.getQueryData(['todos'])?.find(d => d.id === todoId),
     initialDataUpdatedAt: () => queryClient.getQueryState(['todos'])?.dataUpdatedAt,
   })
   ```
3. **Implement optimistic updates with rollback**
   ```typescript
   useMutation({
     mutationFn: updateTodo,
     onMutate: async (newTodo) => {
       await queryClient.cancelQueries({ queryKey: ['todos'] })
       const previous = queryClient.getQueryData(['todos'])
       queryClient.setQueryData(['todos'], old => [...old, newTodo])
       return { previous }
     },
     onError: (err, newTodo, context) => {
       queryClient.setQueryData(['todos'], context.previous)
     },
     onSettled: () => {
       queryClient.invalidateQueries({ queryKey: ['todos'] })
     },
   })
   ```
4. **Use `staleTime` appropriately** — Reduce unnecessary refetches
5. **Prefetch for navigation** — Smoother UX

##### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Missing queryKey dependencies | Stale data, wrong cache | Include all variables used in queryFn |
| Aggressive refetching | Excessive API calls | Set appropriate `staleTime` |
| No error handling | Silent failures | Use `onError` or error boundaries |
| Forgetting to invalidate | Stale data after mutations | Call `invalidateQueries` in `onSettled` |
| Too broad invalidation | Unnecessary refetches | Use specific queryKey filters |

#### Zustand (Client State)

**Technology:** Zustand v4

- Editor state (current document, dirty state)
- UI state (modals, sidebars)
- Chat history for AI refinement session

##### Best Practices

1. **Use slices pattern for organization** — Split large stores
   ```typescript
   // stores/slices/editorSlice.ts
   export const createEditorSlice = (set, get) => ({
     content: null,
     isDirty: false,
     setContent: (content) => set({ content, isDirty: true }),
     markClean: () => set({ isDirty: false }),
   })
   
   // stores/slices/chatSlice.ts
   export const createChatSlice = (set, get) => ({
     messages: [],
     addMessage: (msg) => set(state => ({ 
       messages: [...state.messages, msg] 
     })),
   })
   
   // stores/index.ts
   export const useStore = create()((...a) => ({
     ...createEditorSlice(...a),
     ...createChatSlice(...a),
   }))
   ```
2. **Wrap in `(SELECT ...)` for devtools** — Better action names
   ```typescript
   set(
     (state) => ({ bears: state.bears + 1 }),
     undefined,
     'bears/increment'
   )
   ```
3. **Use selectors to prevent rerenders** — Select specific state
   ```typescript
   // ✅ Good: Only rerenders when isDirty changes
   const isDirty = useStore(state => state.isDirty)
   
   // ❌ Bad: Rerenders on any state change
   const { isDirty } = useStore()
   ```
4. **Apply middleware at the root** — Persist, devtools, etc.

##### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Selecting entire store | Excessive rerenders | Use granular selectors |
| Middleware in slices | Unexpected behavior | Apply middleware at root only |
| Mutating state | State doesn't update | Use spread or immer |
| No devtools | Hard to debug | Add devtools middleware |
| Nested object updates | Shallow merge misses nested | Spread nested objects or use immer |

#### Conventions

```typescript
// stores/useAppStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface EditorSlice {
  documentId: string | null
  content: object | null
  isDirty: boolean
  setDocument: (id: string, content: object) => void
  updateContent: (content: object) => void
  markClean: () => void
}

interface ChatSlice {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  addMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void
  clearMessages: () => void
}

interface UISlice {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

type AppStore = EditorSlice & ChatSlice & UISlice

const createEditorSlice = (set): EditorSlice => ({
  documentId: null,
  content: null,
  isDirty: false,
  setDocument: (id, content) => 
    set({ documentId: id, content, isDirty: false }, false, 'editor/setDocument'),
  updateContent: (content) => 
    set({ content, isDirty: true }, false, 'editor/updateContent'),
  markClean: () => 
    set({ isDirty: false }, false, 'editor/markClean'),
})

const createChatSlice = (set): ChatSlice => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] }), false, 'chat/addMessage'),
  clearMessages: () => 
    set({ messages: [] }, false, 'chat/clearMessages'),
})

const createUISlice = (set): UISlice => ({
  sidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'ui/toggleSidebar'),
})

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...a) => ({
        ...createEditorSlice(...a),
        ...createChatSlice(...a),
        ...createUISlice(...a),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({ sidebarOpen: state.sidebarOpen }), // Only persist UI state
      }
    ),
    { name: 'DemandLetterApp' }
  )
)
```

---

### 11. Deployment — Vercel

**Technology:** Vercel

- **Features:**
  - Automatic deployments from Git
  - Preview deployments for PRs
  - Edge network for global performance
  - Serverless functions for API routes
  - Environment variable management

#### Best Practices

1. **Use preview deployments for testing** — Test PRs before merge
2. **Configure environment variables properly** — Different values for preview/production
3. **Set appropriate function regions** — Close to your database
4. **Monitor with Vercel Analytics** — Track performance
5. **Use ISR for semi-static content** — Balance between static and dynamic

#### Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Function timeouts | Long operations fail | Use streaming; background jobs |
| Cold starts | Slow first request | Keep functions warm; use Edge where possible |
| Env var exposure | Security issues | Never prefix secrets with `NEXT_PUBLIC_` |
| Build failures | Deployment blocked | Test builds locally first |
| Large bundles | Slow deployments | Analyze and reduce bundle size |

#### Limitations

- **Function duration:** 10s (Hobby) / 60s (Pro) / 900s (Enterprise)
- **Payload size:** 4.5MB request body
- **Build time:** 45 min (Hobby) / 45 min (Pro)
- **Edge function size:** 1MB limit

#### Conventions

```typescript
// vercel.json (optional configuration)
{
  "functions": {
    "app/api/generate/route.ts": {
      "maxDuration": 60
    },
    "app/api/export/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-only, never expose

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...  # Server-only

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Package Dependencies

### Production Dependencies
```json
{
  "next": "^14.2.0",
  "@supabase/supabase-js": "^2.45.0",
  "@supabase/ssr": "^0.5.0",
  "@anthropic-ai/sdk": "^0.27.0",
  "@tiptap/react": "^2.6.0",
  "@tiptap/starter-kit": "^2.6.0",
  "@tiptap/extension-placeholder": "^2.6.0",
  "@tiptap/extension-highlight": "^2.6.0",
  "@tiptap/extension-table": "^2.6.0",
  "docx": "^8.5.0",
  "langchain": "^0.3.0",
  "@langchain/community": "^0.3.0",
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.8.0",
  "@tanstack/react-query": "^5.56.0",
  "zustand": "^4.5.0",
  "tailwindcss": "^3.4.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.5.0",
  "@radix-ui/react-dialog": "^1.1.0",
  "@radix-ui/react-dropdown-menu": "^2.1.0",
  "@radix-ui/react-slot": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "lucide-react": "^0.441.0",
  "zod": "^3.23.0",
  "use-debounce": "^10.0.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.5.0",
  "@types/node": "^20.16.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "eslint": "^8.57.0",
  "eslint-config-next": "^14.2.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0",
  "@typescript-eslint/parser": "^8.0.0",
  "prettier": "^3.3.0",
  "prettier-plugin-tailwindcss": "^0.6.0"
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                     NEXT.JS APP                           │ │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐  │ │
│  │  │   Pages/App     │    │      API Routes             │  │ │
│  │  │   (React)       │    │  ┌─────────────────────┐    │  │ │
│  │  │                 │    │  │ /api/generate       │    │  │ │
│  │  │  • Dashboard    │    │  │ /api/refine         │    │  │ │
│  │  │  • Editor       │    │  │ /api/export         │    │  │ │
│  │  │  • Templates    │    │  │ /api/documents      │    │  │ │
│  │  │                 │    │  └─────────────────────┘    │  │ │
│  │  └────────┬────────┘    └─────────────┬───────────────┘  │ │
│  └───────────┼───────────────────────────┼───────────────────┘ │
└──────────────┼───────────────────────────┼─────────────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│       SUPABASE           │    │       ANTHROPIC          │
│  ┌────────────────────┐  │    │                          │
│  │   Auth             │  │    │   Claude API             │
│  │   PostgreSQL DB    │  │    │   • Generation           │
│  │   Storage          │  │    │   • Refinement           │
│  │   Row Level Sec.   │  │    │                          │
│  └────────────────────┘  │    └──────────────────────────┘
└──────────────────────────┘
```

---

## Security Checklist

- [ ] RLS enabled on all tables with user data
- [ ] `auth.uid() IS NOT NULL` check in all RLS policies
- [ ] Service role key only used server-side
- [ ] API routes verify authentication
- [ ] Input validation with Zod on all endpoints
- [ ] File upload type and size validation
- [ ] Signed URLs for storage access
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] No sensitive data in `NEXT_PUBLIC_*` env vars

---

## Performance Targets (from PRD)

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| HTTP Response Time | < 5 seconds | Streaming for AI; optimize queries |
| Database Queries | < 2 seconds | Indexes; RLS optimization |
| AI Generation | First token < 2s | Streaming responses |
| File Upload | Progress indicator | Resumable uploads; chunking |
| Page Load | < 3s (LCP) | Server components; image optimization |

---

## Future Considerations

- **P1 Collaboration:** TipTap has Yjs integration for real-time collaboration
- **AWS Migration:** If compliance requires (HIPAA, SOC2), can migrate to AWS Amplify + Bedrock
- **Mobile:** Next.js PWA capabilities for mobile access
- **Analytics:** Add Vercel Analytics or PostHog for usage tracking
