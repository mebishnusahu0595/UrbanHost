"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui/button";
import { Menu, X, User, ChevronDown, Building2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { LoginModal } from "@/components/auth/LoginModal";

export function Navbar() {
    const { data: session } = useSession();
    const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [hasApprovedProperty, setHasApprovedProperty] = useState(false);
    const pathname = usePathname();
    const userMenuRef = useRef<HTMLDivElement>(null);
    
    // Close user dropdown menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isUserMenuOpen]);

    // Close user menu on route change
    useEffect(() => {
        setIsUserMenuOpen(false);
    }, [pathname]);
    
    // Determine if user is in property-panel context
    const isPropertyPanel = pathname?.startsWith('/property-panel');

    // Check if user has approved properties
    useEffect(() => {
        const checkApprovedProperties = async () => {
            if (session?.user?.role === 'propertyOwner' || session?.user?.role === 'hotelOwner') {
                try {
                    const res = await fetch('/api/property-panel/check-approved');
                    if (res.ok) {
                        const data = await res.json();
                        setHasApprovedProperty(data.hasApproved);
                    }
                } catch (error) {
                    console.error('Failed to check approved properties:', error);
                }
            }
        };
        
        checkApprovedProperties();
    }, [session]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const [mainOrigin, setMainOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const host = window.location.hostname.toLowerCase();
            if (host.includes("stayntour.com") && (host.startsWith("partner.") || host.startsWith("admin.") || host.startsWith("superadmin.") || host.startsWith("listproperty."))) {
                setMainOrigin("https://stayntour.com");
            }
        }
    }, []);

    const navLinks = [
        { href: mainOrigin ? `${mainOrigin}/` : "/", label: "Stays" },
        { href: "/partner", label: "List Your Property" },
        { href: mainOrigin ? `${mainOrigin}/about` : "/about", label: "About Us" },
        { href: mainOrigin ? `${mainOrigin}/privacy` : "/privacy", label: "Our Policies" },
        { href: mainOrigin ? `${mainOrigin}/contact` : "/contact", label: "Contact" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
            <nav className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 w-full">
                <div className="flex items-center justify-between h-18">
                    {/* Logo */}
                    <Link href={mainOrigin ? `${mainOrigin}/` : "/"} className="flex items-center -ml-3">
                        <Image
                            src="/logo_name.png"
                            alt="StayNTour"
                            width={170}
                            height={48}
                            className="h-10 md:h-11 w-auto object-contain"
                            priority
                            quality={100}
                            unoptimized
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">

                        {session ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="w-8 h-8 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>
                                {isUserMenuOpen && (
                                    <div 
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        {session.user?.role === 'admin' ? (
                                            <Link
                                                href="/admin/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                Admin Dashboard
                                            </Link>
                                        ) : session.user?.role === 'receptionist' ? (
                                            <Link
                                                href="/receptionist/bookings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                Reception Dashboard
                                            </Link>
                                        ) : (session.user?.role === 'propertyOwner' || session.user?.role === 'hotelOwner') ? (
                                            <>
                                                {hasApprovedProperty && (
                                                    <Link
                                                        href="/property-owner/dashboard"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/property-panel/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Profile
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/my-bookings"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    My Bookings
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Profile
                                                </Link>
                                            </>
                                        )}
                                        <hr className="my-2 border-gray-100" />
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="bg-[#F87171] hover:bg-[#ef5350] text-white rounded-full px-6 font-bold shadow-lg shadow-[#F87171]/25"
                            >
                                Login / Signup
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-x-0 top-[72px] bottom-0 z-40 bg-white animate-in slide-in-from-top-5 fade-in duration-200 p-6 md:hidden overflow-y-auto">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-lg font-bold text-gray-800 hover:text-[#38BDF8] py-3 border-b border-gray-100 transition-colors"
                                    onClick={toggleMobileMenu}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="pt-0 space-y-4">
                                {session ? (
                                    <>
                                        {session.user?.role === 'admin' ? (
                                            <Link
                                                href="/admin/dashboard"
                                                className="block text-lg font-bold text-gray-800 hover:text-[#38BDF8] py-3 border-b border-gray-100"
                                                onClick={toggleMobileMenu}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        ) : session.user?.role === 'receptionist' ? (
                                            <Link
                                                href="/receptionist/bookings"
                                                className="block text-lg font-bold text-gray-800 hover:text-[#38BDF8] py-3 border-b border-gray-100"
                                                onClick={toggleMobileMenu}
                                            >
                                                Reception Dashboard
                                            </Link>
                                        ) : (session.user?.role === 'propertyOwner' || session.user?.role === 'hotelOwner') ? (
                                            <>
                                                {hasApprovedProperty && (
                                                    <Link
                                                        href="/property-owner/dashboard"
                                                        className="block text-lg font-bold text-gray-800 hover:text-[#38BDF8] py-3 border-b border-gray-100"
                                                        onClick={toggleMobileMenu}
                                                    >
                                                        Dashboard
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/property-panel/profile"
                                                    className="block text-lg font-bold text-gray-800 hover:text-[#38BDF8] py-3 border-b border-gray-100"
                                                    onClick={toggleMobileMenu}
                                                >
                                                    Profile
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/my-bookings"
                                                    className="block text-lg font-bold text-gray-800 hover:text-[#38BDF8] py-3 border-b border-gray-100"
                                                    onClick={toggleMobileMenu}
                                                >
                                                    My Bookings
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    className="block text-lg font-bold text-gray-800 hover:text-[#38BDF8] py-3 border-b border-gray-100"
                                                    onClick={toggleMobileMenu}
                                                >
                                                    Profile
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            onClick={() => {
                                                signOut({ callbackUrl: "/" });
                                                toggleMobileMenu();
                                            }}
                                            className="block w-full text-left text-lg font-bold text-red-600 hover:text-red-700 py-3"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3 pt-4">
                                        <Button
                                            onClick={() => { toggleMobileMenu(); setIsLoginModalOpen(true); }}
                                            className="w-full h-12 text-base font-bold bg-blue-600 text-white rounded-xl shadow-lg"
                                        >
                                            Login / Signup
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </header >
    );
}
