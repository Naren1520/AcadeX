export interface TeamMember {
  name: string;
  role: string;
  image: string;
  isLead?: boolean;
  socials?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

export interface MentorInfo {
  name: string;
  role: string;
  designation: string;
  department: string;
  institution: string;
  description?: string;
  image?: string;
  linkedin?: string;
}

export const projectMeta = {
  title: "AcadeX",
  subtitle: " Academic Project Governance & Management Platform",
  projectType: "Academic Mini Project",
  semester: "5th Semester",
  department: "Department of Information Science & Engineering",
  section: "Section B",
  institution: "Sahyadri College of Engineering & Management",
  institutionTag: "Autonomous Institution, Mangaluru",
  summary:
    "AcadeX was conceptualized and engineered as an Academic Mini Project by 5th Semester Information Science & Engineering (Section B) students at Sahyadri College of Engineering & Management. Under the mentorship of Dr. Rithesh Pakkala, HoD ISE, the platform solves core institutional bottlenecks across academic project lifecycles: automated CGPA-based team formation, mandatory UN SDG proposal alignment, milestone window control, versioned artefact archiving, and tamper-resistant audit logs.",
};

export const mentorData: MentorInfo = {
  name: "Dr. Rithesh Pakkala",
  role: "Project Mentor & Guide",
  designation: "Head of the Department (HoD)",
  department: "Department of Information Science & Engineering",
  institution: "Sahyadri College of Engineering & Management (Autonomous), Mangaluru",
  image: "/images/team/hod.png",
  linkedin: "https://www.linkedin.com/in/dr-rithesh-pakkala-permanki-guthu-537b073b/",
};

export const teamMembers: TeamMember[] = [
  {
    name: "Naren S J",
    role: "Team Lead & Developer",
    image: "/images/team/narensj.png",
    isLead: true,
    socials: {
      github: "https://github.com/Naren1520",
      linkedin: "https://www.linkedin.com/in/narensj20/",
      portfolio: "https://narensj.netlify.app/",
    },
  },
  {
    name: "Yaksha Shetty",
    role: "Team Member &  Developer",
    image: "/images/team/image.png",
  },
  {
    name: "Ananya Naik",
    role: "Team Member & Developer",
    image: "/images/team/image.png",
  },
  {
    name: "Vaishnavi Naik",
    role: "Team Member & Developer",
    image: "/images/team/image.png",
  },
];

export const platformHighlights = [
  {
    title: "CGPA-Balanced Formation",
    desc: "Enforces fair team composition and department criteria automatically before project registration.",
  },
  {
    title: "17 UN SDG Integrations",
    desc: "Formal sustainability goal classification enabling verifiable accreditation reporting.",
  },
  {
    title: "Milestone Windows & Deadlines",
    desc: "Strict cutoffs, upload verification, and automated tracking for reports, slides, and code repos.",
  },
  {
    title: "Immutable Audit Trail",
    desc: "Zero-loss record of every proposal defense, faculty review remarks, and grade submission.",
  },
];
