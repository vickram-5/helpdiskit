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

const TicketTable = ({ tickets }: TicketTableProps) => {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        !search ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
        t.userName.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = filterPriority === "All" || t.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tickets, search, filterPriority]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, subject, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary/50 border-border">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priorities</SelectItem>
            <SelectItem value="High">🔴 High</SelectItem>
            <SelectItem value="Medium">🟡 Medium</SelectItem>
            <SelectItem value="Low">🟢 Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Inbox className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">No tickets found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Ticket ID</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Subject</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">User</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ticket) => (
                <TableRow key={ticket.ticketId} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-mono text-xs text-primary">{ticket.ticketId}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{ticket.subject}</TableCell>
                  <TableCell className="text-muted-foreground">{ticket.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityColors[ticket.priority] || ""}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-status-open/10 text-status-open border-status-open/30">
                      {ticket.status || "Open"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
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
