"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, CreditCard, BarChart3, HeadphonesIcon, Shield } from "lucide-react";

export default function BusinessPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <Building2 className="w-4 h-4" />
                        Urban Host for Business
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Corporate Travel Solutions
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Streamline your business travel with exclusive rates, dedicated support, and flexible booking options
                    </p>
                </div>

                {/* Main CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 md:p-12 text-center mb-12 text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Coming Soon!</h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        We're building a comprehensive business travel platform. Register your interest to get early access and exclusive offers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/list-property">
                            <Button className="bg-white text-blue-600 hover:bg-gray-100 rounded-full px-8">
                                List Your Property
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button className="bg-white text-blue-600 hover:bg-gray-100 rounded-full px-8 border-2 border-white">
                                Browse Hotels
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {[
                        {
                            icon: CreditCard,
                            title: "Corporate Billing",
                            description: "Centralized invoicing and payment options for your organization",
                        },
                        {
                            icon: BarChart3,
                            title: "Travel Analytics",
                            description: "Detailed reports and insights on your company's travel spending",
                        },
                        {
                            icon: Users,
                            title: "Team Management",
                            description: "Manage travel policies and approvals for your entire team",
                        },
                        {
                            icon: Shield,
                            title: "Duty of Care",
                            description: "24/7 support and traveler tracking for employee safety",
                        },
                        {
                            icon: HeadphonesIcon,
                            title: "Dedicated Support",
                            description: "Priority customer service with a dedicated account manager",
                        },
                        {
                            icon: Building2,
                            title: "Exclusive Rates",
                            description: "Negotiated corporate rates with top hotels across India",
                        },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Interested in Urban Host for Business?</h3>
                    <p className="text-gray-600 mb-6">
                        Contact our corporate sales team to learn more about our business solutions
                    </p>
                    <a href="mailto:business@urbanhost.in" className="inline-block">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                            Contact Sales Team
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
