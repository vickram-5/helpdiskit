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

export const createTicket = async (ticket: Omit<Ticket, "id" | "sl_no" | "request_id" | "effort_time">): Promise<Ticket | null> => {
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
    console.error("Error creating ticket:", error);
    return null;
  }

  // Sync to Google Sheets
  syncToSheet("create", data);

  return data as unknown as Ticket;
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

export const exportToCSV = (tickets: Ticket[], filename: string) => {
  const headers = [
    "Sl No", "Request/Complaint ID", "Created Date", "Start Time", "End Time",
    "User Name", "Process", "Reported By", "Priority", "Technician Name",
    "Issue Category", "Sub-category", "Effort Time", "Request Status", "Remarks"
  ];

  const rows = tickets.map(t => [
    t.sl_no, t.request_id, t.created_date, t.start_time || "", t.end_time || "",
    t.user_name, t.process, t.reported_by, t.priority, t.technician_name,
    t.issue_category, t.sub_category, t.effort_time, t.request_status, t.remarks
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
