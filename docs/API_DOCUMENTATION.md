# AcadeX – API Documentation

## Base URL

```
Production: https://your-domain.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

All endpoints (except public auth routes) require a valid session cookie set by Supabase Auth. The session is established via `POST /api/auth/login` and maintained using HttpOnly cookies managed by `@supabase/ssr`.

**Error Responses (common)**:
- `401 Unauthorized` – No valid session
- `403 Forbidden` – Valid session but insufficient role or missing section assignment

---

## Auth Endpoints

### POST /api/auth/login

Sign in with email and password.

**Rate limit**: 10 requests per 60 seconds per IP. Blocked for 5 minutes after limit.

**Request Body**:
```json
{
  "email": "student@college.edu",
  "password": "securepassword"
}
```

**Response 200** (no MFA):
```json
{ "redirectTo": "/student" }
```

**Response 200** (MFA required):
```json
{ "redirectTo": "/mfa" }
```

**Response 422**:
```json
{ "error": "Invalid email or password." }
```

**Response 429**:
```json
{ "error": "Too many login attempts. Try again in 300 seconds.", "retryAfterSeconds": 300 }
```

---

### POST /api/auth/logout

Invalidates the current session and clears the cookie.

**Response 200**:
```json
{ "redirectTo": "/login" }
```

---

### POST /api/auth/mfa/verify

Verify a TOTP code for MFA-enabled sessions.

**Request Body**:
```json
{ "code": "123456" }
```

**Response 200**:
```json
{ "redirectTo": "/student" }
```

**Response 401**:
```json
{ "error": "Invalid MFA code." }
```

---

### GET /api/auth/session

Returns the current user's id and role.

**Response 200**:
```json
{
  "userId": "uuid",
  "role": "student",
  "email": "student@college.edu"
}
```

---

## Admin Endpoints

All admin endpoints require `role = "admin"`.

### GET /api/admin/departments

Returns all departments.

**Response 200**:
```json
[
  { "id": "uuid", "name": "Computer Science & Engineering", "code": "CSE", "is_active": true }
]
```

---

### POST /api/admin/departments

Create a new department.

**Request Body**:
```json
{ "name": "Computer Science & Engineering", "code": "CSE" }
```

**Response 201**:
```json
{ "id": "uuid", "name": "...", "code": "CSE", "is_active": true }
```

**Response 409**: Department code already exists.

---

### PATCH /api/admin/departments/[id]

Update a department's name, code, or active status.

**Request Body** (partial):
```json
{ "name": "Updated Name", "is_active": false }
```

**Response 200**: Updated department object.

---

### DELETE /api/admin/departments/[id]

Delete a department. Fails if the department has existing sections.

**Response 204**: No content.

---

### GET /api/admin/academic-years

Returns all academic years.

**Response 200**:
```json
[
  { "id": "uuid", "label": "2024-25", "is_closed": false }
]
```

---

### POST /api/admin/academic-years

**Request Body**:
```json
{ "label": "2024-25" }
```

**Response 201**: Created academic year object.

---

### POST /api/admin/academic-years/[id]/close

Permanently closes an academic year.

**Response 200**:
```json
{ "success": true }
```

---

### GET /api/admin/semesters

Returns all semesters (optionally filtered by `?academic_year_id=`).

---

### POST /api/admin/semesters

**Request Body**:
```json
{ "academic_year_id": "uuid", "label": "Semester 6" }
```

---

### POST /api/admin/semesters/[id]/close

Permanently closes a semester.

---

### GET /api/admin/sections

Returns all sections (filtered by `?semester_id=` or `?department_id=`).

---

### POST /api/admin/sections

**Request Body**:
```json
{
  "semester_id": "uuid",
  "department_id": "uuid",
  "label": "A"
}
```

---

### GET /api/admin/faculty-assignments

Returns all faculty assignments.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "faculty_id": "uuid",
    "faculty_name": "Dr. Smith",
    "section_id": "uuid",
    "section_label": "A",
    "department_id": "uuid",
    "department_name": "CSE"
  }
]
```

---

### POST /api/admin/faculty-assignments

**Request Body**:
```json
{
  "faculty_id": "uuid",
  "section_id": "uuid",
  "department_id": "uuid"
}
```

---

### DELETE /api/admin/faculty-assignments/[id]

Remove a faculty assignment.

---

### GET /api/admin/audit-logs

Paginated audit log viewer.

**Query Params**:
- `page` (default: 1)
- `limit` (default: 50, max: 200)
- `actor_role` – filter by role
- `action_type` – filter by event type

**Response 200**:
```json
{
  "data": [
    {
      "event_id": "uuid",
      "actor_id": "uuid",
      "actor_email": "admin@college.edu",
      "actor_role": "admin",
      "action_type": "department.created",
      "target_table": "departments",
      "target_record_id": "uuid",
      "new_value": { "name": "CSE", "code": "CSE" },
      "created_at": "2024-11-01T10:00:00Z"
    }
  ],
  "total": 450,
  "page": 1,
  "limit": 50
}
```

---

## Proposal Endpoints

### GET /api/proposals

Returns proposals. Faculty get all proposals in their sections. Students get their team's proposals.

**Query Params**:
- `team_id` (student)
- `section_id` (faculty)
- `status` – filter by status

**Response 200**:
```json
[
  {
    "id": "uuid",
    "title": "Smart Water Management System",
    "description": "...",
    "status": "pending",
    "version": 1,
    "submitted_at": "2024-11-01T09:00:00Z",
    "sdgs": [6, 11, 13],
    "team": { "id": "uuid", "name": "Team Alpha" }
  }
]
```

---

### POST /api/proposals

Submit a new proposal. Only students in confirmed teams.

**Request Body**:
```json
{
  "title": "Smart Water Management System",
  "description": "Detailed project description...",
  "sdg_numbers": [6, 11, 13]
}
```

**Response 201**: Created proposal object.

**Response 409**: Team already has an active pending/revision proposal.

---

### POST /api/proposals/[id]/approve

Faculty only. Approve a pending proposal.

**Response 200**:
```json
{ "success": true, "status": "approved" }
```

**Response 422**: Invalid state transition (proposal is not in pending state).

---

### POST /api/proposals/[id]/reject

Faculty only.

**Request Body**:
```json
{ "reason": "Proposal lacks sufficient technical detail." }
```

**Response 200**:
```json
{ "success": true, "status": "rejected" }
```

---

### POST /api/proposals/[id]/request-revision

Faculty only.

**Request Body**:
```json
{ "notes": "Please include a system architecture diagram and cost analysis." }
```

---

### POST /api/proposals/[id]/resubmit

Student only. Resubmit after revision request.

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description...",
  "sdg_numbers": [6, 11, 13]
}
```

**Response 201**: New proposal version object (status: pending, version incremented).

---

## Team Endpoints

### GET /api/teams

Returns teams for the student's section or for the faculty's assigned sections.

---

### POST /api/teams

Create a new team. Student must be CGPA-eligible for the rule.

**Request Body**:
```json
{
  "rule_id": "uuid",
  "section_id": "uuid",
  "name": "Team Alpha"
}
```

**Response 201**:
```json
{ "id": "uuid", "name": "Team Alpha", "status": "forming" }
```

**Response 422**: CGPA does not match any slot in the rule.

**Response 409**: Max teams quota reached.

---

### POST /api/teams/[id]/join

Join an existing team.

**Response 200**:
```json
{ "id": "uuid", "status": "forming" }
```

**Response 409**: Team is full or student is already in a team.

**Response 422**: CGPA does not fill any remaining slot.

---

### DELETE /api/teams/[id]/members/[studentId]

Remove a student from a team. Only team lead or faculty.

**Response 200**:
```json
{ "success": true }
```

---

## Milestone Endpoints

### GET /api/milestones

Returns milestones. Faculty gets all in their sections; students get milestones for their approved proposal.

**Query Params**:
- `proposal_id`

---

### POST /api/milestones

Faculty only. Create a milestone for an approved proposal.

**Request Body**:
```json
{
  "proposal_id": "uuid",
  "name": "Phase 1 - Prototype",
  "description": "Complete the initial prototype with basic functionality.",
  "deadline": "2024-12-15T23:59:00Z"
}
```

**Response 201**: Created milestone.

**Response 422**: Deadline is in the past.

---

### PATCH /api/milestones/[id]

Update milestone name, description, or deadline.

---

### DELETE /api/milestones/[id]

Delete a milestone. Faculty only.

---

## Submission Window Endpoints

### GET /api/submission-windows

Returns submission windows.

**Query Params**:
- `milestone_id`

**Response 200**:
```json
[
  {
    "id": "uuid",
    "milestone_id": "uuid",
    "opens_at": "2024-12-01T09:00:00Z",
    "closes_at": "2024-12-07T23:59:00Z",
    "is_open": true
  }
]
```

---

### POST /api/submission-windows

Faculty only. Create a submission window.

**Request Body**:
```json
{
  "milestone_id": "uuid",
  "opens_at": "2024-12-01T09:00:00Z",
  "closes_at": "2024-12-07T23:59:00Z"
}
```

---

## Submission Endpoints

### POST /api/submissions/ppt

Upload a PPT file. Must be within an open submission window.

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `file` – .pptx or .ppt file (max 100 MB)
- `window_id` – submission window UUID
- `milestone_id` – milestone UUID

**Response 201**:
```json
{
  "id": "uuid",
  "artefact_type": "ppt",
  "storage_path": "2024-25/CSE/team-uuid/milestone-uuid/ppt/presentation.pptx",
  "submitted_at": "2024-11-20T10:00:00Z"
}
```

**Response 422**: Invalid MIME type or file too large.

**Response 409**: Submission window is closed.

---

### POST /api/submissions/report

Upload a PDF report.

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `file` – PDF file (max 50 MB)
- `window_id`
- `milestone_id`

---

### POST /api/submissions/github

Submit a GitHub repository URL.

**Request Body**:
```json
{
  "github_url": "https://github.com/username/project-repo",
  "window_id": "uuid",
  "milestone_id": "uuid"
}
```

**Response 201**: Submission record.

**Response 422**: URL does not start with `https://github.com/`.

---

### GET /api/submissions/[id]/url

Generate a signed URL for a submission file. Valid for 5 minutes.

**Access**: Student must be a team member; faculty must be assigned to the section.

**Response 200**:
```json
{
  "url": "https://storage.supabase.co/signed/...?token=...&expires=..."
}
```

**Response 404**: Submission not found.

**Response 403**: Not authorized to access this submission.

---

## Student Profile Endpoints

### PATCH /api/students/[id]/cgpa

Update a student's CGPA. Student can update own; admin and faculty (for their section) can also update.

**Request Body**:
```json
{ "cgpa": 8.5 }
```

**Response 200**: Updated student record.

---

### PATCH /api/students/[id]/github

**Request Body**:
```json
{ "github_url": "https://github.com/username" }
```

---

### PATCH /api/students/[id]/skills

**Request Body**:
```json
{ "skills": ["React", "Node.js", "PostgreSQL"] }
```

---

### POST /api/students/[id]/resume

Upload a PDF resume.

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `file` – PDF only (max 20 MB)

**Response 200**:
```json
{ "resume_path": "resumes/student-uuid/resume.pdf" }
```

---

### GET /api/students/[id]/resume/url

Generate a signed URL for the student's resume. 5-minute expiry.

**Response 200**:
```json
{ "url": "https://storage.supabase.co/signed/..." }
```

---

## Notification Endpoints

### GET /api/notifications

Returns all notifications for the authenticated user, newest first.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "message": "Your proposal 'Smart Water System' has been approved.",
    "deep_link": "/student/proposals",
    "trigger_event": "proposal.approved",
    "is_read": false,
    "created_at": "2024-11-20T08:30:00Z"
  }
]
```

---

### POST /api/notifications/[id]/read

Mark a notification as read.

**Response 200**:
```json
{ "success": true }
```

---

## Team Formation Rules

### GET /api/team-formation/rules

Returns team formation rules for the authenticated faculty's sections.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "label": "Mixed CGPA Team of 4",
    "team_size": 4,
    "max_teams": 10,
    "formed_count": 3,
    "is_enabled": true,
    "slots": [
      { "cgpa_lower": 8.0, "cgpa_upper": 10.0, "count": 2, "label": "High" },
      { "cgpa_lower": 6.0, "cgpa_upper": 7.9,  "count": 2, "label": "Mid"  }
    ]
  }
]
```

---

### POST /api/team-formation/rules

Faculty only. Create a team formation rule.

**Request Body**:
```json
{
  "section_id": "uuid",
  "label": "Mixed CGPA Team of 4",
  "team_size": 4,
  "max_teams": 10,
  "slots": [
    { "cgpa_lower": 8.0, "cgpa_upper": 10.0, "count": 2, "label": "High Performers" },
    { "cgpa_lower": 6.0, "cgpa_upper": 7.9,  "count": 2, "label": "Mid Performers" }
  ]
}
```

**Response 422**: Slot counts do not sum to team_size.

---

### DELETE /api/team-formation/rules/[id]

Delete a rule. Cannot delete if teams are already formed under it.

---

## Cron Endpoints

### POST /api/cron/deadline-reminders

Triggered by a scheduled job (e.g., Vercel Cron). Sends notifications for milestones with deadlines within 24 hours.

**Authorization**: Requires cron secret header or service-role key.

**Response 200**:
```json
{ "sent": 15 }
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message",
  "fields": {
    "fieldName": "Per-field error message"
  }
}
```

The `fields` object is only present for validation errors (422).

## HTTP Status Code Reference

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (delete) |
| 400 | Bad Request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

*Last Updated: November 2026 | Author: Naren SJ*
