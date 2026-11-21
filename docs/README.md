# AcadeX – Documentation Index

Complete documentation for the AcadeX Academic Project Management Platform.

---

## Documents

| Document | Description | Audience |
|----------|-------------|----------|
| [PROJECT_REPORT.md](./PROJECT_REPORT.md) | Full academic project report (abstract, architecture, implementation, results, conclusion) | Examiners, stakeholders |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | High-level platform overview, features, tech stack, workflows | Anyone new to the project |
| [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) | Architecture, code structure, authentication, authorization, API, error handling | Developers |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Full database schema with all 22 tables, ERD, RLS summary, migration order | Developers, DBAs |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | All API endpoints with request/response examples and error codes | Developers, integrators |
| [USER_GUIDE.md](./USER_GUIDE.md) | Step-by-step usage guide for Admin, Faculty, and Student roles | End users |
| [SECURITY_REPORT.md](./SECURITY_REPORT.md) | Security controls at all layers: auth, RBAC, RLS, storage, audit | Security reviewers, auditors |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Local setup, Vercel deployment, Supabase config, Resend setup | DevOps, developers |
| [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) | Unit, integration, E2E, and security test strategy with examples | Developers, QA |
| [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) | Routine operations, user management, monitoring, upgrades | System admins |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines | Open-source contributors |
| [recovery-runbook.md](./recovery-runbook.md) | Disaster recovery procedures | System admins |

---

## Quick Reference

### Tech Stack
- **Frontend**: React 19 + Next.js 16 (App Router) + Tailwind CSS 4
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: PostgreSQL 15 via Supabase
- **Auth**: Supabase Auth + MFA (TOTP)
- **Storage**: Supabase Storage (private bucket, signed URLs)
- **Email**: Resend API with exponential backoff retry queue
- **Deployment**: Vercel (serverless)

### Roles
- **Admin**: Full platform access, manages institutional structure
- **Faculty**: Manages assigned sections, reviews proposals, sets milestones
- **Student**: Forms teams, submits proposals, uploads project artifacts

### Key Security Controls
- RLS on all 22 database tables
- Server-side session and role validation on every request
- Rate limiting on login (10 req/60s, 5-min block)
- MFA available for all roles
- Private file storage with 5-minute signed URL access
- Immutable audit log for 40+ operation types

---

## Author

**Naren SJ**  
Email: narensonu1520@gmail.com  
Phone: +91 8296833381

---

*Last Updated: November 2026*
