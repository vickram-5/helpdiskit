import { useState, useEffect, useCallback } from "react";
import { fetchTickets, deleteTicket, exportToCSV, type Ticket } from "@/lib/tickets";
import { useAuth } from "@/hooks/useAuth";
import TicketForm from "@/components/TicketForm";
import TicketTable from "@/components/TicketTable";
import StatsCards from "@/components/StatsCards";
import DashboardCharts from "@/components/DashboardCharts";
import EditTicketDialog from "@/components/EditTicketDialog";
import UserManagement from "@/components/UserManagement";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Download, Users, LayoutDashboard, PlusCircle, History } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background mesh-bg">
      {/* Header */}
      <header className="border-b border-border glass-card sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 gradient-border flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight gradient-text">CyberVibe Global Solutions</h1>
              <p className="text-xs text-muted-foreground">
                {profile?.full_name} • <span className="capitalize font-medium text-primary/80">{role}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl border-border hover:border-primary/30 transition-all">
              <Download className="mr-2 h-3.5 w-3.5" /> Export
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
              <LogOut className="mr-2 h-3.5 w-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        <StatsCards tickets={tickets} />

        {isAdmin ? (
          <Tabs defaultValue="tickets" className="space-y-6">
            <TabsList className="glass-card border border-border rounded-xl p-1 h-auto">
              <TabsTrigger value="tickets" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Tickets
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                <Users className="mr-1.5 h-3.5 w-3.5" /> Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="glass-card rounded-2xl p-6 glow-primary sticky top-24">
                    <h2 className="text-base font-semibold mb-1 gradient-text">Raise a Ticket</h2>
                    <p className="text-xs text-muted-foreground mb-5">Submit a new support request</p>
                    <TicketForm onTicketCreated={handleTicketCreated} />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-base font-semibold mb-1">All Tickets</h2>
                    <p className="text-xs text-muted-foreground mb-5">Manage all support requests</p>
                    <TicketTable tickets={tickets} onEdit={setEditTicket} onDelete={setDeleteTarget} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dashboard">
              <DashboardCharts tickets={tickets} />
            </TabsContent>

            <TabsContent value="users">
              <div className="glass-card rounded-2xl p-6">
                <UserManagement />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="raise" className="space-y-6">
            <TabsList className="glass-card border border-border rounded-xl p-1 h-auto">
              <TabsTrigger value="raise" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Raise Ticket
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                <History className="mr-1.5 h-3.5 w-3.5" /> My History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="raise">
              <div className="max-w-2xl mx-auto">
                <div className="glass-card rounded-2xl p-6 glow-primary">
                  <h2 className="text-base font-semibold mb-1 gradient-text">Raise a Ticket</h2>
                  <p className="text-xs text-muted-foreground mb-5">Submit a new support request</p>
                  <TicketForm onTicketCreated={handleTicketCreated} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-1">My Tickets</h2>
                <p className="text-xs text-muted-foreground mb-5">Your ticket history</p>
                <TicketTable tickets={tickets} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <EditTicketDialog
        ticket={editTicket}
        open={!!editTicket}
        onClose={() => setEditTicket(null)}
        onUpdated={loadTickets}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ticket <strong className="text-primary">{deleteTarget?.request_id}</strong>? This action cannot be undone.
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
