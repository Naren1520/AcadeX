# AcadeX – Database Schema

## Overview

AcadeX uses **PostgreSQL 15+** via **Supabase**. The schema is applied through 28 sequential migration files. All tables have Row-Level Security (RLS) policies enforced at the database level.

---

## Entity Relationship Diagram

```
profiles ──────────────────────────────────────────────────────────────────────────
   │ (id)                                                                           │
   │                                                                                │
   ├─── students (id FK→profiles.id)                                               │
   │       │ (department_id FK→departments.id)                                      │
   │       │ (section_id FK→sections.id)                                            │
   │       │                                                                        │
   │       └─── team_members (student_id FK→students.id)                           │
   │                   │ (team_id FK→teams.id)                                      │
   │                                                                                │
   ├─── faculty_assignments (faculty_id FK→profiles.id)                            │
   │           │ (section_id FK→sections.id)                                        │
   │           │ (department_id FK→departments.id)                                  │
   │                                                                                │
departments                                                                         │
   │ (id)                                                                           │
   │                                                                                │
   └─── sections ◄── semesters ◄── academic_years                                  │
           │ (id)                                                                   │
           │                                                                        │
           └─── team_formation_rules                                                │
                       │ (id)                                                       │
                       ├─── team_formation_slots                                    │
                       └─── teams                                                   │
                               │ (id)                                               │
                               ├─── team_members                                    │
                               ├─── team_invitations                                │
                               ├─── team_mentors                                    │
                               ├─── team_chat                                       │
                               └─── proposals                                       │
                                       │ (id)                                       │
                                       ├─── proposal_sdgs                           │
                                       └─── milestones                              │
                                               │ (id)                               │
                                               └─── submission_windows              │
                                                           │ (id)                   │
                                                           └─── submissions         │
                                                                                    │
notifications (recipient_id FK→profiles.id) ───────────────────────────────────────┘
audit_logs   (actor_id FK→profiles.id)
email_retry_queue (recipient_id FK→profiles.id)
```

---

## Table Definitions

### profiles

Mirrors Supabase `auth.users`. Created automatically on sign-up via trigger.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, FK→auth.users | Maps to Supabase Auth user |
| `role` | enum | NOT NULL | `admin` \| `faculty` \| `student` |
| `full_name` | text | NOT NULL | Display name |
| `email` | text | NOT NULL, UNIQUE | User email |
| `created_at` | timestamptz | DEFAULT now() | |
| `updated_at` | timestamptz | DEFAULT now() | |

---

### departments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | |
| `name` | text | NOT NULL | e.g. "Computer Science & Engineering" |
| `code` | text | NOT NULL, UNIQUE | e.g. "CSE" |
| `is_active` | boolean | DEFAULT true | Soft-disable departments |
| `created_at` | timestamptz | DEFAULT now() | |
| `updated_at` | timestamptz | DEFAULT now() | |

---

### academic_years

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `label` | text | NOT NULL | e.g. "2024-25" |
| `is_closed` | boolean | DEFAULT false | Closed years are read-only |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |

---

### semesters

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `academic_year_id` | uuid | FK→academic_years | |
| `label` | text | NOT NULL | e.g. "Semester 6" |
| `is_closed` | boolean | DEFAULT false | Closing a semester locks all sections |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |

---

### sections

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `semester_id` | uuid | FK→semesters | |
| `department_id` | uuid | FK→departments | |
| `label` | text | NOT NULL | e.g. "A", "B", "C" |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |

---

### faculty_assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `faculty_id` | uuid | FK→profiles | |
| `section_id` | uuid | FK→sections | |
| `department_id` | uuid | FK→departments | Denormalized for query efficiency |
| `assigned_at` | timestamptz | DEFAULT now() | |

---

### students

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, FK→profiles | |
| `usn` | text | NOT NULL, UNIQUE | University Seat Number |
| `department_id` | uuid | FK→departments | |
| `section_id` | uuid | FK→sections, NULLABLE | Assigned by faculty |
| `cgpa` | numeric(4,2) | NOT NULL | 0.00–10.00 |
| `skills` | text[] | DEFAULT '{}' | Array of skill strings |
| `github_url` | text | NULLABLE | GitHub profile URL |
| `resume_path` | text | NULLABLE | Supabase Storage path |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |

---

### team_formation_rules

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `faculty_id` | uuid | FK→profiles | Rule creator |
| `section_id` | uuid | FK→sections | Rule applies to this section |
| `label` | text | NOT NULL | Descriptive rule name |
| `team_size` | integer | NOT NULL | Exact team size required |
| `max_teams` | integer | NOT NULL | Maximum teams allowed |
| `formed_count` | integer | DEFAULT 0 | Incremented on team confirmation |
| `is_enabled` | boolean | DEFAULT true | Disabled rules cannot be used |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |

**Legacy columns** (kept for backward compatibility):
- `cgpa_lower`, `cgpa_upper` – single CGPA band
- `min_team_size`, `max_team_size` – range instead of fixed size

---

### team_formation_slots

CGPA band quotas for a rule. Slot counts must sum to `team_size`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `rule_id` | uuid | FK→team_formation_rules | |
| `cgpa_lower` | numeric(4,2) | NOT NULL | Lower CGPA bound |
| `cgpa_upper` | numeric(4,2) | NOT NULL | Upper CGPA bound |
| `count` | integer | NOT NULL | Seats reserved for this band |
| `label` | text | NULLABLE | e.g. "High Performers" |

**Example**: Team of 4 with 2 slots:
```
Slot A: cgpa_lower=8.0, cgpa_upper=10.0, count=2 (High Performers)
Slot B: cgpa_lower=6.0, cgpa_upper=7.99, count=2 (Mid Performers)
Total seats: 2+2 = 4 = team_size ✅
```

---

### teams

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `section_id` | uuid | FK→sections | |
| `rule_id` | uuid | FK→team_formation_rules | |
| `name` | text | NOT NULL | Team display name |
| `status` | enum | NOT NULL | `forming` \| `confirmed` \| `dissolved` |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |

---

### team_members

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `team_id` | uuid | FK→teams | |
| `student_id` | uuid | FK→students | UNIQUE – one team per student |
| `is_lead` | boolean | DEFAULT false | First member is team lead |
| `joined_at` | timestamptz | DEFAULT now() | |

---

### team_invitations

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `team_id` | uuid | FK→teams |
| `invitee_id` | uuid | FK→students (invitee) |
| `invited_by` | uuid | FK→students (team lead) |
| `status` | text | `pending` \| `accepted` \| `rejected` |
| `created_at` | timestamptz | |

---

### team_mentors

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `team_id` | uuid | FK→teams |
| `faculty_id` | uuid | FK→profiles |
| `assigned_by` | uuid | FK→profiles (admin/faculty) |
| `assigned_at` | timestamptz | |

---

### team_chat

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `team_id` | uuid | FK→teams |
| `sender_id` | uuid | FK→profiles |
| `message` | text | Chat message content |
| `created_at` | timestamptz | |

---

### proposals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `team_id` | uuid | FK→teams | |
| `faculty_id` | uuid | FK→profiles | Reviewing faculty |
| `title` | text | NOT NULL | Proposal title |
| `description` | text | NOT NULL | Full proposal description |
| `status` | enum | NOT NULL | `pending` \| `approved` \| `rejected` \| `revision_requested` |
| `parent_proposal_id` | uuid | NULLABLE, FK→proposals | For resubmissions/versioning |
| `version` | integer | DEFAULT 1 | Increments on resubmit |
| `rejection_reason` | text | NULLABLE | Faculty feedback on reject |
| `revision_notes` | text | NULLABLE | Faculty notes on revision request |
| `reviewed_at` | timestamptz | NULLABLE | When faculty acted |
| `submitted_at` | timestamptz | DEFAULT now() | |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |

---

### proposal_sdgs

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `proposal_id` | uuid | FK→proposals |
| `sdg_number` | integer | 1–17 (UN SDG number) |

---

### milestones

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `proposal_id` | uuid | FK→proposals | Only for approved proposals |
| `faculty_id` | uuid | FK→profiles | |
| `name` | text | NOT NULL | Milestone title |
| `description` | text | DEFAULT '' | Detail description |
| `deadline` | timestamptz | NOT NULL | Must be future date at creation |
| `status` | enum | DEFAULT 'open' | `open` \| `completed` \| `missed` |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |

---

### submission_windows

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `milestone_id` | uuid | FK→milestones |
| `faculty_id` | uuid | FK→profiles |
| `opens_at` | timestamptz | Window open time |
| `closes_at` | timestamptz | Window close time |
| `created_at` | timestamptz | |

---

### submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `team_id` | uuid | FK→teams | |
| `milestone_id` | uuid | FK→milestones | |
| `window_id` | uuid | FK→submission_windows | |
| `submitted_by` | uuid | FK→profiles | Student who uploaded |
| `artefact_type` | enum | NOT NULL | `ppt` \| `report` \| `github_link` |
| `storage_path` | text | NULLABLE | Supabase Storage path (for files) |
| `github_url` | text | NULLABLE | GitHub URL (for github_link type) |
| `status` | enum | DEFAULT 'submitted' | `submitted` \| `accepted` \| `missed_deadline` |
| `submitted_at` | timestamptz | DEFAULT now() | |

**Storage path format**: `{year}/{dept}/{team_id}/{milestone_id}/{type}/{filename}`

---

### notifications

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `recipient_id` | uuid | FK→profiles |
| `message` | text | Notification text |
| `deep_link` | text | Portal route to navigate to |
| `trigger_event` | text | Event that caused this (e.g. `proposal.approved`) |
| `is_read` | boolean | DEFAULT false |
| `created_at` | timestamptz | |

---

### audit_logs

Immutable – no UPDATE or DELETE permitted via RLS.

| Column | Type | Description |
|--------|------|-------------|
| `event_id` | uuid | PK |
| `actor_id` | uuid | FK→profiles |
| `actor_role` | enum | `admin` \| `faculty` \| `student` \| `system` |
| `actor_email` | text | Captured at time of event |
| `action_type` | text | Enum-like string (see AuditEventTypes) |
| `target_table` | text | Which DB table was affected |
| `target_record_id` | text | Which record was affected |
| `previous_value` | jsonb | State before change |
| `new_value` | jsonb | State after change |
| `ip_address` | text | Requester IP |
| `user_agent` | text | Browser/client |
| `created_at` | timestamptz | |

**Audit Event Types**:
```
user.login / user.logout / user.created / user.edited / user.deleted
department.created / department.updated / department.deactivated
academic_year.created / academic_year.closed
semester.created / semester.closed
section.created
faculty.assigned / faculty.unassigned
student.section_assigned
cgpa.updated
team.formed / team.member_added / team.member_removed
proposal.submitted / proposal.approved / proposal.rejected / proposal.revision_requested
milestone.created / milestone.deadline_updated
submission.uploaded / submission.overwritten
file.uploaded / file.accessed
notification.email_failed
```

---

### email_retry_queue

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `recipient_id` | uuid | NULLABLE, FK→profiles |
| `recipient_email` | text | Direct email address |
| `subject` | text | Email subject |
| `body_html` | text | HTML email body |
| `trigger_event` | text | Event that triggered this email |
| `attempt_count` | integer | DEFAULT 1 |
| `next_attempt_at` | timestamptz | Scheduled retry time |
| `exhausted` | boolean | DEFAULT false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

## Row-Level Security Summary

| Table | Student can | Faculty can | Admin can |
|-------|-------------|-------------|-----------|
| `profiles` | SELECT own | SELECT any in section | ALL |
| `students` | SELECT/UPDATE own | SELECT/UPDATE in section | ALL |
| `departments` | SELECT | SELECT | ALL |
| `academic_years` | SELECT | SELECT | ALL |
| `semesters` | SELECT | SELECT | ALL |
| `sections` | SELECT own | SELECT assigned | ALL |
| `faculty_assignments` | SELECT | SELECT own | ALL |
| `team_formation_rules` | SELECT in section | ALL in assigned section | ALL |
| `teams` | SELECT own | SELECT in section | ALL |
| `team_members` | SELECT own team | SELECT in section | ALL |
| `proposals` | INSERT own / SELECT own | UPDATE in section | ALL |
| `milestones` | SELECT own | ALL in assigned section | ALL |
| `submissions` | INSERT own / SELECT own | SELECT in section | ALL |
| `notifications` | SELECT/UPDATE own | SELECT/UPDATE own | ALL |
| `audit_logs` | ❌ | ❌ | SELECT |
| `email_retry_queue` | ❌ | ❌ | Service-role only |

---

## Indexes (Key)

```sql
-- Performance indexes
CREATE INDEX idx_students_section_id ON students(section_id);
CREATE INDEX idx_teams_section_id ON teams(section_id);
CREATE INDEX idx_proposals_team_id ON proposals(team_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_milestones_proposal_id ON milestones(proposal_id);
CREATE INDEX idx_submissions_window_id ON submissions(window_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id, is_read);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_email_retry_queue_next_attempt ON email_retry_queue(next_attempt_at)
  WHERE exhausted = false;
```

---

## Database Triggers

### Team Capacity Trigger (`027_team_capacity_trigger.sql`)

Automatically prevents exceeding team size at the database level:
- Fires `BEFORE INSERT` on `team_members`
- Counts existing members for the team
- Compares against `team_formation_rules.team_size`
- Raises exception if full

This acts as a last-resort guard alongside application-layer checks.

---

*Last Updated: November 2026 | Author: Naren SJ*
