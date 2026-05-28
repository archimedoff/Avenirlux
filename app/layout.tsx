import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { SiteChrome } from "@/components/site-chrome";
import { getEnabledSocialProviders } from "@/lib/auth/providers-meta";
import { getSiteUrl } from "@/lib/site";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AvenirLux — Quiet luxury hotels",
    template: "%s · AvenirLux",
  },
  description:
    "Curated cinematic stays across the world's most considered destinations. Ultra-premium hospitality, privately selected.",
  applicationName: "AvenirLux",
  keywords: ["AvenirLux", "luxury hotels", "boutique stays", "quiet luxury travel"],
  openGraph: {
    title: "AvenirLux",
    description:
      "Curated cinematic stays across the world's most considered destinations. Ultra-premium hospitality, privately selected.",
    siteName: "AvenirLux",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AvenirLux — Quiet luxury hotels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AvenirLux",
    description:
      "Curated cinematic stays across the world's most considered destinations.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const socialProviders = getEnabledSocialProviders();

  return (
    <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable}`}>
      <body className={`${plusJakarta.className} flex min-h-screen flex-col antialiased`}>
        <AppProviders socialProviders={socialProviders}>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
