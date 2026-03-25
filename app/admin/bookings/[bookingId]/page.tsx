"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    FiArrowLeft,
    FiPrinter,
    FiEdit,
    FiCalendar,
    FiCreditCard,
    FiMail,
    FiPhone,
} from "react-icons/fi";
import { useParams } from "next/navigation";
import { useBooking } from "@/lib/hooks/useBookings";
import { useUpdateBookingStatus } from "@/lib/hooks/useAdminBookings";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function BookingDetailPage() {
    const params = useParams();
    const bookingId = params.bookingId as string;
    const { data: booking, isLoading, error } = useBooking(bookingId);
    const updateStatus = useUpdateBookingStatus();

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateStatus.mutateAsync({ bookingId, status: newStatus });
            alert(`Status updated to ${newStatus}`);
        } catch (err: any) {
            alert(err.message || "Failed to update status");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-600 mb-4 text-lg">Failed to load booking details</p>
                <Link href="/admin/bookings">
                    <Button>Back to Bookings</Button>
                </Link>
            </div>
        );
    }

    const hotel = booking.hotel as any;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const basePrice = booking.totalPrice / 1.12;
    const taxes = booking.totalPrice - basePrice;
    const shortId = (booking._id || '').slice(-6).toUpperCase();

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                <Link href="/admin/bookings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer w-fit">
                    <FiArrowLeft className="text-gray-600" />
                    <span className="text-sm">Back to Bookings (BK-{shortId})</span>
                </Link>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2 text-xs md:text-sm flex-1 md:flex-none" size="sm">
                        <FiPrinter className="h-4 w-4" />
                        Print
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-xs md:text-sm flex-1 md:flex-none" size="sm">
                        <FiEdit className="h-4 w-4" />
                        Modify
                    </Button>
                </div>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 flex-wrap">
                    Booking #BK-{shortId}
                    <Badge className={`${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        } uppercase text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-3 md:py-1`}>
                        {booking.status}
                    </Badge>
                </h1>
                <p className="text-xs md:text-base text-gray-600 mt-1">
                    Manage reservation details and payment.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* LEFT SECTION */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Booking Summary */}
                    <Card>
                        <CardHeader className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center p-4 md:p-6 pb-2 md:pb-6">
                            <CardTitle className="text-base md:text-xl">Booking Summary</CardTitle>
                            <div className="flex items-center gap-2">
                                <span className="text-xs md:text-sm text-muted-foreground font-medium">Status</span>
                                <Select
                                    defaultValue={booking.status}
                                    onValueChange={handleStatusChange}
                                    disabled={updateStatus.isPending}
                                >
                                    <SelectTrigger className="w-full md:w-[140px] font-semibold h-9 md:h-10 text-xs md:text-sm">
                                        {updateStatus.isPending ? (
                                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                        ) : null}
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="confirmed" className="text-green-600 font-medium">Confirmed</SelectItem>
                                        <SelectItem value="pending" className="text-yellow-600 font-medium">Pending</SelectItem>
                                        <SelectItem value="cancelled" className="text-red-600 font-medium">Cancelled</SelectItem>
                                        <SelectItem value="completed" className="text-blue-600 font-medium">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent className="grid md:grid-cols-3 gap-4 md:gap-6 pt-2 md:pt-4 p-4 md:p-6">
                            <div className="space-y-4 order-2 md:order-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                                        <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <FiCalendar className="h-4 w-4 md:h-5 md:w-5" />
                                        </div>
                                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Room Selection</p>
                                    </div>
                                    <p className="font-bold text-gray-900 text-base md:text-lg">{booking.roomType}</p>
                                    <p className="text-xs md:text-sm text-gray-500">
                                        {hotel?.name}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                                        <div className="p-1.5 md:p-2 bg-orange-100 rounded-lg text-orange-600">
                                            <FiCalendar className="h-4 w-4 md:h-5 md:w-5" />
                                        </div>
                                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Stay Duration</p>
                                    </div>
                                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                                        {format(checkIn, "MMM dd, yyyy")} – {format(checkOut, "MMM dd, yyyy")}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-500">
                                        {nights} {nights > 1 ? 'Nights' : 'Night'}, {booking.guests.adults} Adults {booking.guests.children > 0 ? `, ${booking.guests.children} Children` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col md:flex-row gap-3 md:gap-4 order-1 md:order-2">
                                <div className="relative w-full md:w-64 h-48 md:h-40 rounded-xl overflow-hidden shadow-sm">
                                    <Image
                                        src={hotel?.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400"}
                                        alt="Room"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex flex-col justify-between py-1 gap-2">
                                    <div className="space-y-1 md:space-y-2">
                                        <p className="text-xs md:text-sm text-gray-700">
                                            <strong className="text-gray-900">Check-in:</strong> from 12:00 PM
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-700">
                                            <strong className="text-gray-900">Check-out:</strong> by 11:00 AM
                                        </p>
                                    </div>
                                    <Button variant="link" className="p-0 h-auto text-blue-600 font-medium justify-start hover:text-blue-700 text-xs md:text-sm">
                                        View Property Details
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-6">
                            <CardTitle className="text-base md:text-xl">Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4 pt-2 md:pt-4 p-4 md:p-6">
                            <Row label={`${booking.roomType} (${nights} night${nights > 1 ? 's' : ''} × ₹${(basePrice / nights / (booking.numberOfRooms || 1)).toFixed(2)})`} value={`₹${basePrice.toFixed(2)}`} labelClass="text-gray-600" />
                            <Row label="Taxes & Fees (12%)" value={`₹${taxes.toFixed(2)}`} labelClass="text-gray-600" />
                            <Row label="Service Fee" value="₹0.00" labelClass="text-gray-600" />

                            <Separator />

                            <Row
                                label="Total Amount Paid"
                                value={`₹${booking.totalPrice.toLocaleString("en-IN")}`}
                                bold
                                valueClass="text-blue-600 text-base md:text-lg"
                            />

                            <Separator />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-xs md:text-sm pt-2 gap-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <FiCreditCard className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                    <div>
                                        <p className="uppercase text-[10px] font-bold text-gray-400 tracking-wider">Payment Method</p>
                                        <p className="font-semibold text-gray-900">{booking.paymentMethod || 'Visa ending in **** 4242'}</p>
                                    </div>
                                </div>
                                <div className="text-left md:text-right w-full md:w-auto pl-[44px] md:pl-0">
                                    <p className="uppercase text-[10px] font-bold text-gray-400 tracking-wider">Transaction ID</p>
                                    <span className="text-blue-600 font-mono font-bold uppercase tracking-tight text-xs md:text-sm">TRX-{(booking._id || '').slice(0, 8).toUpperCase()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT SECTION */}
                <div className="space-y-4 md:space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-2 md:pb-6">
                            <CardTitle className="text-base md:text-xl">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 md:space-y-5 pt-2 md:pt-4 p-4 md:p-6">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
                                    <span className="text-base md:text-xl font-bold">
                                        {(booking.guestInfo?.name || booking.user?.name || 'G')[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="space-y-0.5 md:space-y-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-base md:text-lg leading-tight truncate">{booking.guestInfo?.name || booking.user?.name || 'Guest User'}</p>
                                    <p className="text-[10px] md:text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                                        Member since {format(new Date(booking.user?.createdAt || booking.createdAt), "yyyy")}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <InfoRow icon={<FiMail className="text-blue-600 w-3 h-3 md:w-4 md:h-4" />} label="Email Address" text={booking.guestInfo?.email || booking.user?.email || 'N/A'} />
                                <InfoRow icon={<FiPhone className="text-blue-600 w-3 h-3 md:w-4 md:h-4" />} label="Phone Number" text={booking.guestInfo?.phone || booking.user?.phone || 'N/A'} />
                            </div>

                        </CardContent>
                    </Card>

                    {/* Special Requests */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between p-4 md:p-6 pb-2 md:pb-6">
                            <CardTitle className="text-sm md:text-base">Guest Special Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-2 md:pt-4">
                            <p className="text-xs md:text-sm border-l-4 pl-3 border-blue-500 italic text-gray-700">
                                {booking.specialRequests ? `“${booking.specialRequests}”` : "No special requests provided."}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ---------------- helpers ---------------- */

function Row({
    label,
    value,
    bold,
    valueClass,
    labelClass,
}: {
    label: string;
    value: string;
    bold?: boolean;
    valueClass?: string;
    labelClass?: string;
}) {
    return (
        <div className="flex justify-between text-xs md:text-sm mb-1">
            <span className={`${bold ? "font-semibold" : ""} ${labelClass || "text-gray-700"} truncate pr-2`}>{label}</span>
            <span className={`${bold ? "font-semibold" : ""} ${valueClass || "text-gray-900"} whitespace-nowrap`}>
                {value}
            </span>
        </div>
    );
}

function InfoRow({
    icon,
    label,
    text,
}: {
    icon: React.ReactNode;
    label?: string;
    text: string;
}) {
    return (
        <div className="space-y-0.5 md:space-y-1">
            {label && <p className="text-[10px] md:text-xs uppercase text-gray-500 font-medium">{label}</p>}
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700 truncate">
                {icon}
                <span className="truncate">{text}</span>
            </div>
        </div>
    );
}
