import { useState } from "react";
import { createTicket, type Ticket } from "@/lib/tickets";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketFormProps {
  onTicketCreated: (ticket: Ticket) => void;
}

const ISSUE_CATEGORIES: Record<string, string[]> = {
  Hardware: ["Laptop Issue", "Monitor", "Keyboard/Mouse", "Printer", "Other"],
  Software: ["OS Issue", "Application Error", "Installation", "Update", "Other"],
  Network: ["Internet", "VPN", "Wi-Fi", "LAN", "Other"],
  Access: ["Password Reset", "Account Unlock", "Permission Request", "New Account", "Other"],
};

const TicketForm = ({ onTicketCreated }: TicketFormProps) => {
  const { user, profile } = useAuth();
  const [userName, setUserName] = useState("");
  const [process, setProcess] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "">("");
  const [issueCategory, setIssueCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const subCategories = issueCategory ? ISSUE_CATEGORIES[issueCategory] || [] : [];

  const handleCategoryChange = (value: string) => {
    setIssueCategory(value);
    setSubCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !issueCategory || !priority || !user) return;

    setSubmitting(true);
    const ticket = await createTicket({
      user_name: userName.trim(),
      process: process.trim(),
      reported_by: reportedBy.trim(),
      priority: priority as "Low" | "Medium" | "High",
      technician_name: profile?.username || user.email || "",
      issue_category: issueCategory,
      sub_category: subCategory,
      start_time: startTime || null,
      end_time: endTime || null,
      request_status: "Open",
      remarks: remarks.trim(),
      created_by: user.id,
      created_date: new Date().toISOString().split("T")[0],
    });

    if (ticket) {
      onTicketCreated(ticket);
      toast({ title: `${ticket.request_id} created`, description: "Ticket saved & synced to Google Sheet." });
      setSuccess(true);
      setTimeout(() => {
        setUserName(""); setProcess(""); setReportedBy("");
        setPriority(""); setIssueCategory(""); setSubCategory("");
        setStartTime(""); setEndTime(""); setRemarks("");
        setSuccess(false);
      }, 1200);
    } else {
      toast({ title: "Error", description: "Failed to create ticket.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const fieldClass = "bg-secondary/50 border-border focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Start Time">
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldClass} />
        </Field>
        <Field label="End Time">
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldClass} />
        </Field>
      </div>

      <Field label="Technician Name">
        <Input value={profile?.username || ""} readOnly className={`${fieldClass} opacity-70 cursor-not-allowed`} />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="User Name *">
          <Input placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} required maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Process">
          <Input placeholder="e.g. Onboarding" value={process} onChange={(e) => setProcess(e.target.value)} maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Reported By">
          <Input placeholder="Reporter name" value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} maxLength={100} className={fieldClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Priority *">
          <Select value={priority} onValueChange={(v) => setPriority(v as "Low" | "Medium" | "High")}>
            <SelectTrigger className={fieldClass}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">🟢 Low</SelectItem>
              <SelectItem value="Medium">🟡 Medium</SelectItem>
              <SelectItem value="High">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Issue Category *">
          <Select value={issueCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className={fieldClass}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {Object.keys(ISSUE_CATEGORIES).map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sub-category">
          <Select value={subCategory} onValueChange={setSubCategory} disabled={!issueCategory}>
            <SelectTrigger className={fieldClass}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {subCategories.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Remarks">
        <Textarea placeholder="Describe the issue..." value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} maxLength={2000} className={`${fieldClass} resize-none`} />
      </Field>

      <Button type="submit" disabled={submitting || !userName.trim() || !issueCategory || !priority} className="w-full h-11 font-semibold text-sm tracking-wide">
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
