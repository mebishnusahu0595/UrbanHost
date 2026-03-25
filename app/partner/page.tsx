"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, ShieldCheck, Smartphone, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Testimonials } from "./components/Testimonials";
import { useState } from "react";

export default function PartnerPage() {
    const benefits = [
        {
            icon: <Users className="w-12 h-12 text-[#1E3A8A]" />,
            title: "Increase Occupancy",
            description: "Drive more bookings from our loyal customer base and corporate partners."
        },
        {
            icon: <DollarSign className="w-12 h-12 text-[#1E3A8A]" />,
            title: "Increase RevPAR",
            description: "Optimize your room rates dynamically to maximize revenue per available room."
        },
        {
            icon: <ShieldCheck className="w-12 h-12 text-[#1E3A8A]" />,
            title: "Complete Control",
            description: "Maintain full control over your inventory, pricing, and policies with our easy-to-use dashboard."
        },
        {
            icon: <Smartphone className="w-12 h-12 text-[#1E3A8A]" />,
            title: "Contactless Experience",
            description: "Offer seamless check-ins and support with our technology-driven platform."
        }
    ];

    const brands = [
        "The Park", "Lemon Tree", "Park Inn", "Holiday Inn", "Pride Hotel",
        "Ramada", "Keys Select", "Sarovar", "Treebo", "Mango Hotels"
    ];

    const faqs = [
        {
            question: "How does UrbanHost work?",
            answer: "UrbanHost connects property owners with travelers looking for flexible and comfortable stays. We provide a platform to list your property and manage bookings efficiently."
        },
        {
            question: "Is there a commission fee?",
            answer: "We offer competitive commission rates. You only pay when you get a booking. Contact us for detailed pricing structures."
        },
        {
            question: "How do I manage my inventory?",
            answer: "You get access to a dedicated Extranet dashboard where you can update rates, availability, and view bookings in real-time."
        }
    ];

    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop')`,
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 container mx-auto px-4 text-center text-white"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">
                            Why partner with UrbanHost?
                        </h1>
                        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
                            Join the fastest growing network of premium hotels and stays.
                            Maximize your revenue with flexible inventory management.
                        </p>
                        <Link href="/partner/login">
                            <Button
                                className="bg-[#F97316] hover:bg-[#EA580C] text-white text-lg font-bold px-10 py-6 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                List Property
                            </Button>
                        </Link>
                    </motion.div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center group"
                                >
                                    <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <Testimonials />

                {/* Brands Section */}
                <section className="py-16 bg-white overflow-hidden">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-gray-400 font-medium mb-10 tracking-widest uppercase text-sm">Trusted by Leading Hospitality Brands</p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                        >
                            {brands.map((brand, i) => (
                                <span key={i} className="text-xl md:text-2xl font-bold text-gray-400 hover:text-gray-800 transition-colors cursor-default">
                                    {brand}
                                </span>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Video Section */}
                <section className="py-20 bg-gray-900 text-white">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl font-bold mb-10 text-center">Partner with UrbanHost & join the movement</h2>
                            <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl relative aspect-video bg-gray-800 group cursor-pointer border border-gray-700">
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                                    </div>
                                </div>
                                <Image
                                    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format&fit=crop"
                                    alt="Video Thumbnail"
                                    fill
                                    className="object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500"
                                    sizes="(max-width: 768px) 100vw, 1000px"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Call to Action Banner */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#1E3A8A]"></div>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="container mx-auto px-4 relative z-10 text-center text-white"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to grow your hotel business?</h2>
                        <p className="text-xl mb-10 max-w-2xl mx-auto text-blue-100">
                            Join thousands of hotels that trust UrbanHost to fill their rooms and increase their revenue.
                        </p>
                        <Link href="/partner/login">
                            <Button className="bg-white text-[#1E3A8A] hover:bg-gray-100 font-bold text-lg px-10 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all">
                                List Your Property
                            </Button>
                        </Link>
                    </motion.div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold mb-12 text-center text-gray-800"
                        >
                            Frequently Asked Questions
                        </motion.h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <button
                                        onClick={() => toggleFaq(i)}
                                        className="w-full flex justify-between items-center p-6 text-left focus:outline-none bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                    >
                                        <h3 className="text-lg font-bold text-gray-800">{faq.question}</h3>
                                        {openFaqIndex === i ?
                                            <ChevronUp className="w-5 h-5 text-gray-500" /> :
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        }
                                    </button>
                                    <div
                                        className={`transition-all duration-300 ease-in-out overflow-hidden bg-white ${openFaqIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="p-6 pt-0 text-gray-600 border-t border-gray-100 mt-4">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
