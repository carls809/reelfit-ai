import { NextRequest, NextResponse } from "next/server";

import { createGenerationPayload, createGenerationRecord } from "@/lib/ai";
import { FREE_DAILY_LIMIT, GOAL_OPTIONS, STYLE_OPTIONS } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DurationValue, GoalValue, StyleValue, SubscriptionStatus, UserProfile } from "@/lib/types";
import { isUnlimitedPlan } from "@/lib/utils";

export const runtime = "nodejs";

function normalizeStatus(status: string | null | undefined): SubscriptionStatus {
  if (status === "active" || status === "trialing" || status === "past_due" || status === "canceled") {
    return status;
  }

  return "free";
}

function isValidGoal(value: string): value is GoalValue {
  return GOAL_OPTIONS.some((option) => option.value === value);
}

function isValidStyle(value: string): value is StyleValue {
  return STYLE_OPTIONS.some((option) => option.value === value);
}

function isValidDuration(value: string): value is DurationValue {
  return value === "15s" || value === "30s";
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    goal?: string;
    style?: string;
    duration?: string;
  };

  if (!body.goal || !body.style || !body.duration || !isValidGoal(body.goal) || !isValidStyle(body.style) || !isValidDuration(body.duration)) {
    return NextResponse.json({ message: "Invalid generator selection." }, { status: 400 });
  }

  const payload = createGenerationPayload(body.goal, body.style, body.duration);
  const guestRecord = createGenerationRecord(payload, {
    saved: true,
    source: "local"
  });

  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  const supabase = getSupabaseAdminClient();

  if (!supabase || !accessToken) {
    return NextResponse.json({
      ideas: payload.ideas,
      record: guestRecord,
      remaining: FREE_DAILY_LIMIT,
      limitReached: false,
      subscriptionStatus: "free"
    });
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    return NextResponse.json({ message: "Authentication expired. Please sign in again." }, { status: 401 });
  }

  const { data: existingProfile } = await supabase.from("users").select("*").eq("user_id", user.id).maybeSingle();
  const today = new Date().toISOString().slice(0, 10);
  const profile = (existingProfile as UserProfile | null) ?? {
    user_id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    subscription_status: "free",
    generation_count: 0,
    generation_date: today,
    stripe_customer_id: null,
    stripe_subscription_id: null
  };

  const currentStatus = normalizeStatus(profile.subscription_status);
  const currentCount = profile.generation_date === today ? profile.generation_count ?? 0 : 0;
  const unlimited = isUnlimitedPlan(currentStatus);

  if (!unlimited && currentCount >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      {
        message: "Daily free generation limit reached.",
        limitReached: true,
        remaining: 0,
        subscriptionStatus: currentStatus
      },
      { status: 403 }
    );
  }

  const nextCount = currentCount + 1;

  const { data: savedIdea, error: saveError } = await supabase
    .from("ideas")
    .insert({
      user_id: user.id,
      summary: `${GOAL_OPTIONS.find((option) => option.value === body.goal)?.label} • ${
        STYLE_OPTIONS.find((option) => option.value === body.style)?.label
      } • ${body.duration}`,
      goal: body.goal,
      style: body.style,
      duration: body.duration,
      payload
    })
    .select("id, created_at")
    .single();

  if (saveError || !savedIdea) {
    return NextResponse.json({ message: "Unable to save generation history." }, { status: 500 });
  }

  const { error: upsertError } = await supabase.from("users").upsert(
    {
      user_id: user.id,
      email: user.email ?? profile.email,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? profile.full_name,
      avatar_url: user.user_metadata?.avatar_url ?? profile.avatar_url,
      subscription_status: currentStatus,
      generation_count: nextCount,
      generation_date: today,
      stripe_customer_id: profile.stripe_customer_id,
      stripe_subscription_id: profile.stripe_subscription_id
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    return NextResponse.json({ message: "Unable to update user usage." }, { status: 500 });
  }

  const record = createGenerationRecord(payload, {
    id: savedIdea.id,
    saved: true,
    source: "supabase"
  });
  record.createdAt = savedIdea.created_at;

  return NextResponse.json({
    ideas: payload.ideas,
    record,
    remaining: unlimited ? null : Math.max(0, FREE_DAILY_LIMIT - nextCount),
    limitReached: false,
    subscriptionStatus: currentStatus
  });
}
