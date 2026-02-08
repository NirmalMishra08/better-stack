import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Better Uptime - Advanced Website Monitoring & Alerting",
  description: "Professional website monitoring, uptime tracking, and instant alerting. Keep your services running 24/7 with our advanced monitoring platform.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  other: {
    "theme-color": "#1e3a8a",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>

      </body>
    </html >
  );
}
