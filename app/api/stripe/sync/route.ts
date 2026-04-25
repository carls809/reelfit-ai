import { NextRequest, NextResponse } from "next/server";

import { isActiveSubscriptionStatus, resetUserStripeState, syncUserSubscriptionFromStripe } from "@/lib/stripe-billing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const supabase = getSupabaseAdminClient();

  if (!stripe || !supabase) {
    return NextResponse.json({ message: "Stripe sync is not configured yet." }, { status: 500 });
  }

  const body = (await request.json()) as {
    userId?: string;
  };

  if (!body.userId) {
    return NextResponse.json({ message: "Missing user ID." }, { status: 400 });
  }

  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) {
    return NextResponse.json({ message: "Missing auth session." }, { status: 401 });
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user || user.id !== body.userId) {
    return NextResponse.json({ message: "Unauthorized sync request." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("stripe_customer_id, email, subscription_status")
    .eq("user_id", body.userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      {
        message: "Unable to refresh your billing status right now."
      },
      { status: 500 }
    );
  }

  if (!profile?.stripe_customer_id) {
    if (isActiveSubscriptionStatus(profile?.subscription_status)) {
      const repairedProfile = await resetUserStripeState({
        userId: body.userId,
        email: profile?.email
      });

      return NextResponse.json({
        subscriptionStatus: "free",
        stripeCustomerId: repairedProfile?.stripe_customer_id ?? null
      });
    }

    return NextResponse.json(
      {
        message: "No Stripe customer found yet.",
        subscriptionStatus: profile?.subscription_status ?? "free",
        stripeCustomerId: null
      }
    );
  }

  try {
    const result = await syncUserSubscriptionFromStripe({
      stripe,
      userId: body.userId,
      customerId: profile.stripe_customer_id,
      email: profile.email
    });

    return NextResponse.json({
      subscriptionStatus: result.subscriptionStatus,
      stripeCustomerId: result.profile?.stripe_customer_id ?? null
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to sync Stripe subscription."
      },
      { status: 500 }
    );
  }
}
