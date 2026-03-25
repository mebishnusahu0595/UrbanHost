"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { useState } from "react";

interface HotelCardProps {
    id: string;
    name: string;
    location: string;
    rating: number;
    pricePerNight: number;
    currency?: string;
    image: string;
    featured?: boolean;
    labels?: string[];
}

export function HotelCard({
    id,
    name,
    location,
    rating,
    pricePerNight,
    currency = "₹",
    image,
    featured,
    labels = [],
}: HotelCardProps) {

    const [imageError, setImageError] = useState(false);

    return (
        <Link href={`/hotels/${id}`}>
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    {!imageError ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A]/20 to-[#38BDF8]/20 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                        </div>
                    )}



                    {/* Featured Badge */}
                    {featured && (
                        <div className="absolute top-3 left-3 bg-[#1E3A8A] text-white text-xs font-medium px-3 py-1 rounded-full z-10">
                            Featured
                        </div>
                    )}

                    {/* Urban Host Property Badge */}
                    {labels && labels.includes("Urban Host Property") && (
                        <div className={`absolute top-3 ${featured ? 'left-24' : 'left-3'} bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full z-10 shadow-sm`}>
                            Urban Host Property
                        </div>
                    )}

                    {/* Other Labels (Show if not Urban Host) */}
                    {labels && labels.length > 0 && !labels.includes("Urban Host Property") && !featured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full z-10">
                            {labels[0]}
                        </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate group-hover:text-[#F87171] transition-colors">
                        {name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm truncate">{location}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-[#F87171]">
                            {currency}{pricePerNight}
                        </span>
                        <span className="text-sm text-gray-500">/night</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
