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
  metadataBase: new URL("https://stayntour.com"),
  title: {
    default: "StayNTour - Best Bed & Breakfasts, Historic Inns & Boutique Stays in the USA",
    template: "%s | StayNTour",
  },
  description: "Discover and book handpicked bed & breakfasts, historic manors, mountain lodges, boutique inns, and luxury vacation rentals across all 50 US states with guaranteed best rates.",
  keywords: [
    "bed and breakfast USA",
    "boutique inns",
    "historic manors",
    "mountain lodges",
    "heritage cottages",
    "luxury villas",
    "boutique resorts",
    "stayntour",
    "vacation rentals USA",
    "romantic getaways",
    "authentic american bnbs",
    "book bed and breakfast",
  ],
  authors: [{ name: "StayNTour Team", url: "https://stayntour.com" }],
  creator: "StayNTour Inc.",
  publisher: "StayNTour Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stayntour.com",
    siteName: "StayNTour",
    title: "StayNTour - Best Bed & Breakfasts, Historic Inns & Boutique Stays in the USA",
    description: "Discover and book handpicked bed & breakfasts, historic manors, and mountain lodges across all 50 US states. Guaranteed best rates and verified hosts.",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "StayNTour - America's Authentic Bed & Breakfasts and Boutique Stays",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StayNTour - Best Bed & Breakfasts & Boutique Stays in the USA",
    description: "Discover and book handpicked bed & breakfasts, historic manors, and mountain lodges across all 50 US states.",
    images: ["/hero.png"],
    creator: "@stayntour",
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

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://stayntour.com/#organization",
      "name": "StayNTour",
      "url": "https://stayntour.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://stayntour.com/#logo",
        "url": "https://stayntour.com/logo_name.png",
        "contentUrl": "https://stayntour.com/logo_name.png",
        "caption": "StayNTour Logo"
      },
      "description": "America's premier network for verified Bed & Breakfasts, Boutique Inns, Historic Manors, and Mountain Lodges across all 50 US states.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-800-STAY-TOUR",
        "contactType": "customer service",
        "areaServed": "US",
        "availableLanguage": ["English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://stayntour.com/#website",
      "url": "https://stayntour.com",
      "name": "StayNTour",
      "description": "Find your next stay effortlessly. Book verified Bed and Breakfasts & boutique vacation stays in the USA.",
      "publisher": {
        "@id": "https://stayntour.com/#organization"
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://stayntour.com/search?query={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ]
    }
  ]
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
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
