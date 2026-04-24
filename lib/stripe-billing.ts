import type Stripe from "stripe";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "@/lib/types";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeStripeSubscriptionStatus(status: string | null | undefined): SubscriptionStatus {
  if (status === "active" || status === "trialing" || status === "past_due" || status === "canceled") {
    return status;
  }

  return "free";
}

export function isActiveSubscriptionStatus(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

export function isMissingStripeCustomerError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    message?: unknown;
    code?: unknown;
    raw?: {
      code?: unknown;
      param?: unknown;
      message?: unknown;
    };
  };

  const message =
    typeof candidate.message === "string"
      ? candidate.message
      : typeof candidate.raw?.message === "string"
        ? candidate.raw.message
        : "";
  const code =
    typeof candidate.code === "string"
      ? candidate.code
      : typeof candidate.raw?.code === "string"
        ? candidate.raw.code
        : "";
  const param = typeof candidate.raw?.param === "string" ? candidate.raw.param : "";

  return message.includes("No such customer") || (code === "resource_missing" && param === "customer");
}

export async function resolveUserIdByCustomer(customerId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase.from("users").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
  return data?.user_id ?? null;
}

export async function upsertUserSubscriptionState({
  userId,
  customerId,
  subscriptionId,
  status,
  email
}: {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  email?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data: existing } = await supabase.from("users").select("*").eq("user_id", userId).maybeSingle();

  const nextStatus = normalizeStripeSubscriptionStatus(status);

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        user_id: userId,
        email: email ?? existing?.email ?? null,
        full_name: existing?.full_name ?? null,
        avatar_url: existing?.avatar_url ?? null,
        subscription_status: nextStatus,
        generation_count: existing?.generation_count ?? 0,
        generation_date: existing?.generation_date ?? getTodayKey(),
        stripe_customer_id: customerId ?? existing?.stripe_customer_id ?? null,
        stripe_subscription_id: subscriptionId ?? existing?.stripe_subscription_id ?? null
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function resetUserStripeState({
  userId,
  email
}: {
  userId: string;
  email?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data: existing } = await supabase.from("users").select("*").eq("user_id", userId).maybeSingle();

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        user_id: userId,
        email: email ?? existing?.email ?? null,
        full_name: existing?.full_name ?? null,
        avatar_url: existing?.avatar_url ?? null,
        subscription_status: "free",
        generation_count: existing?.generation_count ?? 0,
        generation_date: existing?.generation_date ?? getTodayKey(),
        stripe_customer_id: null,
        stripe_subscription_id: null
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function findLatestSubscription(stripe: Stripe, customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10
  });

  return (
    subscriptions.data.find((subscription) =>
      ["active", "trialing", "past_due"].includes(subscription.status)
    ) ??
    subscriptions.data[0] ??
    null
  );
}

export async function syncUserSubscriptionFromStripe({
  stripe,
  userId,
  customerId,
  email
}: {
  stripe: Stripe;
  userId: string;
  customerId: string;
  email?: string | null;
}) {
  let subscription: Stripe.Subscription | null;

  try {
    subscription = await findLatestSubscription(stripe, customerId);
  } catch (error) {
    if (isMissingStripeCustomerError(error)) {
      const profile = await resetUserStripeState({
        userId,
        email
      });

      return {
        profile,
        subscriptionStatus: "free" as SubscriptionStatus
      };
    }

    throw error;
  }

  if (!subscription) {
    const profile = await upsertUserSubscriptionState({
      userId,
      customerId,
      subscriptionId: null,
      status: "free",
      email
    });

    return {
      profile,
      subscriptionStatus: "free" as SubscriptionStatus
    };
  }

  const profile = await upsertUserSubscriptionState({
    userId,
    customerId,
    subscriptionId: subscription.id,
    status: subscription.status,
    email
  });

  return {
    profile,
    subscriptionStatus: normalizeStripeSubscriptionStatus(subscription.status)
  };
}
