"use client";

import Link from "next/link";
import { ArrowRight, Crown, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PRICING_BULLETS, PREMIUM_PRICE, TESTIMONIALS } from "@/lib/constants";

interface SiteFooterProps {
  isUnlimited: boolean;
  onUpgrade: () => void;
  onManageBilling: () => void;
}

export function SiteFooter({ isUnlimited, onUpgrade, onManageBilling }: SiteFooterProps) {
  return (
    <footer className="space-y-8 pb-10 pt-6">
      <section className="section-shell overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/10 via-secondary/10 to-transparent blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <Badge>Pricing</Badge>
            <h2 className="max-w-2xl text-balance font-hero text-4xl font-semibold md:text-5xl">
              Upgrade the moment your free daily ideas start converting.
            </h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              ReelFit AI keeps the flow ultra-simple: one click to generate, one click to copy, one plan when you want unlimited output.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PRICING_BULLETS.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-border bg-background/60 px-4 py-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="border-primary/20 bg-background/80">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Creator plan</Badge>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  {isUnlimited ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Monthly</p>
                <p className="mt-2 text-4xl font-semibold">{PREMIUM_PRICE}</p>
                <p className="mt-2 text-sm text-muted-foreground">Unlimited generations, history sync, and billing portal access through Stripe.</p>
              </div>
              <Button className="h-12 w-full rounded-2xl" onClick={isUnlimited ? onManageBilling : onUpgrade}>
                {isUnlimited ? "Open customer portal" : "Upgrade for Unlimited"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">ReelFit AI is operated by SWEET MOTION. Secure billing is handled through Stripe.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <Card key={testimonial.name} className="bg-background/70">
            <CardContent className="space-y-4 p-6">
              <p className="text-lg leading-7">“{testimonial.quote}”</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        id="privacy"
        className="rounded-[1.5rem] border border-border bg-background/70 px-5 py-5 text-sm text-muted-foreground"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Privacy-friendly by design. Auth and saved history live in Supabase, billing lives in Stripe.</span>
            </div>
            <p>
              ReelFit AI is operated by SWEET MOTION in Australia. Review our Privacy Policy and Terms of Service for the practical rules that govern the product.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="font-semibold text-foreground transition hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-semibold text-foreground transition hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </section>
    </footer>
  );
}
