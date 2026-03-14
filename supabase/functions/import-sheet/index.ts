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

      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Unauthorized: no role assigned" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check if this is a bulk import (CSV/Excel data sent in body)
    let sheetData: any[] = [];
    let isBulkImport = false;
    let bulkCreatedBy: string | null = null;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.rows && Array.isArray(body.rows)) {
          sheetData = body.rows;
          isBulkImport = true;
          bulkCreatedBy = body.created_by || null;
          console.log(`Bulk import: ${sheetData.length} rows received`);
        }
      } catch {
        // Not a JSON body with rows, fall through to Google Sheet fetch
      }
    }

    // If no bulk data, fetch from Google Sheet
    if (sheetData.length === 0) {
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

      sheetData = await response.json();

      if (!Array.isArray(sheetData)) {
        console.error("Unexpected sheet data format:", typeof sheetData);
        return new Response(JSON.stringify({ error: "Invalid data format from Google Sheet" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log(`Processing ${sheetData.length} rows`);

    let updated = 0;
    let created = 0;
    let skipped = 0;

    for (const row of sheetData) {
      const requestId = row["Request/Complaint ID"] || row["request_id"] || row["Request ID"];
      const userName = row["User Name"] || row["user_name"] || "";
      const issueCategory = row["Issue Category"] || row["issue_category"] || "";
      const technicianName = row["Technician Name"] || row["technician_name"] || "";

      // For bulk import, we always create new tickets
      if (isBulkImport) {
        if (!userName?.trim() || !issueCategory?.trim()) {
          skipped++;
          continue;
        }

        const insertData: Record<string, any> = {
          user_name: userName,
          process: row["Process"] || row["process"] || "",
          reported_by: row["Reported By"] || row["reported_by"] || "",
          priority: row["Priority"] || row["priority"] || "Medium",
          technician_name: technicianName || "Unassigned",
          issue_category: issueCategory,
          sub_category: row["Sub-category"] || row["sub_category"] || "",
          request_status: row["Request Status"] || row["request_status"] || "Open",
          remarks: row["Remarks"] || row["remarks"] || "",
          created_by: bulkCreatedBy,
          start_time: row["Start Time"] || row["start_time"] || null,
          end_time: row["End Time"] || row["end_time"] || null,
        };

        if (row["Created Date"] || row["created_date"]) {
          insertData.created_date = row["Created Date"] || row["created_date"];
        }

        const { error } = await supabaseAdmin.from("tickets").insert(insertData);
        if (error) {
          console.error(`Failed to create ticket:`, error.message);
          skipped++;
        } else {
          created++;
        }
        continue;
      }

      // For Google Sheet sync: update existing OR create new
      if (requestId) {
        const { data: existing } = await supabaseAdmin
          .from("tickets")
          .select("id")
          .eq("request_id", requestId)
          .single();

        if (existing) {
          // Update existing ticket
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
        } else {
          // Create new ticket from sheet row that doesn't exist yet
          if (!userName?.trim() || !issueCategory?.trim()) {
            skipped++;
            continue;
          }

          // Get the first admin user as created_by fallback
          const { data: adminUser } = await supabaseAdmin
            .from("user_roles")
            .select("user_id")
            .eq("role", "admin")
            .limit(1)
            .single();

          const insertData: Record<string, any> = {
            user_name: userName,
            process: row["Process"] || "",
            reported_by: row["Reported By"] || "",
            priority: row["Priority"] || "Medium",
            technician_name: technicianName || "Unassigned",
            issue_category: issueCategory,
            sub_category: row["Sub-category"] || "",
            request_status: row["Request Status"] || "Open",
            remarks: row["Remarks"] || "",
            created_by: adminUser?.user_id || "00000000-0000-0000-0000-000000000000",
            start_time: row["Start Time"] || null,
            end_time: row["End Time"] || null,
          };

          const { error } = await supabaseAdmin.from("tickets").insert(insertData);
          if (error) {
            console.error(`Failed to create ticket from sheet:`, error.message);
            skipped++;
          } else {
            created++;
          }
        }
      } else {
        skipped++;
      }
    }

    console.log(`Import complete: ${updated} updated, ${created} created, ${skipped} skipped`);

    return new Response(JSON.stringify({ success: true, updated, created, skipped, total: sheetData.length }), {
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
