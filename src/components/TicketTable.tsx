import { useState, useMemo } from "react";
import type { Ticket } from "@/lib/tickets";
import { useAuth } from "@/hooks/useAuth";
import { canViewAllTickets } from "@/lib/roles";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Inbox, Pencil, Trash2 } from "lucide-react";
import { PRIORITIES } from "@/lib/constants";

interface TicketTableProps {
  tickets: Ticket[];
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
}

const priorityColors: Record<string, string> = {
  High: "bg-priority-high/15 text-priority-high border-priority-high/20",
  Medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/20",
  Low: "bg-priority-low/15 text-priority-low border-priority-low/20",
  Critical: "bg-accent/15 text-accent border-accent/20",
};

const statusColors: Record<string, string> = {
  Open: "bg-status-open/10 text-status-open border-status-open/20",
  Closed: "bg-status-closed/10 text-status-closed border-status-closed/20",
};

const TicketTable = ({ tickets, onEdit, onDelete }: TicketTableProps) => {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        t.request_id.toLowerCase().includes(q) ||
        t.user_name.toLowerCase().includes(q) ||
        t.issue_category.toLowerCase().includes(q) ||
        t.technician_name.toLowerCase().includes(q) ||
        (t.department || "").toLowerCase().includes(q);
      const matchesPriority = filterPriority === "All" || t.priority === filterPriority;
      const matchesStatus = filterStatus === "All" || t.request_status === filterStatus;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tickets, search, filterPriority, filterStatus]);

  const isAdmin = role === "admin";
  const fieldClass = "bg-secondary/40 rounded-xl";

  const headers = ["Sl", "Request ID", "Date", "User", "Department", "Category", "Priority", "Technician", "Status", "Effort"];
  if (isAdmin) headers.push("Actions");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ID, user, category, department..." value={search} onChange={(e) => setSearch(e.target.value)} className={`pl-9 ${fieldClass}`} aria-label="Search tickets" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className={`w-full sm:w-36 ${fieldClass}`} aria-label="Filter by priority"><SelectValue /></SelectTrigger>
          <SelectContent className="liquid-glass-strong rounded-xl">
            <SelectItem value="All">All Priorities</SelectItem>
            {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className={`w-full sm:w-32 ${fieldClass}`} aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent className="liquid-glass-strong rounded-xl">
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Inbox className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">No tickets found</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-x-auto liquid-glass-subtle">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {headers.map((h) => (
                  <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id} className="hover:bg-secondary/30 transition-colors">
                  <TableCell className="font-mono text-xs">{t.sl_no}</TableCell>
                  <TableCell className="font-mono text-xs text-primary font-medium">{t.request_id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{t.created_date ? t.created_date.split('-').reverse().join('-') : ''}</TableCell>
                  <TableCell className="font-medium">{t.user_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.department || "—"}</TableCell>
                  <TableCell className="text-sm">{t.issue_category}{t.sub_category ? ` / ${t.sub_category}` : ""}</TableCell>
                  <TableCell><Badge variant="outline" className={`rounded-lg ${priorityColors[t.priority] || ""}`}>{t.priority}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.technician_name || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={`rounded-lg ${statusColors[t.request_status] || statusColors.Open}`}>{t.request_status}</Badge></TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">{t.effort_time || "—"}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => onEdit?.(t)} aria-label={`Edit ticket ${t.request_id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete?.(t)} aria-label={`Delete ticket ${t.request_id}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} of {tickets.length} tickets
      </p>
    </div>
  );
};

export default TicketTable;
