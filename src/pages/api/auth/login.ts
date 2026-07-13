import type { APIRoute } from "astro";
import { supabase } from "../../../server/supabase";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies }) => {
  let email = "";
  let password = "";

  try {
    const contentType = request.headers.get("Content-Type") || "";
    
    if (contentType.includes("application/json")) {
      const text = await request.text();
      const data = text ? JSON.parse(text) : {};
      email = data.email || "";
      password = data.password || "";
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      email = formData.get("email")?.toString() || "";
      password = formData.get("password")?.toString() || "";
    } else {
      const text = await request.text();
      const data = text ? JSON.parse(text) : {};
      email = data.email || "";
      password = data.password || "";
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Parse Error: ${e.message}` }), { status: 400 });
  }

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }

  if (data.session && data.user) {
    // Create a fresh client explicitly injected with the user's JWT to guarantee RLS bypass/validation
    const authedSupabase = createClient(
      (import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL),
      (import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY),
      {
        global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
      }
    );

    const { data: userRecord, error: userError } = await authedSupabase
      .from('users')
      .select('role')
      .eq('auth_id', data.user.id)
      .single();

    if (userError || userRecord?.role !== 'admin') {
      const debugPayload = { userError, userRecord, authId: data.user.id };
      console.error("Admin Login Check Failed:", debugPayload);
      
      await supabase.auth.signOut();
      return new Response(JSON.stringify({ 
        error: "Access denied. Only administrators can log in to this dashboard.",
        debug: debugPayload
      }), { status: 403 });
    }

    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 31536000 // 1 year
    });
    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 31536000 // 1 year
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
