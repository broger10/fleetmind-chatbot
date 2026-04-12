import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FleetMind Assistant",
  description: "Multi-agent AI chatbot for FleetMind fleet management",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FleetMind",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistSans.variable} h-full`}>
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
