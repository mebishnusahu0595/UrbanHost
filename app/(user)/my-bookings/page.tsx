"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    MapPin,
    Users,
    ChevronRight,
    Search,
    CheckCircle2,
    Loader2,
    Star,
} from "lucide-react";
import { useMyBookings, useCancelBooking } from "@/lib/hooks/useBookings";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

type BookingStatus = "all" | "upcoming" | "confirmed" | "completed" | "cancelled";

/**
 * MyBookingsPage Component
 * Displays a list of user's past, upcoming, and cancelled bookings.
 * Includes search and category-based filtering functionality.
 * 
 * @returns {JSX.Element} The rendered MyBookingsPage component.
 */
export default function MyBookingsPage() {
    const [filter, setFilter] = useState<BookingStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

    // Fetch real bookings from API
    const { data: bookings = [], isLoading, error } = useMyBookings();
    const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

    const handleCancelBooking = (id: string) => {
        setBookingToCancel(id);
        setCancelModalOpen(true);
    };

    const confirmCancellation = () => {
        if (bookingToCancel) {
            cancelBooking(bookingToCancel);
            setCancelModalOpen(false);
            setBookingToCancel(null);
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        // Map "upcoming" filter to "confirmed" status from database
        const matchesFilter = filter === "all" ||
            (filter === "upcoming" ? booking.status === "confirmed" : booking.status === filter);
        const hotelName = (booking.hotel as any)?.name || "";
        const hotelLocation = (booking.hotel as any)?.address?.city || "";
        const bookingId = booking._id || booking.id || "";
        const matchesSearch =
            hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotelLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookingId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status: String) => {
        switch (status) {
            case "upcoming":
            case "confirmed":
                return "bg-green-100 text-green-700";
            case "completed":
                return "bg-gray-100 text-gray-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "upcoming":
            case "confirmed":
                return "Confirmed";
            case "completed":
                return "Completed";
            case "cancelled":
                return "Cancelled";
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === "upcoming" || status === "confirmed" || status === "completed") {
            return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
        }
        return null;
    };

    const counts = {
        upcoming: bookings.filter(b => b.status === "confirmed").length,
        completed: bookings.filter(b => b.status === "completed").length,
        cancelled: bookings.filter(b => b.status === "cancelled").length,
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-500 mt-1">Manage your upcoming stays and view past trips.</p>
                    </div>
                    {!isLoading && (
                        <div className="flex gap-2">
                            <div className="bg-[#1E3A8A]/10 text-[#1E3A8A] px-4 py-2 rounded-lg text-sm font-medium">
                                <span className="font-bold mr-1">{counts.upcoming}</span> Upcoming
                            </div>
                            <div className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium">
                                <span className="font-bold mr-1">{counts.completed}</span> Completed
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600">Failed to load bookings. Please try again later.</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
                            <div className="flex gap-8">
                                {[
                                    { id: "all", label: `All (${bookings.length})` },
                                    { id: "upcoming", label: `Upcoming (${counts.upcoming})` },
                                    { id: "completed", label: `Completed (${counts.completed})` },
                                    { id: "cancelled", label: `Cancelled (${counts.cancelled})` },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilter(tab.id as BookingStatus)}
                                        className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${filter === tab.id
                                            ? "border-[#1E3A8A] text-[#1E3A8A]"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search booking ID or hotel"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 outline-none transition-all"
                            />
                        </div>

                        {/* Bookings List */}
                        <div className="space-y-6">
                            {filteredBookings.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                                    <p className="text-gray-500 mb-6">
                                        {filter === "all"
                                            ? "You haven't made any bookings yet."
                                            : `You don't have any ${filter} bookings.`}
                                    </p>
                                    <Link href="/search">
                                        <Button className="bg-[#F87171] hover:bg-[#ef5350] rounded-full px-6">
                                            Start Exploring
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                filteredBookings.map((booking) => {
                                    const hotel = booking.hotel as any;
                                    const hotelName = hotel?.name || "Unknown Hotel";
                                    const hotelLocation = hotel?.address ? `${hotel.address.city}, ${hotel.address.state}` : "Unknown Location";
                                    const hotelImage = hotel?.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400";
                                    const hotelRating = hotel?.rating || 4.5;

                                    return (
                                        <div
                                            key={booking._id || booking.id}
                                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Image */}
                                                <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 rounded-xl overflow-hidden">
                                                    <Image
                                                        src={hotelImage}
                                                        alt={hotelName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md text-xs font-bold flex items-center shadow-sm">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" /> {hotelRating.toFixed(1)}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        {/* Header Row */}
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(booking.status)}`}>
                                                                    {getStatusIcon(booking.status)}
                                                                    {getStatusLabel(booking.status)}
                                                                </span>
                                                                <span className="text-xs text-gray-500 font-medium">Booking ID: #{(booking._id || booking.id || "").slice(-6).toUpperCase()}</span>
                                                            </div>
                                                            <div className="text-xl font-bold text-gray-900">
                                                                ₹{booking.totalPrice.toLocaleString("en-IN")}.00
                                                            </div>
                                                        </div>

                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{hotelName}</h3>
                                                        <div className="flex items-center text-sm text-gray-500 mb-6">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {hotelLocation}
                                                        </div>

                                                        {/* Details Grid */}
                                                        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-white rounded-lg text-[#1E3A8A]">
                                                                    <Calendar className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 font-medium">Check-in</p>
                                                                    <p className="text-sm font-semibold text-gray-900">{format(new Date(booking.checkInDate), "MMM d, yyyy")}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-white rounded-lg text-[#1E3A8A]">
                                                                    <Calendar className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 font-medium">Check-out</p>
                                                                    <p className="text-sm font-semibold text-gray-900">{format(new Date(booking.checkOutDate), "MMM d, yyyy")}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-white rounded-lg text-[#1E3A8A]">
                                                                    <Users className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 font-medium">Guests</p>
                                                                    <p className="text-sm font-semibold text-gray-900">{booking.guests.adults} Adults</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className={`flex gap-3 mt-6 ${booking.status === "cancelled" ? "justify-center" : "justify-end"}`}>
                                                        {booking.status === "confirmed" && (
                                                            <Button
                                                                variant="outline"
                                                                className="border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-6"
                                                                onClick={() => handleCancelBooking(booking._id || booking.id || "")}
                                                                disabled={isCancelling}
                                                            >
                                                                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                                                            </Button>
                                                        )}
                                                        <Link href={`/confirmation/${booking._id || booking.id}`}>
                                                            <Button className="bg-[#F87171] hover:bg-[#ef5350] text-white font-medium px-6">
                                                                View Details
                                                                <ChevronRight className="w-4 h-4 ml-2" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Cancellation Confirmation Modal */}
            <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Cancel Booking?</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
                        <p className="text-sm text-amber-800">
                            <strong>Note:</strong> Cancellation charges may apply based on the hotel's cancellation policy.
                            Please review the policy before proceeding.
                        </p>
                    </div>

                    <DialogFooter className="flex gap-3 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCancelModalOpen(false);
                                setBookingToCancel(null);
                            }}
                            className="flex-1"
                            disabled={isCancelling}
                        >
                            Keep Booking
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmCancellation}
                            disabled={isCancelling}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            {isCancelling ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                'Yes, Cancel Booking'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
