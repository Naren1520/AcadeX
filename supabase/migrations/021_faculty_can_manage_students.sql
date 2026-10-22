-- Migration 021: allow admin to grant faculty permission to manage students in their section
ALTER TABLE faculty_assignments
  ADD COLUMN IF NOT EXISTS can_manage_students boolean NOT NULL DEFAULT false;
