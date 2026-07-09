import type { APIRoute } from "astro";
import { supabase } from "../../../server/supabase";

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
    // Validate if the user is an admin
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', data.user.id)
      .single();

    if (userError || userRecord?.role !== 'admin') {
      await supabase.auth.signOut();
      return new Response(JSON.stringify({ error: "Access denied. Only administrators can log in to this dashboard." }), { status: 403 });
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
