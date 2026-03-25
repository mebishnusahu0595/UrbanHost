"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Clock } from "lucide-react";

export default function ExperiencesPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Unique Experiences</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover authentic local experiences, guided tours, and unforgettable adventures across India
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon!</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        We're working on bringing you amazing local experiences. Check back soon for guided tours, cultural activities, and adventure experiences.
                    </p>
                    <Link href="/">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                            Browse Hotels Instead
                        </Button>
                    </Link>
                </div>

                {/* Preview Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "Cultural Tours",
                            description: "Explore historical sites and local culture",
                            image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=400",
                        },
                        {
                            title: "Adventure Activities",
                            description: "Trekking, rafting, and outdoor adventures",
                            image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=400",
                        },
                        {
                            title: "Food & Cooking",
                            description: "Taste authentic local cuisine",
                            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400",
                        },
                    ].map((experience, idx) => (
                        <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 opacity-60">
                            <div className="relative h-48">
                                <Image
                                    src={experience.image}
                                    alt={experience.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-1">{experience.title}</h3>
                                <p className="text-sm text-gray-600">{experience.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
