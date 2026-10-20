# AcadeX — College Academic Project Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-Schema%20Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit%20Testing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Testing-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Resend](https://img.shields.io/badge/Resend-Transactional%20Email-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## Overview

**AcadeX** is an enterprise-grade, institutional Academic Project Management Platform designed for colleges and universities. It centralizes academic project lifecycles, rule-driven team formations based on CGPA bands, UN Sustainable Development Goal (SDG) mappings, multi-stage proposal workflows, milestone deliverables, and strict role-based access control (RBAC).

---

## Author & Contact

| Field | Details |
|---|---|
| **Author** | **Naren SJ** |
| **Email** | [narensonu1520@gmail.com](mailto:narensonu1520@gmail.com) |
| **Phone** | [+91 8296833381](tel:+918296833381) |

---

## Tech Stack

### Core Technologies & Frameworks
| Category | Technology Badges |
|---|---|
| **Framework & Runtime** | ![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=flat-square&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React%2019-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Node.js](https://img.shields.io/badge/Node.js%2020+-339933?style=flat-square&logo=nodedotjs&logoColor=white) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript%205-007ACC?style=flat-square&logo=typescript&logoColor=white) |
| **Styling & Components** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?style=flat-square&logo=radix-ui&logoColor=white) |
| **Backend & Database** | ![Supabase](https://img.shields.io/badge/Supabase%20Client%20%26%20SSR-3ECF8E?style=flat-square&logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white) |
| **Validation & Forms** | ![Zod](https://img.shields.io/badge/Zod%20Validation-3E67B1?style=flat-square&logo=zod&logoColor=white) ![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white) |
| **Communication** | ![Resend](https://img.shields.io/badge/Resend%20API-000000?style=flat-square&logo=resend&logoColor=white) |
| **Quality & Testing** | ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white) ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |

---

## Core System Architecture & Features

- **Role-Based Access Control (RBAC) & Security**:
  - Three distinct server-enforced roles: `Admin`, `Faculty`, and `Student`.
  - Database Row-Level Security (RLS) policies on all tables (`019_rls_policies.sql`).
  - Multi-Factor Authentication (MFA) enforcement for administrative privileges.
  - Rate-limited authentication endpoints (IP window protection).

- **Academic Hierarchy Management**:
  - Departments, Academic Years, Semesters, Sections, and Faculty Assignment mapping.
  - Lifecycle controls (closing academic years/semesters while maintaining immutable audit history).

- **Team Formation Engine**:
  - Faculty-configured rules: minimum/maximum team sizes, CGPA bands, and quota limits.
  - Automated validation preventing non-compliant student team formations.

- **Project Proposals & UN SDG Mapping**:
  - Proposal state machine (`Draft` $\rightarrow$ `Pending Review` $\rightarrow$ `Approved` / `Changes Requested` / `Rejected`).
  - Mandatory alignment with United Nations 17 Sustainable Development Goals (SDGs).

- **Submissions & Milestone Tracking**:
  - Controlled faculty submission windows for artifacts: Presentations (PPT), Project Reports (PDF), and GitHub repository URLs.
  - Private Supabase Storage buckets accessible via short-lived, signed URLs.

- **Auditing & Notification Pipeline**:
  - In-app alerts, cron deadline reminders, and an asynchronous email retry queue.
  - Immutable audit logs capturing every critical system action.

---

## Repository Folder Structure

```text
AcadeX/
|-- .env.example
|-- .env.local
|-- .gitignore
|-- eslint.config.mjs
|-- next-env.d.ts
|-- next.config.ts
|-- package-lock.json
|-- package.json
|-- README.md
|-- tsconfig.json
|-- tsconfig.tsbuildinfo
|-- vercel.json
|-- vitest.config.ts
|-- .github/
|   |-- workflows/
|   |   |-- db-backup.yml
|-- .kiro/
|   |-- specs/
|   |   |-- acadex-platform/
|   |   |   |-- .config.kiro
|   |   |   |-- design.md
|   |   |   |-- requirements.md
|   |   |   |-- tasks.md
|-- .vscode/
|   |-- settings.json
|-- docs/
|   |-- .gitkeep
|   |-- CONTRIBUTING.md
|   |-- recovery-runbook.md
|-- public/
|   |-- icons/
|   |   |-- .gitkeep
|   |-- images/
|   |   |-- .gitkeep
|-- scripts/
|   |-- .gitkeep
|   |-- pre-migration-check.sh
|-- src/
|   |-- middleware.ts
|   |-- app/
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   |-- not-found.tsx
|   |   |-- (auth)/
|   |   |   |-- auth/
|   |   |   |   |-- callback/
|   |   |   |   |   |-- .gitkeep
|   |   |   |   |   |-- route.ts
|   |   |   |-- forgot-password/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- page.tsx
|   |   |   |-- login/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- page.tsx
|   |   |   |-- mfa/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- page.tsx
|   |   |-- (portal)/
|   |   |   |-- layout.tsx
|   |   |   |-- admin/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- page.tsx
|   |   |   |   |-- audit-logs/
|   |   |   |   |   |-- AuditLogsClient.tsx
|   |   |   |   |   |-- loading.tsx
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- departments/
|   |   |   |   |   |-- DepartmentsClient.tsx
|   |   |   |   |   |-- loading.tsx
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- notifications/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- students/
|   |   |   |   |   |-- page.tsx
|   |   |   |-- faculty/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- page.tsx
|   |   |   |   |-- milestones/
|   |   |   |   |   |-- FacultyMilestonesClient.tsx
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- notifications/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- proposals/
|   |   |   |   |   |-- FacultyProposalsClient.tsx
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- students/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- submission-windows/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   |-- SubmissionWindowsClient.tsx
|   |   |   |   |-- team-formation/
|   |   |   |   |   |-- loading.tsx
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   |-- TeamFormationRulesClient.tsx
|   |   |   |-- student/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- page.tsx
|   |   |   |   |-- milestones/
|   |   |   |   |   |-- MilestoneTimeline.tsx
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- notifications/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |-- profile/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   |-- StudentProfileClient.tsx
|   |   |   |   |-- proposals/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   |-- StudentProposalsClient.tsx
|   |   |   |   |-- submissions/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   |-- SubmissionsClient.tsx
|   |   |   |   |-- teams/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   |-- TeamsClient.tsx
|   |   |-- (public)/
|   |   |   |-- page.tsx
|   |   |   |-- about/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- page.tsx
|   |   |   |-- academics/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- page.tsx
|   |   |-- api/
|   |   |   |-- .gitkeep
|   |   |   |-- admin/
|   |   |   |   |-- academic-years/
|   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- [id]/
|   |   |   |   |   |   |-- close/
|   |   |   |   |   |   |   |-- route.ts
|   |   |   |   |-- audit-logs/
|   |   |   |   |   |-- route.ts
|   |   |   |   |-- departments/
|   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- [id]/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |-- faculty-assignments/
|   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- [id]/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |-- sections/
|   |   |   |   |   |-- route.ts
|   |   |   |   |-- semesters/
|   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- [id]/
|   |   |   |   |   |   |-- close/
|   |   |   |   |   |   |   |-- route.ts
|   |   |   |-- auth/
|   |   |   |   |-- login/
|   |   |   |   |   |-- route.ts
|   |   |   |   |-- logout/
|   |   |   |   |   |-- route.ts
|   |   |   |   |-- mfa/
|   |   |   |   |   |-- verify/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |-- session/
|   |   |   |   |   |-- route.ts
|   |   |   |-- cron/
|   |   |   |   |-- deadline-reminders/
|   |   |   |   |   |-- route.ts
|   |   |   |-- milestones/
|   |   |   |   |-- route.ts
|   |   |   |   |-- [id]/
|   |   |   |   |   |-- route.ts
|   |   |   |-- notifications/
|   |   |   |   |-- route.ts
|   |   |   |   |-- [id]/
|   |   |   |   |   |-- read/
|   |   |   |   |   |   |-- route.ts
|   |   |   |-- proposals/
|   |   |   |   |-- route.ts
|   |   |   |   |-- [id]/
|   |   |   |   |   |-- approve/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- reject/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- request-revision/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- resubmit/
|   |   |   |   |   |   |-- route.ts
|   |   |   |-- students/
|   |   |   |   |-- [id]/
|   |   |   |   |   |-- cgpa/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- github/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- resume/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |   |   |-- url/
|   |   |   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- skills/
|   |   |   |   |   |   |-- route.ts
|   |   |   |-- submission-windows/
|   |   |   |   |-- route.ts
|   |   |   |-- submissions/
|   |   |   |   |-- github/
|   |   |   |   |   |-- route.ts
|   |   |   |   |-- ppt/
|   |   |   |   |   |-- route.ts
|   |   |   |   |-- report/
|   |   |   |   |   |-- route.ts
|   |   |   |-- team-formation/
|   |   |   |   |-- rules/
|   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- [id]/
|   |   |   |   |   |   |-- route.ts
|   |   |   |-- teams/
|   |   |   |   |-- route.ts
|   |   |   |   |-- [id]/
|   |   |   |   |   |-- join/
|   |   |   |   |   |   |-- route.ts
|   |   |   |   |   |-- members/
|   |   |   |   |   |   |-- [studentId]/
|   |   |   |   |   |   |   |-- route.ts
|   |-- components/
|   |   |-- feedback/
|   |   |   |-- .gitkeep
|   |   |   |-- ErrorBoundary.tsx
|   |   |   |-- Skeleton.tsx
|   |   |-- forms/
|   |   |   |-- .gitkeep
|   |   |   |-- FormError.tsx
|   |   |   |-- FormField.tsx
|   |   |   |-- SubmitButton.tsx
|   |   |-- layout/
|   |   |   |-- .gitkeep
|   |   |   |-- Header.tsx
|   |   |   |-- PageWrapper.tsx
|   |   |   |-- Shell.tsx
|   |   |   |-- Sidebar.tsx
|   |   |-- tables/
|   |   |   |-- .gitkeep
|   |   |   |-- DataTable.tsx
|   |   |-- ui/
|   |   |   |-- .gitkeep
|   |   |   |-- Badge.tsx
|   |   |   |-- Button.tsx
|   |   |   |-- Card.tsx
|   |   |   |-- Dialog.tsx
|   |   |   |-- Icon.tsx
|   |   |   |-- Input.tsx
|   |   |   |-- Pagination.tsx
|   |   |   |-- Select.tsx
|   |-- config/
|   |   |-- .gitkeep
|   |   |-- navigation.tsx
|   |-- features/
|   |   |-- academic-structure/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- approvals/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- audit-logs/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- faculty-assignments/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- identity/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- leave-management/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- no-dues/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- notifications/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |   |-- NotificationsClient.tsx
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- project-management/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- student-records/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- submissions/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- team-formation/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |   |-- users/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |   |-- .gitkeep
|   |   |   |-- repositories/
|   |   |   |   |-- .gitkeep
|   |   |   |-- schemas/
|   |   |   |   |-- .gitkeep
|   |   |   |-- services/
|   |   |   |   |-- .gitkeep
|   |   |   |-- types/
|   |   |   |   |-- .gitkeep
|   |-- hooks/
|   |   |-- .gitkeep
|   |-- lib/
|   |   |-- env.ts
|   |   |-- rateLimit.ts
|   |   |-- constants/
|   |   |   |-- .gitkeep
|   |   |   |-- sdgs.ts
|   |   |   |-- storage.ts
|   |   |-- dates/
|   |   |   |-- .gitkeep
|   |   |   |-- index.ts
|   |   |-- errors/
|   |   |   |-- .gitkeep
|   |   |   |-- httpResponse.ts
|   |   |   |-- index.ts
|   |   |-- supabase/
|   |   |   |-- .gitkeep
|   |   |   |-- client.ts
|   |   |   |-- helpers.ts
|   |   |   |-- server.ts
|   |   |   |-- serviceRole.ts
|   |   |   |-- typed.ts
|   |   |-- validation/
|   |   |   |-- .gitkeep
|   |   |   |-- index.ts
|   |-- server/
|   |   |-- audit/
|   |   |   |-- .gitkeep
|   |   |   |-- index.ts
|   |   |-- authorization/
|   |   |   |-- .gitkeep
|   |   |   |-- index.ts
|   |   |-- notifications/
|   |   |   |-- .gitkeep
|   |   |   |-- index.ts
|   |   |-- storage/
|   |   |   |-- .gitkeep
|   |   |   |-- index.ts
|   |   |-- workflows/
|   |   |   |-- .gitkeep
|   |   |   |-- proposalStateMachine.ts
|   |   |   |-- teamFormationEngine.ts
|   |-- styles/
|   |   |-- .gitkeep
|   |-- types/
|   |   |-- .gitkeep
|   |   |-- database.ts
|-- supabase/
|   |-- config.toml
|   |-- seed.sql
|   |-- migrations/
|   |   |-- .gitkeep
|   |   |-- 001_profiles.sql
|   |   |-- 002_departments.sql
|   |   |-- 003_academic_years.sql
|   |   |-- 004_semesters.sql
|   |   |-- 005_sections.sql
|   |   |-- 006_faculty_assignments.sql
|   |   |-- 007_students.sql
|   |   |-- 008_team_formation_rules.sql
|   |   |-- 009_teams.sql
|   |   |-- 010_team_members.sql
|   |   |-- 011_proposals.sql
|   |   |-- 012_proposal_sdgs.sql
|   |   |-- 013_milestones.sql
|   |   |-- 014_submission_windows.sql
|   |   |-- 015_submissions.sql
|   |   |-- 016_notifications.sql
|   |   |-- 017_audit_logs.sql
|   |   |-- 018_email_retry_queue.sql
|   |   |-- 019_rls_policies.sql
|-- tests/
|   |-- e2e/
|   |   |-- .gitkeep
|   |-- integration/
|   |   |-- .gitkeep
|   |-- security/
|   |   |-- .gitkeep
|   |-- unit/
|   |   |-- .gitkeep
|   |   |-- proposalStateMachine.test.ts
|   |   |-- teamFormation.test.ts
|   |   |-- validation.test.ts
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

### 2. Environment Setup
Copy the sample environment configuration file:
```bash
cp .env.example .env.local
```

Populate the required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=<your-resend-api-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type check & linter
npm run typecheck
npm run lint

# Run unit tests
npx vitest run
```

---

## License & Attribution

Designed and developed by **Naren SJ** ([narensonu1520@gmail.com](mailto:narensonu1520@gmail.com) | [+91 8296833381](tel:+918296833381)).
All rights reserved.
