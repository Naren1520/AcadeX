export type ArtefactCategory = "resume" | "ppt" | "report";

export const ALLOWED_MIME_TYPES: Record<ArtefactCategory, string[]> = {
  resume: ["application/pdf"],
  ppt: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
  ],
  report: ["application/pdf"],
};

export const MAX_FILE_SIZE_BYTES: Record<ArtefactCategory, number> = {
  resume: 20 * 1024 * 1024,   // 20 MB
  ppt: 100 * 1024 * 1024,     // 100 MB
  report: 50 * 1024 * 1024,   // 50 MB
};

export const STORAGE_BUCKET = "acadex-artefacts";
