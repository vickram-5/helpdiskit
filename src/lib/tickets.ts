export interface Ticket {
  ticketId: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  userName: string;
  status: string;
  createdAt: string;
}

export const generateTicketId = (): string => {
  const prefix = "TKT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// =============================================
// GOOGLE SHEETS INTEGRATION
// =============================================
// Replace this URL with your Google Apps Script Web App URL.
// To create one:
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste the doPost function (see below)
// 4. Deploy as Web App (Execute as: Me, Access: Anyone)
// 5. Copy the URL and paste it here
//
// Google Apps Script code:
// function doPost(e) {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//   var data = JSON.parse(e.postData.contents);
//   sheet.appendRow([
//     data.ticketId,
//     data.subject,
//     data.description,
//     data.priority,
//     data.userName,
//     data.status,
//     data.createdAt
//   ]);
//   return ContentService.createTextOutput(
//     JSON.stringify({ result: "success" })
//   ).setMimeType(ContentService.MimeType.JSON);
// }
//
// function doGet() {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//   var data = sheet.getDataRange().getValues();
//   var headers = data[0];
//   var rows = data.slice(1).map(function(row) {
//     var obj = {};
//     headers.forEach(function(h, i) { obj[h] = row[i]; });
//     return obj;
//   });
//   return ContentService.createTextOutput(
//     JSON.stringify(rows)
//   ).setMimeType(ContentService.MimeType.JSON);
// }
// =============================================

const GOOGLE_SHEET_URL = "";
// ↑ PASTE YOUR GOOGLE WEB APP URL HERE ↑

export const submitTicketToSheet = async (ticket: Ticket): Promise<boolean> => {
  if (!GOOGLE_SHEET_URL) {
    console.warn("Google Sheet URL not configured. Saving locally only.");
    return false;
  }

  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket),
    });
    return true;
  } catch (error) {
    console.error("Failed to submit ticket to Google Sheet:", error);
    return false;
  }
};

export const fetchTicketsFromSheet = async (): Promise<Ticket[]> => {
  if (!GOOGLE_SHEET_URL) {
    console.warn("Google Sheet URL not configured. Using local data.");
    return [];
  }

  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    const data = await response.json();
    return data as Ticket[];
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
