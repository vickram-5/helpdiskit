const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwqJxK7ENmRA9Ud_HQ2ubfq2fBpglxN3OCvj_H_pV_R1HJdUku2dPHtou-hbLe5ssiv0A/exec";

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
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
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
