# AcadeX - Project Overview

## Executive Summary

**AcadeX** is a comprehensive Academic Project Management Platform designed for higher education institutions to streamline the entire lifecycle of academic projects. The platform manages everything from student team formation based on CGPA bands, project proposal workflows with UN SDG alignment, milestone tracking, submission management, to role-based access control across admin, faculty, and student portals.

## Author Information

| Field | Details |
|-------|---------|
| **Author** | Naren SJ |
| **Email** | narensonu1520@gmail.com |
| **Phone** | +91 8296833381 |
| **Role** | Full Stack Developer & System Architect |

## Project Metadata

- **Project Name**: AcadeX
- **Version**: 0.1.0
- **Type**: Web Application (SaaS Platform)
- **License**: Proprietary
- **Status**: Production Ready
- **Last Updated**: November 2026

## Problem Statement

Traditional academic project management in colleges faces several challenges:

1. **Manual Team Formation**: Faculty spend significant time manually forming balanced teams based on student capabilities
2. **Scattered Communication**: Project proposals, reviews, and feedback are managed through emails and physical documents
3. **Lack of Progress Tracking**: No centralized system to track project milestones and submission deadlines
4. **Poor Visibility**: Administrators lack real-time insights into project progress across departments
5. **Security Concerns**: No proper role-based access control or audit trails for sensitive academic data
6. **No UN SDG Alignment**: Projects lack mandatory alignment with United Nations Sustainable Development Goals
7. **Submission Chaos**: Difficult to manage file submissions, versioning, and access control

## Solution Overview

AcadeX provides an end-to-end solution with:

### 1. **Intelligent Team Formation Engine**
- CGPA-based automated team grouping with configurable rules
- Faculty-defined constraints (min/max team size, CGPA bands, quota limits)
- Real-time validation preventing non-compliant formations
- Team invitation system with approval workflows

### 2. **Proposal Management System**
- Multi-stage workflow (Draft → Pending → Approved/Rejected/Revision Requested)
- Mandatory UN SDG mapping (17 Sustainable Development Goals)
- Version control for proposal revisions
- Faculty review and feedback mechanism

### 3. **Milestone & Submission Tracking**
- Time-bound submission windows controlled by faculty
- Support for multiple artifact types (PPT, PDF reports, GitHub links)
- Secure file storage with signed URL access (5-minute expiry)
- Deadline tracking with automated reminders

### 4. **Role-Based Access Control**
- Three distinct roles: Admin, Faculty, Student
- Database-level Row-Level Security (RLS) policies
- MFA enforcement for administrative operations
- Page-level and API-level authorization checks

### 5. **Comprehensive Dashboards**
- **Admin Dashboard**: Department-wide statistics, registration trends, proposal analytics
- **Faculty Dashboard**: Section management, proposal reviews, mentee tracking
- **Student Dashboard**: Team status, proposal progress, milestone timeline, upcoming deadlines

### 6. **Notification & Communication System**
- In-app notifications with deep linking
- Email notification system with retry mechanism
- Real-time updates on proposal status changes
- Deadline reminders via cron jobs

### 7. **Audit & Compliance**
- Immutable audit logs for all critical operations
- Actor tracking (who did what, when)
- Before/after value capture for data changes
- Compliance-ready reporting

## Key Features

### For Administrators
✅ Department and academic structure management (Years → Semesters → Sections)  
✅ Faculty assignment to sections  
✅ Student bulk onboarding with Excel import  
✅ System-wide audit log viewing  
✅ Real-time analytics and dashboard charts  
✅ User role management  

### For Faculty
✅ Team formation rule configuration  
✅ Section and student management  
✅ Proposal review workflow (Approve/Reject/Request Changes)  
✅ Milestone creation and tracking  
✅ Submission window management  
✅ Mentee team monitoring  
✅ Submission viewing and evaluation  

### For Students
✅ Profile management (CGPA, skills, GitHub, resume)  
✅ Team creation and joining via invitations  
✅ Proposal submission with UN SDG selection  
✅ Milestone tracking with visual timeline  
✅ File submission (PPT, reports, GitHub links)  
✅ Real-time notification feed  
✅ Comprehensive user guide  

## Technical Highlights

### Architecture
- **Frontend**: React 19 with Next.js 16 (App Router)
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: PostgreSQL 15+ (via Supabase)
- **Authentication**: Supabase Auth with MFA support
- **Storage**: Supabase Storage with private buckets
- **Email**: Resend API with retry queue
- **Styling**: Tailwind CSS 4 with Radix UI primitives
- **Validation**: Zod schemas with type inference
- **Testing**: Vitest (unit) + Playwright (E2E)

### Security Features
- Row-Level Security (RLS) on all database tables
- Server-side session validation on every request
- Rate limiting on authentication endpoints
- Signed URLs for file access (5-minute expiry)
- SQL injection prevention via parameterized queries
- XSS protection with proper input sanitization
- CSRF protection via Next.js built-in mechanisms

### Performance Optimizations
- Server-side rendering (SSR) for dynamic pages
- Loading states on all route transitions
- Optimistic UI updates with `useTransition`
- Navigation progress bar for visual feedback
- Empty state components to prevent layout shifts
- Skeleton loaders for data-heavy pages
- Parallel data fetching where possible

### User Experience Enhancements
- Network status detection (offline/slow connection banner)
- Comprehensive error handling with user-friendly messages
- Drag-and-drop file upload zones
- Real-time form validation with Zod
- Toast notifications for action feedback
- Modal dialogs for confirmation actions
- Responsive design (mobile, tablet, desktop)
- Accessibility compliance (WCAG 2.1 Level AA targeted)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Admin     │  │    Faculty    │  │     Student     │   │
│  │   Portal    │  │    Portal     │  │     Portal      │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes (TypeScript)          │  │
│  │  • Authentication    • Authorization   • Business     │  │
│  │  • Validation        • Workflows       • Logic        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Audit   │  │  Notify  │  │ Storage  │  │ Workflow │  │
│  │  Logger  │  │  Engine  │  │ Manager  │  │  Engine  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                         DATA LAYER                           │
│  ┌──────────────────┐  ┌────────────┐  ┌──────────────┐   │
│  │   PostgreSQL     │  │  Supabase  │  │   Resend     │   │
│  │   (Database)     │  │  Storage   │  │   (Email)    │   │
│  └──────────────────┘  └────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Overview

### Core Entities
1. **profiles** - User accounts with roles (admin, faculty, student)
2. **departments** - Academic departments (CSE, ISE, etc.)
3. **academic_years** - Academic year periods (2023-24, etc.)
4. **semesters** - Semester within academic years (Sem 1, Sem 2, etc.)
5. **sections** - Class sections within departments
6. **faculty_assignments** - Faculty-to-section mappings
7. **students** - Student records with CGPA, skills, GitHub
8. **team_formation_rules** - CGPA-based team formation constraints
9. **teams** - Student teams with status (forming, confirmed, dissolved)
10. **team_members** - Student membership in teams
11. **proposals** - Project proposals with status workflow
12. **proposal_sdgs** - UN SDG mappings for proposals
13. **milestones** - Project milestones with deadlines
14. **submission_windows** - Time-bound submission periods
15. **submissions** - File/link submissions (PPT, report, GitHub)
16. **notifications** - In-app notification feed
17. **audit_logs** - Immutable audit trail
18. **email_retry_queue** - Email retry mechanism
19. **team_invitations** - Team invitation system
20. **team_mentors** - Faculty-team mentor assignments
21. **team_chat** - Team communication messages

## Workflow Diagrams

### 1. Team Formation Workflow
```
Student → Check Eligibility (CGPA Rule) → Create/Join Team
    ↓
Team Lead → Send Invitations → Pending Status
    ↓
Invited Students → Accept/Reject → Update Team Members
    ↓
Team Size Met → Confirm Team → Status: "confirmed"
```

### 2. Proposal Lifecycle
```
Draft → Student Submits → "pending"
    ↓
Faculty Reviews → Decision:
    ├─→ Approve → "approved" → Enable Milestones
    ├─→ Reject → "rejected" → End
    └─→ Request Changes → "revision_requested" → Back to Student
```

### 3. Submission Workflow
```
Faculty Creates Milestone → Sets Deadline
    ↓
Faculty Opens Submission Window → Time-bound Period
    ↓
Students Upload Files → Validation → Store in Supabase Storage
    ↓
Window Closes → Calculate Status (submitted/missed_deadline)
    ↓
Faculty Views Submissions → Evaluation
```

## Technology Stack Details

### Frontend Dependencies
```json
{
  "next": "16.4.6",
  "react": "19.3.0",
  "react-dom": "19.3.0",
  "react-hook-form": "^7.90.0",
  "recharts": "^2.15.0",
  "@radix-ui/react-dialog": "^1.3.1",
  "@radix-ui/react-select": "^2.4.1",
  "tailwindcss": "^4"
}
```

### Backend Dependencies
```json
{
  "@supabase/ssr": "^0.12.7",
  "@supabase/supabase-js": "^2.118.0",
  "resend": "^6.34.1",
  "zod": "^4.6.7",
  "xlsx": "^0.18.5"
}
```

### Development Dependencies
```json
{
  "@playwright/test": "^1.64.1",
  "@vitejs/plugin-react": "^6.1.2",
  "vitest": "^5.0.5",
  "eslint": "^9",
  "typescript": "^5"
}
```

## Deployment Architecture

### Production Stack
- **Hosting**: Vercel (serverless deployment)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (S3-compatible)
- **Email**: Resend API
- **CDN**: Vercel Edge Network
- **SSL**: Automatic via Vercel

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Key Achievements

✅ **100% TypeScript** - Complete type safety across frontend and backend  
✅ **Zero Runtime Errors** - Comprehensive error handling on all operations  
✅ **Row-Level Security** - Database-level security on all tables  
✅ **Responsive Design** - Works seamlessly on mobile, tablet, desktop  
✅ **Production Ready** - Deployed and running in production environment  
✅ **Comprehensive Testing** - Unit tests and E2E test infrastructure  
✅ **Audit Compliance** - Complete audit trail for all critical operations  
✅ **Email Reliability** - Retry mechanism ensures delivery (4 attempts)  
✅ **Real-time Updates** - Live notifications and status changes  
✅ **File Security** - Signed URLs with expiry for secure file access  

## Future Enhancements

1. **Real-time Collaboration** - WebSocket-based live updates
2. **Advanced Analytics** - ML-based insights and predictions
3. **Mobile Apps** - Native iOS and Android applications
4. **Integration APIs** - REST APIs for third-party integrations
5. **Video Conferencing** - Built-in video calls for mentor meetings
6. **Plagiarism Detection** - AI-powered proposal similarity checking
7. **Peer Review System** - Student peer evaluation mechanism
8. **Export Reports** - PDF generation for project reports
9. **Calendar Integration** - Google Calendar/Outlook sync for deadlines
10. **Chatbot Assistant** - AI-powered help and guidance

## Documentation Structure

```
docs/
├── PROJECT_OVERVIEW.md (this file)
├── TECHNICAL_DOCUMENTATION.md
├── USER_GUIDE.md
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── DEPLOYMENT_GUIDE.md
├── SECURITY_REPORT.md
├── TESTING_STRATEGY.md
└── MAINTENANCE_GUIDE.md
```

## Contact & Support

For technical queries, feature requests, or bug reports:

**Naren SJ**  
📧 narensonu1520@gmail.com  
📱 +91 8296833381  

---

*Last Updated: November 2026*  
*Document Version: 1.0*
