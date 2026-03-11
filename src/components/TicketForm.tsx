import { useState, useEffect } from "react";
import { createTicket, type Ticket } from "@/lib/tickets";
import { fetchAssets, type Asset } from "@/lib/assets";
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
import { DEPARTMENTS, ISSUE_CATEGORIES, PRIORITIES } from "@/lib/constants";

interface TicketFormProps {
  onTicketCreated: (ticket: Ticket) => void;
}

const TicketForm = ({ onTicketCreated }: TicketFormProps) => {
  const { user, profile } = useAuth();
  const [userName, setUserName] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [createdDate, setCreatedDate] = useState<Date>(new Date());
  const [otherCategory, setOtherCategory] = useState("");
  const [otherSubCategory, setOtherSubCategory] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssets().then(setAssets);
  }, []);

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
      process: "",
      reported_by: "",
      priority: priority as Ticket["priority"],
      technician_name: profile?.username || user.email || "",
      issue_category: finalCategory,
      sub_category: finalSubCategory,
      start_time: startTime || null,
      end_time: endTime || null,
      request_status: "Closed",
      remarks: remarks.trim(),
      created_by: user.id,
      created_date: format(createdDate, "yyyy-MM-dd"),
      department,
      location: location.trim(),
      asset_id: selectedAssetId || null,
    });

    if (ticket) {
      onTicketCreated(ticket);
      toast({ title: `${ticket.request_id} created`, description: "Ticket saved & synced to Google Sheet." });
      setSuccess(true);
      setTimeout(() => {
        setUserName(""); setDepartment(""); setLocation("");
        setPriority(""); setIssueCategory(""); setSubCategory("");
        setStartTime(""); setEndTime(""); setRemarks("");
        setOtherCategory(""); setOtherSubCategory("");
        setSelectedAssetId(""); setCreatedDate(new Date());
        setSuccess(false);
      }, 1200);
    } else {
      toast({ title: "Error", description: errorMessage || "Failed to create ticket.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const fieldClass = "bg-secondary/40 rounded-xl transition-all focus:ring-1 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="Raise new ticket form">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Date *" htmlFor="ticket-date">
          <Popover>
            <PopoverTrigger asChild>
              <Button id="ticket-date" variant="outline" aria-label="Select date" className={cn(fieldClass, "w-full justify-start text-left font-normal", !createdDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {createdDate ? format(createdDate, "dd/MM/yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 liquid-glass-strong rounded-xl" align="start">
              <Calendar mode="single" selected={createdDate} onSelect={(d) => d && setCreatedDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        </Field>
        <Field label="Start Time" htmlFor="start-time">
          <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldClass} step="60" aria-label="Start time" />
        </Field>
        <Field label="End Time" htmlFor="end-time">
          <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldClass} step="60" aria-label="End time" />
        </Field>
      </div>

      <Field label="Technician Name" htmlFor="tech-name">
        <Input id="tech-name" value={profile?.username || ""} readOnly className={`${fieldClass} opacity-60 cursor-not-allowed`} aria-label="Technician name (auto-filled)" tabIndex={-1} />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="User Name *" htmlFor="user-name">
          <Input id="user-name" placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} required maxLength={100} className={fieldClass} aria-label="User name" aria-required="true" />
        </Field>
        <Field label="Department" htmlFor="department">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger id="department" className={fieldClass} aria-label="Select department"><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent className="liquid-glass-strong rounded-xl">
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Location" htmlFor="location">
          <Input id="location" placeholder="e.g. Floor 2, Bay 5" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} className={fieldClass} aria-label="Location" />
        </Field>
        <Field label="Asset" htmlFor="asset">
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger id="asset" className={fieldClass} aria-label="Select asset"><SelectValue placeholder="Link asset (optional)" /></SelectTrigger>
            <SelectContent className="liquid-glass-strong rounded-xl">
              <SelectItem value="none">None</SelectItem>
              {assets.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.asset_id} — {a.asset_type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Priority *" htmlFor="priority">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="priority" className={fieldClass} aria-label="Select priority" aria-required="true"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="liquid-glass-strong rounded-xl">
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Issue Category *" htmlFor="issue-cat">
          <Select value={issueCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger id="issue-cat" className={fieldClass} aria-label="Select issue category" aria-required="true"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="liquid-glass-strong rounded-xl">
              {Object.keys(ISSUE_CATEGORIES).map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sub-category" htmlFor="sub-cat">
          <Select value={subCategory} onValueChange={(v) => { setSubCategory(v); setOtherSubCategory(""); }} disabled={!issueCategory || issueCategory === "Other"}>
            <SelectTrigger id="sub-cat" className={fieldClass} aria-label="Select sub-category"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="liquid-glass-strong rounded-xl">
              {subCategories.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {issueCategory === "Other" && (
        <Field label="Specify Category *" htmlFor="other-cat">
          <Input id="other-cat" placeholder="Enter custom category" value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} maxLength={100} className={fieldClass} aria-label="Specify custom category" />
        </Field>
      )}

      {subCategory === "Other" && (
        <Field label="Specify Sub-category *" htmlFor="other-sub">
          <Input id="other-sub" placeholder="Enter custom sub-category" value={otherSubCategory} onChange={(e) => setOtherSubCategory(e.target.value)} maxLength={100} className={fieldClass} aria-label="Specify custom sub-category" />
        </Field>
      )}

      <Field label="Remarks" htmlFor="remarks">
        <Textarea id="remarks" placeholder="Describe the issue..." value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} maxLength={2000} className={`${fieldClass} resize-none`} aria-label="Remarks or description" />
      </Field>

      <Button type="submit" disabled={submitting || !userName.trim() || !issueCategory || !priority} className="w-full h-11 font-semibold text-sm tracking-wide rounded-xl" aria-label="Submit ticket">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : success ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Ticket Created!</> : <><Send className="mr-2 h-4 w-4" /> Submit Ticket</>}
      </Button>
    </form>
  );
};

const Field = ({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default TicketForm;
