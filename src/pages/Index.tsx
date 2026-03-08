import { useState, useEffect, useCallback } from "react";
import { fetchTickets, deleteTicket, exportToCSV, type Ticket } from "@/lib/tickets";
import { useAuth } from "@/hooks/useAuth";
import TicketForm from "@/components/TicketForm";
import TicketTable from "@/components/TicketTable";
import AdminDashboard from "@/components/AdminDashboard";
import EditTicketDialog from "@/components/EditTicketDialog";
import UserManagement from "@/components/UserManagement";
import LiquidBackground from "@/components/LiquidBackground";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { user, profile, role, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const { toast } = useToast();
  const isAdmin = role === "admin";

  const loadTickets = useCallback(async () => {
    const data = await fetchTickets(user?.id, isAdmin);
    setTickets(data);
  }, [user?.id, isAdmin]);

  useEffect(() => {
    if (user) loadTickets();
  }, [user, loadTickets]);

  const handleTicketCreated = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteTicket(deleteTarget.id, deleteTarget);
    if (success) {
      toast({ title: "Deleted", description: `Ticket ${deleteTarget.request_id} deleted.` });
      setTickets((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    } else {
      toast({ title: "Error", description: "Failed to delete ticket.", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const handleExport = () => {
    exportToCSV(tickets, `IT_Tickets_${new Date().toISOString().split("T")[0]}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <AdminDashboard tickets={tickets} />;
      case "raise":
        return (
          <div className="max-w-3xl">
            <div className="liquid-glass rounded-2xl p-6 glow-primary">
              <h2 className="text-lg font-semibold mb-1 gradient-text">Raise New Ticket</h2>
              <p className="text-xs text-muted-foreground mb-5">Submit a new support request</p>
              <TicketForm onTicketCreated={handleTicketCreated} />
            </div>
          </div>
        );
      case "tickets":
        return (
          <div className="liquid-glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-1">All Tickets</h2>
            <p className="text-xs text-muted-foreground mb-5">Manage all support requests</p>
            <TicketTable tickets={tickets} onEdit={setEditTicket} onDelete={setDeleteTarget} />
          </div>
        );
      case "users":
        return isAdmin ? (
          <div className="liquid-glass rounded-2xl p-6">
            <UserManagement />
          </div>
        ) : null;
      case "history":
        return (
          <div className="liquid-glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-1">My History</h2>
            <p className="text-xs text-muted-foreground mb-5">Your ticket history</p>
            <TicketTable tickets={tickets.filter((t) => t.created_by === user?.id)} />
          </div>
        );
      case "activity":
        return (
          <div className="liquid-glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-1">Activity Log</h2>
            <p className="text-xs text-muted-foreground mb-5">Recent system activity</p>
            <div className="space-y-3">
              {tickets.slice(0, 20).map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl liquid-glass-subtle">
                  <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${t.request_status === "Open" ? "bg-status-open" : "bg-status-closed"}`} />
                  <div>
                    <p className="text-sm font-medium">{t.request_id} — {t.issue_category}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.technician_name} · {t.request_status} · {new Date(t.created_at || t.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && <p className="text-sm text-muted-foreground">No activity yet</p>}
            </div>
          </div>
        );
      default:
        return <AdminDashboard tickets={tickets} />;
    }
  };

  return (
    <div className="min-h-screen relative">
      <LiquidBackground variant="light" />
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="ml-[180px] relative z-[1]">
        <header className="liquid-glass-strong sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{getGreeting()}</p>
              <h1 className="text-xl font-bold">{profile?.full_name || "User"} 👋</h1>
              <p className="text-[11px] text-muted-foreground">Vindhya IT Support Hub — Efficient & AI-Driven</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl transition-all text-xs border-border hover:bg-primary/10 hover:text-primary bg-secondary/30">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all text-xs">
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>

        <footer className="py-4 text-center text-[10px] text-muted-foreground">
          © 2026 CyberVibe Global Solutions Pvt Ltd. All rights reserved.
        </footer>
      </div>

      <EditTicketDialog
        ticket={editTicket}
        open={!!editTicket}
        onClose={() => setEditTicket(null)}
        onUpdated={loadTickets}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="liquid-glass-strong rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ticket <strong className="text-primary">{deleteTarget?.request_id}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
