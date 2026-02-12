import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, LayoutDashboard, Settings, LogOut, Trophy } from "lucide-react";

interface NavBarProps {
  onSignOut: () => void;
}

export default function NavBar({ onSignOut }: NavBarProps) {
  const location = useLocation();

  const links = [
    { to: "/", label: "Jobs", icon: Briefcase },
    { to: "/predictions", label: "Predictions", icon: Trophy },
    { to: "/applications", label: "Applications", icon: LayoutDashboard },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            JobMatch
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button variant={location.pathname === to ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
