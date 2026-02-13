import type { Ticket } from "@/lib/tickets";
import { TicketIcon, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface StatsCardsProps {
  tickets: Ticket[];
}

const StatsCards = ({ tickets }: StatsCardsProps) => {
  const total = tickets.length;
  const high = tickets.filter((t) => t.priority === "High").length;
  const open = tickets.filter((t) => t.requestStatus === "Open").length;
  const closed = tickets.filter((t) => t.requestStatus !== "Open").length;

  const stats = [
    { label: "Total Tickets", value: total, icon: TicketIcon, color: "text-primary" },
    { label: "High Priority", value: high, icon: AlertTriangle, color: "text-priority-high" },
    { label: "Open", value: open, icon: Clock, color: "text-status-open" },
    { label: "Resolved", value: closed, icon: CheckCircle2, color: "text-status-closed" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card border border-border rounded-lg p-4 ticket-glow ticket-glow-hover transition-all">
          <div className="flex items-center gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
