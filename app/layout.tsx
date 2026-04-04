import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ConditionalNavbar from "@/components/ConditionalNavbar";

import { Analytics } from "@vercel/analytics/next";

const interFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"]
})

export const metadata: Metadata = {
  title: "RejectionGPT",
  description: "Just try it!",
  icons: "/logo2.svg"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interFont.className} antialiased bg-white text-black selection:bg-gray-200`}
      >
        <AuthProvider />
        <ConditionalNavbar />
        <div className="min-h-screen flex flex-col">
          {children}
        </div>

        <Analytics />
      </body>
    </html>
  );
}
