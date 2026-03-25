"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    LayoutDashboard,
    Building2,
    Calendar,
    PlusCircle,
    DollarSign,
    User,
    Users,
    Menu,
    X,
    LogOut,
    Package
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function PropertyOwnerLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    const navItems = [
        { href: "/property-owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/property-owner/properties", label: "My Properties", icon: Building2 },
        { href: "/property-owner/bookings", label: "Bookings", icon: Calendar },
        { href: "/property-owner/add-property", label: "Add New Property", icon: PlusCircle },
        { href: "/property-owner/addons", label: "Addons", icon: Package },
        { href: "/property-owner/earnings", label: "Earnings", icon: DollarSign },
        { href: "/property-owner/staff", label: "Staff", icon: Users },
        { href: "/property-owner/profile", label: "Profile", icon: User },
    ];

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
            {/* Mobile Header */}
            <div className="md:hidden h-16 bg-white border-b z-40 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Image
                        src="/list_property.png"
                        alt="UrbanHost"
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1E3A8A] leading-tight">Urban Host</span>
                        <span className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">Partner Portal</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={cn(
                    "fixed md:relative top-0 left-0 z-50 h-full w-64 bg-white border-r transition-transform duration-300 md:translate-x-0 pt-16 md:pt-4 p-4",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* Mobile Sidebar Overlay (conditional) */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-[-1] md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* Desktop Logo */}
                    <div className="hidden md:flex mb-8 flex-col items-center">
                        <Image
                            src="/list_property.png"
                            alt="UrbanHost"
                            width={100}
                            height={100}
                            className="h-20 w-20 mb-3 object-contain"
                        />
                        <h1 className="text-lg font-bold text-[#1E3A8A] tracking-tight">Urban Host</h1>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#F87171] mt-1">Partner Portal</p>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                                        pathname === item.href || pathname.startsWith(item.href + "/")
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-8 pt-4 border-t">
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 h-full overflow-y-auto bg-gray-50 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
