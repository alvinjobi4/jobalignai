import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types";

interface ApplyPopupProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (action: "applied" | "browsing" | "earlier") => void;
}

export default function ApplyPopup({ job, open, onClose, onConfirm }: ApplyPopupProps) {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Did you apply?</DialogTitle>
          <DialogDescription>
            Did you apply to <span className="font-semibold text-foreground">{job.job_title}</span> at{" "}
            <span className="font-semibold text-foreground">{job.employer_name}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={() => onConfirm("applied")} className="w-full">
            Yes, Applied ✓
          </Button>
          <Button variant="outline" onClick={() => onConfirm("earlier")} className="w-full">
            Applied Earlier
          </Button>
          <Button variant="ghost" onClick={() => onConfirm("browsing")} className="w-full">
            No, just browsing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
