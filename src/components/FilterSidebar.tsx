import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import type { JobFilters } from "@/types";

const SKILLS = ["React", "Node.js", "Python", "TypeScript", "JavaScript", "Java", "Go", "Rust", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "GraphQL", "Next.js", "Vue.js", "Angular", "Figma", "TailwindCSS", "Machine Learning"];

interface FilterSidebarProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onSearch: () => void;
}

export default function FilterSidebar({ filters, onFiltersChange, onSearch }: FilterSidebarProps) {
  const update = (partial: Partial<JobFilters>) => onFiltersChange({ ...filters, ...partial });

  const toggleSkill = (skill: string) => {
    const skills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    update({ skills });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Search Role / Title</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. React Developer"
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <Button size="icon" onClick={onSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="flex flex-wrap gap-1.5">
          {SKILLS.map((skill) => (
            <Badge
              key={skill}
              variant={filters.skills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
              {filters.skills.includes(skill) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Date Posted</Label>
        <Select value={filters.datePosted} onValueChange={(v) => update({ datePosted: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="today">Last 24 hours</SelectItem>
            <SelectItem value="3days">Last 3 days</SelectItem>
            <SelectItem value="week">Last week</SelectItem>
            <SelectItem value="month">Last month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Job Type</Label>
        <Select value={filters.employmentType} onValueChange={(v) => update({ employmentType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="FULLTIME">Full-time</SelectItem>
            <SelectItem value="PARTTIME">Part-time</SelectItem>
            <SelectItem value="CONTRACTOR">Contract</SelectItem>
            <SelectItem value="INTERN">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Work Mode</Label>
        <Select value={filters.workMode} onValueChange={(v) => update({ workMode: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Match Score</Label>
        <Select value={filters.matchScore} onValueChange={(v) => update({ matchScore: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scores</SelectItem>
            <SelectItem value="high">High (&gt;70%)</SelectItem>
            <SelectItem value="medium">Medium (40-70%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="City or region..."
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
        />
      </div>
    </div>
  );
}
