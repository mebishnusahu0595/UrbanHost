"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DestinationCardProps {
    name: string;
    propertyCount: number;
    image: string;
    size?: "small" | "large";
}

export function DestinationCard({
    name,
    propertyCount,
    image,
    size = "small",
}: DestinationCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <Link href={`/search?location=${encodeURIComponent(name)}`}>
            <div
                className={`group relative overflow-hidden rounded-2xl cursor-pointer ${size === "large" ? "aspect-[4/5]" : "aspect-square"
                    }`}
            >
                {/* Background Image */}
                {!imageError ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#38BDF8]" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                    <p className="text-sm text-white/80">{propertyCount.toLocaleString()} Properties</p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-2xl transition-colors" />
            </div>
        </Link>
    );
}
