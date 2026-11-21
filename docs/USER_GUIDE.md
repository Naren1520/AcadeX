# AcadeX – User Guide

## Introduction

AcadeX is a web-based Academic Project Management Platform. This guide explains how to use each part of the system for all three user roles: **Admin**, **Faculty**, and **Student**.

---

## 1. Getting Started

### Accessing the Platform

Open your browser and navigate to your institution's AcadeX URL (e.g., `https://acadex.vercel.app`).

### Logging In

1. Enter your institutional email address and password
2. Click **Sign In**
3. If your account has Multi-Factor Authentication enabled, you will be redirected to the MFA page — enter your TOTP code from your authenticator app
4. You are redirected to your role's dashboard

### Forgot Password

Click **Forgot password?** on the login page. Enter your email to receive a reset link.

---

## 2. Admin Portal

The Admin manages the entire institutional structure: departments, academic years, semesters, sections, faculty assignments, and student onboarding.

### 2.1 Dashboard

The Admin Dashboard shows institution-wide statistics:
- Total students, faculty, departments, and teams
- Registration trend chart (new users over time)
- Proposal distribution by status (pie chart)
- Students and faculty per department (bar chart)
- Sections per semester
- Team status distribution

### 2.2 Departments

**To create a department:**
1. Go to **Departments** in the sidebar
2. Click **Add Department**
3. Enter the full name (e.g., "Computer Science & Engineering") and code (e.g., "CSE")
4. Click **Save**

**To deactivate a department:**
- Click the **Deactivate** button next to any active department
- Deactivated departments cannot receive new sections

### 2.3 Academic Year Lifecycle

The academic structure flows: **Academic Year → Semesters → Sections**

**To create an academic year:**
1. Go to **Academic Years**
2. Click **Add Academic Year**
3. Enter the label (e.g., "2024-25")

**To close an academic year:**
- Click **Close Year**
- Closed years are immutable and read-only. This action cannot be undone.

### 2.4 Semesters

1. Navigate to a Department, then to an Academic Year
2. Click **Add Semester** (e.g., "Semester 6")
3. Close a semester with **Close Semester** when the term ends

### 2.5 Sections

1. Navigate to a Semester
2. Click **Add Section** (e.g., "A", "B", "C")
3. Sections appear for faculty assignment

### 2.6 Faculty Assignments

1. Go to **Faculty Assignments**
2. Click **Assign Faculty**
3. Select the faculty member, department, and section
4. Click **Assign**

To remove an assignment, click **Remove** next to any assignment.

### 2.7 Student Management

**Bulk Onboarding (Excel Upload):**
1. Go to **Students**
2. Click **Bulk Upload**
3. Download the template Excel file
4. Fill in student USN, name, email, department, CGPA
5. Upload the completed file

**Individual student editing:**
- Search by name or USN
- Click a student to view their profile
- Edit section assignment or CGPA as needed

### 2.8 Audit Logs

The Audit Logs page shows every significant action taken on the platform:
- Filter by actor, role, action type, or date range
- Columns: Timestamp, Actor, Role, Action, Target
- Logs are immutable and cannot be deleted

### 2.9 Notifications

View system-generated notifications. Mark individual or all as read.

---

## 3. Faculty Portal

Faculty manage their assigned sections: team formation rules, proposal reviews, milestones, submission windows, and mentee teams.

### 3.1 Dashboard

Shows:
- Total students across assigned sections
- Pending proposals awaiting review
- Active submission windows
- Recent activity feed

### 3.2 Sections

Go to **My Sections** to view all sections assigned to you. Click a section to open the **Section Dashboard**, which has tabs:

| Tab | Description |
|-----|-------------|
| **Students** | All students in this section with CGPA and details |
| **Teams** | All formed teams with status |
| **Proposals** | All proposals submitted in this section |
| **Milestones** | Milestones for all approved proposals |
| **Submissions** | All submissions grouped by team and milestone |
| **Windows** | Submission windows you have created |

### 3.3 Team Formation Rules

1. Go to **Team Formation** in the sidebar
2. Click **Create Rule**
3. Fill in:
   - **Label**: Descriptive name (e.g., "Mixed CGPA Team of 4")
   - **Team Size**: Exact number of members per team
   - **Max Teams**: Maximum teams allowed under this rule
4. Add **CGPA Slots**:
   - Each slot specifies a CGPA range and how many members from that range are needed
   - Slot member counts must add up to Team Size
   - Example: Team of 4 → Slot 1 (8.0–10.0, count 2) + Slot 2 (6.0–7.9, count 2)
5. Click **Save Rule**

**To disable a rule**: Toggle the enable switch — students cannot form new teams under a disabled rule.

### 3.4 Reviewing Proposals

1. Go to **Proposals**
2. Pending proposals are listed at the top
3. Click a proposal to review title, description, and UN SDG selections
4. Choose an action:
   - **Approve**: Proposal is accepted; milestones can now be created
   - **Reject**: Enter a rejection reason; students are notified
   - **Request Changes**: Enter revision notes; students must resubmit

### 3.5 Milestones

For each approved proposal you can create milestones:
1. Go to the section's **Milestones** tab (or the global **Milestones** page)
2. Click **Add Milestone**
3. Enter: Name, Description, Deadline (must be a future date)
4. Click **Save**

Milestone statuses: **Open** → **Completed** / **Missed** (after deadline)

### 3.6 Submission Windows

Submission windows define the time period during which students can upload artifacts for a milestone:

1. Go to **Submission Windows**
2. Click **Create Window**
3. Select the milestone, set open and close times
4. Click **Create**

Students can only submit while the window is open.

### 3.7 Mentee Teams

1. Go to **My Sections** → select a section → **Teams** tab
2. Click a team name to open the **Mentee Team Dashboard**
3. View tabs: Members, Proposals, Milestones, Submissions
4. In the **Submissions** tab you can view uploaded PPT, Report files (via View button) and GitHub links

### 3.8 Students

Browse all students across your sections. Update CGPA or section assignment as needed.

---

## 4. Student Portal

Students manage their team, project proposals, milestones, and submissions.

### 4.1 Dashboard

The student dashboard shows:
- Greeting with your name and USN
- Current team status
- Proposal progress summary (donut chart)
- Milestone status (donut chart)
- Upcoming deadlines
- Progress checklist (5 sequential steps)
- Quick action buttons

### 4.2 My Teams

#### Forming a Team

1. Go to **My Teams**
2. If you have no team, available rules are listed
3. Click **Form a Team** under a rule that matches your CGPA
4. Enter a team name and click **Create**
5. You become the Team Lead

#### Joining a Team

1. Go to **My Teams**
2. Browse available teams
3. Click **Join** on a team where your CGPA fits an open slot
4. Or, wait for a team lead to send you an invitation

#### Team Invitations

- Team leads can send invitations to specific students
- Go to your team, click **Invite Member**, search by name/USN
- Invited students see a notification and can accept or reject
- Accepting adds them to the team (if their CGPA fits the slot)

#### Team Status

| Status | Meaning |
|--------|---------|
| Forming | Not all slots are filled yet |
| Confirmed | All CGPA slots are satisfied — team is complete |
| Dissolved | Team has been dissolved (by faculty or admin) |

Only a **confirmed** team can submit proposals.

### 4.3 Proposals

#### Submitting a Proposal

1. Go to **Proposals**
2. Click **New Proposal**
3. Fill in:
   - **Title**: Clear, concise project title
   - **Description**: Detailed explanation of the project
   - **UN SDGs**: Select 1 or more of the 17 Sustainable Development Goals that your project aligns with
4. Click **Submit for Review**

Your proposal status is now **Pending**.

#### Tracking Status

| Status | Meaning | Your Action |
|--------|---------|-------------|
| Pending | Awaiting faculty review | Wait |
| Approved | Faculty accepted it | None — milestones will be assigned |
| Rejected | Faculty rejected it | Read rejection reason; submit a new proposal if needed |
| Revision Requested | Faculty wants changes | Edit and resubmit |

#### Resubmitting

If faculty requests changes:
1. Click **Resubmit** on the proposal
2. Update the title, description, and/or SDGs based on the revision notes
3. Click **Resubmit**
4. The proposal returns to **Pending** status (version number increments)

### 4.4 Milestones

Go to **Milestones** to view all milestones created by your faculty for your approved proposal.

The timeline view shows:
- Milestone name and description
- Deadline date
- Status: Open / Completed / Missed
- Color coding: upcoming deadlines highlighted in orange/red

### 4.5 Submissions

Go to **Submissions** to upload project artifacts:

#### When a Submission Window is Open

Three artifact types per milestone window:
1. **PPT** – Upload a PowerPoint file (.pptx or .ppt, max 100 MB)
2. **Project Report** – Upload a PDF document (max 50 MB)
3. **GitHub Link** – Enter your GitHub repository URL

**Upload Steps:**
1. Find the open window for your milestone
2. For PPT/Report: drag & drop the file onto the upload zone, or click to browse
3. For GitHub: enter your repository URL in the text field
4. Click **Submit**

**Validation:**
- PPT must be .pptx or .ppt
- Report must be .pdf
- GitHub URL must start with `https://github.com/`
- All files have size limits enforced

#### When a Submission Window is Closed

If the window is closed:
- If you submitted: you can **View** your submissions (read-only)
  - Click **View PPT** or **View Report** to open a temporary link (valid for 5 minutes)
  - Click the GitHub link to open the repository
- If you did not submit: a summary shows "No submission recorded"

### 4.6 Profile

Go to **Profile** to manage your academic details:

| Field | How to Update |
|-------|--------------|
| CGPA | Enter new value → Save (affects team formation eligibility) |
| Skills | Add/remove skills from your profile |
| GitHub URL | Enter your GitHub profile URL |
| Resume | Upload a PDF resume (max 20 MB) |

Changes to CGPA may affect your team eligibility — changes after joining a team do not retroactively change team status.

### 4.7 Notifications

Go to **Notifications** to see all alerts:
- Proposal status changes
- Team invitation received
- Milestone deadline approaching
- Submission window opened/closed

Click any notification to navigate directly to the relevant page. Unread notifications are highlighted.

### 4.8 Guide

The built-in Guide page provides:
- Step-by-step instructions for all workflows
- Visual flow diagrams
- Rule tables and permission summaries
- FAQ section

---

## 5. UN Sustainable Development Goals Reference

AcadeX requires all proposals to be mapped to at least one of the 17 UN SDGs:

| # | Goal |
|---|------|
| 1 | No Poverty |
| 2 | Zero Hunger |
| 3 | Good Health and Well-being |
| 4 | Quality Education |
| 5 | Gender Equality |
| 6 | Clean Water and Sanitation |
| 7 | Affordable and Clean Energy |
| 8 | Decent Work and Economic Growth |
| 9 | Industry, Innovation and Infrastructure |
| 10 | Reduced Inequalities |
| 11 | Sustainable Cities and Communities |
| 12 | Responsible Consumption and Production |
| 13 | Climate Action |
| 14 | Life Below Water |
| 15 | Life on Land |
| 16 | Peace, Justice and Strong Institutions |
| 17 | Partnerships for the Goals |

---

## 6. File Upload Limits

| Artifact | Accepted Format | Max Size |
|----------|----------------|----------|
| Resume | PDF only | 20 MB |
| PPT | .pptx, .ppt | 100 MB |
| Project Report | PDF only | 50 MB |

---

## 7. Common Questions

**Q: I formed a team but my status shows "Forming" — what does that mean?**  
A: Not all CGPA slots are filled yet. Invite students whose CGPA fits the remaining slots to complete the team.

**Q: Can I be in more than one team?**  
A: No. Each student can be a member of only one team per section.

**Q: My proposal was rejected — can I resubmit?**  
A: If rejected (not revision-requested), submit a new proposal. You can only resubmit when the status is "Revision Requested".

**Q: The submission window is closed and I forgot to upload — what happens?**  
A: Your submission status is marked as "missed_deadline". Contact your faculty for guidance.

**Q: I cannot see my section or team — why?**  
A: Your admin may not have assigned you to a section yet. Check with your administrator or faculty.

**Q: The View button for my PPT opened a link that expired — what do I do?**  
A: Signed links expire after 5 minutes. Click **View** again to generate a fresh link.

**Q: How do I enable MFA on my account?**  
A: Go to your profile settings and follow the TOTP setup instructions. Download an authenticator app (Google Authenticator, Authy) and scan the QR code.

---

## 8. Browser Support

AcadeX is tested on:
- Google Chrome 120+
- Mozilla Firefox 120+
- Microsoft Edge 120+
- Safari 17+

JavaScript must be enabled. Screen resolution of 1024×768 or higher is recommended.

---

*Last Updated: November 2026 | Author: Naren SJ*
