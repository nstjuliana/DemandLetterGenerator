# Phase 2: MVP Core

**Status:** Not Started  
**Depends On:** Phase 1 (Foundation)  
**Goal:** Implement core document workflow: upload, generate, edit, and export

---

## Overview

This phase delivers the primary value of the application. Users can upload source documents, generate demand letters using AI, edit the generated content, and export to Word format. This is a functional MVP that delivers on the core promise.

---

## Deliverables

- [ ] Document upload with multi-file support
- [ ] AI-powered demand letter generation
- [ ] Rich text editor for viewing and editing
- [ ] Export to Word (.docx) format
- [ ] Document list on dashboard
- [ ] Basic document management (view, delete)

---

## Features

### 2.1 Implement Document Upload

Allow users to upload source documents for demand letter generation.

**Steps:**
1. Create `src/components/documents/document-upload.tsx` with drag-and-drop
2. Create `src/lib/storage/upload.ts` with file validation and Supabase upload
3. Create `src/app/api/documents/route.ts` for document metadata CRUD
4. Store file in Supabase Storage with firm-scoped path
5. Create database record linking storage path to document metadata

**Acceptance Criteria:**
- Users can upload PDF, DOCX, DOC, TXT files
- Files are validated for type and size (max 10MB)
- Upload progress is displayed
- Multiple files can be uploaded at once
- Files are stored with firm isolation

---

### 2.2 Implement Document Parsing

Extract text content from uploaded documents for AI processing.

**Steps:**
1. Create `src/lib/documents/parser.ts` with LangChain loaders
2. Install `pdf-parse` and `mammoth` dependencies
3. Implement file type detection and appropriate loader selection
4. Return parsed content with metadata (page count, char count)
5. Handle parsing errors gracefully with user feedback

**Acceptance Criteria:**
- PDF files are parsed and text is extracted
- DOCX/DOC files are parsed correctly
- TXT files are read directly
- Parsing errors show helpful messages
- Large documents are handled without timeout

---

### 2.3 Build Generation Screen

Create the UI for document upload and generation initiation.

**Steps:**
1. Create `src/app/(dashboard)/letters/new/page.tsx`
2. Add document upload area with file list display
3. Add optional template selector (placeholder for Phase 3)
4. Add "Generate" button with loading state
5. Navigate to edit page on successful generation

**Acceptance Criteria:**
- User can upload multiple source documents
- Uploaded files are displayed with remove option
- Generate button is disabled until files are uploaded
- Loading state shows during AI generation
- User is redirected to edit page after generation

---

### 2.4 Implement AI Generation API

Create the backend endpoint for generating demand letters.

**Steps:**
1. Create `src/lib/ai/anthropic.ts` with Claude client setup
2. Create `src/lib/ai/prompts.ts` with demand letter generation prompt
3. Create `src/app/api/generate/route.ts` with streaming response
4. Fetch and parse source documents before sending to AI
5. Stream AI response back to client

**Acceptance Criteria:**
- API authenticates user and validates request
- Source documents are fetched from storage
- Documents are parsed and combined for AI context
- AI generates demand letter with streaming
- Response streams to client in real-time

---

### 2.5 Build Rich Text Editor

Implement the TipTap editor for viewing and editing demand letters.

**Steps:**
1. Install TipTap packages (`@tiptap/react`, `@tiptap/starter-kit`, extensions)
2. Create `src/components/editor/demand-letter-editor.tsx`
3. Create `src/components/editor/editor-toolbar.tsx` with formatting buttons
4. Implement content state management with debounced saving
5. Style editor to match legal document appearance

**Acceptance Criteria:**
- Editor displays generated content with formatting
- User can edit text with standard formatting (bold, italic, etc.)
- Changes are auto-saved after debounce period
- Editor is responsive and usable on different screen sizes

---

### 2.6 Create Document Edit Page

Build the review/edit interface for generated demand letters.

**Steps:**
1. Create `src/app/(dashboard)/letters/[id]/edit/page.tsx`
2. Fetch document content from database
3. Display TipTap editor with document content
4. Add header with document title and status badge
5. Add action buttons: Save, Export, Delete

**Acceptance Criteria:**
- Page loads document content into editor
- Status badge shows current state (Generated, Edited, Exported)
- Save button persists changes to database
- User can navigate back to dashboard

---

### 2.7 Implement Document Saving

Persist document changes to the database.

**Steps:**
1. Create `src/hooks/use-documents.ts` with TanStack Query hooks
2. Implement `useUpdateDocument` mutation for saving content
3. Create `src/app/api/documents/[id]/route.ts` for updates
4. Track last action (generated, edited, exported) with timestamp
5. Implement optimistic updates for better UX

**Acceptance Criteria:**
- Document content saves to database
- Last action updates on save (edited + timestamp)
- Save indicator shows success/failure
- Content persists across page refreshes

---

### 2.8 Implement Word Export

Allow users to export demand letters as Word documents.

**Steps:**
1. Install `docx` package
2. Create `src/lib/export/docx.ts` with document conversion
3. Create `src/lib/export/converter.ts` to map TipTap JSON to docx
4. Create `src/app/api/export/route.ts` endpoint
5. Trigger browser download on successful generation

**Acceptance Criteria:**
- Export button generates .docx file
- Document retains formatting (headers, bold, italic)
- File downloads with appropriate filename
- Last action updates on export
- Export works with documents of varying length

---

### 2.9 Build Document List

Display all firm documents on the dashboard.

**Steps:**
1. Create `src/components/documents/document-list.tsx`
2. Create `src/components/documents/document-card.tsx` with status badge
3. Create `src/components/documents/status-badge.tsx`
4. Implement document fetching with `useDocuments` hook
5. Add click handler to navigate to edit page

**Acceptance Criteria:**
- Dashboard shows list of all firm documents
- Each document displays title, status, last modified
- Clicking a document navigates to edit page
- Empty state shows when no documents exist
- List updates when new document is created

---

### 2.10 Implement Document Deletion

Allow users to delete documents they no longer need.

**Steps:**
1. Create `src/components/shared/confirm-dialog.tsx`
2. Add delete button to document card and edit page
3. Implement `useDeleteDocument` mutation
4. Delete storage files and database record
5. Show confirmation before deletion

**Acceptance Criteria:**
- Delete requires confirmation
- Deletion removes database record and storage files
- Document list updates after deletion
- User is redirected to dashboard if on edit page

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List all documents for firm |
| POST | `/api/documents` | Create document metadata |
| GET | `/api/documents/[id]` | Get single document |
| PATCH | `/api/documents/[id]` | Update document content |
| DELETE | `/api/documents/[id]` | Delete document |
| POST | `/api/generate` | Generate demand letter (streaming) |
| POST | `/api/export` | Export document to Word |

---

## File Checklist

New files after this phase:

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── letters/
│   │       ├── page.tsx              # Letters list
│   │       ├── new/
│   │       │   └── page.tsx          # Generation screen
│   │       └── [id]/
│   │           ├── page.tsx          # View document
│   │           └── edit/
│   │               └── page.tsx      # Edit document
│   └── api/
│       ├── documents/
│       │   ├── route.ts              # List, Create
│       │   └── [id]/
│       │       └── route.ts          # Get, Update, Delete
│       ├── generate/
│       │   └── route.ts              # AI generation
│       └── export/
│           └── route.ts              # Word export
├── components/
│   ├── documents/
│   │   ├── document-list.tsx
│   │   ├── document-card.tsx
│   │   ├── document-upload.tsx
│   │   └── status-badge.tsx
│   ├── editor/
│   │   ├── demand-letter-editor.tsx
│   │   └── editor-toolbar.tsx
│   └── shared/
│       ├── confirm-dialog.tsx
│       └── loading-spinner.tsx
├── hooks/
│   └── use-documents.ts
├── lib/
│   ├── ai/
│   │   ├── anthropic.ts
│   │   ├── prompts.ts
│   │   └── streaming.ts
│   ├── documents/
│   │   ├── parser.ts
│   │   └── types.ts
│   ├── export/
│   │   ├── docx.ts
│   │   └── converter.ts
│   └── storage/
│       ├── upload.ts
│       └── download.ts
└── validations/
    └── documents.ts
```

---

## Dependencies to Install

```bash
# AI
npm install @anthropic-ai/sdk

# Document parsing
npm install langchain @langchain/community pdf-parse mammoth

# Rich text editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-highlight

# Word export
npm install docx

# State management
npm install @tanstack/react-query zustand

# Utilities
npm install use-debounce
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Anthropic (server-only)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

---

## Definition of Done

- [ ] User can upload source documents (PDF, DOCX, TXT)
- [ ] User can generate demand letter from uploaded documents
- [ ] AI generation streams to the client
- [ ] User can view and edit generated letter in rich text editor
- [ ] User can save edits to database
- [ ] User can export letter to Word format
- [ ] Dashboard displays list of all firm documents
- [ ] Documents show status badge (Generated/Edited/Exported)
- [ ] User can delete documents
- [ ] All API endpoints are authenticated and validated

