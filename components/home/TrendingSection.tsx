"use client";

import { useState } from "react";
import { useTrendingHotels } from "@/lib/hooks/useHotels";
import Link from "next/link";
import { HotelCard } from "@/components/hotel/HotelCard";
import { ChevronRight, Loader2, Home, Building2, Palmtree, Warehouse, Tent, Grid, CheckCircle2 } from "lucide-react";

export function TrendingSection() {
    const { data: trendingHotels = [], isLoading } = useTrendingHotels();
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = [
        { id: "All", label: "All Stays", icon: Grid },
        { id: "Hotel", label: "Hotels", icon: Building2 },
        { id: "Villa", label: "Villas", icon: Home },
        { id: "Resort", label: "Resorts", icon: Palmtree },
        { id: "Apartment", label: "Apartments", icon: Warehouse },
        { id: "Homestay", label: "Homestays", icon: Tent },
    ];

    const filteredHotels = activeCategory === "All"
        ? trendingHotels
        : trendingHotels.filter(hotel =>
            // Flexible matching for property types
            (hotel.category || "").toLowerCase().includes(activeCategory.toLowerCase()) ||
            hotel.name.toLowerCase().includes(activeCategory.toLowerCase())
        );

    if (isLoading) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Trending Stays Nearby
                        </h2>
                        <p className="text-gray-500">Highly-rated properties based on your location</p>
                    </div>
                    <Link
                        href="/search?sort=trending"
                        className="hidden sm:flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium transition-colors"
                    >
                        View all
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Category Filters - Responsive Horizontal Scroll */}
                <div className="flex gap-3 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 mb-4 no-scrollbar snap-x">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all whitespace-nowrap snap-start ${activeCategory === cat.id
                                ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md transform scale-105"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                                }`}
                        >
                            <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? "text-white" : "text-gray-500"}`} />
                            <span className="font-bold text-sm">{cat.label}</span>
                            {activeCategory === cat.id && <CheckCircle2 className="w-3 h-3 ml-1" />}
                        </button>
                    ))}
                </div>

                {/* Hotel Cards Grid */}
                {filteredHotels.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Home className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No {activeCategory.toLowerCase()}s found</h3>
                        <p className="text-gray-500 text-sm">Try selecting a different category or view all stays.</p>
                        <button
                            onClick={() => setActiveCategory("All")}
                            className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-500">
                        {filteredHotels.map((hotel) => (
                            <HotelCard
                                key={hotel._id}
                                id={hotel._id}
                                name={hotel.name}
                                location={`${hotel.address?.city || ""}, ${hotel.address?.state || ""}`}
                                rating={hotel.rating}
                                pricePerNight={hotel.rooms?.[0]?.price || 0}
                                image={hotel.images?.[0] || "/placeholder-hotel.jpg"}
                                featured={hotel.featured}
                                labels={hotel.labels}
                            />
                        ))}
                    </div>
                )}

                {/* Mobile View All Link */}
                <div className="mt-6 text-center sm:hidden">
                    <Link
                        href="/search?sort=trending"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium"
                    >
                        View all properties
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
