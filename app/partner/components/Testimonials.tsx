"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export function Testimonials() {
    const testimonials = [
        {
            name: "Sudhir Kumar",
            role: "General Manager, Lemon Tree Hotel",
            text: "UrbanHost has been a game changer for us. We've seen a significant increase in our occupancy rates during off-peak hours thanks to their unique hourly booking model. The dashboard is intuitive and the support team is excellent.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Anjali Mehta",
            role: "General Manager, The Park Hotel",
            text: "UrbanHost's platform is incredibly user-friendly. We've optimized our room inventory like never before and seen a steady growth in revenue.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Rahul Verma",
            role: "Operations Head, Sarovar Hotels",
            text: "Seamless integration and great support. The flexibility of hourly bookings has opened up a new revenue stream for us.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Priya Singh",
            role: "Manager, Treebo Trend",
            text: "Revenue has jumped 20% since we listed. The hourly slots are a hit with business travelers looking for short stays.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Amit Kapoor",
            role: "Owner, Kapoor Residency",
            text: "Finally, a platform that understands the budget hotel business. UrbanHost has helped us maximize our occupancy.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Sneha Reddy",
            role: "General Manager, Radisson Blu",
            text: "Excellent dashboard analytics helped us make better pricing decisions. Highly recommended for any hotelier.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
        }
    ];

    const testimonialRef = useRef<HTMLDivElement>(null);

    const scrollTestimonials = (direction: 'left' | 'right') => {
        if (testimonialRef.current) {
            const { current } = testimonialRef;
            const scrollAmount = current.clientWidth; // Scroll by one full width of the container

            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-24 bg-gray-50/50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl text-left">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            Our Partners Love Working With Us
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-gray-600 text-lg"
                        >
                            Hear from trusted hotel managers and owners who have transformed their business with UrbanHost.
                        </motion.p>
                    </div>
                    <div className="flex gap-3 relative z-10">
                        <button
                            onClick={() => scrollTestimonials('left')}
                            className="bg-white shadow-md border border-gray-100 p-3 rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            aria-label="Previous testimonials"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => scrollTestimonials('right')}
                            className="bg-white shadow-md border border-gray-100 p-3 rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            aria-label="Next testimonials"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <div
                        ref={testimonialRef}
                        className="flex gap-6 overflow-x-auto pb-12 pt-4 no-scrollbar snap-x snap-mandatory scroll-px-4 px-1"
                        style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain' }}
                    >
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                                className="flex-[0_0_85%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] snap-start bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative group"
                            >
                                <div className="flex text-yellow-400 mb-4 md:mb-6">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                    ))}
                                </div>

                                <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 md:mb-8 flex-grow line-clamp-6">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center gap-4 border-t border-gray-50 pt-4 md:pt-6">
                                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 ring-4 ring-blue-50/30">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 48px, 56px"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base md:text-lg leading-tight">{testimonial.name}</h4>
                                        <p className="text-blue-600 text-[10px] md:text-xs font-bold uppercase tracking-wide mt-1">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
