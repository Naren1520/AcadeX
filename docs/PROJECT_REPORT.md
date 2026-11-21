# AcadeX – Academic Project Management Platform
## Project Report

---

**Author**: Naren SJ  
**Email**: narensonu1520@gmail.com  
**Phone**: +91 8296833381  
**Institution**: Sahyadri College of Engineering & Management  
**Date**: November 2026  

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Database Design](#7-database-design)
8. [Module Descriptions](#8-module-descriptions)
9. [Security Design](#9-security-design)
10. [Implementation Highlights](#10-implementation-highlights)
11. [Testing](#11-testing)
12. [Results & Screenshots Description](#12-results--screenshots-description)
13. [Conclusion](#13-conclusion)
14. [Future Work](#14-future-work)
15. [References](#15-references)

---

## 1. Abstract

AcadeX is a web-based Academic Project Management Platform developed to address the operational challenges faced by colleges in managing student academic projects. The system automates and centralizes team formation based on CGPA bands, project proposal workflows with UN Sustainable Development Goal (SDG) alignment, milestone tracking, and submission management. Built using Next.js 16, React 19, TypeScript, and Supabase (PostgreSQL), AcadeX provides three distinct role-based portals — Admin, Faculty, and Student — each with comprehensive dashboards, real-time notifications, audit trails, and secure file management. The platform enforces security at every layer through database Row-Level Security policies, server-side authorization guards, Multi-Factor Authentication, and immutable audit logs.

---

## 2. Introduction

Higher education institutions manage hundreds of student projects every academic semester. The traditional approach relies on physical documents, spreadsheets, and email threads — leading to communication gaps, delayed feedback, lost submissions, and no systematic way to track progress. Faculty spend significant manual effort forming balanced teams, reviewing proposals, and tracking deadlines across multiple sections.

AcadeX was conceived to digitize and streamline this entire lifecycle. The name combines "Academia" and "Excellence" — reflecting the goal of elevating the academic project experience for students, faculty, and administrators alike.

The platform covers every step of a project's lifecycle:

```
Institution Setup → Team Formation → Proposal Submission
       ↓                  ↓                  ↓
   Admin Portal     Faculty Rules      Faculty Review
                          ↓                  ↓
                    Student Teams      Approved/Revised
                                           ↓
                               Milestones & Submission Windows
                                           ↓
                               Student File Submissions
                                           ↓
                               Faculty Evaluation & Records
```

---

## 3. Problem Statement

Academic project management in colleges faces the following challenges:

| Problem | Impact |
|---------|--------|
| Manual team formation | Time-intensive; teams are often unbalanced in capability |
| Email-based proposal reviews | No version control; feedback gets lost; no audit history |
| No standardized SDG alignment | Projects lack connection to global development goals |
| Scattered submission management | Files emailed or submitted via drives without structure |
| No real-time progress visibility | Administrators and faculty lack dashboards for oversight |
| No role-based access control | Sensitive academic data accessible to unauthorized users |
| Missed deadlines | No automated reminders or deadline tracking system |
| No audit trail | No record of who changed what and when |

---

## 4. Objectives

1. Build a multi-role web application (Admin, Faculty, Student) with strict role-based access
2. Implement an intelligent team formation engine based on CGPA bands and slot quotas
3. Build a proposal workflow system with version control, UN SDG alignment, and state machine-enforced transitions
4. Provide milestone tracking with time-bound submission windows and secure file storage
5. Implement a comprehensive notification system (in-app + email) with retry mechanism
6. Ensure security at all layers: database (RLS), application (guards), network (HTTPS, MFA), audit (immutable logs)
7. Provide visual dashboards and analytics for each role
8. Ensure production readiness: TypeScript, testing, proper error handling, loading states

---

## 5. System Architecture

### 5.1 High-Level Architecture

AcadeX follows a **three-tier architecture** deployed on serverless infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT TIER                              │
│         React 19 (Next.js App Router)                        │
│   Admin Portal | Faculty Portal | Student Portal             │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                   APPLICATION TIER                           │
│     Next.js 16 Serverless Functions (Vercel)                 │
│  API Routes + Server Components + Authorization Guards       │
└───────────────────┬──────────────────┬──────────────────────┘
                    │                  │
         ┌──────────▼─────┐  ┌────────▼──────────┐
         │  Supabase       │  │    Resend API      │
         │  PostgreSQL 15  │  │  Transactional     │
         │  + Auth         │  │  Email             │
         │  + Storage      │  └───────────────────┘
         └─────────────────┘
```

### 5.2 Request Flow

```
1. Browser → Vercel CDN (HTTPS)
2. Next.js Edge Middleware: session cookie check → redirect if unauthenticated
3. Server Component: reads session → fetches data via Supabase server client
4. Client hydration: interactive components mounted
5. User action → fetch() to API route
6. API Route:
   a. requireRole() — verify session and role
   b. requireFacultyAssignment() — scope check for faculty
   c. Zod schema.parse() — validate input
   d. Business logic (proposal FSM, team engine)
   e. Supabase query (RLS enforced at DB)
   f. writeAuditLog() — record action
   g. sendInAppNotifications() — trigger notifications
7. JSON response → client state update
```

### 5.3 Module Structure

```
src/
├── app/           – Pages and API routes (Next.js App Router)
├── components/    – Reusable UI components
├── config/        – Navigation configuration
├── features/      – Domain modules (each has types/schemas/services)
├── hooks/         – Custom React hooks
├── lib/           – Utilities, Supabase clients, error classes
├── server/        – Server-only services (audit, auth, notifications, storage, workflows)
├── styles/        – Global CSS
└── types/         – TypeScript type definitions
```

---

## 6. Technology Stack

### 6.1 Core Technologies

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| Framework | Next.js | 16.4.6 | App Router, SSR, serverless API routes, full-stack in one repo |
| UI Library | React | 19.3.0 | Latest concurrent rendering features |
| Language | TypeScript | 5.x | End-to-end type safety from DB to UI |
| Styling | Tailwind CSS | 4.x | Utility-first; consistent design system |
| Component primitives | Radix UI | Latest | Accessible, unstyled components (Dialog, Select) |
| Backend/Database | Supabase | Latest | Managed PostgreSQL + Auth + Storage + RLS |
| Database | PostgreSQL | 15+ | Relational data model with ACID guarantees |
| Email | Resend | 6.34.1 | Modern transactional email API |
| Validation | Zod | 4.6.7 | TypeScript-first schema validation |
| Forms | React Hook Form | 7.90.0 | Performant form handling |
| Charts | Recharts | 2.15.0 | React-native chart library |
| Excel import | xlsx | 0.18.5 | Student bulk onboarding from Excel |

### 6.2 Development & Testing Tools

| Tool | Purpose |
|------|---------|
| Vitest 5.x | Unit testing (fast, Vite-native) |
| Playwright 1.64 | End-to-end browser testing |
| fast-check | Property-based testing |
| ESLint 9 | Code quality enforcement |
| TypeScript strict mode | Compile-time type checking |

### 6.3 Deployment Infrastructure

| Service | Role |
|---------|------|
| Vercel | Hosting, serverless functions, CDN, cron jobs |
| Supabase | Database, Auth, Storage, RLS |
| Resend | Transactional email |
| GitHub Actions | CI pipeline + scheduled DB backup |

---

## 7. Database Design

### 7.1 Entity Relationship Overview

The database consists of 22 tables organized around the following entity hierarchy:

```
Institution (Departments)
  └── Academic Structure (Years → Semesters → Sections)
        └── Faculty Assignments (Faculty → Sections)
              └── Students (assigned to Sections)
                    └── Team Formation Rules (per Section)
                          └── Teams (per Rule)
                                └── Proposals (per Team)
                                      └── Milestones (per Proposal)
                                            └── Submission Windows
                                                  └── Submissions
```

### 7.2 Key Design Decisions

**Decision 1: CGPA Slot System**

Instead of a single CGPA band, teams are formed using multiple slots. This ensures diversity within teams:

```
Team of 4 with 2 slots:
  Slot A: CGPA 8.0-10.0, 2 seats → "High Performers"
  Slot B: CGPA 6.0-7.9,  2 seats → "Mid Performers"
```

This encourages peer learning and mirrors industry team composition practices.

**Decision 2: Proposal State Machine**

Proposals follow a strict FSM to prevent invalid state transitions:

```
pending → {approved, rejected, revision_requested}
revision_requested → {pending}
approved → {} (terminal)
rejected → {} (terminal)
```

Enforced both in code (`applyProposalTransition()`) and implicitly via RLS (only faculty can UPDATE proposals).

**Decision 3: Immutable Audit Logs**

The `audit_logs` table has an RLS policy that only allows INSERT (via service-role), never UPDATE or DELETE. This creates a tamper-proof audit trail.

**Decision 4: Email Retry Queue**

Rather than failing silently on email send failure, AcadeX enqueues failed emails for retry with exponential backoff (30s, 60s, 120s), up to 4 attempts total.

### 7.3 Table Summary

The database contains 22 tables (28 migration files applied):

| Category | Tables |
|----------|--------|
| Identity | profiles |
| Academic Structure | departments, academic_years, semesters, sections, faculty_assignments |
| Students | students |
| Teams | team_formation_rules, team_formation_slots, teams, team_members, team_invitations, team_mentors, team_chat |
| Projects | proposals, proposal_sdgs, milestones, submission_windows, submissions |
| Communication | notifications, email_retry_queue |
| Compliance | audit_logs |

---

## 8. Module Descriptions

### 8.1 Admin Module

The Admin Portal manages the entire institutional structure.

**Key features**:
- Department CRUD with soft-disable
- Academic year lifecycle management (create → close, immutable when closed)
- Semester and section management under each year/department
- Faculty-to-section assignment and removal
- Student bulk onboarding via Excel file upload
- System-wide audit log viewer with filtering
- Analytics dashboard with 5 chart types (Recharts)

**Dashboard charts**:
1. Registration trend — area chart of new users over time
2. Proposals by status — pie chart
3. Students and faculty per department — horizontal bar chart
4. Sections per semester — bar chart
5. Team status distribution — pie chart

### 8.2 Faculty Module

Faculty interact primarily with their assigned sections.

**Key features**:
- Section dashboard with 6 tabs: Students, Teams, Proposals, Milestones, Submissions, Windows
- Team formation rule creation with CGPA slot configuration
- Proposal review queue (approve/reject/request-revision)
- Milestone creation with deadline management
- Submission window management (open/close periods)
- Mentee team dashboard — view team members, proposals, milestones, submitted files
- Section-level submission viewer grouped by team

**Proposal review workflow**:

```
Faculty opens proposal → Reads title, description, SDG selections
  → Click Approve → Proposal status: approved → notifications sent to team
  → Click Reject → Enter reason → Proposal status: rejected
  → Click Request Changes → Enter notes → Proposal status: revision_requested
                                          → Student must resubmit
```

### 8.3 Student Module

Students manage their academic project journey end-to-end.

**Key features**:
- Team formation: create or join teams based on CGPA eligibility
- Team invitation system: invite specific students by name/USN
- Proposal submission with UN SDG selection (17 goals)
- Resubmission after revision request
- Milestone timeline visualization
- File submission: PPT (.pptx/.ppt), Report (PDF), GitHub URL
- Submission viewing with signed URL access
- Profile management: CGPA, skills, GitHub URL, resume upload
- Real-time notification feed

**Dashboard components**:
- Greeting banner with team status badge or "Find a Team" call-to-action
- Stat strip: proposals submitted, milestones, pending submissions
- Donut charts for proposal and milestone status distributions
- Upcoming deadlines with urgency highlighting
- 5-step progress checklist (sequential)
- Quick action buttons

### 8.4 Notification System

Two-channel notification delivery:

**In-app notifications**:
- Stored in `notifications` table
- Displayed in real-time notification feed per user
- Unread badge on notification icon in header
- Click-through deep links to relevant pages

**Email notifications** (Resend API):
- HTML emails with personalized greeting
- Deep link back to platform
- Retry queue: up to 4 attempts (30s → 60s → 120s backoff)
- Failed emails logged in audit trail

**Notification triggers**:
- Proposal approved / rejected / revision requested
- Milestone deadline approaching (cron job, daily at 8:00 AM)
- Submission window opened / closed
- Team membership changed

### 8.5 Audit & Compliance System

Every sensitive action is logged with full context:

```typescript
await writeAuditLog({
  actorId: userId,
  actorRole: 'faculty',
  actionType: AuditEventTypes.PROPOSAL_APPROVED,
  targetTable: 'proposals',
  targetRecordId: proposalId,
  previousValue: { status: 'pending' },
  newValue: { status: 'approved' },
  ipAddress: extractedFromRequest,
  userAgent: extractedFromRequest,
});
```

40+ distinct audit event types covering all significant platform operations. Immutable by RLS policy.

### 8.6 Storage System

Secure file management via Supabase Storage:

```
Private bucket: acadex-artefacts

Upload path: {year}/{dept}/{team_id}/{milestone_id}/{type}/{filename}
Example: 2024-25/CSE/uuid-team/uuid-milestone/ppt/presentation.pptx

Access: Signed URL (5-minute expiry for submissions, 1-hour max)
Validation: MIME type + file size enforced server-side before upload
Audit: Every upload and access is logged
```

---

## 9. Security Design

AcadeX implements a defence-in-depth approach across five layers:

### Layer 1: Network

- HTTPS enforced by Vercel on all requests
- SSL/TLS certificates automatically managed
- No sensitive data in URL query parameters

### Layer 2: Authentication

- Supabase Auth with HttpOnly session cookies (no JS access)
- Session validated on every server request and API route
- MFA via TOTP for high-privilege operations
- Rate limiting: 10 login attempts / 60s per IP, 5-minute block

### Layer 3: Authorization

Three-level authorization check:

```
1. requireRole() — is the user authenticated and do they have the right role?
2. requireFacultyAssignment() — does this faculty own this section?
3. requireOwnerOrAdmin() — does this student own this resource?
```

No request proceeds to business logic without passing all applicable checks.

### Layer 4: Database

- Row-Level Security on all 22 tables
- Service-role key (bypasses RLS) used only in server-side modules
- Parameterized queries via Supabase JS client (no SQL injection risk)
- DB-level trigger prevents team overfill even if app layer is bypassed

### Layer 5: Audit

- Immutable audit logs capture every critical action
- IP address and User-Agent captured from every request
- Failed email deliveries logged
- File uploads and accesses logged (every signed URL generation)

---

## 10. Implementation Highlights

### 10.1 TypeScript End-to-End Type Safety

The database schema is reflected as TypeScript types in `src/types/database.ts`. Every Supabase query is typed through the generated Database type, eliminating entire classes of runtime errors.

### 10.2 Navigation & Loading Experience

A common problem in web applications is a blank white screen during page transitions on slow connections. AcadeX solves this with:

- **NavigationProgress**: A navy-colored progress bar (matching theme) that starts immediately when any internal link is clicked and completes when the new route renders
- **loading.tsx**: Every route has a skeleton loading screen. Next.js shows it instantly while the server fetches data
- **useTransition**: Sidebar navigation uses React transitions to prevent full component unmount during navigation
- **NetworkStatus**: A banner slides in from the top when the connection goes offline or latency exceeds 3 seconds

### 10.3 Team Formation Slot Engine

The slot-based team formation is a novel approach to balanced team composition:

```
Traditional: "CGPA must be between X and Y"

AcadeX slots: "Team needs:
  2 students with CGPA 8.0-10.0 (High)
  2 students with CGPA 6.0-7.9  (Mid)"
```

This guarantees balanced teams by design, not luck.

### 10.4 Signed URL Access Control

File access uses a two-step process:

1. `GET /api/submissions/[id]/url` — API route verifies authorization
2. Returns a 5-minute signed URL from Supabase Storage
3. Browser opens the signed URL directly
4. Every access is logged in audit trail

This means files cannot be accessed without going through the authorization layer, even if someone obtained a storage path directly.

### 10.5 Error Handling Architecture

The error system uses typed HTTP error classes:

```typescript
class AuthError extends AppError     // 401
class ForbiddenError extends AppError // 403
class NotFoundError extends AppError  // 404
class ConflictError extends AppError  // 409
class ValidationError extends AppError // 422 (with per-field details)
```

API routes catch these and return structured JSON. Client components display specific, actionable error messages — not generic "Something went wrong" text.

---

## 11. Testing

### Unit Tests (Vitest)

Three test files cover the core business logic:

| File | Tests | Coverage |
|------|-------|----------|
| `proposalStateMachine.test.ts` | FSM transitions, deadline validation | 100% of pure functions |
| `teamFormation.test.ts` | CGPA eligibility, slot validation, band checks | 100% of pure functions |
| `validation.test.ts` | Zod schema edge cases | Input boundaries |

Run with: `npx vitest run`

### Test Examples

```typescript
// FSM: rejected state is terminal
it('rejected → pending is not allowed', () => {
  const result = applyProposalTransition('rejected', 'pending');
  expect(result.success).toBe(false);
});

// Slot validation: counts must sum to team_size
it('slot counts not matching team_size fails', () => {
  const result = validateSlots(4, [
    { cgpa_lower: 8, cgpa_upper: 10, count: 3, label: 'A' },
    { cgpa_lower: 6, cgpa_upper: 7.9, count: 2, label: 'B' },
  ]);
  expect(result.valid).toBe(false); // 3+2=5 ≠ 4
});
```

### E2E Test Infrastructure

Playwright is configured for browser-based end-to-end testing. Test scenarios cover all major user flows for all three roles.

---

## 12. Results & Screenshots Description

### Admin Dashboard

The admin dashboard displays six live stat cards (Total Departments, Active Students, Faculty, Teams, Pending Proposals, Notifications) followed by five interactive charts:
- Area chart: user registrations over time
- Pie chart: proposals by status (Pending, Approved, Rejected, Revision)
- Horizontal bar: students vs faculty per department
- Bar chart: sections per semester
- Pie chart: team status distribution

All charts are built with Recharts and include empty state handling.

### Faculty Section Dashboard

A tabbed interface gives faculty a complete view of their assigned section. The Submissions tab groups uploaded files by team and milestone, with View buttons that generate 5-minute signed URLs for PPT and report files.

### Student Dashboard

A redesigned dashboard with:
- Hero banner (name, USN, team badge or find-team CTA)
- Stat strip (proposals, milestones, submissions)
- Two donut charts (proposal and milestone status)
- Upcoming deadlines list with urgency highlighting
- 5-step progress checklist
- Quick action buttons

### Student Submissions Page

When a submission window is open: drag-and-drop file zones with MIME type indicators and GitHub URL input with real-time validation.

When a window is closed with submissions: clean view-only display with View PPT / View Report buttons and GitHub link.

### Guide Pages

Each role has a comprehensive built-in guide with:
- Sidebar navigation
- Visual flow diagrams
- Step-by-step timelines
- Permission matrix tables
- Rule reference tables

---

## 13. Conclusion

AcadeX successfully addresses the core challenges of academic project management in higher education institutions. The platform delivers:

**For Administrators**: A complete view of institutional structure with real-time analytics, the ability to manage the entire academic hierarchy, and an immutable audit trail for compliance.

**For Faculty**: Efficient proposal review workflows, intelligent team formation tools, milestone management, and comprehensive submission visibility including secure file access.

**For Students**: A guided, transparent journey from team formation through proposal approval to final submission, with real-time notifications at every step.

**Technically**, the system demonstrates production-grade engineering:
- Full TypeScript type safety from database to UI
- Zero silent failures — every operation has proper error handling
- Database-level security (RLS) as the last line of defense
- Complete audit trail for all 40+ operation types
- Proper loading states, empty states, and error states throughout

The project aligns with UN Sustainable Development Goal 4 (Quality Education) by modernizing academic project management and making quality project guidance accessible to every student in the institution.

---

## 14. Future Work

| Feature | Description | Priority |
|---------|-------------|----------|
| Real-time collaboration | WebSocket-based live updates (chat, notifications) | High |
| PDF report generation | Export project summary and submission history to PDF | High |
| Mobile apps | React Native iOS/Android apps | Medium |
| AI-powered SDG suggestions | Automatically suggest SDG mappings based on proposal text | Medium |
| Plagiarism detection | Similarity check on proposal descriptions | Medium |
| Peer review system | Student evaluation of team members | Medium |
| Calendar integration | Sync milestones with Google Calendar / Outlook | Low |
| Advanced analytics | ML-based predictions on project success | Low |
| Public API | REST API for third-party integrations | Low |
| Offline support | Service Worker for limited offline access | Low |

---

## 15. References

1. Next.js Documentation — App Router, Server Components, API Routes  
   https://nextjs.org/docs

2. Supabase Documentation — PostgreSQL, Auth, Storage, RLS  
   https://supabase.com/docs

3. Zod Documentation — TypeScript-first schema validation  
   https://zod.dev

4. Resend Documentation — Transactional Email API  
   https://resend.com/docs

5. Recharts Documentation — React Chart Library  
   https://recharts.org

6. United Nations Sustainable Development Goals  
   https://sdgs.un.org/goals

7. OWASP Top 10 — Web Application Security Risks  
   https://owasp.org/www-project-top-ten/

8. Playwright Documentation — E2E Testing  
   https://playwright.dev/docs

9. Vitest Documentation — Unit Testing Framework  
   https://vitest.dev

10. React Hook Form Documentation  
    https://react-hook-form.com

11. Radix UI Documentation — Accessible UI Primitives  
    https://www.radix-ui.com

12. Tailwind CSS Documentation  
    https://tailwindcss.com/docs

---

*Report prepared by: Naren SJ*  
*Contact: narensonu1520@gmail.com | +91 8296833381*  
*Date: November 2026*
