# User Flow Document

**Project:** Demand Letter Generator  
**Organization:** Steno

---

## 1. Overview

This document defines the user journey through the Demand Letter Generator application. It outlines how users navigate between features and the permissions associated with each user role.

---

## 2. User Roles & Permissions

| Feature | Admin | Attorney | Paralegal |
|---------|-------|----------|-----------|
| View Dashboard | ✓ | ✓ | ✓ |
| View Firm Demand Letters | ✓ | ✓ | ✓ |
| Create New Demand Letter | ✓ | ✓ | ✓ |
| Edit/Review Demand Letter | ✓ | ✓ | ✓ |
| Export Demand Letter | ✓ | ✓ | ✓ |
| Create New Template | ✓ | ✓ | ✗ |
| Edit Existing Template | ✓ | ✓ | ✗ |
| Delete Template | ✓ | ✓ | ✗ |
| View/Use Templates | ✓ | ✓ | ✓ |
| Manage Firm Users | ✓ | ✗ | ✗ |
| Manage Firm Settings | ✓ | ✗ | ✗ |

---

## 3. Authentication Flow

```
[Landing Page]
      │
      ▼
[Login / Sign Up] ─── Supabase Auth
      │
      ├── New User ──► [Firm Selection / Creation]
      │                        │
      │                        ▼
      │               [Role Assignment by Admin]
      │                        │
      └── Existing User ───────┴──► [Dashboard]
```

### 3.1 New User Registration
1. User navigates to landing page
2. User clicks "Sign Up"
3. User enters email and password (Supabase Auth)
4. User receives email verification
5. User is prompted to join an existing firm (via invite code) or create a new firm
6. If creating a new firm, user becomes the Admin
7. If joining a firm, Admin assigns role (Attorney or Paralegal)
8. User is redirected to Dashboard

### 3.2 Existing User Login
1. User navigates to landing page
2. User clicks "Login"
3. User enters credentials
4. User is redirected to Dashboard

---

## 4. Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                        DASHBOARD                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────┐    ┌─────────────────────┐       │
│   │  Create New         │    │  Create New         │       │
│   │  Template           │    │  Demand Letter      │       │
│   │  (Admin/Attorney)   │    │                     │       │
│   └─────────────────────┘    └─────────────────────┘       │
│                                                             │
│   ─────────────────────────────────────────────────────    │
│                                                             │
│   Recent Firm Demand Letters                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ Letter Title    │ Status Badge      │ Last Modified │  │
│   │ Smith v. Jones  │ [Exported 12/5]   │ 2 hours ago   │  │
│   │ Doe v. Corp     │ [Edited 12/4]     │ 1 day ago     │  │
│   │ Case #12345     │ [Generated 12/3]  │ 3 days ago    │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.1 Dashboard Elements
- **Create New Template** button (visible only to Admin and Attorney)
- **Create New Demand Letter** button (visible to all roles)
- **Firm Demand Letters List** showing all demand letters belonging to the firm
  - Each entry displays:
    - Letter title/identifier
    - Status badge (last action: Generated | Edited | Exported + timestamp)
    - Last modified date
  - Clicking an entry navigates to the Review/Edit screen

---

## 5. Create New Template Flow

**Access:** Admin, Attorney only

```
[Dashboard]
      │
      ▼
[Create New Template]
      │
      ▼
[Template Editor Screen]
      │
      ├── Option A: Start from scratch
      │         │
      │         ▼
      │   [Blank Editor]
      │
      └── Option B: Load existing letter
                │
                ▼
          [Select from Firm Letters]
                │
                ▼
          [Letter content loaded into editor]
      │
      ▼
[Insert Smart Variables]
      │
      ▼
[Save Template]
      │
      ▼
[Dashboard]
```

### 5.1 Template Editor Screen
1. User clicks "Create New Template" from Dashboard
2. User is presented with two options:
   - **Start from scratch:** Opens blank template editor
   - **Load from existing letter:** Opens file picker showing firm's demand letters
3. User writes/edits template content in rich text editor
4. User inserts smart variables from a variable picker:
   - `{{defendant_name}}`
   - `{{plaintiff_name}}`
   - `{{law_firm}}`
   - `{{lawyer_name}}`
   - `{{case_number}}`
   - `{{incident_date}}`
   - `{{demand_amount}}`
   - (Additional variables as needed)
5. User enters template name and optional description
6. User clicks "Save Template"
7. User is returned to Dashboard (or can continue editing)

### 5.2 Edit Existing Template
1. User navigates to Templates list (accessible from Dashboard or navigation)
2. User selects a template to edit
3. Template loads in Template Editor Screen
4. User makes changes
5. User saves template

---

## 6. Create New Demand Letter Flow

**Access:** All roles

```
[Dashboard]
      │
      ▼
[Create New Demand Letter]
      │
      ▼
┌─────────────────────────────────────────┐
│     DEMAND LETTER GENERATION SCREEN     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Upload Source Documents       │   │
│  │   (Multi-file upload)           │   │
│  │   [Drag & drop or browse]       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Select Template (Optional)    │   │
│  │   [Dropdown / Search]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│           [Generate Letter]             │
│                                         │
└─────────────────────────────────────────┘
      │
      ▼
[AI Processing / Loading State]
      │
      ▼
[Review/Edit Screen]
```

### 6.1 Generation Screen Elements
1. **Source Document Upload Area**
   - Supports multiple file uploads
   - Multi-modal support (various document types)
   - Displays list of uploaded files with remove option
   - Shows upload progress and validation status

2. **Template Selection (Optional)**
   - Dropdown or searchable list of firm templates
   - Preview option to see template before selecting
   - "No Template" option for freeform generation

3. **Generate Button**
   - Disabled until at least one source document is uploaded
   - Clicking initiates AI generation process

### 6.2 Generation Process
1. User clicks "Create New Demand Letter" from Dashboard
2. User uploads one or more source documents
3. User optionally selects a template
4. User clicks "Generate Letter"
5. Loading state displays while AI processes documents
6. Upon completion, user is redirected to Review/Edit Screen
7. Action history logs: `Generated` with timestamp

---

## 7. Review/Edit Demand Letter Flow

**Access:** All roles

```
┌───────────────────────────────────────────────────────────────────┐
│                    REVIEW/EDIT SCREEN                             │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐                                          │
│  │ Status Badge        │  Letter Title                            │
│  │ [Generated 12/6]    │  ─────────────────────────               │
│  └─────────────────────┘                                          │
│                                                                   │
│  ┌─────────────────────────────────┬─────────────────────────┐   │
│  │                                 │                         │   │
│  │   DOCUMENT EDITOR               │   AI CHAT ASSISTANT     │   │
│  │                                 │                         │   │
│  │   [Rich text editor with        │   [Chat interface]      │   │
│  │    generated demand letter]     │                         │   │
│  │                                 │   "Make the tone more   │   │
│  │                                 │    formal in para 3"    │   │
│  │                                 │                         │   │
│  │                                 │   "Add more details     │   │
│  │                                 │    about damages"       │   │
│  │                                 │                         │   │
│  │                                 │   [Message input]       │   │
│  │                                 │                         │   │
│  └─────────────────────────────────┴─────────────────────────┘   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │ Save Draft   │  │ Regenerate   │  │ Export to Word       │    │
│  └──────────────┘  └──────────────┘  └──────────────────────┘    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 7.1 Review/Edit Screen Elements

1. **Header Section**
   - Letter title (editable)
   - Status badge showing last action (Generated | Edited | Exported) with timestamp

2. **Document Editor (Left Panel)**
   - Rich text editor displaying generated demand letter
   - Standard formatting tools (bold, italic, headers, lists, etc.)
   - Manual editing capabilities

3. **AI Chat Assistant (Right Panel)**
   - Chat-style interface for iterative refinement
   - User can send instructions to modify the letter
   - AI applies changes to the document
   - Chat history preserved for context

4. **Action Buttons**
   - **Save Draft:** Saves current state without exporting
     - Logs action: `Edited` with timestamp
   - **Regenerate:** Returns to Generation Screen to start fresh
     - Prompts user to confirm (unsaved changes will be lost)
   - **Export to Word:** Exports document as .docx file
     - Logs action: `Exported` with timestamp

### 7.2 AI Chat Refinement Flow
1. User views generated letter in editor
2. User types instruction in chat (e.g., "Make paragraph 2 more assertive")
3. AI processes request and updates document
4. Changes are highlighted/visible in editor
5. User can continue sending refinement requests
6. User can also manually edit document directly
7. User saves draft or exports when satisfied

### 7.3 Regenerate Flow
1. User clicks "Regenerate"
2. Confirmation modal appears: "Start a new generation? Current changes will be lost."
3. If confirmed, user is returned to Generation Screen
4. Previous source documents and template selection are cleared

---

## 8. Export Flow

**Access:** All roles

```
[Review/Edit Screen]
      │
      ▼
[Export to Word]
      │
      ▼
[Export Options Modal]
      │
      ├── Filename input
      │
      └── Export button
      │
      ▼
[.docx file downloaded]
      │
      ▼
[Action logged: Exported]
      │
      ▼
[Return to Review/Edit Screen]
```

### 8.1 Export Process
1. User clicks "Export to Word" on Review/Edit Screen
2. Export options modal appears
   - User can customize filename
3. User clicks "Export"
4. System generates .docx file
5. File downloads to user's device
6. Action history logs: `Exported` with timestamp
7. User remains on Review/Edit Screen (can continue editing or return to Dashboard)

---

## 9. View Firm Demand Letters Flow

**Access:** All roles

```
[Dashboard]
      │
      ▼
[Click on Demand Letter from list]
      │
      ▼
[Review/Edit Screen for selected letter]
```

### 9.1 Firm Documents List
- Displays all demand letters belonging to the firm
- Sortable by date, title, status
- Searchable/filterable
- Each entry shows:
  - Letter title
  - Status badge (last action + timestamp)
  - Created by (user name)
  - Last modified date

### 9.2 Viewing a Letter
1. User clicks on a letter from the Dashboard list
2. Letter opens in Review/Edit Screen
3. User can view, edit, refine with AI, or export

---

## 10. Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER / NAVIGATION BAR                                    │
├─────────────────────────────────────────────────────────────┤
│  [Logo]   Dashboard   Templates   [User Menu ▼]             │
│                                    ├── Profile              │
│                                    ├── Firm Settings*       │
│                                    └── Logout               │
└─────────────────────────────────────────────────────────────┘

* Firm Settings visible to Admin only
```

### 10.1 Primary Navigation
- **Dashboard:** Home screen with action buttons and firm letters list
- **Templates:** List of firm templates (Admin/Attorney can edit; Paralegal can view)
- **User Menu:** Profile, Firm Settings (Admin only), Logout

---

## 11. Action History & Status Badges

Each demand letter maintains an action history log. The most recent action is displayed as a status badge.

### 11.1 Action Types
| Action | Triggered By | Badge Display |
|--------|--------------|---------------|
| Generated | AI completes initial generation | `Generated [timestamp]` |
| Edited | User saves draft after making changes | `Edited [timestamp]` |
| Exported | User exports to Word | `Exported [timestamp]` |

### 11.2 Badge Display Locations
- Dashboard demand letters list
- Review/Edit Screen header

---

## 12. Screen Summary

| Screen | Access | Description |
|--------|--------|-------------|
| Landing Page | Public | Login/Sign Up entry point |
| Dashboard | Authenticated | Home screen with actions and firm letters |
| Generation Screen | Authenticated | Upload documents, select template, generate |
| Review/Edit Screen | Authenticated | View, edit, AI refine, export demand letter |
| Template Editor | Admin, Attorney | Create and edit templates with smart variables |
| Templates List | Authenticated | View all firm templates |
| Firm Settings | Admin | Manage firm users and settings |

---

## 13. Flow Diagram Summary

```
                              ┌─────────────┐
                              │  Landing    │
                              │   Page      │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │   Login/    │
                              │  Sign Up    │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │  Dashboard  │◄─────────────────────┐
                              └──────┬──────┘                      │
                                     │                             │
                 ┌───────────────────┼───────────────────┐         │
                 │                   │                   │         │
          ┌──────▼──────┐     ┌──────▼──────┐    ┌──────▼──────┐  │
          │  Create     │     │  Create     │    │  View       │  │
          │  Template   │     │  Demand     │    │  Existing   │  │
          │             │     │  Letter     │    │  Letter     │  │
          └──────┬──────┘     └──────┬──────┘    └──────┬──────┘  │
                 │                   │                   │         │
          ┌──────▼──────┐     ┌──────▼──────┐           │         │
          │  Template   │     │ Generation  │           │         │
          │  Editor     │     │  Screen     │           │         │
          └──────┬──────┘     └──────┬──────┘           │         │
                 │                   │                   │         │
                 │            ┌──────▼──────┐           │         │
                 │            │  Review/    │◄──────────┘         │
                 │            │  Edit       │                      │
                 │            └──────┬──────┘                      │
                 │                   │                             │
                 │            ┌──────▼──────┐                      │
                 │            │  Export     │                      │
                 │            └──────┬──────┘                      │
                 │                   │                             │
                 └───────────────────┴─────────────────────────────┘
```

---

## 14. Smart Variables Reference

Available smart variables for templates:

| Variable | Description |
|----------|-------------|
| `{{defendant_name}}` | Name of the defendant |
| `{{plaintiff_name}}` | Name of the plaintiff |
| `{{law_firm}}` | Name of the law firm |
| `{{lawyer_name}}` | Name of the attorney |
| `{{case_number}}` | Case reference number |
| `{{incident_date}}` | Date of the incident |
| `{{demand_amount}}` | Monetary demand amount |
| `{{defendant_address}}` | Defendant's address |
| `{{plaintiff_address}}` | Plaintiff's address |
| `{{court_name}}` | Name of the court |
| `{{filing_deadline}}` | Deadline for filing |
| `{{current_date}}` | Auto-populated current date |

*Additional variables can be added based on firm requirements.*

