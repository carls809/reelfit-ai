import type { NextRequest } from "next/server";

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function isLocalHost(value: string) {
  return value.includes("localhost") || value.includes("127.0.0.1");
}

function normalizeAbsoluteUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `${isLocalHost(trimmed) ? "http" : "https"}://${trimmed}`;

  try {
    return trimTrailingSlash(new URL(withProtocol).toString());
  } catch {
    return null;
  }
}

function getConfiguredAppUrl() {
  return (
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL) ??
    normalizeAbsoluteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeAbsoluteUrl(process.env.VERCEL_URL) ??
    null
  );
}

export function hasSupabaseClientEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isGoogleAuthEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";
}

export function getAuthRedirectUrl() {
  if (typeof window !== "undefined") {
    return trimTrailingSlash(window.location.origin);
  }

  return getConfiguredAppUrl() ?? "http://localhost:3000";
}

export function getAppUrl(request?: NextRequest) {
  if (request) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");

    if (forwardedProto && forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }

    return normalizeAbsoluteUrl(request.nextUrl.origin) ?? "http://localhost:3000";
  }

  return getConfiguredAppUrl() ?? "http://localhost:3000";
}

export function getSiteUrl() {
  return getConfiguredAppUrl() ?? "http://localhost:3000";
}
