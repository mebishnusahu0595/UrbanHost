"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Heart,
    Lightbulb,
    ShieldCheck,
    Globe,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
    const coreValuesRef = useRef<HTMLDivElement>(null);
    const teamRef = useRef<HTMLDivElement>(null);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
        if (ref.current) {
            const scrollAmount = direction === "left" ? -300 : 300;
            ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop"
                        alt="Urban Skyline"
                        fill
                        className="object-cover brightness-[0.4]"
                        priority
                    />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
                            Redefining urban stays <br />
                            through <span className="text-blue-400">local heart</span> and <br />
                            global standards.
                        </h1>
                        <p className="text-base md:text-xl text-gray-200 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                            Urban Host is your premium companion for discovering authenticity living.
                            We bridge the gap between luxury and local immersion.
                        </p>
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 md:px-10 py-5 md:py-7 text-base md:text-lg font-bold shadow-xl shadow-blue-500/20">
                            Explore Our Vision
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* OUR LEGACY SECTION */}
            <section className="py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] md:text-sm mb-2 md:mb-4">OUR LEGACY</p>
                        <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
                            Born from a passion for <br className="hidden md:block" /> authentic travel.
                        </h2>
                        <div className="space-y-4 md:space-y-6 text-gray-600 text-base md:text-lg leading-relaxed">
                            <p>
                                Starting in 2018, we set out to bridge the gap between cold, impersonal hotel rooms and the unpredictable quality of short-term rentals. What began with a single boutique apartment in London has grown into a global network of curated homes.
                            </p>
                            <p>
                                We believe that where you stay shouldn't just be a bed—it should be your gateway to the soul of a city. Our technology ensures a seamless experience, while our local hosts ensure you feel like you belong.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop"
                                alt="Modern Interior"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-8 rounded-2xl shadow-xl">
                            <p className="text-4xl font-bold leading-tight">10+</p>
                            <p className="text-xs font-black tracking-widest uppercase">Years of excellence</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CORE VALUES */}
            <section className="py-12 md:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4 text-center md:text-left">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Our Core Values</h2>
                            <p className="text-gray-500 text-base md:text-lg">The principles that guide every decision we take and every guest interaction we facilitate.</p>
                        </div>
                        <div className="flex gap-4 justify-center md:justify-end">
                            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-gray-200" onClick={() => scroll(coreValuesRef, "left")}><ArrowRight className="w-5 h-5 rotate-180" /></Button>
                            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-gray-200 text-blue-600 border-blue-100" onClick={() => scroll(coreValuesRef, "right")}><ArrowRight className="w-5 h-5" /></Button>
                        </div>
                    </div>

                    <div
                        ref={coreValuesRef}
                        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:gap-8 pb-4"
                    >
                        {[
                            {
                                icon: Heart,
                                title: "Hospitality",
                                desc: "Put people first in every interaction. We treat every guest like they are visiting our own family."
                            },
                            {
                                icon: Lightbulb,
                                title: "Innovation",
                                desc: "Developing proprietary technology that simplifies the complexity of international travel and local hosting."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Trust",
                                desc: "Transparent pricing and verified stays. We adhere to symmetry in ensuring robust safety and quality standards."
                            }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="flex-shrink-0 w-[85%] md:w-full snap-center"
                            >
                                <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 p-8 h-full bg-white group">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <value.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{value.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TEAM SECTION */}
            <section className="py-12 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4 text-center md:text-left">
                        <div>
                            <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">The Minds Behind Urban Host</h2>
                            <p className="text-gray-500 max-w-xl text-base md:text-lg">A diverse group of travel enthusiasts, engineers, and designers.</p>
                        </div>
                        <div className="flex gap-4 justify-center md:justify-end">
                            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-gray-200" onClick={() => scroll(teamRef, "left")}><ArrowRight className="w-5 h-5 rotate-180" /></Button>
                            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-gray-200 text-blue-600 border-blue-100" onClick={() => scroll(teamRef, "right")}><ArrowRight className="w-5 h-5" /></Button>
                        </div>
                    </div>

                    <div
                        ref={teamRef}
                        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory lg:grid lg:grid-cols-4 gap-6 md:gap-8 pb-4"
                    >
                        {[
                            { name: "Marcus Chen", role: "Founder & CEO", img: "https://i.pravatar.cc/300?u=marcus" },
                            { name: "Sarah Jenkins", role: "Chief Product Officer", img: "https://i.pravatar.cc/300?u=sarah" },
                            { name: "David Miller", role: "Head of Global Ops", img: "https://i.pravatar.cc/300?u=david" },
                            { name: "Elena Rodriguez", role: "Design Lead", img: "https://i.pravatar.cc/300?u=elena" }
                        ].map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="group cursor-pointer flex-shrink-0 w-[75%] sm:w-[45%] lg:w-full snap-center"
                            >
                                <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden mb-4 md:mb-6 bg-gray-100">
                                    <Image
                                        src={member.img}
                                        alt={member.name}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <h3 className="text-xl font-bold">{member.name}</h3>
                                <p className="text-blue-600 font-medium text-sm">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GLOBAL FOOTPRINT */}
            <section className="py-12 md:py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Globe className="w-full h-full text-blue-500" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-4">Global Footprint</h2>
                        <div className="h-0.5 md:h-1 w-16 md:w-24 bg-blue-600 mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
                        <div>
                            <p className="text-3xl md:text-5xl font-bold text-blue-400 mb-1 md:mb-2">50+</p>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-sm">Cities Covered</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-5xl font-bold text-blue-400 mb-1 md:mb-2">120k+</p>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-sm">Happy Guests</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-5xl font-bold text-blue-400 mb-1 md:mb-2">500+</p>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-sm">Property Listings</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-5xl font-bold text-blue-400 mb-1 md:mb-2">4.8/5</p>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-sm">Average Rating</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto bg-blue-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/30"
                >
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
                    <h2 className="text-2xl md:text-5xl font-bold mb-6 md:mb-8 relative z-10 leading-tight">
                        Ready to experience the heart of the city?
                    </h2>
                    <p className="text-base md:text-xl text-blue-50 mb-8 md:mb-12 max-w-2xl mx-auto relative z-10 font-medium">
                        Join thousands of travelers who have found their second home with Urban Host.
                        Explore our boutique hotels and apartments today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 relative z-10">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100 rounded-full px-8 md:px-12 py-5 md:py-7 font-black text-base md:text-lg transition-transform hover:scale-105">
                                Browse Stays
                            </Button>
                        </Link>
                        <Link href="/list-property" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 rounded-full px-8 md:px-12 py-5 md:py-7 font-black text-base md:text-lg transition-transform hover:scale-105 border-none shadow-xl shadow-blue-900/20">
                                Partner with us
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
