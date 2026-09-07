import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import AuthPage from "@/pages/AuthPage";
import JobFeedPage from "@/pages/JobFeedPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import SettingsPage from "@/pages/SettingsPage";
import NavBar from "@/components/NavBar";
import AIChatSidebar from "@/components/AIChatSidebar";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { resumeText, hasResume, loading: resumeLoading, uploadResume } = useResume(user?.id);

  // Sync any pending resume uploaded during signup once the user session is active
  useEffect(() => {
    if (user?.email && !hasResume && !resumeLoading) {
      const pendingKey = `pending_resume_${user.email.toLowerCase().trim()}`;
      const pendingRaw = localStorage.getItem(pendingKey);
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          if (pending?.text) {
            uploadResume(pending.text, pending.fileName || "resume.pdf");
            localStorage.removeItem(pendingKey);
          }
        } catch (e) {
          console.error("Error syncing pending resume:", e);
        }
      }
    }
  }, [user, hasResume, resumeLoading]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        signIn={signIn}
        signUp={signUp}
        onSignUpSuccess={async (userId, text, fileName) => {
          await uploadResume(text, fileName);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <NavBar onSignOut={signOut} />
      <Routes>
        <Route path="/" element={<JobFeedPage userId={user.id} resumeText={resumeText} />} />
        <Route path="/applications" element={<ApplicationsPage userId={user.id} />} />
        <Route path="/settings" element={<SettingsPage userId={user.id} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AIChatSidebar />
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
