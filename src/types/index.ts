export type Job = {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_city: string;
  job_state: string;
  job_country: string;
  job_description: string;
  job_employment_type: string;
  job_apply_link: string;
  job_is_remote: boolean;
  job_posted_at_datetime_utc: string;
  job_required_skills: string[] | null;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
  };
};

export type JobMatchScore = {
  job_id: string;
  score: number;
  matched_skills: string[];
  explanation: string;
};

export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";

export type Application = {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  company: string;
  job_url: string | null;
  location: string | null;
  status: ApplicationStatus;
  applied_at: string;
  created_at: string;
  updated_at: string;
};

export type JobFilters = {
  query: string;
  skills: string[];
  datePosted: string;
  employmentType: string;
  workMode: string;
  location: string;
  matchScore: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
