export interface Ticket {
  slNo: number;
  requestId: string;
  createdDate: string;
  startTime: string;
  endTime: string;
  userName: string;
  process: string;
  reportedBy: string;
  priority: "Low" | "Medium" | "High";
  technicianName: string;
  issueCategory: string;
  subCategory: string;
  effortTime: string;
  requestStatus: string;
  remarks: string;
}

let ticketCounter = 1;

export const generateRequestId = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `REQ-${dateStr}-${random}`;
};

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyPOC-FrcgkbDxU_7ZWrFQmX6__l7yXd7y1XJUmThSIPxtwjo31cXO9kPR5Di--_QaG/exec";

export const submitTicketToSheet = async (ticket: Ticket): Promise<boolean> => {
  if (!GOOGLE_SHEET_URL) {
    console.warn("Google Sheet URL not configured.");
    return false;
  }

  try {
    const payload = {
      "Sl No": ticket.slNo,
      "Request/Complaint ID": ticket.requestId,
      "Created Date": ticket.createdDate,
      "Start Time": ticket.startTime,
      "End Time": ticket.endTime,
      "User Name": ticket.userName,
      "Process": ticket.process,
      "Reported By": ticket.reportedBy,
      "Priority": ticket.priority,
      "Technician Name": ticket.technicianName,
      "Issue Category": ticket.issueCategory,
      "Sub-category": ticket.subCategory,
      "Effort Time": ticket.effortTime,
      "Request Status": ticket.requestStatus,
      "Remarks": ticket.remarks,
    };

    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error("Failed to submit ticket to Google Sheet:", error);
    return false;
  }
};

export const fetchTicketsFromSheet = async (): Promise<Ticket[]> => {
  if (!GOOGLE_SHEET_URL) return [];

  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    const data = await response.json();
    return data.map((row: any) => ({
      slNo: row["Sl No"] || 0,
      requestId: row["Request/Complaint ID"] || "",
      createdDate: row["Created Date"] || "",
      startTime: row["Start Time"] || "",
      endTime: row["End Time"] || "",
      userName: row["User Name"] || "",
      process: row["Process"] || "",
      reportedBy: row["Reported By"] || "",
      priority: row["Priority"] || "Medium",
      technicianName: row["Technician Name"] || "",
      issueCategory: row["Issue Category"] || "",
      subCategory: row["Sub-category"] || "",
      effortTime: row["Effort Time"] || "",
      requestStatus: row["Request Status"] || "Open",
      remarks: row["Remarks"] || "",
    })) as Ticket[];
  } catch (error) {
    console.error("Failed to fetch tickets from Google Sheet:", error);
    return [];
  }
};

export const getLocalTickets = (): Ticket[] => {
  const stored = localStorage.getItem("tickets");
  return stored ? JSON.parse(stored) : [];
};

export const saveLocalTicket = (ticket: Ticket) => {
  const tickets = getLocalTickets();
  tickets.unshift(ticket);
  localStorage.setItem("tickets", JSON.stringify(tickets));
};

export const getNextSlNo = (): number => {
  const tickets = getLocalTickets();
  if (tickets.length === 0) return 1;
  return Math.max(...tickets.map((t) => t.slNo)) + 1;
};
