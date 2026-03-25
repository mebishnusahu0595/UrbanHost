"use client";

import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                    Find your next stay
                    <br />
                    <span className="italic font-light">effortlessly</span>
                </h1>
                <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                    Discover and book the best hotels at the best prices nearby.
                </p>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-8">
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

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>
    );
}
