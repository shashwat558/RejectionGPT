import type { Metadata } from "next";
import {   Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
