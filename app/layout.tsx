import type { Metadata } from "next";
import {   Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ConditionalNavbar from "@/components/ConditionalNavbar";

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
        className={`${Robotomono.className} antialiased bg-[#111111]`}
      >
        <AuthProvider />
        <div className="min-h-screen w-full relative bg-transparent">
    {/* X Organizations Black Background with Top Glow */}
    <div
      className="absolute inset-0 z-0"
      style={{
       background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
      }}
    />
  
    {/* Your Content/Components */}
  
        <ConditionalNavbar />
        {children}
        </div>
      </body>
    </html>
  );
}
