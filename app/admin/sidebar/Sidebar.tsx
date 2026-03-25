// components/layout/sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    MdDashboard,
    MdCalendarMonth,
    MdBusiness,
    MdPeople,
    MdBarChart,
    MdSettings,
    MdMenu,
    MdClose,
    MdLogout,
    MdNotifications,
    MdAttachMoney,
    MdAddCircle,
} from "react-icons/md";

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: <MdDashboard className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Notifications",
        href: "/admin/notifications",
        icon: <MdNotifications className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Hotel Revenue",
        href: "/admin/hotel-revenue",
        icon: <MdBarChart className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Add Hotel",
        href: "/admin/addhotel",
        icon: <MdBusiness className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Bookings",
        href: "/admin/bookings",
        icon: <MdCalendarMonth className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Hotels",
        href: "/admin/hotels",
        icon: <MdBusiness className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Property Listings",
        href: "/admin/properties",
        icon: <MdBusiness className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: <MdPeople className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Hotel Owners",
        href: "/admin/hotel-owners",
        icon: <MdBusiness className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Receptionists",
        href: "/admin/receptionists",
        icon: <MdPeople className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Promotions & Coupons",
        href: "/admin/promotions",
        icon: <MdBusiness className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Addons",
        href: "/admin/addons",
        icon: <MdAddCircle className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Payments",
        href: "/admin/payments",
        icon: <MdAttachMoney className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
        title: "Reports",
        href: "/admin/reports",
        icon: <MdBarChart className="h-5 w-5 md:h-6 md:w-6" />,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
        try {
            const res = await fetch('/api/admin/notifications?unreadOnly=true');
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Listen for internal notification updates
        const handleUpdate = () => {
            fetchUnreadCount();
        };

        window.addEventListener('notifications-updated', handleUpdate);

        // Refresh count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notifications-updated', handleUpdate);
        };
    }, []);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4 md:hidden">
                <div className="flex items-center gap-2">
                    <Image
                        src="/list_property.png"
                        alt="UrbanHöst"
                        width={60}
                        height={60}
                        className="h-10 w-10 object-contain"
                        priority
                        quality={100}
                        unoptimized
                    />
                    <span className="text-sm font-black uppercase tracking-widest text-[#1E3A8A]">Admin</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <MdClose className="h-6 w-6" /> : <MdMenu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white z-50 transition-transform duration-300 ease-in-out",
                    "md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Logo Section */}
                <div className="flex h-40 items-center justify-center border-b px-6 bg-white">
                    <div className="flex flex-col items-center gap-4">
                        <Image
                            src="/list_property.png"
                            alt="UrbanHöst"
                            width={160}
                            height={160}
                            className="h-20 w-20 object-contain"
                            priority
                            quality={100}
                            unoptimized
                        />
                        <span className="text-2xl font-black uppercase tracking-[0.2em] text-[#1E3A8A] text-center">Admin Portal</span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 space-y-1 p-3 md:p-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const isNotifications = item.href === "/admin/notifications";
                        return (
                            <Link key={item.href} href={item.href} onClick={closeSidebar}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3 text-sm md:text-base py-5 md:py-6 relative",
                                        isActive
                                            ? "bg-[#1E3A8A]/10 text-[#1E3A8A] hover:bg-[#1E3A8A]/10 hover:text-[#1E3A8A]"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                                    )}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.title}</span>
                                    {isNotifications && unreadCount > 0 && (
                                        <Badge
                                            className="ml-auto bg-red-500 text-white h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full text-xs"
                                        >
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Badge>
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="border-t p-3 md:p-4 space-y-3">
                    {/* Settings Button */}
                    <Link href="/admin/settings" onClick={closeSidebar}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 text-sm md:text-base py-5 md:py-6",
                                pathname === "/admin/settings"
                                    ? "bg-[#1E3A8A]/10 text-[#1E3A8A] hover:bg-[#1E3A8A]/10 hover:text-[#1E3A8A]"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                            )}
                        >
                            <MdSettings className="h-5 w-5 md:h-6 md:w-6" />
                            <span className="font-medium">Settings</span>
                        </Button>
                    </Link>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || 'Admin')}&background=random`} />
                            <AvatarFallback className="bg-orange-200 text-orange-700 text-sm md:text-base">
                                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                                {session?.user?.name || 'Admin User'}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 truncate">
                                {(session?.user as any)?.role === 'admin' ? 'Super Admin' : 'Administrator'}
                            </p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-sm md:text-base py-5 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <MdLogout className="h-5 w-5 md:h-6 md:w-6" />
                        <span className="font-medium">Logout</span>
                    </Button>
                </div>
            </div>
        </>
    );
}
