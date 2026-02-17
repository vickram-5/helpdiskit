const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxitMHVaJTfw-bZmjy0mVpCpcq3VuXrtSiLedDCkVlPrQTBYaHEJ7AFEytgsozSCOEB/exec";

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

    console.log("Syncing to Google Sheet, action:", action);

    // Google Apps Script redirects POST requests. We need to follow manually.
    let response = await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    // If we get a redirect, follow it manually with GET (Google Apps Script pattern)
    if (response.status === 302 || response.status === 301 || response.status === 307) {
      const redirectUrl = response.headers.get("location");
      if (redirectUrl) {
        console.log("Following redirect to:", redirectUrl);
        response = await fetch(redirectUrl);
      }
    }

    const status = response.status;
    const responseText = await response.text();
    console.log("Google Sheet response status:", status);
    console.log("Google Sheet response:", responseText.substring(0, 200));

    if (status >= 400) {
      console.error("Google Sheet sync failed with status:", status);
    }

    return new Response(JSON.stringify({ success: status < 400, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
