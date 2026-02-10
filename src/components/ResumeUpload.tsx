import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";

interface ResumeUploadProps {
  onUpload: (text: string, fileName: string) => Promise<void>;
  onSkip?: () => void;
  currentFileName?: string;
  isOnboarding?: boolean;
}

export default function ResumeUpload({ onUpload, onSkip, currentFileName, isOnboarding = false }: ResumeUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setError("");
    if (!f.name.endsWith(".txt") && !f.name.endsWith(".pdf")) {
      setError("Please upload a .txt or .pdf file");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      await onUpload(text, file.name);
      setFile(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isOnboarding ? "flex min-h-screen items-center justify-center bg-background p-4" : ""}>
      <Card className={isOnboarding ? "w-full max-w-lg" : "w-full"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {currentFileName ? "Update Resume" : "Upload Your Resume"}
          </CardTitle>
          <CardDescription>
            {currentFileName
              ? `Current: ${currentFileName}. Upload a new file to replace it.`
              : "Upload your resume so we can match you with the best jobs."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drop your resume here or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports .txt and .pdf (max 5MB)</p>
            <input ref={inputRef} type="file" accept=".txt,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-md bg-secondary p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={!file || loading} className="flex-1">
              {loading ? "Uploading..." : "Upload Resume"}
            </Button>
            {isOnboarding && onSkip && (
              <Button variant="ghost" onClick={onSkip}>Skip for now</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
