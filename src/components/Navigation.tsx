import { Link, useLocation } from "react-router-dom";
import { Network, FileText, Zap, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Navigation = () => {
  const location = useLocation();
  const isDevelopmentRoute = location.pathname === "/editor";

  const navItems = [
    {
      path: "/",
      label: "Gerador de IP",
      icon: Network,
    },
    {
      path: "/rat",
      label: "RAT",
      icon: FileText,
    },
    {
      path: "/troubleshooter",
      label: "Diagnóstico",
      icon: Zap,
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to="/editor"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-medium border border-dashed hover:bg-secondary",
                isDevelopmentRoute ? "bg-secondary text-primary" : "text-muted-foreground"
              )}
              title="Editor de Desenvolvimento (Remover no futuro)"
            >
              <FileEdit className="h-4 w-4" />
              Editor
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
