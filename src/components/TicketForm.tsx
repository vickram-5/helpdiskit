import { useState } from "react";
import { generateRequestId, getNextSlNo, saveLocalTicket, submitTicketToSheet, type Ticket } from "@/lib/tickets";
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
  const [userName, setUserName] = useState("");
  const [process, setProcess] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [technicianName, setTechnicianName] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !issueCategory.trim()) return;

    setSubmitting(true);
    const now = new Date();
    const ticket: Ticket = {
      slNo: getNextSlNo(),
      requestId: generateRequestId(),
      createdDate: now.toLocaleDateString(),
      startTime: now.toLocaleTimeString(),
      endTime: "",
      userName: userName.trim(),
      process: process.trim(),
      reportedBy: reportedBy.trim(),
      priority,
      technicianName: technicianName.trim(),
      issueCategory: issueCategory.trim(),
      subCategory: subCategory.trim(),
      effortTime: "",
      requestStatus: "Open",
      remarks: remarks.trim(),
    };

    saveLocalTicket(ticket);
    const sheetSuccess = await submitTicketToSheet(ticket);
    onTicketCreated(ticket);

    toast({
      title: `${ticket.requestId} created`,
      description: sheetSuccess ? "Saved to Google Sheet ✓" : "Saved locally (sheet sync pending)",
    });

    setSuccess(true);
    setTimeout(() => {
      setUserName(""); setProcess(""); setReportedBy("");
      setPriority("Medium"); setTechnicianName("");
      setIssueCategory(""); setSubCategory(""); setRemarks("");
      setSuccess(false);
    }, 1500);
    setSubmitting(false);
  };

  const fieldClass = "bg-secondary/50 border-border focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="User Name *">
          <Input placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} required maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Reported By">
          <Input placeholder="Reporter name" value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Process">
          <Input placeholder="e.g. Onboarding" value={process} onChange={(e) => setProcess(e.target.value)} maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Priority">
          <Select value={priority} onValueChange={(v) => setPriority(v as "Low" | "Medium" | "High")}>
            <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">🟢 Low</SelectItem>
              <SelectItem value="Medium">🟡 Medium</SelectItem>
              <SelectItem value="High">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Technician Name">
          <Input placeholder="Assigned technician" value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Issue Category *">
          <Input placeholder="e.g. Hardware, Software" value={issueCategory} onChange={(e) => setIssueCategory(e.target.value)} required maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Sub-category">
          <Input placeholder="e.g. Printer, VPN" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} maxLength={100} className={fieldClass} />
        </Field>
      </div>

      <Field label="Remarks">
        <Textarea placeholder="Additional details..." value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} maxLength={2000} className={`${fieldClass} resize-none`} />
      </Field>

      <Button type="submit" disabled={submitting || !userName.trim() || !issueCategory.trim()} className="w-full h-11 font-semibold text-sm tracking-wide">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : success ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Ticket Created!</> : <><Send className="mr-2 h-4 w-4" /> Submit Ticket</>}
      </Button>
    </form>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default TicketForm;
