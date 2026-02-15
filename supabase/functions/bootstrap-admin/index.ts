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

    const results: string[] = [];

    // Seed users list
    const usersToSeed = [
      { email: "admin@cybervibe.com", password: "Admin@12345", username: "Admin", full_name: "Admin", role: "admin" },
      { email: "tech01@cybervibe.com", password: "password", username: "tech01", full_name: "Technician 01", role: "technician" },
      { email: "tech02@cybervibe.com", password: "password", username: "tech02", full_name: "Technician 02", role: "technician" },
      { email: "tech03@cybervibe.com", password: "password", username: "tech03", full_name: "Technician 03", role: "technician" },
    ];

    for (const u of usersToSeed) {
      // Check if user already exists by listing and filtering
      const { data: existingProfiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, username")
        .eq("username", u.username);

      if (existingProfiles && existingProfiles.length > 0) {
        results.push(`${u.username} already exists, skipping`);
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

      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: newUser.user.id, role: u.role });

      results.push(`${u.username} created as ${u.role}`);
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
