import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building2, Clock, ExternalLink, Sparkles } from "lucide-react";
import type { Job, JobMatchScore } from "@/types";

interface JobCardProps {
  job: Job;
  score?: JobMatchScore;
  onApply: (job: Job) => void;
}

export default function JobCard({ job, score, onApply }: JobCardProps) {
  const matchColor = score
    ? score.score > 70 ? "bg-match-high text-white"
      : score.score >= 40 ? "bg-match-medium text-white"
      : "bg-match-low text-white"
    : "";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff}d ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {job.employer_logo ? (
              <img src={job.employer_logo} alt="" className="h-10 w-10 rounded-lg object-contain bg-secondary p-1 shrink-0" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary shrink-0">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-base leading-tight line-clamp-2">{job.job_title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{job.employer_name}</p>
            </div>
          </div>
          {score && score.score > 0 && (
            <Badge className={`shrink-0 ${matchColor} border-0`}>
              <Sparkles className="mr-1 h-3 w-3" />
              {score.score}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {(job.job_city || job.job_state || job.job_country) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {[job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ")}
            </span>
          )}
          {job.job_is_remote && (
            <Badge variant="outline" className="text-xs py-0">Remote</Badge>
          )}
          {job.job_employment_type && (
            <Badge variant="secondary" className="text-xs py-0">{job.job_employment_type.replace("FULLTIME", "Full-time").replace("PARTTIME", "Part-time").replace("CONTRACTOR", "Contract").replace("INTERN", "Internship")}</Badge>
          )}
          {job.job_posted_at_datetime_utc && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(job.job_posted_at_datetime_utc)}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.job_description?.substring(0, 200)}...
        </p>

        {score && score.matched_skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {score.matched_skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {score && score.explanation && score.score > 0 && (
          <p className="text-xs text-muted-foreground italic">{score.explanation}</p>
        )}

        <Button size="sm" className="w-full" onClick={() => onApply(job)}>
          <ExternalLink className="mr-1 h-3 w-3" />
          Apply
        </Button>
      </CardContent>
    </Card>
  );
}
