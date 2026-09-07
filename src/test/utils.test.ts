import { describe, it, expect } from "vitest";
import { getJobApplyUrl, normalizeUrl } from "@/lib/utils";

describe("normalizeUrl", () => {
  it("prepends https:// when missing protocol", () => {
    expect(normalizeUrl("example.com/job/123")).toBe("https://example.com/job/123");
  });

  it("leaves existing http/https intact", () => {
    expect(normalizeUrl("https://example.com/apply")).toBe("https://example.com/apply");
    expect(normalizeUrl("http://example.com/apply")).toBe("http://example.com/apply");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl(null)).toBe("");
  });
});

describe("getJobApplyUrl", () => {
  it("prioritizes direct job_apply_link", () => {
    const job = {
      job_apply_link: "https://company.com/apply",
      apply_options: [{ apply_link: "https://linkedin.com/apply" }],
      job_google_link: "https://google.com/jobs",
    };
    expect(getJobApplyUrl(job)).toBe("https://company.com/apply");
  });

  it("falls back to apply_options when job_apply_link is missing", () => {
    const job = {
      job_apply_link: "",
      apply_options: [{ apply_link: "https://linkedin.com/apply" }],
      job_google_link: "https://google.com/jobs",
    };
    expect(getJobApplyUrl(job)).toBe("https://linkedin.com/apply");
  });

  it("falls back to job_google_link when other options missing", () => {
    const job = {
      job_apply_link: "",
      apply_options: [],
      job_google_link: "https://google.com/jobs/123",
    };
    expect(getJobApplyUrl(job)).toBe("https://google.com/jobs/123");
  });

  it("falls back to Google search when no links provided", () => {
    const job = {
      employer_name: "Acme Corp",
      job_title: "Fullstack Engineer",
    };
    expect(getJobApplyUrl(job)).toContain("https://www.google.com/search?q=");
    expect(getJobApplyUrl(job)).toContain("Acme%20Corp");
  });
});
