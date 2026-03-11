import { useState } from "react";
import type { Ticket } from "@/lib/tickets";
import { updateTicket } from "@/lib/tickets";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PRIORITIES } from "@/lib/constants";

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
      priority: priority as Ticket["priority"],
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

  const fieldClass = "bg-secondary/40 rounded-xl";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="liquid-glass-strong rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit {ticket.request_id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="edit-status" className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="edit-status" className={fieldClass} aria-label="Ticket status"><SelectValue /></SelectTrigger>
              <SelectContent className="liquid-glass-strong rounded-xl">
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="edit-priority" className="text-xs font-medium text-muted-foreground">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="edit-priority" className={fieldClass} aria-label="Ticket priority"><SelectValue /></SelectTrigger>
              <SelectContent className="liquid-glass-strong rounded-xl">
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="edit-tech" className="text-xs font-medium text-muted-foreground">Technician Name</label>
            <Input id="edit-tech" value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} className={fieldClass} aria-label="Technician name" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="edit-end" className="text-xs font-medium text-muted-foreground">End Time</label>
            <Input id="edit-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldClass} aria-label="End time" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTicketDialog;
