import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, Upload, X, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { extractTextFromFile } from "@/lib/utils";

interface AuthPageProps {
  onAuth?: (user: any) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    resumeData?: { text: string; fileName: string }
  ) => Promise<{ data?: any; error: any }>;
  onSignUpSuccess?: (userId: string, text: string, name: string) => Promise<void>;
}

export default function AuthPage({ signIn, signUp, onSignUpSuccess }: AuthPageProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleResumeSelect = async (file: File) => {
    setError("");
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".txt") && !lowerName.endsWith(".docx")) {
      setError("Please attach a .pdf or .txt resume file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Resume file size must be under 5MB.");
      return;
    }

    setResumeFile(file);
    setExtracting(true);
    try {
      const extracted = await extractTextFromFile(file);
      setResumeText(extracted);
    } catch (e: any) {
      console.error("Error reading file text:", e);
      setResumeText("");
    } finally {
      setExtracting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const result = await signIn(signInEmail.trim(), signInPassword);
    if (result.error) {
      setError(result.error.message || "Failed to sign in. Please check your credentials.");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!resumeFile) {
      setError("Please attach your resume (.pdf or .txt) so we can calculate AI match scores for jobs.");
      setLoading(false);
      return;
    }

    const resumeData = {
      text: resumeText || resumeFile.name,
      fileName: resumeFile.name,
    };

    const result = await signUp(signUpEmail.trim(), signUpPassword, signUpName.trim(), resumeData);
    if (result.error) {
      setError(result.error.message || "Failed to create account. Please try again.");
      setLoading(false);
      return;
    }

    // Check if session established or if email verification is required
    if (result.data?.user && onSignUpSuccess) {
      await onSignUpSuccess(result.data.user.id, resumeData.text, resumeData.fileName);
    }

    if (!result.data?.session && result.data?.user) {
      setSuccessMessage(
        "Account created! Please check your email to confirm your account, then sign in with your credentials."
      );
      setTab("signin");
      setSignInEmail(signUpEmail);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 p-4">
      <Card className="w-full max-w-lg shadow-xl border-border/80">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Briefcase className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">JobAlignAI</CardTitle>
          <CardDescription className="text-sm">
            AI-Powered Job Tracking & Resume Matching Platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs
            value={tab}
            onValueChange={(val) => {
              setTab(val as "signin" | "signup");
              setError("");
              setSuccessMessage("");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* SIGN IN TAB */}
            <TabsContent value="signin" className="space-y-4 mt-0">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email Address</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <Button type="submit" className="w-full cursor-pointer h-10 font-medium" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("signup");
                    setError("");
                  }}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            </TabsContent>

            {/* SIGN UP TAB */}
            <TabsContent value="signup" className="space-y-4 mt-0">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                {/* RESUME ATTACHMENT SECTION */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Attach Your Resume <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-xs text-muted-foreground">PDF or TXT (Max 5MB)</span>
                  </div>

                  {!resumeFile ? (
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 transition-all cursor-pointer ${
                        dragOver
                          ? "border-primary bg-primary/10 scale-[1.01]"
                          : "border-border hover:border-primary/60 hover:bg-muted/30"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files[0]) {
                          handleResumeSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mb-2 h-7 w-7 text-primary/70" />
                      <p className="text-sm font-medium text-foreground">
                        Click to browse or drag & drop resume
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Used to calculate match scores against real-time jobs
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.docx"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleResumeSelect(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border bg-secondary/50 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{resumeFile.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(resumeFile.size)}
                            </span>
                            {extracting ? (
                              <span className="text-xs text-muted-foreground italic">
                                Processing text...
                              </span>
                            ) : (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-emerald-600 border-emerald-500/30 bg-emerald-50/50">
                                Attached ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                        onClick={() => {
                          setResumeFile(null);
                          setResumeText("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer h-10 font-medium mt-2"
                  disabled={loading || extracting}
                >
                  {loading ? "Creating Account..." : "Create Account & Attach Resume"}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setError("");
                  }}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
