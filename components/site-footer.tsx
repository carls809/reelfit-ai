"use client";

import Link from "next/link";
import { ArrowRight, Crown, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";

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
  const reduceMotion = useReducedMotion();
  const carouselTestimonials = reduceMotion ? TESTIMONIALS : [...TESTIMONIALS, ...TESTIMONIALS];

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

      <section className="space-y-4">
        <div className="space-y-3">
          <Badge variant="secondary">Loved by coaches</Badge>
          <div>
            <h2 className="font-hero text-3xl font-semibold md:text-4xl">A rolling wall of creator proof.</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              ReelFit AI is built for fast-moving coaches who want less blank-page stress and more post-ready momentum.
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background via-background/80 to-transparent" />
          <div className="testimonial-marquee flex w-max gap-4 py-1">
            {carouselTestimonials.map((testimonial, index) => (
              <Card
                key={`${testimonial.name}-${index}`}
                className="w-[280px] shrink-0 border-primary/40 bg-background/80 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] md:w-[320px]"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-1 text-secondary">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-base leading-7 text-foreground/95">“{testimonial.quote}”</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
