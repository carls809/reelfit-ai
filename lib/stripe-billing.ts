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
  const subscription = await findLatestSubscription(stripe, customerId);

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
