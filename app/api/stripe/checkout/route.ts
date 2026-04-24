import { NextRequest, NextResponse } from "next/server";

import { getAppUrl } from "@/lib/app-env";
import { isActiveSubscriptionStatus, syncUserSubscriptionFromStripe } from "@/lib/stripe-billing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const supabase = getSupabaseAdminClient();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripe || !supabase || !priceId) {
    return NextResponse.json(
      { message: "Stripe checkout is not configured. Add Stripe and Supabase env vars first." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as {
    userId?: string;
    email?: string;
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
    return NextResponse.json({ message: "Unauthorized checkout request." }, { status: 401 });
  }

  const origin = getAppUrl(request);
  const { data: userProfile } = await supabase.from("users").select("*").eq("user_id", body.userId).maybeSingle();
  let customerId = userProfile?.stripe_customer_id ?? null;

  try {
    if (customerId) {
      const syncResult = await syncUserSubscriptionFromStripe({
        stripe,
        userId: body.userId,
        customerId,
        email: body.email ?? userProfile?.email ?? null
      });

      if (isActiveSubscriptionStatus(syncResult.subscriptionStatus)) {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${origin}/`
        });

        return NextResponse.json({ url: portalSession.url });
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: body.email ?? userProfile?.email ?? undefined,
        metadata: {
          supabaseUserId: body.userId
        }
      });
      customerId = customer.id;

      await supabase.from("users").upsert(
        {
          user_id: body.userId,
          email: body.email ?? userProfile?.email ?? null,
          full_name: userProfile?.full_name ?? null,
          avatar_url: userProfile?.avatar_url ?? null,
          stripe_customer_id: customerId,
          stripe_subscription_id: userProfile?.stripe_subscription_id ?? null,
          subscription_status: userProfile?.subscription_status ?? "free",
          generation_count: userProfile?.generation_count ?? 0,
          generation_date: userProfile?.generation_date ?? new Date().toISOString().slice(0, 10)
        },
        { onConflict: "user_id" }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: body.userId,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=canceled`,
      subscription_data: {
        metadata: {
          supabaseUserId: body.userId
        }
      },
      metadata: {
        supabaseUserId: body.userId
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to create Stripe checkout session."
      },
      { status: 500 }
    );
  }
}
