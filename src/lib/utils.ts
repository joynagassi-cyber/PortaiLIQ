import { v4 as uuidv4 } from "uuid";

export function generateToken(): string {
  return uuidv4() + uuidv4().replace(/-/g, "").slice(0, 16);
}

export function generatePortalSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export const ALLOWED_FILE_TYPES = [
  "pdf", "png", "jpg", "jpeg", "gif", "svg",
  "doc", "docx", "xls", "xlsx", "csv",
  "zip", "rar", "7z",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function isAllowedFileType(mimeType: string): boolean {
  const ext = mimeType.split("/").pop()?.toLowerCase() || "";
  return ALLOWED_FILE_TYPES.includes(ext);
}

export function getReminderDays(schedule: string[]): number[] {
  return schedule.map((s) => parseInt(s.replace("d", ""), 10));
}
