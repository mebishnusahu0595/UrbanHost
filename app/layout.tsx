import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Urban Host - Find Your Next Stay Effortlessly",
  description: "Discover and book the best hotels at the best prices. Urban Host connects you with verified stays and experiences around the world.",
  keywords: ["hotels", "booking", "travel", "stays", "vacation", "accommodation"],
  openGraph: {
    title: "Urban Host - Find Your Next Stay Effortlessly",
    description: "Discover and book the best hotels at the best prices.",
    type: "website",
  },
};

import ChunkErrorListener from "@/components/ChunkErrorListener";
import ScrollToTop from "@/components/ScrollToTop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          <ChunkErrorListener />
          {children}
        </Providers>
      </body>
    </html>
  );
}
