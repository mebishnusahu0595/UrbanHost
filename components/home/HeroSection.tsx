"use client";

import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative min-h-[620px] flex items-center justify-center pt-24 pb-20">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <Image
                    src="/hero.webp"
                    alt="StayNTour - Authentic Stays"
                    fill
                    priority
                    sizes="100vw"
                    quality={85}
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-20 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                    Find your next stay
                    <br />
                    <span className="italic font-light">effortlessly</span>
                </h1>
                <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                    Discover and book the best hotels at the best prices nearby.
                </p>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-8 relative z-30">
                    <SearchBar />
                </div>

                {/* List Your Property CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                    <Link href="/partner">
                        <Button
                            size="lg"
                            className="bg-white text-[#1E3A8A] hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                        >
                            <Building2 className="w-6 h-6" />
                            List Your Property
                        </Button>
                    </Link>
                    <p className="text-white/90 text-sm">
                        Earn extra income by listing your property
                    </p>
                </div>
            </div>

            {/* Decorative Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
        </section>
    );
}
