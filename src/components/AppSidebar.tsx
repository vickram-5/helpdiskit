import { useAuth } from "@/hooks/useAuth";
import { canViewAllTickets, canManageUsers, canRaiseTicket, canManageAssets } from "@/lib/roles";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard, PlusCircle, List, Users, Activity, Clock, X, Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const AppSidebar = ({ activeView, onViewChange, mobileOpen, onMobileClose }: AppSidebarProps) => {
  const { role } = useAuth();
  const isMobile = useIsMobile();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(canRaiseTicket(role) ? [{ id: "raise", label: "Raise Ticket", icon: PlusCircle }] : []),
    { id: "tickets", label: "All Tickets", icon: List },
    ...(canManageUsers(role) ? [{ id: "users", label: "User Management", icon: Users }] : []),
    { id: "assets", label: "Assets", icon: Monitor },
    { id: "activity", label: "Activity Log", icon: Activity },
    ...(canRaiseTicket(role) ? [{ id: "history", label: "My History", icon: Clock }] : []),
  ];

  const handleNavClick = (id: string) => {
    onViewChange(id);
    if (isMobile && onMobileClose) onMobileClose();
  };

  const navButton = (item: typeof navItems[0]) => (
    <button
      key={item.id}
      onClick={() => handleNavClick(item.id)}
      aria-current={activeView === item.id ? "page" : undefined}
      aria-label={`Navigate to ${item.label}`}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
        activeView === item.id
          ? "bg-primary/15 text-primary border border-primary/25"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </button>
  );

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onMobileClose} />
        )}
        <aside
          role="navigation"
          aria-label="Main navigation"
          className={cn(
            "fixed left-0 top-0 bottom-0 w-[220px] z-50 liquid-glass-strong flex flex-col transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4 flex items-center justify-between border-b border-border">
            <img src={logo} alt="Vindhya" className="h-12" />
            <button onClick={onMobileClose} className="p-1 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Close menu">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {navItems.map(navButton)}
          </nav>
          <div className="p-3 border-t border-border">
            <p className="text-[9px] text-muted-foreground text-center">Vindhya IT Hub</p>
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside role="navigation" aria-label="Main navigation" className="fixed left-0 top-0 bottom-0 w-[180px] z-20 liquid-glass-strong border-r-0 flex flex-col">
      <div className="p-4 flex items-center justify-center border-b border-border">
        <img src={logo} alt="Vindhya" className="h-14" />
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map(navButton)}
      </nav>
      <div className="p-3 border-t border-border">
        <p className="text-[9px] text-muted-foreground text-center">Vindhya IT Hub</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
