import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Clock, ArrowRight, Building2, MapPin, Filter } from "lucide-react";
import type { Application, ApplicationStatus } from "@/types";
import { useApplications } from "@/hooks/useApplications";

interface ApplicationsPageProps {
  userId: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: "Applied", color: "bg-primary text-primary-foreground" },
  interview: { label: "Interview", color: "bg-match-medium text-white" },
  offer: { label: "Offer", color: "bg-match-high text-white" },
  rejected: { label: "Rejected", color: "bg-destructive text-destructive-foreground" },
};

const STATUSES: ApplicationStatus[] = ["applied", "interview", "offer", "rejected"];

export default function ApplicationsPage({ userId }: ApplicationsPageProps) {
  const { applications, loading, updateStatus } = useApplications(userId);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = filterStatus === "all" ? applications : applications.filter((a) => a.status === filterStatus);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({applications.length})</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label} ({counts[s]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map((s) => (
          <Card key={s} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus(s === filterStatus ? "all" : s)}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{counts[s]}</p>
              <Badge className={`mt-1 ${STATUS_CONFIG[s].color} border-0`}>{STATUS_CONFIG[s].label}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications list */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Briefcase className="mb-3 h-10 w-10" />
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm">Start applying to jobs to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card key={app.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{app.job_title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{app.company}</span>
                      {app.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {app.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v as ApplicationStatus)}>
                    <SelectTrigger className="w-32">
                      <Badge className={`${STATUS_CONFIG[app.status].color} border-0`}>
                        {STATUS_CONFIG[app.status].label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${STATUS_CONFIG[s].color}`} />
                            {STATUS_CONFIG[s].label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
