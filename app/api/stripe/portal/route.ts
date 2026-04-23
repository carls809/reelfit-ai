import { NextRequest, NextResponse } from "next/server";

import { getAppUrl } from "@/lib/app-env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const supabase = getSupabaseAdminClient();

  if (!stripe || !supabase) {
    return NextResponse.json({ message: "Stripe customer portal is not configured yet." }, { status: 500 });
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
    return NextResponse.json({ message: "Unauthorized portal request." }, { status: 401 });
  }

  const origin = getAppUrl(request);
  const { data: userProfile } = await supabase
    .from("users")
    .select("stripe_customer_id, subscription_status")
    .eq("user_id", body.userId)
    .maybeSingle();

  if (!userProfile?.stripe_customer_id) {
    return NextResponse.json(
      {
        message:
          userProfile?.subscription_status === "active" || userProfile?.subscription_status === "trialing"
            ? "Stripe billing exists but the customer record has not synced yet. Retry in a moment."
            : "No Stripe customer found yet. Start checkout first."
      },
      { status: 404 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: `${origin}/`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to create Stripe billing portal session."
      },
      { status: 500 }
    );
  }
}
