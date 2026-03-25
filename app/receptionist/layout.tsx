"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiCalendar,
    FiLogOut,
    FiUser
} from "react-icons/fi";
import { MdBusiness } from "react-icons/md";

export default function ReceptionistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [hotelName, setHotelName] = useState<string>("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session && (session.user as any).role !== "receptionist") {
            router.push("/");
        }
    }, [session, status, router]);

    useEffect(() => {
        // Fetch receptionist's hotel info
        const fetchHotelInfo = async () => {
            try {
                const response = await fetch("/api/receptionist/hotel-info");
                if (response.ok) {
                    const data = await response.json();
                    setHotelName(data.hotelName || "");
                }
            } catch (error) {
                console.error("Failed to fetch hotel info:", error);
            }
        };

        if (session && (session.user as any).role === "receptionist") {
            fetchHotelInfo();
        }
    }, [session]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session || (session.user as any).role !== "receptionist") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">UH</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Reception Panel</h1>
                                {hotelName ? (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                        <MdBusiness className="w-3 h-3" />
                                        <span className="font-medium">{hotelName}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">Urban Host</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                                <p className="text-xs text-gray-500">Receptionist</p>
                            </div>
                            <button
                                onClick={() => router.push("/api/auth/signout")}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <FiLogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
