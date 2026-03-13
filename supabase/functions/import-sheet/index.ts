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
    // Allow both authenticated user calls and cron calls (via Authorization header)
    const authHeader = req.headers.get("Authorization");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If called by a user, verify they have a valid role
    if (authHeader?.startsWith("Bearer ")) {
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
    }

    // Fetch all data from Google Sheet via GET
    console.log("Fetching data from Google Sheet...");
    let response = await fetch(`${GOOGLE_SHEET_URL}?action=getAll`, {
      method: "GET",
      redirect: "follow",
    });

    if (response.status === 302 || response.status === 301 || response.status === 307) {
      const redirectUrl = response.headers.get("location");
      if (redirectUrl) {
        response = await fetch(redirectUrl);
      }
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Google Sheet fetch failed:", response.status, text);
      return new Response(JSON.stringify({ error: "Failed to fetch from Google Sheet", status: response.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sheetData = await response.json();

    if (!Array.isArray(sheetData)) {
      console.error("Unexpected sheet data format:", typeof sheetData);
      return new Response(JSON.stringify({ error: "Invalid data format from Google Sheet" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Received ${sheetData.length} rows from Google Sheet`);

    let updated = 0;
    let skipped = 0;

    for (const row of sheetData) {
      const requestId = row["Request/Complaint ID"];
      if (!requestId) {
        skipped++;
        continue;
      }

      // Find the existing ticket by request_id
      const { data: existing } = await supabaseAdmin
        .from("tickets")
        .select("id, updated_at")
        .eq("request_id", requestId)
        .single();

      if (!existing) {
        skipped++;
        continue; // Only update existing tickets, don't create new ones from sheet
      }

      // Map sheet columns back to database columns
      const updates: Record<string, any> = {};

      if (row["User Name"] !== undefined) updates.user_name = row["User Name"];
      if (row["Process"] !== undefined) updates.process = row["Process"] || "";
      if (row["Reported By"] !== undefined) updates.reported_by = row["Reported By"] || "";
      if (row["Priority"] !== undefined) updates.priority = row["Priority"];
      if (row["Technician Name"] !== undefined) updates.technician_name = row["Technician Name"];
      if (row["Issue Category"] !== undefined) updates.issue_category = row["Issue Category"];
      if (row["Sub-category"] !== undefined) updates.sub_category = row["Sub-category"] || "";
      if (row["Request Status"] !== undefined) updates.request_status = row["Request Status"];
      if (row["Remarks"] !== undefined) updates.remarks = row["Remarks"] || "";
      if (row["Start Time"] !== undefined) updates.start_time = row["Start Time"] || null;
      if (row["End Time"] !== undefined) updates.end_time = row["End Time"] || null;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabaseAdmin
          .from("tickets")
          .update(updates)
          .eq("id", existing.id);

        if (error) {
          console.error(`Failed to update ticket ${requestId}:`, error.message);
        } else {
          updated++;
        }
      }
    }

    console.log(`Import complete: ${updated} updated, ${skipped} skipped`);

    return new Response(JSON.stringify({ success: true, updated, skipped, total: sheetData.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Import error:", error.message);
    return new Response(JSON.stringify({ error: "Import failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
