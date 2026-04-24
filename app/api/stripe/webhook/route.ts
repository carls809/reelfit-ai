import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  normalizeStripeSubscriptionStatus,
  resolveUserIdByCustomer,
  upsertUserSubscriptionState
} from "@/lib/stripe-billing";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !webhookSecret || !signature) {
    return NextResponse.json({ message: "Stripe webhook is not configured." }, { status: 500 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
      const userId = session.metadata?.supabaseUserId || session.client_reference_id;

      if (userId) {
        await upsertUserSubscriptionState({
          userId,
          customerId,
          subscriptionId,
          status: "active",
          email: session.customer_details?.email ?? session.customer_email
        });
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const metadataUserId = subscription.metadata?.supabaseUserId;
      const userId = metadataUserId || (await resolveUserIdByCustomer(customerId));

      if (userId) {
        await upsertUserSubscriptionState({
          userId,
          customerId,
          subscriptionId: subscription.id,
          status: normalizeStripeSubscriptionStatus(subscription.status)
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
