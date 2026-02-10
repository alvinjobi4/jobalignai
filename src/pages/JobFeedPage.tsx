import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import JobCard from "@/components/JobCard";
import FilterSidebar from "@/components/FilterSidebar";
import ApplyPopup from "@/components/ApplyPopup";
import type { Job, JobFilters } from "@/types";
import { useJobs } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";

interface JobFeedPageProps {
  userId: string;
  resumeText: string;
}

export default function JobFeedPage({ userId, resumeText }: JobFeedPageProps) {
  const { jobs, matchScores, loading, matchLoading, searchJobs, matchJobs } = useJobs();
  const { addApplication } = useApplications(userId);
  const [filters, setFilters] = useState<JobFilters>({
    query: "software developer",
    skills: [],
    datePosted: "all",
    employmentType: "all",
    workMode: "all",
    location: "",
    matchScore: "all",
  });
  const [pendingJob, setPendingJob] = useState<Job | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const doSearch = useCallback(async () => {
    const result = await searchJobs(filters);
    if (result.length > 0 && resumeText) {
      matchJobs(result, resumeText);
    }
  }, [filters, resumeText]);

  useEffect(() => {
    doSearch();
  }, []);

  // Smart popup: when tab regains focus after apply click
  useEffect(() => {
    if (!pendingJob) return;
    const handleFocus = () => {
      setShowPopup(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [pendingJob]);

  const handleApply = (job: Job) => {
    setPendingJob(job);
    if (job.job_apply_link) {
      window.open(job.job_apply_link, "_blank");
    }
  };

  const handlePopupConfirm = async (action: "applied" | "browsing" | "earlier") => {
    if ((action === "applied" || action === "earlier") && pendingJob) {
      await addApplication({
        job_id: pendingJob.job_id,
        job_title: pendingJob.job_title,
        company: pendingJob.employer_name,
        job_url: pendingJob.job_apply_link,
        location: [pendingJob.job_city, pendingJob.job_state].filter(Boolean).join(", "),
      });
    }
    setPendingJob(null);
    setShowPopup(false);
  };

  // Filter jobs by match score on client side
  const filteredJobs = jobs.filter((job) => {
    if (filters.matchScore === "high") return (matchScores[job.job_id]?.score || 0) > 70;
    if (filters.matchScore === "medium") return (matchScores[job.job_id]?.score || 0) >= 40;
    return true;
  });

  // Best matches
  const bestMatches = [...filteredJobs]
    .filter((j) => (matchScores[j.job_id]?.score || 0) > 40)
    .sort((a, b) => (matchScores[b.job_id]?.score || 0) - (matchScores[a.job_id]?.score || 0))
    .slice(0, 6);

  return (
    <div className="container py-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 rounded-lg border bg-card p-4">
            <h2 className="mb-4 font-semibold">Filters</h2>
            <FilterSidebar filters={filters} onFiltersChange={setFilters} onSearch={doSearch} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Best matches */}
          {bestMatches.length > 0 && !loading && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-match-high" />
                Best Matches for You
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {bestMatches.map((job) => (
                  <JobCard key={`best-${job.job_id}`} job={job} score={matchScores[job.job_id]} onApply={handleApply} />
                ))}
              </div>
            </section>
          )}

          {/* All jobs */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {loading ? "Searching..." : `${filteredJobs.length} Jobs Found`}
              </h2>
              {matchLoading && (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Matching with AI...
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredJobs.map((job) => (
                  <JobCard key={job.job_id} job={job} score={matchScores[job.job_id]} onApply={handleApply} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">No jobs found</p>
                <p className="text-sm">Try adjusting your filters or search query</p>
              </div>
            )}
          </section>
        </main>
      </div>

      <ApplyPopup job={pendingJob} open={showPopup} onClose={() => { setShowPopup(false); setPendingJob(null); }} onConfirm={handlePopupConfirm} />
    </div>
  );
}
