import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import AuthPage from "@/pages/AuthPage";
import JobFeedPage from "@/pages/JobFeedPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import SettingsPage from "@/pages/SettingsPage";
import ResumeUpload from "@/components/ResumeUpload";
import NavBar from "@/components/NavBar";
import AIChatSidebar from "@/components/AIChatSidebar";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { resumeText, hasResume, loading: resumeLoading, uploadResume } = useResume(user?.id);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={() => {}} signIn={signIn} signUp={signUp} />;
  }

  if (!resumeLoading && !hasResume) {
    return (
      <ResumeUpload
        onUpload={uploadResume}
        onSkip={() => uploadResume("", "skipped")}
        isOnboarding
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
