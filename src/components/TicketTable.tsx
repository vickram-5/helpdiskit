import { useState, useMemo } from "react";
import type { Ticket } from "@/lib/tickets";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Inbox } from "lucide-react";

interface TicketTableProps {
  tickets: Ticket[];
}

const priorityColors: Record<string, string> = {
  High: "bg-priority-high/20 text-priority-high border-priority-high/30",
  Medium: "bg-priority-medium/20 text-priority-medium border-priority-medium/30",
  Low: "bg-priority-low/20 text-priority-low border-priority-low/30",
};

const statusColors: Record<string, string> = {
  Open: "bg-status-open/10 text-status-open border-status-open/30",
  Closed: "bg-status-closed/10 text-status-closed border-status-closed/30",
};

const TicketTable = ({ tickets }: TicketTableProps) => {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        t.requestId.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.issueCategory.toLowerCase().includes(q) ||
        t.technicianName.toLowerCase().includes(q);
      const matchesPriority = filterPriority === "All" || t.priority === filterPriority;
      const matchesStatus = filterStatus === "All" || t.requestStatus === filterStatus;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tickets, search, filterPriority, filterStatus]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ID, user, category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-36 bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priorities</SelectItem>
            <SelectItem value="High">🔴 High</SelectItem>
            <SelectItem value="Medium">🟡 Medium</SelectItem>
            <SelectItem value="Low">🟢 Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-32 bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
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
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                {["Sl", "Request ID", "Date", "User", "Category", "Priority", "Technician", "Status"].map((h) => (
                  <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.requestId} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-mono text-xs">{t.slNo}</TableCell>
                  <TableCell className="font-mono text-xs text-primary">{t.requestId}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{t.createdDate}</TableCell>
                  <TableCell className="font-medium">{t.userName}</TableCell>
                  <TableCell className="text-sm">{t.issueCategory}{t.subCategory ? ` / ${t.subCategory}` : ""}</TableCell>
                  <TableCell><Badge variant="outline" className={priorityColors[t.priority] || ""}>{t.priority}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.technicianName || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[t.requestStatus] || statusColors.Open}>{t.requestStatus}</Badge></TableCell>
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
