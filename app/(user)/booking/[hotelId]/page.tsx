"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
    ArrowLeft,
    Check,
    ChevronRight,
    ChevronDown,
    Search,
    Share2,
    Plus,
    Minus,
    X
} from "lucide-react";

/**
 * BookingPage Component
 * Handles the final review and booking confirmation process.
 * Allows users to review stay details, add-on services, and proceed to payment.
 * 
 * @returns {JSX.Element} The rendered BookingPage component.
 */
import { useHotel } from "@/lib/hooks/useHotels";

export default function BookingPage() {
    const params = useParams();
    const hotelId = params.hotelId as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/');
        }
    }, [status, router]);

    // Fetch real hotel data
    const { data: hotel, isLoading, error } = useHotel(hotelId);

    const roomId = searchParams.get("room");

    const [isEditOpen, setIsEditOpen] = useState(false);

    // Trip State
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date("2026-01-22"),
        to: searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date("2026-01-23"),
    });
    const [adults, setAdults] = useState(parseInt(searchParams.get("adults") || "2"));
    const [roomsCount, setRoomsCount] = useState(parseInt(searchParams.get("rooms") || "1"));
    const [specialRequest, setSpecialRequest] = useState("");
    const [taxPercentage, setTaxPercentage] = useState<number>(12);

    // Fetch tax percentage from settings
    useEffect(() => {
        fetch('/api/admin/settings?key=taxPercentage')
            .then(res => res.json())
            .then(data => {
                if (data.value !== null && data.value !== undefined) {
                    setTaxPercentage(data.value);
                }
            })
            .catch(err => console.error('Failed to fetch tax percentage:', err));
    }, []);

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (dateRange.from) params.set("from", format(dateRange.from, "yyyy-MM-dd"));
        if (dateRange.to) params.set("to", format(dateRange.to, "yyyy-MM-dd"));
        params.set("adults", adults.toString());
        params.set("rooms", roomsCount.toString());
        router.push(`?${params.toString()}`, { scroll: false });
        setIsEditOpen(false);
    };

    const handleShare = async () => {
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({
                    title: hotel?.name,
                    text: `Booking at ${hotel?.name} on Urban Host`,
                    url: window.location.href,
                });
            } else {
                throw new Error("Web Share not supported");
            }
        } catch (error) {
            // Fallback to clipboard
            try {
                if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                } else {
                    // Fallback for insecure contexts (HTTP)
                    const textArea = document.createElement("textarea");
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        alert("Link copied to clipboard!");
                    } catch (e) {
                        console.error("Copy failed", e);
                        alert("Unable to copy link");
                    }
                    document.body.removeChild(textArea);
                }
            } catch (err) {
                console.error("Share failed", err);
            }
        }
    };

    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

    // Effect to initialize addons once hotel data is loaded if needed or just use hotel.addons
    const hotelAddons = hotel?.addons || [];

    // Loading & Error states
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
                <p className="text-gray-600 mb-6">We couldn't load the booking details for this property.</p>
                <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
        );
    }

    const selectedRoom = hotel.rooms?.find((r: any) => r._id === roomId) || hotel.rooms?.[0] || {
        type: "Standard Room",
        price: 0,
        images: []
    };

    const nightsCount = dateRange.from && dateRange.to
        ? Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

    // Capacity Validation
    const isCapacityExceeded = (selectedRoom.capacity || 2) * roomsCount < adults;
    const canProceed = !isCapacityExceeded;

    const roomPrice = (selectedRoom.price || 0) * roomsCount * nightsCount;
    const taxes = Math.round(roomPrice * (taxPercentage / 100));
    const addonsTotal = hotelAddons
        .filter(a => selectedAddons.has(a.name))
        .reduce((sum, a) => sum + a.price, 0);
    const grandTotal = roomPrice + taxes + addonsTotal;

    const hotelImage = hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400";
    const hotelLocation = hotel.address ? `${hotel.address.city}, ${hotel.address.state}` : "";

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
            {/* Header / Sticky Top */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 lg:static">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-blue-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold text-gray-900 leading-tight">Review booking</h1>
                        <p className="text-xs text-gray-500">
                            {format(dateRange.from!, "d MMM")} - {format(dateRange.to!, "d MMM")}, {roomsCount} Rm, {adults} Gts
                            <button onClick={() => setIsEditOpen(true)} className="text-blue-600 font-medium ml-1">Edit</button>
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
                {/* Hotel Summary Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 border border-gray-100">
                    <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={hotelImage} alt={hotel.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-medium bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider text-gray-600">{hotel.propertyType || 'Hotel'}</span>
                            </div>
                            <h2 className="font-bold text-gray-900 text-lg leading-tight mb-1">{hotel.name}</h2>
                            <p className="text-[10px] text-gray-400 font-normal leading-tight">
                                {hotel.address?.street}, {hotel.address?.city}, {hotel.address?.state}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold">{hotel.rating}/5</span>
                                <span className="text-[10px] text-gray-400 font-normal">{hotel.totalReviews || 0} Ratings</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center px-2">
                        <div className="space-y-0.5">
                            <p className="text-gray-900 font-semibold text-sm">{format(dateRange.from!, "d MMM, EEE")}</p>
                            <p className="text-gray-400 text-[10px] font-normal text-center">12 PM</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 border-t-2 border-dashed border-gray-200" />
                            <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-50 rounded-full mt-1 border border-gray-100">{nightsCount} Night{nightsCount > 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-0.5 text-right">
                            <p className="text-gray-900 font-semibold text-sm">{format(dateRange.to!, "d MMM, EEE")}</p>
                            <p className="text-gray-400 text-[10px] font-normal text-center">11 AM</p>
                        </div>
                    </div>
                </div>

                {/* Simplified Trip Summary with Edit Button */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700">
                        {format(dateRange.from!, "d MMM, EEE")} - {format(dateRange.to!, "d MMM, EEE")} <span className="mx-2 text-gray-300">|</span> {adults} Guests
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50 font-medium px-6 rounded-xl h-9 bg-blue-50/50"
                        onClick={() => setIsEditOpen(true)}
                    >
                        Edit
                    </Button>
                </div>

                {/* Selected Room Details */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b border-gray-50 uppercase tracking-widest text-gray-400">Room Details, {adults} Adults</h3>

                    {isCapacityExceeded && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium mb-4 flex items-start gap-2 animate-pulse">
                            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Room capacity exceeded! Selected room(s) can only accommodate {(selectedRoom.capacity || 2) * roomsCount} guests. Please add more rooms or change room type.</span>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <h4 className="font-semibold text-gray-900 text-base">{selectedRoom.type}</h4>
                            <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                                <Check className="w-3.5 h-3.5" />
                                <Link href="/privacy" target="_blank" className="hover:underline">
                                    Cancellation policy applies
                                </Link>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600 text-xs font-medium">
                                <Check className="w-3.5 h-3.5" /> Book @ ₹0 available
                            </div>
                        </div>
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={selectedRoom.images?.[0] || hotelImage} alt={selectedRoom.type} fill className="object-cover" />
                        </div>
                    </div>
                </div>

                {/* Addons Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Addons</h3>
                    <p className="text-[10px] text-gray-400 font-normal mb-6 tracking-wide">PRICE INCLUSIVE OF TAXES AND FOR ALL GUESTS</p>

                    <div className="space-y-6">
                        {hotelAddons.length > 0 ? (
                            hotelAddons.map((addon) => {
                                const isApplied = selectedAddons.has(addon.name);
                                return (
                                    <div key={addon.name} className="flex justify-between items-center gap-4 group">
                                        <div className="flex-1">
                                            <h4 className="font-normal text-gray-800 text-sm">Add <span className="text-blue-600 font-medium">{addon.name}</span> for <span className="font-semibold text-gray-900">₹{addon.price}</span></h4>
                                            {addon.description && <p className="text-[10px] text-gray-400 font-normal">{addon.description}</p>}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedAddons(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(addon.name)) next.delete(addon.name);
                                                    else next.add(addon.name);
                                                    return next;
                                                });
                                            }}
                                            className={`text-xs font-semibold px-5 py-2 rounded-xl border-2 transition-all ${isApplied ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-100" : "border-blue-50 text-blue-600 hover:bg-blue-50 bg-blue-50/20"}`}
                                        >
                                            {isApplied ? "APPLIED" : "APPLY"}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-500 italic">No extra addons available for this stay</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Special Request Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Special Requests</h3>
                    <textarea
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm"
                        rows={3}
                        placeholder="Any special requests? (e.g., Early check-in, dietary restrictions...)"
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                    />
                </div>
            </div>

            {/* Sticky Bottom Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.1)]">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex-shrink-0">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="flex items-center gap-1 group">
                                    <span className="text-xl md:text-2xl font-bold text-gray-900">₹{grandTotal}</span>
                                    <span className="text-gray-400 text-xs md:text-sm line-through decoration-red-400 font-medium">₹{Math.round(grandTotal * 1.3)}</span>
                                    <ChevronDown className="w-4 h-4 text-blue-600 ml-1 group-hover:text-blue-700" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-4 rounded-2xl shadow-xl" align="start" sideOffset={8}>
                                <h4 className="font-semibold text-gray-900 text-sm mb-4">Price Breakdown</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Room: {selectedRoom.type} (x{roomsCount} Rooms, {nightsCount} Nights)</span>
                                        <span className="font-medium text-gray-900">₹{roomPrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Taxes & Fees</span>
                                        <span className="font-medium text-gray-900">₹{taxes}</span>
                                    </div>
                                    {addonsTotal > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Add-ons</span>
                                            <span className="font-medium text-gray-900">₹{addonsTotal}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-3 border-t border-gray-100">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-green-600">₹{grandTotal}</span>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <p className="text-[10px] text-gray-400 font-normal">Incl. of taxes & fees</p>
                    </div>
                    <Link
                        href={canProceed ? `/payment/${hotel._id}?from=${dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}&to=${dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}&adults=${adults}&rooms=${roomsCount}&room=${roomId}&specialRequests=${encodeURIComponent(specialRequest)}&addons=${Array.from(selectedAddons).join(',')}` : "#"}
                        className={`flex-1 max-w-[240px] ${!canProceed ? "pointer-events-none" : ""}`}
                    >
                        <Button
                            disabled={!canProceed}
                            className={`w-full h-12 md:h-14 text-sm md:text-lg font-bold rounded-xl md:rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-wide ${canProceed
                                ? "bg-orange-500 hover:bg-orange-600 shadow-orange-100"
                                : "bg-gray-300 shadow-none cursor-not-allowed"
                                }`}
                        >
                            {isCapacityExceeded ? "Capacity Exceeded" : "Proceed to pay"}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md w-[95%] rounded-3xl p-0 overflow-hidden border-none shadow-2xl top-[40%]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Edit Booking Details</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 border-b border-gray-100 flex items-start gap-4">
                        <button onClick={() => setIsEditOpen(false)} className="mt-1">
                            <ChevronRight className="w-6 h-6 rotate-180 text-blue-600" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">{hotel.name}</h2>
                                <button onClick={handleShare}><Share2 className="w-6 h-6 text-blue-600" /></button>
                            </div>
                            <p className="text-xs text-gray-500">{format(dateRange.from!, "d MMM")} - {format(dateRange.to!, "d MMM")}, {adults} Adults</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <label className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1 block">Area, Landmark or Property</label>
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-gray-400" />
                                <span className="text-lg font-medium text-gray-700">{hotelLocation}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-blue-200">
                                        <div>
                                            <label className="text-[10px] font-medium text-blue-600 uppercase mb-1 block">Checkin date</label>
                                            <p className="text-sm font-semibold text-gray-900">{format(dateRange.from!, "d MMM ''yy")}</p>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto rounded-2xl"><Calendar mode="single" selected={dateRange.from} onSelect={(d) => setDateRange(p => ({ ...p, from: d }))} /></PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-blue-200">
                                        <div>
                                            <label className="text-[10px] font-medium text-blue-600 uppercase mb-1 block">Checkout date</label>
                                            <p className="text-sm font-semibold text-gray-900">{format(dateRange.to!, "d MMM ''yy")}</p>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto rounded-2xl"><Calendar mode="single" selected={dateRange.to} onSelect={(d) => setDateRange(p => ({ ...p, to: d }))} /></PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-blue-200">
                                        <div>
                                            <label className="text-[10px] font-medium text-blue-600 uppercase mb-1 block">Guests</label>
                                            <p className="text-sm font-semibold text-gray-900">{adults} Adults</p>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-4 rounded-2xl shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">Adults</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-1 rounded-full border border-gray-200"><Minus className="w-4 h-4" /></button>
                                            <span className="font-semibold text-sm">{adults}</span>
                                            <button onClick={() => setAdults(adults + 1)} className="p-1 rounded-full border border-gray-200"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-blue-200">
                                        <div>
                                            <label className="text-[10px] font-medium text-blue-600 uppercase mb-1 block">Rooms</label>
                                            <p className="text-sm font-semibold text-gray-900">{roomsCount} Room</p>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-4 rounded-2xl shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">Rooms</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))} className="p-1 rounded-full border border-gray-200"><Minus className="w-4 h-4" /></button>
                                            <span className="font-semibold text-sm">{roomsCount}</span>
                                            <button onClick={() => setRoomsCount(roomsCount + 1)} className="p-1 rounded-full border border-gray-200"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Button
                            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold rounded-2xl shadow-lg mt-4 active:scale-95 transition-all"
                            onClick={handleApply}
                        >
                            Apply
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
