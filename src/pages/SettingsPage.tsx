import ResumeUpload from "@/components/ResumeUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResume } from "@/hooks/useResume";

interface SettingsPageProps {
  userId: string;
}

export default function SettingsPage({ userId }: SettingsPageProps) {
  const { resumeText, fileName, uploadResume } = useResume(userId);

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ResumeUpload
        onUpload={uploadResume}
        currentFileName={fileName}
      />
    </div>
  );
}
