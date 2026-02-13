import { useState } from "react";
import { generateTicketId, saveLocalTicket, submitTicketToSheet, type Ticket } from "@/lib/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketFormProps {
  onTicketCreated: (ticket: Ticket) => void;
}

const TicketForm = ({ onTicketCreated }: TicketFormProps) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !userName.trim()) return;

    setSubmitting(true);
    const ticket: Ticket = {
      ticketId: generateTicketId(),
      subject: subject.trim(),
      description: description.trim(),
      priority,
      userName: userName.trim(),
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    saveLocalTicket(ticket);
    const sheetSuccess = await submitTicketToSheet(ticket);
    onTicketCreated(ticket);

    toast({
      title: `Ticket ${ticket.ticketId} created`,
      description: sheetSuccess
        ? "Saved to Google Sheet & locally."
        : "Saved locally. Configure Google Sheet URL for cloud sync.",
    });

    setSuccess(true);
    setTimeout(() => {
      setSubject("");
      setDescription("");
      setPriority("Medium");
      setUserName("");
      setSuccess(false);
    }, 1500);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Your Name</label>
          <Input
            placeholder="John Doe"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            maxLength={100}
            className="bg-secondary/50 border-border focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Priority</label>
          <Select value={priority} onValueChange={(v) => setPriority(v as "Low" | "Medium" | "High")}>
            <SelectTrigger className="bg-secondary/50 border-border focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">🟢 Low</SelectItem>
              <SelectItem value="Medium">🟡 Medium</SelectItem>
              <SelectItem value="High">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Subject</label>
        <Input
          placeholder="Brief summary of the issue..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          maxLength={200}
          className="bg-secondary/50 border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Description</label>
        <Textarea
          placeholder="Describe the issue in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          className="bg-secondary/50 border-border focus:border-primary resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting || !subject.trim() || !userName.trim()}
        className="w-full h-11 font-semibold text-sm tracking-wide"
      >
        {submitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
        ) : success ? (
          <><CheckCircle2 className="mr-2 h-4 w-4" /> Ticket Created!</>
        ) : (
          <><Send className="mr-2 h-4 w-4" /> Submit Ticket</>
        )}
      </Button>
    </form>
  );
};

export default TicketForm;
