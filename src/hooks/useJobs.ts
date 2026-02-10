import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Job, JobFilters, JobMatchScore } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matchScores, setMatchScores] = useState<Record<string, JobMatchScore>>({});
  const [loading, setLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const { toast } = useToast();

  const searchJobs = async (filters: Partial<JobFilters>) => {
    setLoading(true);
    try {
      const body: Record<string, any> = {
        query: filters.query || "software developer",
        num_pages: 1,
      };
      if (filters.datePosted && filters.datePosted !== "all") body.date_posted = filters.datePosted;
      if (filters.employmentType && filters.employmentType !== "all") body.employment_types = filters.employmentType;
      if (filters.workMode === "remote") body.remote_jobs_only = true;

      const { data, error } = await supabase.functions.invoke("search-jobs", { body });
      if (error) throw error;
      const fetchedJobs: Job[] = data?.data || [];
      setJobs(fetchedJobs);
      return fetchedJobs;
    } catch (e: any) {
      toast({ title: "Error fetching jobs", description: e.message, variant: "destructive" });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const matchJobs = async (jobsList: Job[], resumeText: string) => {
    if (!jobsList.length) return;
    setMatchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("match-jobs", {
        body: { jobs: jobsList, resumeText },
      });
      if (error) throw error;
      const scores: JobMatchScore[] = data?.scores || [];
      const scoreMap: Record<string, JobMatchScore> = {};
      scores.forEach((s) => { scoreMap[s.job_id] = s; });
      setMatchScores(scoreMap);
    } catch (e: any) {
      toast({ title: "AI matching error", description: e.message, variant: "destructive" });
    } finally {
      setMatchLoading(false);
    }
  };

  return { jobs, matchScores, loading, matchLoading, searchJobs, matchJobs };
}
