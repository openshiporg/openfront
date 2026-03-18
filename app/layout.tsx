import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/ui/whatsapp-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SYSmoAI — AI Tools & Systems for Bangladesh",
    template: "%s | SYSmoAI",
  },
  description:
    "Premium AI subscriptions and AI implementation services for students, freelancers, agencies, and businesses in Bangladesh. bKash, Nagad, Rocket payments accepted.",
  keywords: [
    "AI tools Bangladesh",
    "ChatGPT Bangladesh",
    "AI subscription Bangladesh",
    "SYSmoAI",
    "AI implementation Bangladesh",
    "bKash AI subscription",
  ],
  openGraph: {
    title: "SYSmoAI — AI Tools & Systems for Bangladesh",
    description: "Premium AI subscriptions and AI implementation services for Bangladesh.",
    url: "https://sysmoai.com",
    siteName: "SYSmoAI",
    locale: "en_US",
    type: "website",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <main>{children}</main>
        <WhatsAppButton />
      </body>
    </html>
  );
}
