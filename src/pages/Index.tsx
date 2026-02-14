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
import { TicketIcon, LogOut, Download, Users } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TicketIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">IT Management</h1>
              <p className="text-xs text-muted-foreground">
                {profile?.full_name} • <span className="capitalize">{role}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-3.5 w-3.5" /> Export
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-3.5 w-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        <StatsCards tickets={tickets} />

        {isAdmin ? (
          <Tabs defaultValue="tickets" className="space-y-6">
            <TabsList className="bg-secondary/50 border border-border">
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-lg p-6 ticket-glow sticky top-24">
                    <h2 className="text-base font-semibold mb-1">New Ticket</h2>
                    <p className="text-xs text-muted-foreground mb-5">Submit a new support request</p>
                    <TicketForm onTicketCreated={handleTicketCreated} />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-card border border-border rounded-lg p-6">
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
              <div className="bg-card border border-border rounded-lg p-6">
                <UserManagement />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 ticket-glow sticky top-24">
                <h2 className="text-base font-semibold mb-1">New Ticket</h2>
                <p className="text-xs text-muted-foreground mb-5">Submit a new support request</p>
                <TicketForm onTicketCreated={handleTicketCreated} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-base font-semibold mb-1">My Tickets</h2>
                <p className="text-xs text-muted-foreground mb-5">Your ticket history</p>
                <TicketTable tickets={tickets} />
              </div>
            </div>
          </div>
        )}
      </main>

      <EditTicketDialog
        ticket={editTicket}
        open={!!editTicket}
        onClose={() => setEditTicket(null)}
        onUpdated={loadTickets}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ticket <strong>{deleteTarget?.request_id}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
