"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
    CheckCircle,
    Calendar,
    Users,
    MapPin,
    Download,
    Loader2,
    Star,
    Wifi,
    Navigation,
    Building,
    Home,
    Search,
    CreditCard,
    ArrowRight
} from "lucide-react";
import { useBooking, useCancelBooking } from "@/lib/hooks/useBookings";


// Mock recommendations (keep these as they are not part of the specific booking)
const recommendations = [
    {
        id: "1",
        name: "Grand Urban Plaza",
        location: "Mumbai, Maharashtra",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400",
        rating: 4.9,
        price: 4500,
    },
    {
        id: "2",
        name: "The Seaside Retreat",
        location: "Goa, India",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400",
        rating: 4.7,
        price: 5200,
    },
    {
        id: "3",
        name: "Mountain View Lodge",
        location: "Manali, Himachal",
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=400",
        rating: 4.8,
        price: 3800,
    },
];

export default function ConfirmationPage() {
    const params = useParams();
    const bookingId = params.bookingId as string;
    const { data: booking, isLoading, error: fetchError } = useBooking(bookingId);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const [cancelReason, setCancelReason] = useState("plan-change");
    const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();


    const cancelReasons = [
        { id: "plan-change", label: "Change of plans" },
        { id: "better-price", label: "Found a better price" },
        { id: "dates-changed", label: "Travel dates changed" },
        { id: "emergency", label: "Personal emergency" },
        { id: "other", label: "Other" },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (fetchError || !booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                <p className="text-gray-600 mb-6">We couldn't load the details for this booking.</p>
                <Link href="/my-bookings">
                    <Button>My Bookings</Button>
                </Link>
            </div>
        );
    }

    const hotel = booking.hotel as any;
    const hotelImage = hotel?.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";
    const nights = Math.max(1, Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
    const basePrice = booking.totalPrice / 1.12;
    // const taxes = booking.totalPrice - basePrice;

    const handleGetDirections = () => {
        if (!hotel) return;

        const openMaps = (startLat?: number, startLng?: number) => {
            let destParam = "";

            if (hotel.location?.coordinates && Array.isArray(hotel.location.coordinates) && hotel.location.coordinates.length === 2) {
                const lat = hotel.location.coordinates[1];
                const lng = hotel.location.coordinates[0];
                if (lat !== 0 || lng !== 0) {
                    destParam = `${lat},${lng}`;
                }
            }

            if (!destParam) {
                const parts = [hotel.address?.street, hotel.address?.city, hotel.address?.state].filter(Boolean);
                destParam = encodeURIComponent(parts.join(", ") || hotel.name);
            }

            let url = `https://www.google.com/maps/dir/?api=1&destination=${destParam}`;
            if (startLat && startLng) {
                url += `&origin=${startLat},${startLng}`;
            }

            window.open(url, '_blank');
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => openMaps(pos.coords.latitude, pos.coords.longitude),
                (err) => {
                    console.error("Location access denied or error", err);
                    openMaps();
                }
            );
        } else {
            console.warn("Geolocation not supported");
            openMaps();
        }
    };

    const handleDownloadInvoice = () => {
        window.print();
    };

    const formatPaymentMethod = (method: string | undefined) => {
        if (!method) return "Payment Pending";

        // Check if the method string ends with 4 digits (common for saved "Visa 1234" formats)
        const lastFourMatch = method.match(/(\d{4})$/);
        if (lastFourMatch) {
            const lastFour = lastFourMatch[1];
            // Remove the digits from the name if present to avoid duplication
            const name = method.replace(/\s*\d{4}$/, '').trim();
            return `${name} **** ${lastFour}`;
        }

        // If it looks like a card type but no digits, mask generally
        if (['visa', 'mastercard', 'amex', 'credit card', 'debit card', 'card'].some(t => method.toLowerCase().includes(t))) {
            return `${method} ****`;
        }
        return method; // Cash, UPI, etc.
    };

    if (isCancelled || booking.status === 'cancelled') {
        return (
            <div className="min-h-screen bg-gray-50 pt-8 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
                    {/* Success Icon (actually info/check for cancelled state handled gracefully) */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Cancelled Successfully</h1>
                    <p className="text-gray-500 mb-12 max-w-lg mx-auto">
                        Your reservation has been cancelled. We&apos;ve sent a confirmation email to your registered address.
                    </p>

                    {/* Refund Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 text-left max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">Booking ID: #{(booking._id || bookingId).slice(-6).toUpperCase()}</h3>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold uppercase">Cancelled</span>
                        </div>

                        <div className="bg-[#1E3A8A]/10 rounded-xl p-4 flex gap-4 text-[#1E3A8A]">
                            <div className="mt-0.5 flex-shrink-0">
                                <Search className="w-5 h-5 text-[#1E3A8A] rotate-90" />
                            </div>
                            <p className="text-sm leading-relaxed">
                                A refund of <span className="font-bold">₹{booking.totalPrice.toLocaleString("en-IN")}</span> has been initiated to your original payment method ({formatPaymentMethod(booking.paymentMethod)}) and will reflect in <span className="font-bold">5-7 business days</span>.
                            </p>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <div className="relative w-full h-48 rounded-xl overflow-hidden">
                                <Image
                                    src={hotelImage}
                                    alt={hotel.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-center gap-4 mb-16">
                        <Link href="/search">
                            <Button className="bg-[#F87171] hover:bg-[#ef5350] text-white h-12 px-8 rounded-xl font-medium">
                                <Search className="w-4 h-4 mr-2" />
                                Browse More Hotels
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" className="h-12 px-8 rounded-xl font-medium border-gray-200 text-gray-700 bg-white">
                                <Home className="w-4 h-4 mr-2" />
                                Go to Home
                            </Button>
                        </Link>
                    </div>

                    {/* Recommendations */}
                    <div className="border-t border-gray-200 pt-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Other Hotels You Might Like</h2>
                            <Link href="/search" className="text-[#38BDF8] font-medium hover:underline flex items-center">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recommendations.map((h) => (
                                <div key={h.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group cursor-pointer">
                                    <div className="relative h-48">
                                        <Image
                                            src={h.image}
                                            alt={h.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-xs font-bold flex items-center">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" /> {h.rating}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-1">{h.name}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                            {h.location}
                                        </div>
                                        <div className="flex items-end gap-1">
                                            <span className="text-lg font-bold text-[#F87171]">₹{h.price}</span>
                                            <span className="text-sm text-gray-400 mb-0.5">/ night</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16 print:bg-white print:pt-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 print:hidden">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Link href="/my-bookings" className="hover:text-[#38BDF8] transition-colors">My Bookings</Link>
                            <span>/</span>
                            <span>Booking Details</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                        <p className="text-gray-500 mt-1">
                            Booking ID: <span className="font-mono font-medium text-gray-900">#{(booking._id || bookingId).slice(-6).toUpperCase()}</span>
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                </div>

                <div className="hidden print:block mb-8 text-center border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                    <p>Booking ID: #{(booking._id || bookingId).slice(-6).toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Hotel Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 flex flex-col md:flex-row gap-6 print:shadow-none print:border">
                            <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 print:hidden">
                                <Image
                                    src={hotelImage}
                                    alt={hotel.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="mb-4">
                                    <span className="text-[#1E3A8A] text-xs font-bold uppercase tracking-wider">
                                        {booking.roomType}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{hotel?.name}</h2>
                                    <div className="flex items-center gap-1 mb-2">
                                        <div className="flex text-yellow-400 print:hidden">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < (hotel?.rating || 4) ? "fill-current" : "text-gray-300"}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">({hotel?.rating || 4}/5.0) {hotel?.reviewCount ? `(${hotel.reviewCount} Reviews)` : ''}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        {hotel?.address?.street}, {hotel?.address?.city}, {hotel?.address?.state}
                                    </p>
                                </div>
                                <div className="flex gap-3 print:hidden">
                                    <Button onClick={handleGetDirections} className="bg-[#F87171] hover:bg-[#ef5350] text-white gap-2">
                                        <Navigation className="w-4 h-4" />
                                        Get Directions
                                    </Button>
                                    <Link href={`/hotels/${hotel._id}`}>
                                        <Button variant="outline" className="gap-2 text-gray-700 bg-gray-50 border-transparent hover:bg-gray-100 w-full">
                                            <Building className="w-4 h-4" />
                                            View Property
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Stay Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border">
                            <div className="flex items-center gap-2 mb-6">
                                <Calendar className="w-5 h-5 text-[#1E3A8A]" />
                                <h3 className="text-lg font-bold text-gray-900">Stay Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 print:bg-transparent print:border">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Check-in</p>
                                    <p className="text-lg font-bold text-gray-900">{format(new Date(booking.checkInDate), "EEEE, MMM d")}</p>
                                    <p className="text-sm text-gray-500">Standard Check-In: 12:00 PM</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 print:bg-transparent print:border">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Check-out</p>
                                    <p className="text-lg font-bold text-gray-900">{format(new Date(booking.checkOutDate), "EEEE, MMM d")}</p>
                                    <p className="text-sm text-gray-500">Standard Check-Out: 11:00 AM</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Guests</p>
                                    <p className="font-semibold text-gray-900">
                                        {booking.guests.adults} Adults
                                        {booking.guests.children > 0 && `, ${booking.guests.children} Children`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Room Type</p>
                                    <p className="font-semibold text-gray-900">{booking.roomType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Stay Duration</p>
                                    <p className="font-semibold text-gray-900">{nights} Night{nights > 1 ? 's' : ''}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                                    <p className="font-semibold text-gray-900 text-xs sm:text-base break-all">#{(booking._id || bookingId).slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
                            {/* Policies */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="w-5 h-5 text-[#1E3A8A]" />
                                    <h3 className="text-lg font-bold text-gray-900">Policies</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                    Read our cancellation policy. Review our standard terms and conditions for bookings in the Help Center.
                                </p>
                                <Link href="/privacy" className="text-[#38BDF8] text-sm font-bold hover:underline print:hidden">
                                    View full policy
                                </Link>
                            </div>

                            {/* Amenities Used */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wifi className="w-5 h-5 text-[#1E3A8A]" />
                                    <h3 className="text-lg font-bold text-gray-900">Amenities Included</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {hotel.amenities && hotel.amenities.length > 0 ? (
                                        hotel.amenities.map((amenity: string, idx: number) => (
                                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold print:border print:bg-white">{amenity}</span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">Includes all standard amenities.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">

                        {/* Payment Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>{booking.roomType} x {nights} Nights</span>
                                    <span className="font-medium text-gray-900">₹{basePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Total Price (Incl. Taxes & Fees)</span>
                                    <span className="font-medium text-gray-900">₹{booking.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-6">
                                <span className="font-bold text-gray-900">Total Paid</span>
                                <span className="text-2xl font-bold text-[#F87171]">₹{booking.totalPrice.toLocaleString("en-IN")}</span>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 print:bg-transparent print:border">
                                <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-blue-900" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Payment Method</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatPaymentMethod(booking.paymentMethod)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Manage Booking Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:hidden">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Booking</h3>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => setIsCancelModalOpen(true)}
                                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 h-11 rounded-xl font-medium"
                                >
                                    Cancel Booking
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadInvoice}
                                    className="w-full h-11 rounded-xl font-medium border-gray-200 text-gray-700"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Invoice
                                </Button>
                            </div>

                            <div className="mt-8 text-center bg-transparent">
                                <p className="text-sm text-gray-500 mb-2">Need help?</p>
                                <Link href="/contact" className="text-[#38BDF8] font-bold hover:underline">
                                    Contact Support
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Cancel Booking Modal */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 scale-100">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Cancel Booking?</h2>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-500"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-6">
                            {/* Info Box */}
                            <div className="bg-blue-50 rounded-xl p-4 flex gap-3 text-blue-800">
                                <div className="mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                </div>
                                <p className="text-sm leading-relaxed">
                                    Cancellations made within 24 hours of check-in may incur a fee.
                                    Please check the property&apos;s specific policy for more details.
                                </p>
                            </div>

                            {/* Reason Selection */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Why are you cancelling?</h3>
                                <div className="space-y-3">
                                    {cancelReasons.map((reason) => (
                                        <div key={reason.id} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={reason.id}
                                                name="cancelReason"
                                                value={reason.id}
                                                checked={cancelReason === reason.id}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <label htmlFor={reason.id} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                                                {reason.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    Keep Booking
                                </Button>
                                <Button
                                    className="h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium border-none shadow-sm disabled:opacity-50"
                                    disabled={isCancelling}
                                    onClick={() => {
                                        cancelBooking(booking._id || bookingId, {
                                            onSuccess: () => {
                                                setIsCancelModalOpen(false);
                                                setIsCancelled(true);
                                            }
                                        });
                                    }}
                                >
                                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Confirm Cancellation
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
