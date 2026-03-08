import { useState } from "react";
import { createTicket, type Ticket } from "@/lib/tickets";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Send, Loader2, CheckCircle2, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TicketFormProps {
  onTicketCreated: (ticket: Ticket) => void;
}

const ISSUE_CATEGORIES: Record<string, string[]> = {
  Hardware: ["Laptop Issue", "Monitor", "Keyboard/Mouse", "Printer", "Other"],
  Software: ["OS Issue", "Application Error", "Installation", "Update", "Other"],
  Network: ["Internet", "VPN", "Wi-Fi", "LAN", "Other"],
  Access: ["Password Reset", "Account Unlock", "Permission Request", "New Account", "Other"],
  Other: [],
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
  const [createdDate, setCreatedDate] = useState<Date>(new Date());
  const [otherCategory, setOtherCategory] = useState("");
  const [otherSubCategory, setOtherSubCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const subCategories = issueCategory ? ISSUE_CATEGORIES[issueCategory] || [] : [];

  const handleCategoryChange = (value: string) => {
    setIssueCategory(value);
    setSubCategory("");
    setOtherCategory("");
    setOtherSubCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !issueCategory || !priority || !user) return;

    const finalCategory = issueCategory === "Other" ? (otherCategory.trim() || "Other") : issueCategory;
    const finalSubCategory = subCategory === "Other" ? (otherSubCategory.trim() || "Other") : subCategory;

    setSubmitting(true);
    const { data: ticket, errorMessage } = await createTicket({
      user_name: userName.trim(),
      process: process.trim(),
      reported_by: reportedBy.trim(),
      priority: priority as "Low" | "Medium" | "High",
      technician_name: profile?.username || user.email || "",
      issue_category: finalCategory,
      sub_category: finalSubCategory,
      start_time: startTime || null,
      end_time: endTime || null,
      request_status: "Closed",
      remarks: remarks.trim(),
      created_by: user.id,
      created_date: format(createdDate, "yyyy-MM-dd"),
    });

    if (ticket) {
      onTicketCreated(ticket);
      toast({ title: `${ticket.request_id} created`, description: "Ticket saved & synced to Google Sheet." });
      setSuccess(true);
      setTimeout(() => {
        setUserName(""); setProcess(""); setReportedBy("");
        setPriority(""); setIssueCategory(""); setSubCategory("");
        setStartTime(""); setEndTime(""); setRemarks("");
        setOtherCategory(""); setOtherSubCategory("");
        setCreatedDate(new Date());
        setSuccess(false);
      }, 1200);
    } else {
      toast({ title: "Error", description: errorMessage || "Failed to create ticket.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const fieldClass = "bg-secondary/40 rounded-xl transition-all focus:ring-1 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Date *">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(fieldClass, "w-full justify-start text-left font-normal", !createdDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {createdDate ? format(createdDate, "dd/MM/yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 liquid-glass-strong rounded-xl" align="start">
              <Calendar mode="single" selected={createdDate} onSelect={(d) => d && setCreatedDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        </Field>
        <Field label="Start Time">
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldClass} step="60" />
        </Field>
        <Field label="End Time">
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldClass} step="60" />
        </Field>
      </div>

      <Field label="Technician Name">
        <Input value={profile?.username || ""} readOnly className={`${fieldClass} opacity-60 cursor-not-allowed`} />
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
            <SelectContent className="liquid-glass-strong rounded-xl">
              <SelectItem value="Low">🟢 Low</SelectItem>
              <SelectItem value="Medium">🟡 Medium</SelectItem>
              <SelectItem value="High">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Issue Category *">
          <Select value={issueCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className={fieldClass}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="liquid-glass-strong rounded-xl">
              {Object.keys(ISSUE_CATEGORIES).map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sub-category">
          <Select value={subCategory} onValueChange={(v) => { setSubCategory(v); setOtherSubCategory(""); }} disabled={!issueCategory || issueCategory === "Other"}>
            <SelectTrigger className={fieldClass}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="liquid-glass-strong rounded-xl">
              {subCategories.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {issueCategory === "Other" && (
        <Field label="Specify Category *">
          <Input placeholder="Enter custom category" value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} maxLength={100} className={fieldClass} />
        </Field>
      )}

      {subCategory === "Other" && (
        <Field label="Specify Sub-category *">
          <Input placeholder="Enter custom sub-category" value={otherSubCategory} onChange={(e) => setOtherSubCategory(e.target.value)} maxLength={100} className={fieldClass} />
        </Field>
      )}

      <Field label="Remarks">
        <Textarea placeholder="Describe the issue..." value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} maxLength={2000} className={`${fieldClass} resize-none`} />
      </Field>

      <Button type="submit" disabled={submitting || !userName.trim() || !issueCategory || !priority} className="w-full h-11 font-semibold text-sm tracking-wide rounded-xl">
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
