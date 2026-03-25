"use client";

import { DestinationCard } from "@/components/destination/DestinationCard";

const destinations = [
    {
        name: "Bhilai",
        propertyCount: 124,
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format",
    },
    {
        name: "Indore",
        propertyCount: 456,
        image: "/indore.png",
    },
    {
        name: "Raipur",
        propertyCount: 876,
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format",
    },
    {
        name: "Goa",
        propertyCount: 1542,
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format",
    },
];

export function DestinationsSection() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Explore Popular Destinations
                    </h2>
                    <p className="text-gray-500">Discover new places and experiences near you</p>
                </div>

                {/* Destinations Grid - Consistent Style */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {/* Bhilai */}
                    <div className="row-span-2 col-span-1">
                        <DestinationCard
                            name={destinations[0].name}
                            propertyCount={destinations[0].propertyCount}
                            image={destinations[0].image}
                            size="large"
                        />
                    </div>

                    {/* Indore */}
                    <div className="row-span-2 col-span-1">
                        <DestinationCard
                            name={destinations[1].name}
                            propertyCount={destinations[1].propertyCount}
                            image={destinations[1].image}
                            size="large"
                        />
                    </div>

                    {/* Raipur */}
                    <div className="row-span-2 col-span-1">
                        <DestinationCard
                            name={destinations[2].name}
                            propertyCount={destinations[2].propertyCount}
                            image={destinations[2].image}
                            size="large"
                        />
                    </div>

                    {/* Goa */}
                    <div className="row-span-2 col-span-1">
                        <DestinationCard
                            name={destinations[3].name}
                            propertyCount={destinations[3].propertyCount}
                            image={destinations[3].image}
                            size="large"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
