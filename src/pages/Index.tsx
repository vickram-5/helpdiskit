import { useState, useEffect, useCallback } from "react";
import { getLocalTickets, fetchTicketsFromSheet, type Ticket } from "@/lib/tickets";
import TicketForm from "@/components/TicketForm";
import TicketTable from "@/components/TicketTable";
import StatsCards from "@/components/StatsCards";
import { Button } from "@/components/ui/button";
import { RefreshCw, TicketIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTickets(getLocalTickets());
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    const sheetTickets = await fetchTicketsFromSheet();
    if (sheetTickets.length > 0) {
      setTickets(sheetTickets);
      toast({ title: "Synced", description: `Loaded ${sheetTickets.length} tickets from Google Sheet.` });
    } else {
      setTickets(getLocalTickets());
      toast({ title: "Using local data", description: "No Google Sheet data found. Showing local tickets." });
    }
    setSyncing(false);
  }, [toast]);

  const handleTicketCreated = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TicketIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">IT HelpDesk</h1>
              <p className="text-xs text-muted-foreground">Ticket Management System</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="border-border hover:border-primary/50"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <StatsCards tickets={tickets} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 ticket-glow sticky top-24">
              <h2 className="text-base font-semibold mb-1">New Ticket</h2>
              <p className="text-xs text-muted-foreground mb-5">Submit a new support request</p>
              <TicketForm onTicketCreated={handleTicketCreated} />
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-base font-semibold mb-1">All Tickets</h2>
              <p className="text-xs text-muted-foreground mb-5">Filter & reporting dashboard</p>
              <TicketTable tickets={tickets} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
