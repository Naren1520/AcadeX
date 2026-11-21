# AcadeX – Testing Strategy

## Overview

AcadeX uses a multi-layer testing approach to ensure correctness, security, and reliability across the platform.

| Layer | Tool | Location | Scope |
|-------|------|----------|-------|
| Unit tests | Vitest | `tests/unit/` | Pure functions, business logic, state machines |
| Integration tests | Vitest + Supabase | `tests/integration/` | API routes with real DB |
| E2E tests | Playwright | `tests/e2e/` | Full user flows in browser |
| Security tests | Custom | `tests/security/` | RLS, auth bypass attempts |

---

## 1. Unit Tests (Vitest)

Unit tests cover pure functions with no external dependencies.

### Running Tests

```bash
# Single run
npx vitest run

# Watch mode (development)
npx vitest
```

### Test Files

#### `proposalStateMachine.test.ts`

Tests the proposal FSM state transition logic.

**Covered cases**:
- `pending → approved` → allowed
- `pending → rejected` → allowed
- `pending → revision_requested` → allowed
- `revision_requested → pending` → allowed
- `approved → rejected` → rejected (terminal state)
- `rejected → pending` → rejected (terminal state)
- `approved → approved` → rejected (self-transition not allowed)
- Milestone deadline validation (past date rejected)
- Milestone deadline validation (future date accepted)

```typescript
// Example test
it('should allow pending → approved transition', () => {
  const result = applyProposalTransition('pending', 'approved');
  expect(result.success).toBe(true);
});

it('should reject approved → rejected transition', () => {
  const result = applyProposalTransition('approved', 'rejected');
  expect(result.success).toBe(false);
});
```

#### `teamFormation.test.ts`

Tests CGPA eligibility, slot validation, and band checks.

**Covered cases**:
- Student CGPA in range → eligible
- Student CGPA out of range → not eligible
- Slot counts sum to team_size → valid
- Slot counts do not sum to team_size → invalid
- CGPA upper < lower → invalid
- CGPA bounds outside [0, 10] → invalid (legacy band check)
- `findMatchingSlot()` exact boundary conditions
- Multiple slots — matches correct slot
- No slots defined (legacy rule) → eligible if in legacy band

```typescript
it('should find matching slot for CGPA 8.5', () => {
  const slots = [
    { cgpa_lower: 8.0, cgpa_upper: 10.0, count: 2, label: 'High' },
    { cgpa_lower: 6.0, cgpa_upper: 7.9,  count: 2, label: 'Mid'  },
  ];
  const match = findMatchingSlot(8.5, slots);
  expect(match?.label).toBe('High');
});
```

#### `validation.test.ts`

Tests Zod schema edge cases for API inputs.

**Covered cases**:
- Proposal title: empty string, too short, too long, valid
- SDG numbers: out of range (0, 18), valid range (1–17), duplicates
- CGPA: negative, above 10, valid decimal
- GitHub URL: non-GitHub domain, valid URL, missing https
- File size: at limit, over limit

---

## 2. Integration Tests (Planned)

Integration tests will use a test Supabase instance.

### Planned Coverage

| Endpoint | Scenarios |
|----------|-----------|
| `POST /api/auth/login` | Valid credentials, invalid credentials, rate limit |
| `POST /api/proposals` | Confirmed team can submit, unconfirmed cannot, duplicate active proposal rejected |
| `POST /api/teams` | CGPA eligible can form, ineligible rejected, quota exceeded |
| `POST /api/teams/[id]/join` | Slot filled correctly, full team rejected |
| `POST /api/proposals/[id]/approve` | Faculty can approve, student cannot, wrong role rejected |
| `POST /api/submissions/ppt` | Valid file accepted, wrong MIME rejected, closed window rejected |

### Setup

```typescript
// tests/integration/setup.ts
import { createClient } from '@supabase/supabase-js';

export const testSupabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
);

// Seed test data before each suite
// Clean up after each test
```

---

## 3. E2E Tests (Playwright)

E2E tests run a real browser against a running application.

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run with UI (debugging)
npx playwright test --ui

# Run specific file
npx playwright test tests/e2e/auth.spec.ts
```

### Planned Test Scenarios

#### Authentication Flow
- [ ] Login with valid credentials → redirect to correct portal
- [ ] Login with invalid credentials → error message shown
- [ ] MFA verification screen appears for MFA-enrolled users
- [ ] Logout clears session and redirects to login
- [ ] Password reset email triggered

#### Admin Flows
- [ ] Create department → appears in list
- [ ] Create academic year → semester created under it
- [ ] Assign faculty → appears in assignments table
- [ ] View audit log → shows recent events

#### Faculty Flows
- [ ] Create team formation rule with slots → appears in list
- [ ] Approve a proposal → status changes to Approved
- [ ] Reject proposal with reason → student notified
- [ ] Create milestone → appears in section dashboard
- [ ] Create submission window → students can submit

#### Student Flows
- [ ] Form a team → status is Forming
- [ ] Team confirmed when all slots filled
- [ ] Submit proposal → status Pending
- [ ] After approval, milestones visible
- [ ] Upload PPT in open window → submission recorded
- [ ] View uploaded file via signed URL
- [ ] Notification appears on proposal approval

#### Security Flows
- [ ] Student cannot access `/admin` → redirected
- [ ] Faculty cannot access `/admin` → redirected
- [ ] Student cannot approve proposals (API returns 403)
- [ ] Student cannot view another team's submissions

### Example Test

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('student login redirects to student portal', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'student@test.edu');
  await page.fill('[name="password"]', 'password123');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/student');
});

test('invalid login shows error', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'nobody@test.edu');
  await page.fill('[name="password"]', 'wrongpassword');
  await page.click('[type="submit"]');
  await expect(page.locator('[role="alert"]')).toBeVisible();
});
```

---

## 4. Security Tests

### RLS Policy Tests

Verify that database-level security cannot be bypassed:

```typescript
// tests/security/rls.test.ts

// Student cannot read another student's data
it('student cannot read other student record', async () => {
  const student1Client = createClientAsStudent('student-1-id');
  const { data, error } = await student1Client
    .from('students')
    .select('*')
    .eq('id', 'student-2-id')
    .single();
  expect(data).toBeNull();
});

// Student cannot update proposal status
it('student cannot update proposal status', async () => {
  const studentClient = createClientAsStudent('student-id');
  const { error } = await studentClient
    .from('proposals')
    .update({ status: 'approved' })
    .eq('id', 'some-proposal-id');
  expect(error).toBeTruthy();
});
```

### Auth Bypass Attempts

```typescript
// tests/security/auth.test.ts

// API route without session returns 401
it('unauthenticated request to proposals API returns 401', async () => {
  const res = await fetch('/api/proposals');
  expect(res.status).toBe(401);
});

// Student role cannot call faculty endpoint
it('student cannot approve proposal', async () => {
  const res = await fetchAsStudent(`/api/proposals/${proposalId}/approve`, {
    method: 'POST'
  });
  expect(res.status).toBe(403);
});
```

---

## 5. Test Configuration

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': '/src' },
  },
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 6. Test Coverage Goals

| Module | Target Coverage |
|--------|----------------|
| `proposalStateMachine.ts` | 100% |
| `teamFormationEngine.ts` (pure functions) | 100% |
| `storage/index.ts` (validateFileUpload) | 100% |
| API routes (integration) | 80%+ |
| E2E critical paths | All user-facing workflows |

---

## 7. CI Integration

Add to GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npx vitest run
      - run: npm run build
```

---

*Last Updated: November 2026 | Author: Naren SJ*
