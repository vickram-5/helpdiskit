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
    const { username, password } = await req.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the user's email server-side — never return it to the client
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .ilike("username", username)
      .single();

    if (error || !data) {
      // Return identical error for unknown username to prevent enumeration
      return new Response(JSON.stringify({ error: "Invalid username or password" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(data.user_id);

    if (authError || !authUser?.user?.email) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Perform sign-in server-side so the email never leaves the server
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: authUser.user.email,
      password,
    });

    if (signInError || !signInData.session) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return the session tokens — the client can use these to set the session
    return new Response(JSON.stringify({
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid username or password" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
