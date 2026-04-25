"use client";

import { track } from "@vercel/analytics";

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>;

export function trackEvent(eventName: string, properties?: AnalyticsProperties) {
  try {
    const sanitized = properties
      ? Object.fromEntries(
          Object.entries(properties).filter(
            (entry): entry is [string, AnalyticsValue] => entry[1] !== undefined && entry[1] !== null
          )
        )
      : undefined;

    track(eventName, sanitized);
  } catch {
    // Never block core user flows if analytics is unavailable.
  }
}
