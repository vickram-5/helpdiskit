import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Users,
  Activity,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const AppSidebar = ({ activeView, onViewChange }: AppSidebarProps) => {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "raise", label: "Raise Ticket", icon: PlusCircle },
    { id: "tickets", label: "All Tickets", icon: List },
    ...(isAdmin
      ? [{ id: "users", label: "User Management", icon: Users }]
      : []),
    { id: "activity", label: "Activity Log", icon: Activity },
    { id: "history", label: "My History", icon: Clock },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[160px] z-20 liquid-glass-strong border-r border-border flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <img src={logo} alt="CyberVibe" className="h-9" />
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
              activeView === item.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
