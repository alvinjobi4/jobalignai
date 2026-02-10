import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Application, ApplicationStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useApplications(userId: string | undefined) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchApplications();
  }, [userId]);

  const fetchApplications = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      setApplications((data || []) as Application[]);
    } catch (e) {
      console.error("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const addApplication = async (app: {
    job_id: string;
    job_title: string;
    company: string;
    job_url?: string;
    location?: string;
  }) => {
    if (!userId) return;
    try {
      // Check if already applied
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("user_id", userId)
        .eq("job_id", app.job_id)
        .maybeSingle();
      if (existing) {
        toast({ title: "Already tracked", description: "This application is already in your tracker." });
        return;
      }

      const { error } = await supabase
        .from("applications")
        .insert({ user_id: userId, ...app });
      if (error) throw error;
      toast({ title: "Application tracked!" });
      await fetchApplications();
    } catch (e: any) {
      toast({ title: "Error tracking application", description: e.message, variant: "destructive" });
    }
  };

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast({ title: `Status updated to ${status}` });
    } catch (e: any) {
      toast({ title: "Error updating status", description: e.message, variant: "destructive" });
    }
  };

  return { applications, loading, addApplication, updateStatus, fetchApplications };
}
