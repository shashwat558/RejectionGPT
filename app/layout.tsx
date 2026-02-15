import type { Metadata } from "next";
import {   Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const Robotomono = Outfit({
    subsets: ["latin"],
    weight: "400"
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
        className={`${Robotomono.className} antialiased bg-[#09090b] text-gray-200 selection:bg-pink-500/30`}
      >
        

      

      
        <AuthProvider />
        <ConditionalNavbar />
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
