import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getJobApplyUrl(job: {
  job_apply_link?: string | null;
  apply_options?: Array<{ apply_link?: string; publisher?: string }> | null;
  job_google_link?: string | null;
  employer_website?: string | null;
  employer_name?: string | null;
  job_title?: string | null;
}): string {
  // 1. Direct apply link if available
  if (job.job_apply_link && job.job_apply_link.trim().length > 0) {
    return normalizeUrl(job.job_apply_link);
  }

  // 2. First valid publisher apply link (e.g. LinkedIn, Indeed, Glassdoor)
  if (job.apply_options && Array.isArray(job.apply_options) && job.apply_options.length > 0) {
    const validOption = job.apply_options.find((opt) => opt.apply_link && opt.apply_link.trim().length > 0);
    if (validOption?.apply_link) {
      return normalizeUrl(validOption.apply_link);
    }
  }

  // 3. Google Jobs viewer link
  if (job.job_google_link && job.job_google_link.trim().length > 0) {
    return normalizeUrl(job.job_google_link);
  }

  // 4. Employer career/company website
  if (job.employer_website && job.employer_website.trim().length > 0) {
    return normalizeUrl(job.employer_website);
  }

  // 5. Fallback Google search query for the specific position
  const employer = job.employer_name || "";
  const title = job.job_title || "";
  return `https://www.google.com/search?q=${encodeURIComponent(`${employer} ${title} apply job`.trim())}`;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const rawText = await file.text();
  if (file.name.toLowerCase().endsWith(".txt")) {
    return rawText;
  }

  // Clean ASCII characters and words from PDF or other text formats
  const cleanAscii = rawText
    .replace(/[^\x20-\x7E\r\n\t]/g, " ")
    .replace(/\s+/g, " ");

  const words = cleanAscii.match(/[a-zA-Z0-9.,@#+/\-_]{2,}/g) || [];
  const extracted = words.join(" ");

  if (extracted.length > 30) {
    return extracted.slice(0, 15000);
  }

  return rawText.slice(0, 15000);
}

