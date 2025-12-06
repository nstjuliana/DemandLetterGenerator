# Development Phases

**Project:** Demand Letter Generator  
**Organization:** Steno

---

## Overview

This directory contains the iterative development plan for the Demand Letter Generator. Each phase builds upon the previous one, progressively delivering a more complete and polished application.

---

## Phase Summary

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 0 | [Setup](./00-setup.md) | Project foundation, tooling, deployment | Not Started |
| 1 | [Foundation](./01-foundation.md) | Auth, database, navigation | Not Started |
| 2 | [MVP Core](./02-mvp-core.md) | Upload, generate, edit, export | Not Started |
| 3 | [MVP Complete](./03-mvp-complete.md) | Templates, AI chat refinement | Not Started |
| 4 | [Polish](./04-polish.md) | UX improvements, performance | Not Started |
| 5 | [Future](./05-future.md) | Advanced features, P1/P2 items | Planned |

---

## Development Timeline

```
Phase 0: Setup (1-2 days)
    │
    ▼
Phase 1: Foundation (3-5 days)
    │
    ▼
Phase 2: MVP Core (5-7 days)
    │
    ▼
Phase 3: MVP Complete (5-7 days)
    │
    ▼
Phase 4: Polish (3-5 days)
    │
    ▼
─── MVP Launch ───
    │
    ▼
Phase 5: Future (Ongoing)
```

---

## Feature Mapping

### PRD P0 (Must-Have) → Phases 2-3

| PRD Requirement | Phase | Feature |
|-----------------|-------|---------|
| Upload source documents | Phase 2 | 2.1 Document Upload |
| Generate demand letter with AI | Phase 2 | 2.4 AI Generation API |
| Firm-specific templates | Phase 3 | 3.1-3.5 Template System |
| Refine drafts with AI | Phase 3 | 3.6-3.8 AI Chat Refinement |
| Export to Word | Phase 2 | 2.8 Word Export |

### PRD P1 (Should-Have) → Phase 5

| PRD Requirement | Phase | Feature |
|-----------------|-------|---------|
| Real-time collaboration | Phase 5 | 5.1 Collaboration |
| Customizable AI prompts | Phase 5 | 5.2 Custom Prompts |

### PRD P2 (Nice-to-Have) → Phase 5

| PRD Requirement | Phase | Feature |
|-----------------|-------|---------|
| DMS integration | Phase 5 | 5.8 DMS Integration |

---

## User Flow Mapping

| User Flow | Phase | Features |
|-----------|-------|----------|
| Authentication | Phase 1 | 1.2-1.4 |
| Dashboard | Phase 1-2 | 1.5-1.6, 2.9 |
| Create Demand Letter | Phase 2 | 2.1-2.6 |
| Review/Edit Letter | Phase 2-3 | 2.5-2.7, 3.6-3.8 |
| Export Letter | Phase 2 | 2.8 |
| Create Template | Phase 3 | 3.1-3.4 |
| Manage Templates | Phase 3 | 3.3 |
| Settings | Phase 1 | 1.7 |

---

## Tech Stack by Phase

### Phase 0-1: Foundation
- Next.js 14 (App Router)
- Supabase (Auth, DB)
- Tailwind CSS + shadcn/ui

### Phase 2: MVP Core
- Anthropic Claude
- TipTap Editor
- LangChain (document parsing)
- docx (export)
- TanStack Query

### Phase 3: MVP Complete
- Zustand (state management)
- Custom TipTap extensions

### Phase 4: Polish
- Sonner (toasts)
- Performance optimizations

### Phase 5: Future
- Yjs (collaboration)
- Additional integrations

---

## Tracking Progress

Update the status in each phase document as work progresses:

| Status | Meaning |
|--------|---------|
| Not Started | Phase has not begun |
| In Progress | Currently being worked on |
| Complete | All features delivered and tested |
| Blocked | Waiting on external dependency |

Update individual feature checkboxes as they are completed.

---

## Quick Links

- [PRD](./../PRD_Steno_Demand_Letter_Generator.md)
- [User Flow](./../user-flow.md)
- [Tech Stack](./../tech-stack.md)
- [Project Rules](./../project-rules.md)

