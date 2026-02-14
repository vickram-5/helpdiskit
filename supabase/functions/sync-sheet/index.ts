const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwa1wkZTP2wfaqVAo5mue3EG0Ir2jyra8WqFj8O3KfwITiSOy1dFjDQ96Y7sV20ST9-/exec";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ticket } = await req.json();

    const payload = {
      action,
      "Sl No": ticket.sl_no,
      "Request/Complaint ID": ticket.request_id,
      "Created Date": ticket.created_date,
      "Start Time": ticket.start_time || "",
      "End Time": ticket.end_time || "",
      "User Name": ticket.user_name,
      "Process": ticket.process || "",
      "Reported By": ticket.reported_by || "",
      "Priority": ticket.priority,
      "Technician Name": ticket.technician_name,
      "Issue Category": ticket.issue_category,
      "Sub-category": ticket.sub_category || "",
      "Effort Time": ticket.effort_time || "",
      "Request Status": ticket.request_status,
      "Remarks": ticket.remarks || "",
    };

    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
