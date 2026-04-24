import Link from "next/link";
import { ArrowLeft, Database, LockKeyhole, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "Who operates ReelFit AI",
    body: [
      "ReelFit AI is operated by SWEET MOTION in Australia. This page explains what information we collect, why we collect it, and how we use it to run the product."
    ]
  },
  {
    title: "What we collect",
    body: [
      "We may collect your email address, login details, profile details supplied through Supabase, billing-related customer references from Stripe, and the generations you choose to save inside your account history.",
      "We may also collect limited technical information such as request logs, browser information, and device information needed to keep the service secure and working properly."
    ]
  },
  {
    title: "How we use your information",
    body: [
      "We use your information to sign you in, save your Reel packs, enforce free-plan limits, process subscription access, open the Stripe billing portal, and improve the reliability of the app.",
      "We do not sell your personal information. We only use it to operate, secure, support, and improve ReelFit AI."
    ]
  },
  {
    title: "Third-party processors",
    body: [
      "Authentication and account data are handled through Supabase.",
      "Subscription billing, invoices, and customer portal access are handled through Stripe."
    ]
  },
  {
    title: "Saved content and retention",
    body: [
      "Saved generations remain in your account history until you delete them or your account data is otherwise removed. Guest-mode history stays in the local browser storage on the device you used.",
      "If you delete a history item inside the app, it is removed from the corresponding saved history store for that account or device."
    ]
  },
  {
    title: "Your choices",
    body: [
      "You can sign out at any time, delete saved history from inside the app, and manage or cancel paid subscriptions through the Stripe customer portal.",
      "Depending on where you live, you may also have rights to request access to, correction of, or deletion of personal information we hold about you."
    ]
  },
  {
    title: "Security",
    body: [
      "We use reasonable technical and operational measures to protect account and billing data. No online service can promise absolute security, but we work to keep access limited to the systems needed to run the product."
    ]
  },
  {
    title: "Updates",
    body: [
      "We may update this Privacy Policy from time to time as the product evolves. Material updates will be reflected on this page with a refreshed effective date."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="container min-h-screen py-8">
      <div className="space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to ReelFit AI
        </Link>

        <div className="space-y-4">
          <BrandMark />
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Privacy Policy</Badge>
            <Badge variant="secondary">Effective 24 April 2026</Badge>
          </div>
          <div className="max-w-4xl space-y-3">
            <h1 className="font-hero text-5xl font-semibold text-balance">Privacy that matches how ReelFit AI actually works.</h1>
            <p className="max-w-3xl text-lg text-muted-foreground">
              ReelFit AI is operated by SWEET MOTION. We keep the product simple: Supabase handles accounts and saved history, Stripe handles billing, and this page explains the basics in plain English.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="bg-background/70">
            <CardContent className="space-y-3 p-6">
              <div className="rounded-full bg-primary/10 p-3 text-primary w-fit">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Operator</h2>
              <p className="text-sm text-muted-foreground">ReelFit AI is operated by SWEET MOTION in Australia.</p>
            </CardContent>
          </Card>

          <Card className="bg-background/70">
            <CardContent className="space-y-3 p-6">
              <div className="rounded-full bg-primary/10 p-3 text-primary w-fit">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Where data lives</h2>
              <p className="text-sm text-muted-foreground">Account and history data are stored through Supabase. Billing lives in Stripe.</p>
            </CardContent>
          </Card>

          <Card className="bg-background/70">
            <CardContent className="space-y-3 p-6">
              <div className="rounded-full bg-primary/10 p-3 text-primary w-fit">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Your controls</h2>
              <p className="text-sm text-muted-foreground">You can sign out, delete history, and manage paid subscriptions from inside the app.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-5xl bg-background/70">
          <CardContent className="space-y-8 p-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                <div className="space-y-3 text-muted-foreground">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <section className="space-y-3 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-6">
              <h2 className="text-2xl font-semibold">Contact and billing questions</h2>
              <p className="text-muted-foreground">
                For billing issues, use the Stripe customer portal inside ReelFit AI. For product, privacy, or account questions, use the
                account email channel you signed up with until a dedicated custom-domain support inbox is published.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
