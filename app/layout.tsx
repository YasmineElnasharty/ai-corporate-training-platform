import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Corporate Training Platform",
  description: "Choose from AI-driven categories and tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Fixed Navbar */}
        <header className="bg-white shadow-md fixed top-0 w-full z-50">
          <div className="container mx-auto flex items-center justify-start py-4 px-6">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <Image src="/logo1.png" alt="Logo" width={120} height={40} priority />
              <span className="ml-2 text-lg font-bold text-[#5aba47]">
                AI Corporate Training Platform
              </span>
            </a>
          </div>
        </header>

        {/* Page Content with padding to prevent overlap */}
        <main className="container mx-auto px-4">{children}</main>
      </body>
    </html>
  );
}
