import type { NextRequest } from "next/server";

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function hasSupabaseClientEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getAuthRedirectUrl() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000"
  );
}

export function getAppUrl(request?: NextRequest) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (request) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");

    if (forwardedProto && forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }

    return trimTrailingSlash(request.nextUrl.origin);
  }

  return "http://localhost:3000";
}
