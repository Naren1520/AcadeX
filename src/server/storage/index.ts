import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  STORAGE_BUCKET,
  type ArtefactCategory,
} from "@/lib/constants/storage";
import { ValidationError } from "@/lib/errors";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import type { Role } from "@/server/authorization";

export interface UploadRequest {
  file: File;
  category: ArtefactCategory;
  /** Full storage path: {academic_year}/{dept}/{team_id}/{milestone_id}/{type}/{filename} */
  path: string;
  actorId: string;
  actorRole: Role;
}

/**
 * Validates MIME type and file size BEFORE calling Supabase Storage.
 * Writes a `file.uploaded` audit entry on success.
 */
export async function uploadArtefact(
  req: UploadRequest
): Promise<{ storagePath: string }> {
  const allowedMimeTypes = ALLOWED_MIME_TYPES[req.category];

  if (!allowedMimeTypes.includes(req.file.type)) {
    throw new ValidationError(
      `File type "${req.file.type}" is not permitted for ${req.category} uploads. Permitted types: ${allowedMimeTypes.join(", ")}.`,
      { mimeType: `Must be one of: ${allowedMimeTypes.join(", ")}` }
    );
  }

  const maxBytes = MAX_FILE_SIZE_BYTES[req.category];
  if (req.file.size > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    throw new ValidationError(
      `File size exceeds the ${maxMb} MB limit for ${req.category} uploads.`,
      { fileSize: `Must not exceed ${maxMb} MB` }
    );
  }

  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(req.path, req.file, { upsert: true });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  await writeAuditLog({
    actorId: req.actorId,
    actorRole: req.actorRole,
    actionType: AuditEventTypes.FILE_UPLOADED,
    targetTable: "storage",
    targetRecordId: req.path,
    newValue: { storagePath: req.path, category: req.category },
  });

  return { storagePath: req.path };
}

/**
 * Generates a signed URL capped at 3600 seconds.
 * Writes a `file.accessed` audit entry on success.
 */
export async function generateSignedUrl(
  storagePath: string,
  actorId: string,
  actorRole: Role,
  expiresInSeconds = 3600
): Promise<string> {
  const cappedExpiry = Math.min(expiresInSeconds, 3600);

  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, cappedExpiry);

  if (error || !data) {
    throw new Error(
      `Failed to generate signed URL: ${error?.message ?? "unknown error"}`
    );
  }

  await writeAuditLog({
    actorId,
    actorRole,
    actionType: AuditEventTypes.FILE_ACCESSED,
    targetTable: "storage",
    targetRecordId: storagePath,
    newValue: { storagePath, expiresInSeconds: cappedExpiry },
  });

  return data.signedUrl;
}

/**
 * Pure validation helper - useful for testing without storage side-effects.
 */
export function validateFileUpload(
  mimeType: string,
  sizeBytes: number,
  category: ArtefactCategory
): { valid: boolean; error?: string } {
  const allowed = ALLOWED_MIME_TYPES[category];
  if (!allowed.includes(mimeType)) {
    return {
      valid: false,
      error: `MIME type "${mimeType}" is not permitted for ${category}.`,
    };
  }
  const max = MAX_FILE_SIZE_BYTES[category];
  if (sizeBytes > max) {
    return {
      valid: false,
      error: `File size ${sizeBytes} bytes exceeds ${max / (1024 * 1024)} MB limit.`,
    };
  }
  return { valid: true };
}
