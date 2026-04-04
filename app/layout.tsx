import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SYSmoAI — AI Systems for Bangladesh Businesses",
    template: "%s | SYSmoAI",
  },
  description:
    "SYSmoAI builds AI-powered operating systems for Bangladesh businesses. AI Profit Audit, Implementation Sprint, and Monthly Retainer. Bangla support. bKash, Nagad accepted.",
  keywords: [
    "AI systems Bangladesh",
    "AI implementation Bangladesh",
    "SYSmoAI",
    "business automation Bangladesh",
    "Notion Bangladesh",
    "AI workflow Bangladesh",
    "bKash AI",
    "B2B AI Bangladesh",
  ],
  openGraph: {
    title: "SYSmoAI — AI Systems for Bangladesh Businesses",
    description: "We build AI-powered operating systems for Bangladesh businesses.",
    url: "https://sysmoai.com",
    siteName: "SYSmoAI",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="/favicon.svg" rel="icon" />
      </head>
      <body className="antialiased min-h-screen bg-background font-sans">
        <main>{children}</main>
      </body>
    </html>
  );
}
