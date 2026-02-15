import type { Ticket } from "@/lib/tickets";
import { TicketIcon, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface StatsCardsProps {
  tickets: Ticket[];
}

const StatsCards = ({ tickets }: StatsCardsProps) => {
  const total = tickets.length;
  const high = tickets.filter((t) => t.priority === "High").length;
  const open = tickets.filter((t) => t.request_status === "Open").length;
  const closed = tickets.filter((t) => t.request_status !== "Open").length;

  const stats = [
    { label: "Total Tickets", value: total, icon: TicketIcon, color: "text-primary", glow: "glow-primary" },
    { label: "High Priority", value: high, icon: AlertTriangle, color: "text-priority-high", glow: "" },
    { label: "Open", value: open, icon: Clock, color: "text-status-open", glow: "" },
    { label: "Resolved", value: closed, icon: CheckCircle2, color: "text-status-closed", glow: "" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className={`glass-card glass-card-hover rounded-2xl p-5 transition-all cursor-default ${stat.glow}`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl bg-secondary flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
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
