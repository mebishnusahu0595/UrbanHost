"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">
            {/* Desktop Full Footer */}
            <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Logo & Description */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/list_property.png"
                                alt="Urban Host Icon"
                                width={80}
                                height={80}
                                className="h-20 w-auto"
                                quality={100}
                                unoptimized
                            />
                            <Image
                                src="/logo_name.png"
                                alt="Urban Host"
                                width={450}
                                height={130}
                                className="h-32 w-auto -ml-4"
                                quality={100}
                                unoptimized
                            />
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs font-medium">
                            Premium hotel booking experiences across India. Modern stays for the modern traveler.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1E3A8A] hover:text-white transition-all duration-300 shadow-sm"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">Company</h3>
                        <ul className="space-y-4">
                            {["About Us", "Careers"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={item === "About Us" ? "/about" : item === "Careers" ? "/careers" : "#"}
                                        className="text-sm text-gray-500 hover:text-[#38BDF8] font-bold transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">Support</h3>
                        <ul className="space-y-4">
                            {["Safety", "Contact Us"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={
                                            item === "Contact Us" ? "/contact" :
                                                (item === "Safety") ? "/safety" : "#"
                                        }
                                        className="text-sm text-gray-500 hover:text-[#38BDF8] font-bold transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">Get Updates</h3>
                        <p className="text-sm text-gray-500 font-medium">Join our mailing list for exclusive deals.</p>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Email address"
                                className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                            />
                            <Button className="h-12 bg-[#F87171] hover:bg-[#ef5350] text-white rounded-xl px-6 font-bold shadow-lg shadow-[#F87171]/25">
                                Send
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-gray-400 font-bold">
                        © 2026 Urban Host Property Services Private Limited.
                    </p>
                    <div className="flex items-center gap-8">
                        {[
                            { label: "Our Policies", href: "/privacy" },
                        ].map(link => (
                            <Link key={link.label} href={link.href} className="text-xs text-gray-400 hover:text-gray-900 font-bold transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Compact Footer */}
            <div className="md:hidden px-6 py-10">
                <div className="flex flex-col items-center text-center gap-8">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/list_property.png"
                            alt="Urban Host Icon"
                            width={60}
                            height={60}
                            className="h-12 w-auto"
                            quality={100}
                            unoptimized
                        />
                        <Image
                            src="/logo_name.png"
                            alt="Urban Host"
                            width={300}
                            height={80}
                            className="h-22 w-auto -ml-3"
                            quality={100}
                            unoptimized
                        />
                    </Link>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-left w-full">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Company</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: "About Us", href: "/about" },
                                    { label: "Careers", href: "/careers" },
                                ].map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm font-bold text-gray-500 hover:text-[#38BDF8]">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Support</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: "Safety", href: "/safety" },
                                    { label: "Contact Us", href: "/contact" }
                                ].map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm font-bold text-gray-500 hover:text-[#38BDF8]">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4 col-span-2 pt-4 border-t border-gray-50">
                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Legal</h4>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {[
                                    { label: "Our Policies", href: "/privacy" },
                                ].map(link => (
                                    <Link key={link.label} href={link.href} className="text-xs font-bold text-gray-400 hover:text-gray-900">
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {[Facebook, Instagram, Twitter].map((Icon, i) => (
                            <a key={i} href="#" className="text-gray-400 p-2">
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-gray-100 w-full">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider flex items-center justify-center">
                            Made with <Heart className="w-3 h-3 text-red-500 fill-current mx-1" /> in India
                        </p>
                        <p className="text-[10px] text-gray-300 font-bold mt-1">
                            © 2026 URBANHOST | A Brand of Kuber Hoteliers & Management Services Pvt. Ltd.. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
