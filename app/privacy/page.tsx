import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <main className="container min-h-screen py-8">
      <div className="space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to ReelFit AI
        </Link>

        <BrandMark />

        <Card className="max-w-4xl">
          <CardContent className="space-y-6 p-8">
            <Badge>Privacy</Badge>
            <h1 className="font-hero text-5xl font-semibold">Privacy notes for ReelFit AI</h1>
            <div className="flex items-center gap-3 rounded-[1.25rem] border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
              <ShieldCheck className="h-4 w-4" />
              Supabase stores auth + saved generations in your own project. Stripe stores billing in your own account.
            </div>
            <div className="space-y-5 text-muted-foreground">
              <p>
                ReelFit AI only persists saved generations, profile metadata needed for the product experience, and Stripe customer IDs needed for subscription access.
              </p>
              <p>
                Email/password and Google OAuth authentication are handled by Supabase Auth. Payment collection and subscription management are handled by Stripe Checkout and the Stripe Customer Portal.
              </p>
              <p>
                You can delete history directly from your Supabase database, revoke billing in Stripe, and export your own project data at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
