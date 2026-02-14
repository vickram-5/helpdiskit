import { useState } from "react";
import type { Ticket } from "@/lib/tickets";
import { updateTicket } from "@/lib/tickets";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EditTicketDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditTicketDialog = ({ ticket, open, onClose, onUpdated }: EditTicketDialogProps) => {
  const [status, setStatus] = useState(ticket?.request_status || "Open");
  const [priority, setPriority] = useState<string>(ticket?.priority || "Medium");
  const [technicianName, setTechnicianName] = useState(ticket?.technician_name || "");
  const [endTime, setEndTime] = useState(ticket?.end_time || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!ticket) return;
    setSaving(true);
    const success = await updateTicket(ticket.id, {
      request_status: status,
      priority: priority as "Low" | "Medium" | "High",
      technician_name: technicianName,
      end_time: endTime || null,
    } as any);

    if (success) {
      toast({ title: "Updated", description: `Ticket ${ticket.request_id} updated.` });
      onUpdated();
      onClose();
    } else {
      toast({ title: "Error", description: "Failed to update ticket.", variant: "destructive" });
    }
    setSaving(false);
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit {ticket.request_id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">🟢 Low</SelectItem>
                <SelectItem value="Medium">🟡 Medium</SelectItem>
                <SelectItem value="High">🔴 High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Technician Name</label>
            <Input value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} className="bg-secondary/50 border-border" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">End Time</label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-secondary/50 border-border" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTicketDialog;
