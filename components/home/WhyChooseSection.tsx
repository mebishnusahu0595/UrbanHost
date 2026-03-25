"use client";

import { Shield, CheckCircle, HeadphonesIcon } from "lucide-react";

const features = [
    {
        icon: Shield,
        title: "Best Price Guarantee",
        description: "We match prices if you find a cheaper deal elsewhere for the same property and dates.",
    },
    {
        icon: CheckCircle,
        title: "Verified Stays",
        description: "Every property is verified for quality and safety to ensure you have a worry-free stay.",
    },
    {
        icon: HeadphonesIcon,
        title: "24/7 Support",
        description: "Our support team is always available to help you with your booking, day or night.",
    },
];

export function WhyChooseSection() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                        Why Choose Urban Host
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        We make travel simple, secure, and memorable.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="text-center group"
                        >
                            {/* Icon */}
                            <div className="w-16 h-16 mx-auto mb-5 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <feature.icon className="w-8 h-8 text-blue-500" />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
