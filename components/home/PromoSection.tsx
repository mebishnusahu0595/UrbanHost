"use client";

import { motion } from "framer-motion";
import { Palmtree, Mountain, Building2, Landmark } from "lucide-react";

const vibes = [
    {
        id: 1,
        title: "Relaxation",
        description: "Unwind in serene landscapes",
        icon: Palmtree,
        color: "bg-teal-50 text-teal-600",
        delay: 0.1
    },
    {
        id: 2,
        title: "Adventure",
        description: "Thrill-seeking journeys",
        icon: Mountain,
        color: "bg-orange-50 text-orange-600",
        delay: 0.2
    },
    {
        id: 3,
        title: "Urban Life",
        description: "Experience city energy",
        icon: Building2,
        color: "bg-blue-50 text-blue-600",
        delay: 0.3
    },
    {
        id: 4,
        title: "Culture",
        description: "Rich heritage & history",
        icon: Landmark,
        color: "bg-purple-50 text-purple-600",
        delay: 0.4
    }
];

export function PromoSection() {
    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                    >
                        Find Your Vibe
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-gray-500"
                    >
                        Discover destinations that match your style
                    </motion.p>
                </div>

                <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:pb-0 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {vibes.map((vibe) => (
                        <motion.div
                            key={vibe.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: vibe.delay }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="min-w-[260px] sm:min-w-0 flex-shrink-0 snap-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${vibe.color}`}>
                                <vibe.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {vibe.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {vibe.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
