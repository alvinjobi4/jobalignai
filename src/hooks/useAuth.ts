import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    resumeData?: { text: string; fileName: string }
  ) => {
    if (resumeData?.text) {
      localStorage.setItem(`pending_resume_${email.toLowerCase().trim()}`, JSON.stringify(resumeData));
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });

    if (error) return { data: null, error };

    const newUserId = data.user?.id;
    if (newUserId && resumeData?.text) {
      try {
        await supabase.from("resumes").insert({
          user_id: newUserId,
          resume_text: resumeData.text,
          file_name: resumeData.fileName,
        });
      } catch (e) {
        console.error("Resume insert on signup:", e);
      }
    }

    return { data, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signUp, signIn, signOut };
}
