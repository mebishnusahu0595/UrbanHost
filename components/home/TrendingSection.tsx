"use client";

import { useState } from "react";
import { useTrendingHotels } from "@/lib/hooks/useHotels";
import Link from "next/link";
import { HotelCard } from "@/components/hotel/HotelCard";
import {
    ChevronRight,
    Loader2,
    Home,
    Building2,
    Palmtree,
    Grid,
    CheckCircle2,
    Coffee,
    Castle,
    Mountain,
    Crown,
} from "lucide-react";

export function TrendingSection() {
    const { data: trendingHotels = [], isLoading } = useTrendingHotels();
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = [
        { id: "All", label: "All Stays", icon: Grid },
        { id: "Bed and Breakfast", label: "Bed & Breakfast", icon: Coffee },
        { id: "Boutique Inn", label: "Boutique Inns", icon: Building2 },
        { id: "Historic Manor", label: "Historic Manors", icon: Castle },
        { id: "Mountain Lodge", label: "Mountain Lodges", icon: Mountain },
        { id: "Heritage Cottage", label: "Heritage Cottages", icon: Home },
        { id: "Luxury Villa", label: "Luxury Villas", icon: Crown },
        { id: "Boutique Resort", label: "Boutique Resorts", icon: Palmtree },
    ];

    const filteredHotels = activeCategory === "All"
        ? trendingHotels
        : trendingHotels.filter(hotel => {
            const cat = (hotel.category || "").toLowerCase();
            const name = (hotel.name || "").toLowerCase();
            const target = activeCategory.toLowerCase();

            if (target === "bed and breakfast") {
                return cat.includes("bed") || cat.includes("breakfast") || name.includes("b&b") || name.includes("bed");
            }
            if (target === "boutique inn") {
                return cat.includes("inn") || cat.includes("boutique") || name.includes("inn");
            }
            if (target === "historic manor") {
                return cat.includes("manor") || cat.includes("historic") || cat.includes("house") || name.includes("manor") || name.includes("house");
            }
            if (target === "mountain lodge") {
                return cat.includes("lodge") || cat.includes("mountain") || name.includes("lodge");
            }
            if (target === "heritage cottage") {
                return cat.includes("cottage") || cat.includes("heritage") || name.includes("cottage");
            }
            if (target === "luxury villa") {
                return cat.includes("villa") || cat.includes("luxury") || name.includes("villa");
            }
            if (target === "boutique resort") {
                return cat.includes("resort") || cat.includes("gasthaus") || name.includes("resort");
            }

            return cat.includes(target) || name.includes(target);
        });

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
        <section className="py-16 bg-white w-full">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 w-full">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            Trending Stays Nearby
                        </h2>
                        <p className="text-gray-500 text-sm sm:text-base">Highly-rated properties based on your location</p>
                    </div>
                    <Link
                        href="/search?sort=trending"
                        className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold transition-colors"
                    >
                        View all
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Category Filters - Responsive Horizontal Scroll */}
                <div className="flex gap-3 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 no-scrollbar snap-x">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all whitespace-nowrap snap-start cursor-pointer ${activeCategory === cat.id
                                ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md transform scale-105"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                                }`}
                        >
                            <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? "text-white" : "text-gray-500"}`} />
                            <span className="font-bold text-sm">{cat.label}</span>
                            {activeCategory === cat.id && <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
                        </button>
                    ))}
                </div>

                {/* Hotel Cards Grid */}
                {filteredHotels.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 w-full">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 animate-in fade-in zoom-in duration-500 w-full">
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
