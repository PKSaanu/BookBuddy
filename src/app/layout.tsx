import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: "BookBudddy | Premium Reading Companion",
  description: "Your premium reading and vocabulary companion. Master new languages as you read.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable} antialiased h-full`}>
      <body className="font-sans min-h-screen bg-[#F4F5F6] text-slate-800 selection:bg-[#0a0f44] selection:text-white flex flex-col relative overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
