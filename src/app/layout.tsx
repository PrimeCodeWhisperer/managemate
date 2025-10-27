import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: "ManageMate",
  description:
    "A stunning and functional web scheduler complete with desktop and mobile responsiveness.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    url: "/",
    title: "ManageMate",
    description:
    "A stunning and functional web scheduler complete with desktop and mobile responsiveness.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ManageMate",
    description:
    "A stunning and functional web scheduler complete with desktop and mobile responsiveness."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            {children}
            <CookieConsentBanner />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}