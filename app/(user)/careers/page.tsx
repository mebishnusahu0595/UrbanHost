"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Briefcase,
    Globe,
    HeartPulse,
    GraduationCap,
    Users,
    Search,
    MapPin,
    Clock,
    ChevronRight,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mx-4 my-4 rounded-[2rem]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop"
                        alt="Join Our Journey"
                        fill
                        className="object-cover brightness-[0.4]"
                        priority
                    />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            Join Our Journey
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                            Redefining hospitality through technology and heart. Discover a career where your work travels further.
                        </p>
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-10 py-7 text-lg font-bold shadow-xl shadow-blue-500/20">
                            View Openings
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* WHY WORK WITH US */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why Work With Us</h2>
                    <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                        We support our team with more than just a paycheck. Our benefits are designed to help you thrive personally and professionally.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: Globe,
                            title: "Remote Work",
                            desc: "Work from anywhere in the world with our distributed team.",
                            color: "bg-blue-50 text-blue-600"
                        },
                        {
                            icon: HeartPulse,
                            title: "Health Care",
                            desc: "Comprehensive medical, dental, and vision plans for you and yours.",
                            color: "bg-pink-50 text-pink-600"
                        },
                        {
                            icon: GraduationCap,
                            title: "Learning Stipends",
                            desc: "Annual budget for courses, books, and conferences to fuel growth.",
                            color: "bg-indigo-50 text-indigo-600"
                        },
                        {
                            icon: Users,
                            title: "Team Retreats",
                            desc: "Join us in iconic cities twice a year for team building and fun.",
                            color: "bg-cyan-50 text-cyan-600"
                        }
                    ].map((benefit, i) => (
                        <Card key={i} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-8">
                                <div className={`w-12 h-12 ${benefit.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">{benefit.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* OPEN POSITIONS */}
            <section className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Open Positions</h2>
                            <p className="text-gray-500 font-medium">Help us build the future of urban hospitality.</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search for roles (e.g. Developer)" className="pl-12 h-14 rounded-2xl border-gray-200 bg-white" />
                        </div>
                    </div>

                    <div className="space-y-12">
                        {[
                            {
                                category: "Engineering",
                                icon: <div className="text-blue-600">&lt;/&gt;</div>,
                                roles: [
                                    { title: "Senior Full Stack Developer", location: "Remote", type: "Full-time" },
                                    { title: "Frontend Engineer (React)", location: "New York, NY", type: "Full-time" }
                                ]
                            },
                            {
                                category: "Marketing",
                                icon: <Briefcase className="w-4 h-4 text-orange-500" />,
                                roles: [
                                    { title: "Growth Marketing Manager", location: "London, UK", type: "Full-time" }
                                ]
                            },
                            {
                                category: "Customer Success",
                                icon: <Users className="w-4 h-4 text-purple-500" />,
                                roles: [
                                    { title: "Support Lead", location: "Remote", type: "Full-time" }
                                ]
                            }
                        ].map((group, i) => (
                            <div key={i} className="space-y-6">
                                <div className="flex items-center gap-3 text-sm font-black text-gray-900 uppercase tracking-widest">
                                    {group.icon}
                                    {group.category}
                                </div>
                                <div className="space-y-4">
                                    {group.roles.map((role, ri) => (
                                        <div key={ri} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-200 transition-colors shadow-sm">
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 mb-2">{role.title}</h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {role.location}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {role.type}</span>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="text-blue-600 bg-blue-50 border-transparent hover:bg-blue-100 font-bold rounded-xl px-6">
                                                View Details
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LIFE AT URBAN HOST */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-[#EBF3FF] border-none rounded-[3rem] overflow-hidden p-8 md:p-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Life at Urban Host</h2>
                            <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                We're a group of travelers, technologists, and dreamers. Beyond the code and the metrics, we're building a community that values curiosity and kindness.
                            </p>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 font-bold gap-2">
                                Read Our Story <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex gap-4">
                            <div className="relative h-64 w-1/2 rounded-3xl overflow-hidden shadow-xl">
                                <Image src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop" alt="Team meeting" fill className="object-cover" />
                            </div>
                            <div className="relative h-64 w-1/2 rounded-3xl overflow-hidden shadow-xl mt-12">
                                <Image src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=600&auto=format&fit=crop" alt="Office life" fill className="object-cover" />
                            </div>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
}
