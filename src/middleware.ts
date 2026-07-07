import { defineMiddleware } from "astro:middleware";
import { supabase } from "./server/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect } = context;

  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  // Protect the dashboard routes
  const isProtectedRoute = url.pathname === "/" || url.pathname.startsWith("/pool-management") || url.pathname.startsWith("/user-directory");
  const isAuthRoute = url.pathname === "/login";

  if (isProtectedRoute) {
    if (!accessToken || !refreshToken) {
      return redirect("/login");
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    });

    if (error || !data.session) {
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
      return redirect("/login");
    }
  }

  if (isAuthRoute) {
    if (accessToken && refreshToken) {
      const { data } = await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
      });
      if (data.session) {
        return redirect("/");
      }
    }
  }

  return next();
});
