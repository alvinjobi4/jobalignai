import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useResume(userId: string | undefined) {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchResume();
  }, [userId]);

  const fetchResume = async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) {
        setResumeText(data.resume_text);
        setFileName(data.file_name);
        setHasResume(true);
      }
    } catch (e) {
      console.error("Error fetching resume:", e);
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (text: string, name: string) => {
    if (!userId) return;
    try {
      // Check if resume exists
      const { data: existing } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("resumes")
          .update({ resume_text: text, file_name: name })
          .eq("user_id", userId);
      } else {
        await supabase
          .from("resumes")
          .insert({ user_id: userId, resume_text: text, file_name: name });
      }
      setResumeText(text);
      setFileName(name);
      setHasResume(true);
      toast({ title: "Resume uploaded successfully!" });
    } catch (e: any) {
      toast({ title: "Error uploading resume", description: e.message, variant: "destructive" });
    }
  };

  return { resumeText, fileName, hasResume, loading, uploadResume, fetchResume };
}
