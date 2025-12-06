# Phase 3: MVP Complete

**Status:** Not Started  
**Depends On:** Phase 2 (MVP Core)  
**Goal:** Add templates, AI chat refinement, and action history for a complete MVP

---

## Overview

This phase completes the MVP by adding firm-specific templates, AI-powered document refinement via chat interface, and comprehensive action history tracking. Users can now create reusable templates with smart variables, refine generated documents through conversation, and track all document actions.

---

## Deliverables

- [ ] Template creation and management
- [ ] Smart variable system (`{{variable_name}}`)
- [ ] AI chat interface for document refinement
- [ ] Action history logging and display
- [ ] Template selection during generation
- [ ] Role-based template permissions

---

## Features

### 3.1 Create Template Database Schema

Extend the database to support templates with variable definitions.

**Steps:**
1. Create migration for templates table with firm association
2. Add content column (JSON) for TipTap document structure
3. Add variables column (JSONB) for variable metadata
4. Create RLS policies for firm isolation
5. Add role-based policies (Admin/Attorney can edit)

**Acceptance Criteria:**
- Templates table exists with proper relationships
- RLS ensures firm isolation
- Only Admin/Attorney roles can create/edit templates
- All roles can read templates

**Schema:**
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  variables JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.2 Build Template Editor

Create the editor for authoring templates with smart variable insertion.

**Steps:**
1. Create `src/components/editor/template-editor.tsx` extending TipTap
2. Create `src/components/editor/variable-picker.tsx` for inserting variables
3. Create custom TipTap extension for variable nodes
4. Style variables to be visually distinct (e.g., highlighted pills)
5. Implement variable extraction from content

**Acceptance Criteria:**
- Editor allows standard rich text editing
- Users can insert smart variables via picker or typing `{{`
- Variables render as distinct visual elements
- Variables are preserved when saving/loading

---

### 3.3 Create Template Management Pages

Build pages for listing, creating, and editing templates.

**Steps:**
1. Create `src/app/(dashboard)/templates/page.tsx` for template list
2. Create `src/app/(dashboard)/templates/new/page.tsx` for creation
3. Create `src/app/(dashboard)/templates/[id]/page.tsx` for editing
4. Create `src/components/forms/template-form.tsx` for name/description
5. Implement role-based access (hide create button for Paralegals)

**Acceptance Criteria:**
- Template list shows all firm templates
- Admin/Attorney can create new templates
- Admin/Attorney can edit existing templates
- Paralegals can only view templates
- Empty state prompts template creation

---

### 3.4 Implement Load from Existing Letter

Allow users to create templates from existing demand letters.

**Steps:**
1. Add "Load from existing" option in template creation
2. Create modal/drawer to select from firm documents
3. Load selected document content into template editor
4. Prompt user to replace values with variables
5. Provide suggested variable replacements

**Acceptance Criteria:**
- User can select existing demand letter as template base
- Content loads into template editor
- User can manually convert text to variables
- Suggested replacements highlight potential variables

---

### 3.5 Add Template Selection to Generation

Integrate template selection into the document generation flow.

**Steps:**
1. Update `src/app/(dashboard)/letters/new/page.tsx` with template selector
2. Create `src/components/documents/template-selector.tsx`
3. Fetch templates with `useTemplates` hook
4. Pass selected template to generation API
5. Include template content in AI prompt

**Acceptance Criteria:**
- Template selection dropdown appears on generation page
- "No template" option is available for freeform generation
- Selected template structure guides AI output
- Template name is stored with document metadata

---

### 3.6 Build AI Chat Interface

Create the chat panel for iterative document refinement.

**Steps:**
1. Create `src/components/chat/chat-panel.tsx` with message list and input
2. Create `src/components/chat/chat-message.tsx` for message bubbles
3. Create `src/components/chat/chat-input.tsx` with send functionality
4. Implement chat state in Zustand store
5. Connect to refinement API

**Acceptance Criteria:**
- Chat panel displays message history
- User can type and send refinement instructions
- AI responses appear in chat
- Chat history persists during editing session
- Clear chat option available

---

### 3.7 Implement AI Refinement API

Create the backend for processing refinement requests.

**Steps:**
1. Create `src/app/api/refine/route.ts` with streaming response
2. Accept current document content and user instruction
3. Include chat history for context
4. Apply changes and return updated content
5. Stream response for real-time feedback

**Acceptance Criteria:**
- API receives document content and instruction
- Chat history provides context for refinement
- AI applies changes appropriately
- Response streams to client
- Updated content replaces editor content

---

### 3.8 Integrate Chat with Editor

Connect the chat interface to the document editor for seamless refinement.

**Steps:**
1. Update edit page layout to include chat panel
2. Create `src/stores/slices/chat-slice.ts` for chat state
3. Implement message sending with editor content
4. Update editor content when AI responds
5. Highlight or indicate changed sections

**Acceptance Criteria:**
- Chat panel appears alongside editor on edit page
- Sending instruction triggers AI refinement
- Editor updates with AI response
- Chat history shows conversation
- User can continue editing after refinement

---

### 3.9 Implement Action History

Track and display all document actions.

**Steps:**
1. Create `action_logs` table in database
2. Log actions: created, generated, edited, exported, refined
3. Create `src/components/documents/action-history.tsx`
4. Display action history on document edit page
5. Update status badge from latest action

**Acceptance Criteria:**
- All document actions are logged with timestamp
- Action history displays on edit page
- Status badge reflects latest action
- History includes actor (user who performed action)

**Schema:**
```sql
CREATE TABLE action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'generated', 'edited', 'exported', 'refined')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.10 Add Regenerate Functionality

Allow users to regenerate a document from scratch.

**Steps:**
1. Add "Regenerate" button to edit page
2. Show confirmation warning about losing changes
3. Navigate back to generation page with document context
4. Pre-populate source files from original generation
5. Create new version or replace existing

**Acceptance Criteria:**
- Regenerate button is accessible on edit page
- Confirmation dialog warns about data loss
- User is taken to generation page
- Original source files are available
- Action is logged in history

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List all templates for firm |
| POST | `/api/templates` | Create new template |
| GET | `/api/templates/[id]` | Get single template |
| PATCH | `/api/templates/[id]` | Update template |
| DELETE | `/api/templates/[id]` | Delete template |
| POST | `/api/refine` | Refine document with AI (streaming) |

---

## File Checklist

New files after this phase:

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── templates/
│   │       ├── page.tsx              # Template list
│   │       ├── new/
│   │       │   └── page.tsx          # Create template
│   │       └── [id]/
│   │           └── page.tsx          # Edit template
│   └── api/
│       ├── templates/
│       │   ├── route.ts              # List, Create
│       │   └── [id]/
│       │       └── route.ts          # Get, Update, Delete
│       └── refine/
│           └── route.ts              # AI refinement
├── components/
│   ├── chat/
│   │   ├── chat-panel.tsx
│   │   ├── chat-message.tsx
│   │   └── chat-input.tsx
│   ├── documents/
│   │   ├── template-selector.tsx
│   │   └── action-history.tsx
│   ├── editor/
│   │   ├── template-editor.tsx
│   │   └── variable-picker.tsx
│   └── forms/
│       └── template-form.tsx
├── hooks/
│   └── use-templates.ts
├── stores/
│   └── slices/
│       ├── chat-slice.ts
│       └── editor-slice.ts
└── validations/
    └── templates.ts
```

---

## Smart Variables Reference

Default variables available in templates:

| Variable | Description | Auto-populated |
|----------|-------------|----------------|
| `{{defendant_name}}` | Name of defendant | From source docs |
| `{{plaintiff_name}}` | Name of plaintiff | From source docs |
| `{{law_firm}}` | Firm name | Yes (from firm) |
| `{{lawyer_name}}` | Attorney name | Yes (from user) |
| `{{case_number}}` | Case reference | From source docs |
| `{{incident_date}}` | Date of incident | From source docs |
| `{{demand_amount}}` | Monetary demand | From source docs |
| `{{current_date}}` | Today's date | Yes (auto) |

---

## Definition of Done

- [ ] Admin/Attorney can create templates from scratch
- [ ] Admin/Attorney can create templates from existing letters
- [ ] Smart variables can be inserted and are visually distinct
- [ ] Paralegal can view and use templates
- [ ] Templates can be selected during generation
- [ ] AI uses template structure when generating
- [ ] Chat panel allows iterative refinement
- [ ] AI applies requested changes to document
- [ ] Chat history is preserved during session
- [ ] All actions are logged with timestamps
- [ ] Action history is viewable on edit page
- [ ] Status badge updates based on latest action
- [ ] User can regenerate document from edit page

