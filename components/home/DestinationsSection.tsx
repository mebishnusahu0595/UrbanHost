"use client";

import { useRef } from "react";
import { DestinationCard, DestinationItem } from "@/components/destination/DestinationCard";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";

const destinations: DestinationItem[] = [
    {
        name: "New York",
        state: "New York",
        tagline: "Times Square, Broadway lights, Central Park & iconic skyline views.",
        propertyCount: 1450,
        price: "From $120/nt",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format",
    },
    {
        name: "Miami",
        state: "Florida",
        tagline: "Vibrant South Beach sands, Art Deco luxury & tropical oceanfronts.",
        propertyCount: 890,
        price: "From $95/nt",
        image: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=800&auto=format",
    },
    {
        name: "Los Angeles",
        state: "California",
        tagline: "Hollywood glamour, sunset palm drives & breezy Santa Monica vibes.",
        propertyCount: 1120,
        price: "From $110/nt",
        image: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=800&auto=format",
    },
    {
        name: "Las Vegas",
        state: "Nevada",
        tagline: "Glittering Strip casino resorts, world-class nightlife & spectacular shows.",
        propertyCount: 760,
        price: "From $75/nt",
        image: "https://images.unsplash.com/photo-1605833559746-6d2673002017?q=80&w=800&auto=format",
    },
    {
        name: "San Francisco",
        state: "California",
        tagline: "Golden Gate views, scenic bay cruises & historic rolling hills.",
        propertyCount: 640,
        price: "From $105/nt",
        image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format",
    },
    {
        name: "Chicago",
        state: "Illinois",
        tagline: "Architectural riverfront tours, Magnificent Mile & Millennium Park.",
        propertyCount: 820,
        price: "From $85/nt",
        image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?q=80&w=800&auto=format",
    },
    {
        name: "Orlando",
        state: "Florida",
        tagline: "World-famous theme park adventures & sun-soaked resort retreats.",
        propertyCount: 980,
        price: "From $69/nt",
        image: "https://images.unsplash.com/photo-1575089776834-8be34696ffb9?q=80&w=800&auto=format",
    },
    {
        name: "Honolulu",
        state: "Hawaii",
        tagline: "Waikiki turquoise waters, Diamond Head crater & island paradise.",
        propertyCount: 530,
        price: "From $140/nt",
        image: "https://images.unsplash.com/photo-1542259009477-d625272157b7?q=80&w=800&auto=format",
    },
    {
        name: "Seattle",
        state: "Washington",
        tagline: "Pacific waterfront, Pike Place Market & majestic Space Needle.",
        propertyCount: 590,
        price: "From $99/nt",
        image: "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?q=80&w=800&auto=format",
    },
    {
        name: "Austin",
        state: "Texas",
        tagline: "Live music capital, Colorado River lakes & premier culinary culture.",
        propertyCount: 710,
        price: "From $80/nt",
        image: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?q=80&w=800&auto=format",
    },
];

export function DestinationsSection() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 340;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="py-20 bg-gray-50/80 overflow-hidden relative w-full">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 w-full mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    {/* Section Title */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider mb-3">
                            <Compass className="w-3.5 h-3.5 text-blue-600" />
                            <span>Top USA Getaways</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                            Explore Popular USA Destinations
                        </h2>
                        <p className="text-gray-500 mt-2 text-base max-w-2xl">
                            Discover curated hotels, luxury suites and premier stays across America’s most popular cities.
                        </p>
                    </div>

                    {/* Desktop Navigation Arrows */}
                    <div className="hidden sm:flex items-center gap-3">
                        <button
                            onClick={() => handleScroll("left")}
                            className="w-11 h-11 rounded-full border border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-300 text-gray-700 flex items-center justify-center shadow-sm cursor-pointer transition-all active:scale-95"
                            aria-label="Previous destination"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleScroll("right")}
                            className="w-11 h-11 rounded-full border border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-300 text-gray-700 flex items-center justify-center shadow-sm cursor-pointer transition-all active:scale-95"
                            aria-label="Next destination"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Infinite Marquee Track Container */}
            <div className="relative w-full overflow-hidden">
                {/* Left & Right Soft Fade Gradients for visual polish */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-gray-50/90 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-gray-50/90 to-transparent z-10" />

                <div 
                    ref={scrollContainerRef}
                    className="overflow-x-auto no-scrollbar scroll-smooth"
                >
                    {/* Infinite Marquee Strip: Duplicated 2x for seamless continuous infinite loop */}
                    <div className="animate-infinite-marquee flex gap-6 px-4 sm:px-8 py-4">
                        {[...destinations, ...destinations].map((destination, index) => (
                            <DestinationCard
                                key={`${destination.name}-${index}`}
                                destination={destination}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
