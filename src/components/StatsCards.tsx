import type { Ticket } from "@/lib/tickets";
import { TicketIcon, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface StatsCardsProps {
  tickets: Ticket[];
}

const StatsCards = ({ tickets }: StatsCardsProps) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTickets = tickets.filter((t) => {
    const d = new Date(t.created_at || t.created_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const total = currentMonthTickets.length;
  const high = currentMonthTickets.filter((t) => t.priority === "High").length;
  const open = currentMonthTickets.filter((t) => t.request_status === "Open").length;
  const closed = currentMonthTickets.filter((t) => t.request_status !== "Open").length;

  const monthName = now.toLocaleString("default", { month: "short" });

  const stats = [
    { label: `Total (${monthName})`, value: total, icon: TicketIcon, color: "text-primary" },
    { label: "High Priority", value: high, icon: AlertTriangle, color: "text-priority-high" },
    { label: "Open", value: open, icon: Clock, color: "text-status-open" },
    { label: "Resolved", value: closed, icon: CheckCircle2, color: "text-status-closed" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="liquid-glass liquid-glass-hover rounded-2xl p-5 transition-all cursor-default">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/30 backdrop-blur-sm flex items-center justify-center">
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
