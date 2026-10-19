"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/forms/FormError";
import { IconClose } from "@/components/ui/Icon";

interface Props {
  studentId: string;
  fullName: string;
  email: string;
  usn: string;
  cgpa: number;
  initialSkills: string[];
  initialGithubUrl: string;
  resumePath: string | null;
}

export function StudentProfileClient({
  studentId, fullName, email, usn, cgpa,
  initialSkills, initialGithubUrl, resumePath,
}: Props) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState("");
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [savingSkills, setSavingSkills] = useState(false);

  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [savingGithub, setSavingGithub] = useState(false);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(!!resumePath);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) { setSkillsError("Each skill must not exceed 50 characters."); return; }
    if (skills.length >= 20) { setSkillsError("Maximum 20 skills allowed."); return; }
    if (skills.includes(trimmed)) { setSkillsError("Skill already added."); return; }
    setSkills((prev) => [...prev, trimmed]);
    setNewSkill("");
    setSkillsError(null);
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function saveSkills() {
    setSavingSkills(true); setSkillsError(null);
    const res = await fetch(`/api/students/${studentId}/skills`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) setSkillsError(data.error ?? "Failed to save skills.");
    setSavingSkills(false);
  }

  async function saveGithub(e: React.FormEvent) {
    e.preventDefault();
    setSavingGithub(true); setGithubError(null);
    const res = await fetch(`/api/students/${studentId}/github`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ github_url: githubUrl }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) setGithubError(data.error ?? "Failed to save GitHub URL.");
    setSavingGithub(false);
  }

  async function uploadResume() {
    if (!resumeFile) return;
    setUploadingResume(true); setResumeError(null);
    const fd = new FormData();
    fd.append("file", resumeFile);
    const res = await fetch(`/api/students/${studentId}/resume`, { method: "POST", body: fd });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setResumeError(data.error ?? "Upload failed."); setUploadingResume(false); return; }
    setResumeUploaded(true);
    setUploadingResume(false);
  }

  async function viewResume() {
    const res = await fetch(`/api/students/${studentId}/resume/url`);
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) { setResumeUrl(data.url); window.open(data.url, "_blank"); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Read-only info */}
      <Card>
        <CardHeader><CardTitle>Account Info</CardTitle></CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            {[
              { label: "Full Name", value: fullName },
              { label: "Email", value: email },
              { label: "USN", value: usn },
              { label: "CGPA", value: cgpa.toFixed(2) },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium text-neutral-500">{label}</dt>
                <dd className="mt-0.5 text-sm text-neutral-900">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* GitHub URL */}
      <Card>
        <CardHeader><CardTitle>GitHub Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveGithub} className="flex flex-col gap-3">
            <FormError message={githubError} />
            <Input
              label="GitHub Profile URL"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              error={githubError ?? undefined}
            />
            <Button type="submit" variant="primary" size="sm" isLoading={savingGithub}>
              Save GitHub URL
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader><CardTitle>Skills ({skills.length}/20)</CardTitle></CardHeader>
        <CardContent>
          <FormError message={skillsError} />
          <div className="mb-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs"
                style={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 inline-flex items-center text-neutral-400 hover:text-red-500"
                  aria-label={`Remove skill ${skill}`}
                >
                  <IconClose size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              label="Add skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="e.g. React"
              maxLength={50}
            />
            <Button type="button" variant="secondary" size="sm" onClick={addSkill} className="mt-6 flex-shrink-0">
              Add
            </Button>
          </div>
          <Button type="button" variant="primary" size="sm" className="mt-4" isLoading={savingSkills} onClick={saveSkills}>
            Save Skills
          </Button>
        </CardContent>
      </Card>

      {/* Resume */}
      <Card>
        <CardHeader><CardTitle>Resume</CardTitle></CardHeader>
        <CardContent>
          <FormError message={resumeError} />
          <p className="mb-3 text-sm text-neutral-500">
            {resumeUploaded ? "A resume is uploaded." : "No resume uploaded yet."} PDF only, max 20 MB.
          </p>
          <div className="flex flex-col gap-3">
            <label htmlFor="resume-upload" className="text-sm font-medium text-neutral-700">
              Upload new resume
            </label>
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              className="text-sm text-neutral-600"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={uploadResume}
              isLoading={uploadingResume}
              disabled={!resumeFile}
            >
              Upload Resume
            </Button>
            {resumeUploaded && (
              <Button type="button" variant="secondary" size="sm" onClick={viewResume}>
                View Resume (Signed URL)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
