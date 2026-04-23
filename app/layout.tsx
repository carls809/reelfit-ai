import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { PWARegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "ReelFit AI",
    template: "%s | ReelFit AI"
  },
  description:
    "Generate viral Instagram Reel ideas, hooks, captions, and hashtags in seconds for your fitness coaching niche.",
  applicationName: "ReelFit AI",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "ReelFit AI",
    description:
      "Instagram Reel Idea Generator exclusively for fitness coaches. Generate 5 ideas instantly and scale with a clean SaaS workflow.",
    siteName: "ReelFit AI",
    url: metadataBase,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ReelFit AI",
    description:
      "Generate viral Instagram Reel ideas, hooks, captions, and hashtags in seconds for your fitness coaching niche."
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090c12" }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <PWARegister />
          {children}
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
