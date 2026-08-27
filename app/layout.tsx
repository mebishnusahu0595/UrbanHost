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
  title: "StayNTour - Find Your Next Stay Effortlessly",
  description: "Discover and book the best hotels at the best prices. StayNTour connects you with verified stays and experiences around the world.",
  keywords: ["hotels", "booking", "travel", "stays", "vacation", "accommodation", "stayntour"],
  openGraph: {
    title: "StayNTour - Find Your Next Stay Effortlessly",
    description: "Discover and book the best hotels at the best prices.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

import ChunkErrorListener from "@/components/ChunkErrorListener";
import ScrollToTop from "@/components/ScrollToTop";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LocationTracker } from "@/components/common/LocationTracker";
import { RouteTransitionLoader } from "@/components/common/RouteTransitionLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <SmoothScrollProvider>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            <LocationTracker />
            <RouteTransitionLoader />
            <ChunkErrorListener />
            {children}
          </SmoothScrollProvider>
        </Providers>
      </body>
    </html>
  );
}
