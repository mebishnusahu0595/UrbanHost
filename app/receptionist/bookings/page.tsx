"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    FiSearch,
    FiCheckCircle,
    FiClock,
    FiUser,
    FiCalendar,
    FiFilter
} from "react-icons/fi";
import { Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function ReceptionistBookingsPage() {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [checkingIn, setCheckingIn] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch("/api/receptionist/bookings");
            if (response.ok) {
                const data = await response.json();
                setBookings(data.bookings || []);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (bookingId: string) => {
        setCheckingIn(bookingId);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/checkin`, {
                method: "POST",
            });

            if (response.ok) {
                alert("Guest checked in successfully!");
                fetchBookings();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to check in");
            }
        } catch (error) {
            console.error("Check-in error:", error);
            alert("An error occurred");
        } finally {
            setCheckingIn(null);
        }
    };

    // Filter bookings
    const filteredBookings = bookings.filter((booking) => {
        const guestName = booking.guestInfo?.name || "";
        const bookingId = booking._id || "";
        const checkInDate = new Date(booking.checkInDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Search filter
        const matchesSearch =
            guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookingId.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        let matchesStatus = true;
        if (statusFilter === "pending") {
            matchesStatus = !booking.checkedIn && booking.status === 'confirmed';
        } else if (statusFilter === "checked-in") {
            matchesStatus = booking.checkedIn === true;
        }

        // Date filter
        let matchesDate = true;
        if (dateFilter === "today") {
            matchesDate = checkInDate.toDateString() === today.toDateString();
        } else if (dateFilter === "upcoming") {
            matchesDate = checkInDate > today;
        } else if (dateFilter === "past") {
            matchesDate = checkInDate < today;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Calculate stats
    const todayCount = bookings.filter(b => {
        const checkInDate = new Date(b.checkInDate);
        const today = new Date();
        return checkInDate.toDateString() === today.toDateString();
    }).length;

    const checkedInCount = bookings.filter(b => b.checkedIn).length;
    const upcomingCount = bookings.filter(b => {
        const checkInDate = new Date(b.checkInDate);
        const today = new Date();
        return checkInDate > today;
    }).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
                <p className="text-gray-600">Manage guest check-ins for your hotel - Showing {filteredBookings.length} of {bookings.length} bookings</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Today's Check-ins</p>
                                <p className="text-3xl font-bold text-blue-600">{todayCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiCalendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Checked In</p>
                                <p className="text-3xl font-bold text-green-600">{checkedInCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FiCheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                                <p className="text-3xl font-bold text-orange-600">{upcomingCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <FiClock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
                {/* Search */}
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search by guest name or booking ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>

                    {/* Date Filters */}
                    <div className="flex gap-2">
                        <Button
                            variant={dateFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDateFilter("all")}
                            className={dateFilter === "all" ? "bg-blue-600" : ""}
                        >
                            All Time
                        </Button>
                        <Button
                            variant={dateFilter === "today" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDateFilter("today")}
                            className={dateFilter === "today" ? "bg-blue-600" : ""}
                        >
                            Today
                        </Button>
                        <Button
                            variant={dateFilter === "upcoming" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDateFilter("upcoming")}
                            className={dateFilter === "upcoming" ? "bg-blue-600" : ""}
                        >
                            Upcoming
                        </Button>
                        <Button
                            variant={dateFilter === "past" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDateFilter("past")}
                            className={dateFilter === "past" ? "bg-blue-600" : ""}
                        >
                            Past
                        </Button>
                    </div>

                    {/* Status Filters */}
                    <div className="flex gap-2">
                        <Button
                            variant={statusFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("all")}
                            className={statusFilter === "all" ? "bg-green-600" : ""}
                        >
                            All Status
                        </Button>
                        <Button
                            variant={statusFilter === "pending" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("pending")}
                            className={statusFilter === "pending" ? "bg-green-600" : ""}
                        >
                            Pending Check-in
                        </Button>
                        <Button
                            variant={statusFilter === "checked-in" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("checked-in")}
                            className={statusFilter === "checked-in" ? "bg-green-600" : ""}
                        >
                            Checked In
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {dateFilter === "all" && "All Bookings"}
                    {dateFilter === "today" && "Today's Bookings"}
                    {dateFilter === "upcoming" && "Upcoming Bookings"}
                    {dateFilter === "past" && "Past Bookings"}
                </h2>

                {filteredBookings.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-gray-500">
                            <FiCalendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">No bookings found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <Card
                                key={booking._id}
                                className={`border-l-4 ${booking.checkedIn
                                    ? 'border-l-green-600'
                                    : new Date(booking.checkInDate).toDateString() === new Date().toDateString()
                                        ? 'border-l-blue-600'
                                        : 'border-l-gray-300'
                                    }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.checkedIn ? 'bg-green-100' : 'bg-gray-100'
                                                    }`}>
                                                    {booking.checkedIn ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <FiUser className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {booking.guestInfo?.name || booking.user?.name || "Guest User"}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                                                        <span className="font-mono">ID: #{booking._id.slice(-6).toUpperCase()}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span className="flex items-center gap-1 font-medium italic">
                                                            {booking.guestInfo?.email || booking.user?.email || "No Email"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Check-in</p>
                                                    <p className="font-medium">{format(new Date(booking.checkInDate), "MMM d, yyyy")}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Check-out</p>
                                                    <p className="font-medium">{format(new Date(booking.checkOutDate), "MMM d, yyyy")}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Room Type</p>
                                                    <p className="font-medium">{booking.roomType}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Guests</p>
                                                    <p className="font-medium">{booking.guests.adults} Adults</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Phone</p>
                                                    <p className="font-medium">{booking.guestInfo?.phone || booking.user?.phone || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-6">
                                            {booking.checkedIn ? (
                                                <div className="text-center">
                                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg mb-2">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        <span className="font-medium">Checked In</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {format(new Date(booking.checkedInAt), "MMM d, h:mm a")}
                                                    </p>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => handleCheckIn(booking._id)}
                                                    disabled={checkingIn === booking._id}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    {checkingIn === booking._id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Checking In...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiCheckCircle className="w-4 h-4 mr-2" />
                                                            Check In
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
