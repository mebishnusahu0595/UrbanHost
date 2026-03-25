"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MdEventNote, MdSearch, MdVisibility, MdClose, MdPerson, MdHotel, MdCalendarToday, MdPayment, MdPhone, MdEmail } from "react-icons/md";
import { Loader2 } from "lucide-react";

interface Booking {
    _id: string;
    hotel: {
        _id: string;
        name: string;
        images?: string[];
        location?: {
            city?: string;
            state?: string;
        };
    };
    user: {
        name: string;
        email: string;
        phone?: string;
    };
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    paymentStatus?: string;
    totalPrice: number;
    guests: {
        adults: number;
        children: number;
    };
    specialRequests?: string;
    guestInfo?: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: string;
}

export default function BookingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user && !['propertyOwner', 'hotelOwner'].includes((session.user as any).role)) {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch("/api/property-owner/bookings");
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

        if (session?.user) {
            fetchBookings();
        }
    }, [session]);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = (booking.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.hotel?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatFullDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            confirmed: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            cancelled: "bg-red-100 text-red-800",
            completed: "bg-blue-100 text-blue-800",
            "checked-in": "bg-purple-100 text-purple-800",
            "checked in": "bg-purple-100 text-purple-800"
        };
        return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    const getPaymentBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            paid: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            failed: "bg-red-100 text-red-800",
            refunded: "bg-purple-100 text-purple-800",
        };
        return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    const calculateNights = (checkIn: string, checkOut: string) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin border-blue-600 mx-auto mb-4" />
                    <p>Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 pb-20 md:pb-6">
            <div>
                <h1 className="text-xl md:text-3xl font-bold">Bookings</h1>
                <p className="text-sm md:text-lg text-muted-foreground mt-1">
                    Manage bookings for your properties
                </p>
            </div>

            <Card>
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg md:text-xl font-bold">All Bookings</CardTitle>
                            <CardDescription className="text-xs md:text-base mt-1">
                                Total {filteredBookings.length} bookings
                            </CardDescription>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-auto">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Search bookings..."
                                    className="pl-10 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="border rounded-md md:rounded-lg px-4 py-2 bg-white text-sm w-full md:w-auto"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="checked-in">Checked In</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-2 md:pt-0">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-8 md:py-12 text-muted-foreground">
                            <MdEventNote className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-base md:text-lg font-medium">No bookings yet</p>
                            <p className="text-xs md:text-sm mt-2">Bookings will appear here once guests make reservations</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <div
                                    key={booking._id}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <span className="font-bold text-blue-600">
                                                {(booking.user?.name || "G").charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-gray-900 truncate">{booking.guestInfo?.name || booking.user?.name || "Guest"}</p>
                                            <p className="text-xs md:text-sm text-gray-500 truncate">{booking.guestInfo?.email || booking.user?.email}</p>
                                            <p className="text-[10px] font-mono text-gray-400 mt-1">ID: #{booking._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:flex md:items-center gap-y-3 gap-x-4 md:gap-6 flex-[2] text-sm">
                                        <div className="col-span-2 md:col-span-1">
                                            <p className="font-medium text-gray-900 line-clamp-1">{booking.hotel?.name}</p>
                                            <p className="text-gray-500 line-clamp-1">{booking.roomType}</p>
                                        </div>

                                        <div>
                                            <p className="text-gray-500 text-xs uppercase md:normal-case">Check-in</p>
                                            <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase md:normal-case">Check-out</p>
                                            <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase md:normal-case">Guests</p>
                                            <p className="font-medium">{booking.guests?.adults || 0}A, {booking.guests?.children || 0}C</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0">
                                        <Badge className={getStatusBadge(booking.status)}>
                                            {booking.status}
                                        </Badge>

                                        <div className="text-right">
                                            <p className="font-bold text-lg">{formatCurrency(booking.totalPrice)}</p>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-3"
                                            onClick={() => setSelectedBooking(booking)}
                                        >
                                            <MdVisibility className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl md:text-2xl font-bold">{bookings.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl md:text-2xl font-bold text-green-600">
                            {bookings.filter(b => b.status === "confirmed").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl md:text-2xl font-bold text-yellow-600">
                            {bookings.filter(b => b.status === "pending").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl md:text-2xl font-bold text-blue-600">
                            {bookings.filter(b => b.status === "completed").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl relative">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                            >
                                <MdClose className="h-5 w-5 text-white" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="font-bold text-2xl text-white">
                                        {(selectedBooking.user?.name || "G").charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white">{selectedBooking.guestInfo?.name || selectedBooking.user?.name || "Guest"}</h2>
                                    <p className="text-white/80 text-sm">{selectedBooking.guestInfo?.email || selectedBooking.user?.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Badge className={`${getStatusBadge(selectedBooking.status)} border-none`}>
                                    {selectedBooking.status}
                                </Badge>
                                {selectedBooking.paymentStatus && (
                                    <Badge className={`${getPaymentBadge(selectedBooking.paymentStatus)} border-none`}>
                                        Payment: {selectedBooking.paymentStatus}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Property Info */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <MdHotel className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-700">Property Details</h3>
                                </div>
                                <p className="font-bold text-lg text-gray-900">{selectedBooking.hotel?.name}</p>
                                {selectedBooking.hotel?.location && (
                                    <p className="text-sm text-gray-500">
                                        {selectedBooking.hotel.location.city}, {selectedBooking.hotel.location.state}
                                    </p>
                                )}
                                <p className="text-blue-600 font-medium mt-1">{selectedBooking.roomType}</p>
                            </div>

                            {/* Stay Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MdCalendarToday className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-gray-600">Check-in</span>
                                    </div>
                                    <p className="font-bold text-gray-900">{formatFullDate(selectedBooking.checkInDate)}</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MdCalendarToday className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm text-gray-600">Check-out</span>
                                    </div>
                                    <p className="font-bold text-gray-900">{formatFullDate(selectedBooking.checkOutDate)}</p>
                                </div>
                            </div>

                            {/* Guest & Stay Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-purple-50 p-4 rounded-xl text-center">
                                    <MdPerson className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                                    <p className="font-bold text-lg">{selectedBooking.guests?.adults || 0}</p>
                                    <p className="text-xs text-gray-500">Adults</p>
                                </div>
                                <div className="bg-pink-50 p-4 rounded-xl text-center">
                                    <MdPerson className="h-6 w-6 mx-auto text-pink-600 mb-1" />
                                    <p className="font-bold text-lg">{selectedBooking.guests?.children || 0}</p>
                                    <p className="text-xs text-gray-500">Children</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <MdCalendarToday className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                                    <p className="font-bold text-lg">{calculateNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)}</p>
                                    <p className="text-xs text-gray-500">Nights</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="font-semibold text-gray-700 mb-3">Guest Contact</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MdEmail className="h-4 w-4" />
                                        <span className="text-sm">{selectedBooking.guestInfo?.email || selectedBooking.user?.email}</span>
                                    </div>
                                    {(selectedBooking.guestInfo?.phone || selectedBooking.user?.phone) && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MdPhone className="h-4 w-4" />
                                            <span className="text-sm">{selectedBooking.guestInfo?.phone || selectedBooking.user?.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Special Requests */}
                            {selectedBooking.specialRequests && (
                                <div className="bg-yellow-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-700 mb-2">Special Requests</h3>
                                    <p className="text-sm text-gray-600">{selectedBooking.specialRequests}</p>
                                </div>
                            )}

                            {/* Payment Summary */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdPayment className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-700">Payment Summary</h3>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedBooking.totalPrice)}</span>
                                </div>
                            </div>

                            {/* Booking Meta */}
                            <div className="text-center text-xs text-gray-400">
                                Booking ID: #{selectedBooking._id.slice(-6).toUpperCase()}<br />
                                Booked on: {formatFullDate(selectedBooking.createdAt)}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setSelectedBooking(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
