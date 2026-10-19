// Auto-generated types — re-run `supabase gen types typescript --local > src/types/database.ts`
// after any migration changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "faculty" | "student";
          full_name: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: "admin" | "faculty" | "student";
          full_name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "faculty" | "student";
          full_name?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      academic_years: {
        Row: {
          id: string;
          label: string;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      semesters: {
        Row: {
          id: string;
          academic_year_id: string;
          label: string;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academic_year_id: string;
          label: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academic_year_id?: string;
          label?: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          semester_id: string;
          department_id: string;
          label: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          semester_id: string;
          department_id: string;
          label: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          semester_id?: string;
          department_id?: string;
          label?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      faculty_assignments: {
        Row: {
          id: string;
          faculty_id: string;
          section_id: string;
          department_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          faculty_id: string;
          section_id: string;
          department_id: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          faculty_id?: string;
          section_id?: string;
          department_id?: string;
          assigned_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          usn: string;
          department_id: string;
          section_id: string | null;
          cgpa: number;
          skills: string[];
          github_url: string | null;
          resume_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          usn: string;
          department_id: string;
          section_id?: string | null;
          cgpa: number;
          skills?: string[];
          github_url?: string | null;
          resume_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          usn?: string;
          department_id?: string;
          section_id?: string | null;
          cgpa?: number;
          skills?: string[];
          github_url?: string | null;
          resume_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_formation_rules: {
        Row: {
          id: string;
          faculty_id: string;
          section_id: string;
          cgpa_lower: number;
          cgpa_upper: number;
          min_team_size: number;
          max_team_size: number;
          max_teams: number;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          faculty_id: string;
          section_id: string;
          cgpa_lower: number;
          cgpa_upper: number;
          min_team_size: number;
          max_team_size: number;
          max_teams: number;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          faculty_id?: string;
          section_id?: string;
          cgpa_lower?: number;
          cgpa_upper?: number;
          min_team_size?: number;
          max_team_size?: number;
          max_teams?: number;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          section_id: string;
          rule_id: string;
          name: string;
          status: "forming" | "confirmed" | "dissolved";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          rule_id: string;
          name: string;
          status?: "forming" | "confirmed" | "dissolved";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          rule_id?: string;
          name?: string;
          status?: "forming" | "confirmed" | "dissolved";
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          student_id: string;
          is_lead: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          student_id: string;
          is_lead?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          student_id?: string;
          is_lead?: boolean;
          joined_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          team_id: string;
          faculty_id: string;
          title: string;
          description: string;
          status: "pending" | "approved" | "rejected" | "revision_requested";
          parent_proposal_id: string | null;
          version: number;
          rejection_reason: string | null;
          revision_notes: string | null;
          reviewed_at: string | null;
          submitted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          faculty_id: string;
          title: string;
          description: string;
          status?: "pending" | "approved" | "rejected" | "revision_requested";
          parent_proposal_id?: string | null;
          version?: number;
          rejection_reason?: string | null;
          revision_notes?: string | null;
          reviewed_at?: string | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          faculty_id?: string;
          title?: string;
          description?: string;
          status?: "pending" | "approved" | "rejected" | "revision_requested";
          parent_proposal_id?: string | null;
          version?: number;
          rejection_reason?: string | null;
          revision_notes?: string | null;
          reviewed_at?: string | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposal_sdgs: {
        Row: {
          id: string;
          proposal_id: string;
          sdg_number: number;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          sdg_number: number;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          sdg_number?: number;
        };
      };
      milestones: {
        Row: {
          id: string;
          proposal_id: string;
          faculty_id: string;
          name: string;
          description: string;
          deadline: string;
          status: "open" | "completed" | "missed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          faculty_id: string;
          name: string;
          description?: string;
          deadline: string;
          status?: "open" | "completed" | "missed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          faculty_id?: string;
          name?: string;
          description?: string;
          deadline?: string;
          status?: "open" | "completed" | "missed";
          created_at?: string;
          updated_at?: string;
        };
      };
      submission_windows: {
        Row: {
          id: string;
          milestone_id: string;
          faculty_id: string;
          opens_at: string;
          closes_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          milestone_id: string;
          faculty_id: string;
          opens_at: string;
          closes_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          milestone_id?: string;
          faculty_id?: string;
          opens_at?: string;
          closes_at?: string;
          created_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          team_id: string;
          milestone_id: string;
          window_id: string;
          submitted_by: string;
          artefact_type: "ppt" | "report" | "github_link";
          storage_path: string | null;
          github_url: string | null;
          status: "submitted" | "accepted" | "missed_deadline";
          submitted_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          milestone_id: string;
          window_id: string;
          submitted_by: string;
          artefact_type: "ppt" | "report" | "github_link";
          storage_path?: string | null;
          github_url?: string | null;
          status?: "submitted" | "accepted" | "missed_deadline";
          submitted_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          milestone_id?: string;
          window_id?: string;
          submitted_by?: string;
          artefact_type?: "ppt" | "report" | "github_link";
          storage_path?: string | null;
          github_url?: string | null;
          status?: "submitted" | "accepted" | "missed_deadline";
          submitted_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          message: string;
          deep_link: string;
          trigger_event: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          message: string;
          deep_link: string;
          trigger_event: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          message?: string;
          deep_link?: string;
          trigger_event?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          event_id: string;
          actor_id: string;
          actor_role: "admin" | "faculty" | "student" | "system";
          action_type: string;
          target_table: string;
          target_record_id: string;
          previous_value: Json | null;
          new_value: Json | null;
          created_at: string;
        };
        Insert: {
          event_id?: string;
          actor_id: string;
          actor_role: "admin" | "faculty" | "student" | "system";
          action_type: string;
          target_table: string;
          target_record_id: string;
          previous_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          actor_id?: string;
          actor_role?: "admin" | "faculty" | "student" | "system";
          action_type?: string;
          target_table?: string;
          target_record_id?: string;
          previous_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
      };
      email_retry_queue: {
        Row: {
          id: string;
          recipient_id: string | null;
          recipient_email: string;
          subject: string;
          body_html: string;
          trigger_event: string;
          attempt_count: number;
          next_attempt_at: string;
          exhausted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipient_id?: string | null;
          recipient_email: string;
          subject: string;
          body_html: string;
          trigger_event: string;
          attempt_count?: number;
          next_attempt_at?: string;
          exhausted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string | null;
          recipient_email?: string;
          subject?: string;
          body_html?: string;
          trigger_event?: string;
          attempt_count?: number;
          next_attempt_at?: string;
          exhausted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
