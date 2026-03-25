// app/(admin)/bookings/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Search, Plus, MoreHorizontal, Calendar, Hotel, User, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "../../../lib/utils";
import { useAdminBookings, useUpdateBookingStatus } from "@/lib/hooks/useAdminBookings";
import { format } from "date-fns";

interface Booking {
    id: string;
    realId: string;
    customer: {
        name: string;
        avatar?: string;
    };
    hotel: string;
    room: string;
    dates: string;
    checkInDate?: string;
    checkOutDate?: string;
    nights: string;
    status: "Confirmed" | "Pending" | "Checked Out" | "Cancelled" | "Checked In" | "checked-in" | "checked in";
    amount: number;
    guestPhone?: string;
    guestEmail?: string;
    checkedInAt?: string;
    createdAt: string;
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "confirmed") return "default";
    if (normalizedStatus === "pending") return "secondary";
    if (normalizedStatus === "completed") return "outline";
    if (normalizedStatus === "checked in" || normalizedStatus === "checked-in") return "default";
    if (normalizedStatus === "cancelled") return "destructive";
    return "default";
};

const getStatusStyle = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "confirmed") return "bg-green-100 text-green-800";
    if (normalizedStatus === "pending") return "bg-yellow-100 text-yellow-800";
    if (normalizedStatus === "completed" || normalizedStatus === "checked out") return "bg-blue-100 text-blue-800";
    if (normalizedStatus === "checked in" || normalizedStatus === "checked-in") return "bg-purple-100 text-purple-800";
    if (normalizedStatus === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
};

export default function BookingsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const { data: apiBookings = [], isLoading, error, refetch } = useAdminBookings();
    const updateStatus = useUpdateBookingStatus();

    const handleQuickConfirm = async (bookingId: string) => {
        try {
            await updateStatus.mutateAsync({ bookingId, status: 'confirmed' });
            alert("Booking confirmed successfully!");
            refetch();
        } catch (err: any) {
            alert(err.message || "Failed to confirm booking");
        }
    };

    // Transform API bookings to match UI format
    const bookings = apiBookings.map((booking: any) => {
        const checkIn = booking.checkInDate ? new Date(booking.checkInDate) : new Date();
        const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate) : new Date();
        const nightsCount = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

        // Handle Status Display
        let displayStatus = (booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)) || "Pending";
        if (booking.status === 'checked-in') displayStatus = "Checked In";

        return {
            id: `#${(booking._id || booking.id || '').slice(-6)}`,
            realId: booking._id || booking.id,
            customer: {
                name: booking.guestInfo?.name || booking.user?.name || 'Unknown User',
                avatar: booking.user?.image || undefined
            },
            hotel: booking.hotel?.name || 'Unknown Hotel',
            room: booking.roomType || 'Standard',
            dates: format(new Date(booking.createdAt || booking.bookingDate || new Date()), "MMM dd, yyyy, h:mm a"),
            checkInDate: format(checkIn, "MMM dd, yyyy"),
            checkOutDate: format(checkOut, "MMM dd, yyyy"),
            nights: `${nightsCount} night${nightsCount > 1 ? 's' : ''}`,
            status: displayStatus as any,
            amount: booking.totalPrice || 0,
            guestPhone: booking.guestInfo?.phone || booking.contactPhone || booking.phoneNumber || booking.user?.phone || 'N/A',
            guestEmail: booking.guestInfo?.email || booking.contactEmail || booking.user?.email || 'N/A',
            checkedInAt: booking.checkedInAt ? format(new Date(booking.checkedInAt), "MMM dd, h:mm a") : undefined,
            createdAt: booking.createdAt || booking.bookingDate || new Date().toISOString(),
        };
    });

    // Sort bookings by createdAt descending (most recent first)
    bookings.sort((a: Booking, b: Booking) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const filteredBookings = bookings.filter((booking: Booking) => {
        const matchesSearch = booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.hotel.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter.toLowerCase() || (statusFilter === "checked in" && (booking.status.toLowerCase() === "checked in" || booking.status.toLowerCase() === "checked-in"));
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load bookings</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Page Header */}
            <div className="border-b bg-white px-4 md:px-6 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard" className="text-sm md:text-base">
                                        Home
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-sm md:text-base">Bookings</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900">All Bookings</h1>
                            <p className="text-xs md:text-base text-muted-foreground mt-1">
                                Manage all hotel reservations
                            </p>
                        </div>
                    </div>
                    <Button size="sm" className="md:size-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Add Booking
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-4 md:px-6 py-4 bg-gray-50">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 md:h-5 md:w-5" />
                        <Input
                            placeholder="Search bookings..."
                            className="pl-10 w-full h-10 md:h-11 text-sm md:text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[160px] h-10 md:h-11 text-sm md:text-base">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="checked in">Checked In</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results Count */}
            <div className="px-4 md:px-6 py-3 border-b bg-white">
                <p className="text-xs md:text-sm text-muted-foreground">
                    Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-auto p-4 space-y-3">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No bookings found</p>
                    </div>
                ) : (
                    filteredBookings.map((booking: Booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">
                                                    {booking.customer.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    {booking.id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge className={cn("text-[10px] px-2 py-0.5", getStatusStyle(booking.status))}>
                                                {booking.status}
                                            </Badge>
                                            {booking.checkedInAt && (
                                                <Badge variant="outline" className="text-[9px] px-1 py-0 border-green-200 text-green-700 bg-green-50">
                                                    IN: {booking.checkedInAt}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                        <div>
                                            <p className="text-muted-foreground font-bold text-[10px] uppercase">Phone</p>
                                            <p className="font-medium text-gray-900">{booking.guestPhone}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground font-bold text-[10px] uppercase">Email</p>
                                            <p className="font-medium text-gray-900 truncate">{booking.guestEmail}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="text-muted-foreground">Hotel</p>
                                            <p className="font-medium text-gray-900 truncate">{booking.hotel}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Room</p>
                                            <p className="font-medium text-gray-900">{booking.room}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Check-in</p>
                                            <p className="font-medium text-gray-900">{booking.dates}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Duration</p>
                                            <p className="font-medium text-gray-900">{booking.nights}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t px-4 py-3 bg-gray-50">
                                    <div className="font-bold text-base text-gray-900">
                                        ₹{booking.amount.toLocaleString()}
                                    </div>
                                    <div className="flex gap-2">
                                        {booking.status.toLowerCase() === 'pending' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleQuickConfirm(booking.realId)}
                                                disabled={updateStatus.isPending}
                                            >
                                                {updateStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
                                            </Button>
                                        )}
                                        <Link href={`/admin/bookings/${booking.realId}`}>
                                            <Button size="sm" variant="outline" className="h-8 text-xs">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-auto">
                <Card className="mx-6 my-4">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b">
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-4">
                                        Booking ID
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-4">
                                        Customer
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-4">
                                        Hotel / Room
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 px-4">
                                        Booked On
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 text-center px-4">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 text-right px-4">
                                        Amount
                                    </TableHead>
                                    <TableHead className="w-16 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center px-4">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.map((booking: Booking) => (
                                    <TableRow key={booking.id} className="hover:bg-gray-50/50 border-b last:border-b-0">
                                        <TableCell className="font-mono text-sm font-medium text-gray-900 px-4">
                                            #{(booking.id || "").slice(-6).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                    <User className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {booking.customer.name}
                                                    </p>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <p className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                                                            <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                                                            {booking.guestPhone}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 flex items-center gap-1 font-medium truncate max-w-[150px]">
                                                            <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                                                            {booking.guestEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-medium text-gray-900">{booking.hotel}</p>
                                                <p className="text-xs text-gray-500">{booking.room}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4">
                                            <div className="space-y-0.5">
                                                <p className="text-sm text-gray-900 font-medium">{booking.dates}</p>
                                                <p className="text-[10px] text-gray-500">In: {booking.checkInDate}</p>
                                                <p className="text-[10px] text-gray-500">Out: {booking.checkOutDate}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center px-4">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Badge className={cn("text-xs font-semibold px-3 py-1", getStatusStyle(booking.status))}>
                                                    {booking.status}
                                                </Badge>
                                                {booking.checkedInAt && (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-tight">Checked In</span>
                                                        <span className="text-[9px] text-gray-500 font-medium">{booking.checkedInAt}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-4">
                                            <div className="font-mono text-sm font-bold text-gray-900">
                                                ₹{booking.amount.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center px-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/bookings/${booking.realId}`} className="cursor-pointer">
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {booking.status.toLowerCase() === 'pending' && (
                                                        <DropdownMenuItem
                                                            className="text-green-600 font-medium cursor-pointer"
                                                            onClick={() => handleQuickConfirm(booking.realId)}
                                                            disabled={updateStatus.isPending}
                                                        >
                                                            {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                            Confirm Booking
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredBookings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Pagination */}
            <div className="border-t px-4 md:px-6 py-4 bg-white">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                        Page 1 of 1
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" className="text-xs md:text-sm" disabled>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs md:text-sm" disabled>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
