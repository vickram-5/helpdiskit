import { supabase } from "@/integrations/supabase/client";

export interface Ticket {
  id: string;
  sl_no: number;
  request_id: string;
  created_date: string;
  start_time: string | null;
  end_time: string | null;
  user_name: string;
  process: string;
  reported_by: string;
  priority: "Low" | "Medium" | "High";
  technician_name: string;
  issue_category: string;
  sub_category: string;
  effort_time: string;
  request_status: string;
  remarks: string;
  created_by: string;
  created_at?: string;
}

export const fetchTickets = async (userId?: string, isAdmin?: boolean): Promise<Ticket[]> => {
  let query = supabase.from("tickets").select("*").order("sl_no", { ascending: false });
  if (!isAdmin && userId) {
    query = query.eq("created_by", userId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
  return (data || []) as unknown as Ticket[];
};

export const createTicket = async (
  ticket: Omit<Ticket, "id" | "sl_no" | "request_id" | "effort_time">
): Promise<{ data: Ticket | null; errorMessage: string | null }> => {
  // Validate required fields
  if (!ticket.user_name?.trim()) {
    return { data: null, errorMessage: "User Name is required." };
  }
  if (!ticket.issue_category?.trim()) {
    return { data: null, errorMessage: "Issue Category is required." };
  }
  if (!ticket.priority) {
    return { data: null, errorMessage: "Priority is required." };
  }
  if (!ticket.created_by) {
    return { data: null, errorMessage: "You must be logged in to create a ticket." };
  }
  if (!ticket.technician_name?.trim()) {
    return { data: null, errorMessage: "Technician name is missing. Please reload and try again." };
  }

  try {
    console.log("[Ticket] Submitting ticket:", JSON.stringify(ticket, null, 2));

    const { data, error } = await supabase
      .from("tickets")
      .insert({
        user_name: ticket.user_name,
        process: ticket.process,
        reported_by: ticket.reported_by,
        priority: ticket.priority,
        technician_name: ticket.technician_name,
        issue_category: ticket.issue_category,
        sub_category: ticket.sub_category,
        request_status: ticket.request_status,
        remarks: ticket.remarks,
        created_by: ticket.created_by,
        start_time: ticket.start_time || null,
        end_time: ticket.end_time || null,
        created_date: ticket.created_date,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("[Ticket] Database error:", error.code, error.message, error.details, error.hint);

      if (error.code === "23505") {
        return { data: null, errorMessage: "Duplicate ticket detected. Please try again." };
      }
      if (error.code === "42501" || error.message?.includes("row-level security")) {
        return { data: null, errorMessage: "Permission denied. Please sign out and sign back in." };
      }
      if (error.code === "PGRST301" || error.message?.includes("JWT")) {
        return { data: null, errorMessage: "Session expired. Please sign out and sign back in." };
      }
      return { data: null, errorMessage: `Database error: ${error.message}` };
    }

    console.log("[Ticket] Created successfully:", data?.request_id);

    // Sync to Google Sheets (fire-and-forget)
    syncToSheet("create", data);

    return { data: data as unknown as Ticket, errorMessage: null };
  } catch (err: any) {
    console.error("[Ticket] Unexpected error:", err);
    if (err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")) {
      return { data: null, errorMessage: "Network error. Please check your internet connection." };
    }
    return { data: null, errorMessage: `Unexpected error: ${err?.message || "Unknown error"}` };
  }
};

export const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<boolean> => {
  const { data, error } = await supabase
    .from("tickets")
    .update(updates as any)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating ticket:", error);
    return false;
  }

  syncToSheet("update", data);
  return true;
};

export const deleteTicket = async (id: string, ticket: Ticket): Promise<boolean> => {
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) {
    console.error("Error deleting ticket:", error);
    return false;
  }
  syncToSheet("delete", ticket);
  return true;
};

const syncToSheet = async (action: string, ticket: any) => {
  try {
    await supabase.functions.invoke("sync-sheet", {
      body: { action, ticket },
    });
  } catch (e) {
    console.warn("Sheet sync failed:", e);
  }
};

export const importFromSheet = async (): Promise<{ updated: number; created: number; total: number } | null> => {
  try {
    const { data, error } = await supabase.functions.invoke("import-sheet");
    if (error) {
      console.error("Import from sheet failed:", error);
      return null;
    }
    return data as { updated: number; created: number; total: number };
  } catch (e) {
    console.warn("Sheet import failed:", e);
    return null;
  }
};

export const exportToCSV = (tickets: Ticket[], filename: string) => {
  const headers = [
    "Sl No", "Request/Complaint ID", "Created Date", "Start Time", "End Time",
    "User Name", "Process", "Reported By", "Priority", "Technician Name",
    "Issue Category", "Sub-category", "Effort Time", "Request Status", "Remarks"
  ];

  // Sanitize cell values to prevent CSV formula injection
  const sanitize = (v: any): string => {
    const s = String(v ?? "");
    // Prefix formula-starting characters with a single quote to neutralize them
    return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  };

  const rows = tickets.map(t => [
    t.sl_no, t.request_id, t.created_date, t.start_time || "", t.end_time || "",
    t.user_name, t.process, t.reported_by, t.priority, t.technician_name,
    t.issue_category, t.sub_category, t.effort_time, t.request_status, t.remarks
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${sanitize(v)}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
