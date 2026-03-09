import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Verify JWT and authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub;

    // Verify the caller is an authenticated user with a valid role (admin or technician)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Unauthorized: no role assigned" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ticket } = await req.json();

    // Validate that the ticket actually exists in the database before syncing
    if (ticket?.request_id) {
      const { data: existingTicket } = await supabaseAdmin
        .from("tickets")
        .select("id")
        .eq("request_id", ticket.request_id)
        .single();

      if (!existingTicket) {
        return new Response(JSON.stringify({ error: "Ticket not found in database" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

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

    console.log("Syncing to Google Sheet, action:", action, "caller:", callerId);

    let response = await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (response.status === 302 || response.status === 301 || response.status === 307) {
      const redirectUrl = response.headers.get("location");
      if (redirectUrl) {
        response = await fetch(redirectUrl);
      }
    }

    const status = response.status;
    const responseText = await response.text();
    console.log("Google Sheet response status:", status);

    if (status >= 400) {
      console.error("Google Sheet sync failed with status:", status);
    }

    return new Response(JSON.stringify({ success: status < 400, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync error:", error.message);
    return new Response(JSON.stringify({ error: "Sync failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
