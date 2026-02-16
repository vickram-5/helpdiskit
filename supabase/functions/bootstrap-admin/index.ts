import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action } = await req.json();

    if (action === "update-password") {
      const { user_id, password } = await req.json();
      // handled below
    }

    // Seed/update users
    const results: string[] = [];

    // Update existing admin password
    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("username", "Admin")
      .single();

    if (adminProfile) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(adminProfile.user_id, {
        password: "Admin@12345",
      });
      results.push(error ? `Admin password update failed: ${error.message}` : "Admin password updated");
    }

    // Seed technicians if missing
    const techUsers = [
      { email: "tech01@cybervibe.com", password: "password", username: "tech01", full_name: "Technician 01", role: "technician" },
      { email: "tech02@cybervibe.com", password: "password", username: "tech02", full_name: "Technician 02", role: "technician" },
      { email: "tech03@cybervibe.com", password: "password", username: "tech03", full_name: "Technician 03", role: "technician" },
    ];

    for (const u of techUsers) {
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("username", u.username);

      if (existing && existing.length > 0) {
        results.push(`${u.username} exists, skipping`);
        continue;
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { username: u.username, full_name: u.full_name },
      });

      if (createError) {
        results.push(`${u.username}: ${createError.message}`);
        continue;
      }

      await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role: u.role });
      results.push(`${u.username} created`);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
