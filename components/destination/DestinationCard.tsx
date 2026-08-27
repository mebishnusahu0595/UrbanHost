"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MapPin, ArrowRight, Sparkles } from "lucide-react";

export interface DestinationItem {
    name: string;
    state: string;
    tagline: string;
    propertyCount: number;
    price: string;
    image: string;
}

interface DestinationCardProps {
    destination: DestinationItem;
}

export function DestinationCard({ destination }: DestinationCardProps) {
    const [imageError, setImageError] = useState(false);
    const { name, state, tagline, propertyCount, price, image } = destination;

    return (
        <Link 
            href={`/search?location=${encodeURIComponent(name)}`}
            className="group relative block w-[280px] sm:w-[320px] h-[400px] sm:h-[430px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-blue-950/25 transition-all duration-500 flex-shrink-0 cursor-pointer select-none bg-gray-900"
        >
            {/* Background Image with Zoom on Hover */}
            {!imageError ? (
                <Image
                    src={image}
                    alt={`${name}, ${state}`}
                    fill
                    sizes="(max-width: 640px) 280px, 320px"
                    unoptimized={image.startsWith("http")}
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={() => setImageError(true)}
                    priority={false}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] via-[#1e40af] to-[#38BDF8]" />
            )}

            {/* Gradient Overlays for High Contrast & Smooth Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/95 group-hover:via-black/50 transition-colors duration-500" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{state}</span>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-400/30 text-white text-xs font-bold shadow-sm">
                    {price}
                </div>
            </div>

            {/* Bottom Details Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end">
                {/* City Name */}
                <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md group-hover:text-[#38BDF8] transition-colors duration-300">
                    {name}
                </h3>

                {/* Stays Count Badge */}
                <p className="text-xs font-semibold text-gray-200 mt-1 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {propertyCount.toLocaleString()}+ Verified Stays
                </p>

                {/* Tagline - Expands on hover */}
                <p className="text-xs text-gray-300 font-medium mt-2 line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {tagline}
                </p>

                {/* Hover Action Button */}
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-white text-sm font-bold transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[#38BDF8] flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Explore Hotels
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Subtle Border Glow on Hover */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/30 transition-colors pointer-events-none" />
        </Link>
    );
}
