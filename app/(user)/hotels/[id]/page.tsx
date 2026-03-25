"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
    Star,
    MapPin,
    Heart,
    Share2,
    CalendarDays,
    Users,
    Wifi,
    Car,
    UtensilsCrossed,
    Dumbbell,
    Waves,
    Wind,
    Coffee,
    ChevronRight,
    ChevronDown,
    ArrowLeftRight,
    Check,
    X,
    Smartphone,
    Search,
    Plus,
    Minus,
    Pencil,
    Loader2,
    Building,
} from "lucide-react";
import { useHotel } from "@/lib/hooks/useHotels";
import { Reviews } from "@/components/hotel/Reviews";
import { LoginModal } from "@/components/auth/LoginModal";


/**
 * HotelDetailPage Component
 * Renders exhaustive details about a specific hotel including images, descriptions, 
 * available rooms, and booking options. Supports mobile-first design with 
 * interactive modals for editing trip details.
 * 
 * @returns {JSX.Element} The rendered HotelDetailPage component.
 */
export default function HotelDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const { data: session, status } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const hotelId = params.id as string;

    // Fetch real hotel data
    const { data: hotel, isLoading, error } = useHotel(hotelId);


    const [isEditOpen, setIsEditOpen] = useState(false);

    // State for Search
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(),
        to: searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date(new Date().setDate(new Date().getDate() + 1)),
    });
    const [adults, setAdults] = useState(parseInt(searchParams.get("adults") || "2"));
    const [rooms, setRooms] = useState(parseInt(searchParams.get("rooms") || "1"));

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (dateRange.from) params.set("from", format(dateRange.from, "yyyy-MM-dd"));
        if (dateRange.to) params.set("to", format(dateRange.to, "yyyy-MM-dd"));
        params.set("adults", adults.toString());
        params.set("rooms", rooms.toString());
        router.push(`?${params.toString()}`, { scroll: false });
        setIsEditOpen(false);
    };

    const handleShare = async () => {
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({
                    title: hotel?.name,
                    text: `Check out ${hotel?.name} on Urban Host`,
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

    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [compareRoomId, setCompareRoomId] = useState<string | null>(null);
    const [compareSelection, setCompareSelection] = useState<string[]>([]);
    const [isComparingMode, setIsComparingMode] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    const openGallery = (images: string[], index: number = 0) => {
        setGalleryImages(images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format"]);
        setActiveImageIndex(index);
        setIsGalleryOpen(true);
    };

    const nights =
        dateRange.from && dateRange.to
            ? Math.ceil(
                (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
            )
            : 1;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Error state
    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h2>
                    <p className="text-gray-600 mb-6">The hotel you're looking for doesn't exist or has been removed.</p>
                    <Link href="/search">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                            Browse Hotels
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const hotelImages = hotel.images && hotel.images.length > 0
        ? hotel.images
        : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format"];
    const hotelAmenities = hotel.amenities || [];
    const hotelRooms = hotel.rooms || [];
    const hotelLocation = hotel.address ? `${hotel.address.city}, ${hotel.address.state}` : "Location";
    const selectedRoom = hotelRooms.find((r: any) => r._id === selectedRoomId);
    const displayPrice = selectedRoom ? selectedRoom.price : (hotelRooms.length > 0 ? hotelRooms[0].price : 0);
    const defaultRoomImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format";
    const getRoomImage = (room: any) => room.images?.[0] || defaultRoomImage;
    const getRoomName = (room: any) => room.type || "Standard Room";

    // Capacity Validation
    const isCapacityExceeded = selectedRoom ? (rooms * (selectedRoom.capacity || 2) < adults) : false;
    const canContinue = selectedRoomId && !isCapacityExceeded;

    return (
        <div className="min-h-screen bg-gray-50 pt-4 pb-24 md:pt-8 md:pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile Header with Edit Link */}
                <div className="md:hidden flex items-start justify-between mb-4">
                    <div className="max-w-[80%]">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <Link href="/search">
                                <ArrowLeftRight className="w-6 h-6 rotate-180" />
                            </Link>
                            <h1 className="text-lg font-bold text-gray-900 truncate">{hotel.name}</h1>
                        </div>
                        <p className="text-xs text-gray-500 ml-8">
                            {format(dateRange.from!, "d MMM")} - {format(dateRange.to!, "d MMM")}, {adults} Adults
                            <button onClick={() => setIsEditOpen(true)} className="text-blue-600 font-bold ml-1">Edit</button>
                        </p>
                    </div>
                    <button className="p-2" onClick={handleShare}>
                        <Share2 className="w-6 h-6 text-blue-600" />
                    </button>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-600 flex-wrap">
                            <div className="flex items-center gap-1">
                                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold mr-1">{hotel.rating}/5</span>
                                <span className="font-medium text-gray-900">{hotel.reviewCount || 0} Ratings</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600">
                                <MapPin className="w-4 h-4" />
                                <span>{hotelLocation}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleShare}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                            <Share2 className="w-4 h-4" /> Share
                        </button>

                    </div>
                </div>

                {/* Desktop Trip Selection Bar */}
                <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm">
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex-1 grid grid-cols-4 gap-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Check-in</label>
                                <div className="flex items-center gap-2 text-sm font-black text-gray-900">
                                    <CalendarDays className="w-4 h-4 text-gray-400" />
                                    {format(dateRange.from!, "EEE, d MMM ''yy")}
                                </div>
                            </div>
                            <div className="space-y-1 border-l border-gray-100 pl-8">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Check-out</label>
                                <div className="flex items-center gap-2 text-sm font-black text-gray-900">
                                    <CalendarDays className="w-4 h-4 text-gray-400" />
                                    {format(dateRange.to!, "EEE, d MMM ''yy")}
                                </div>
                            </div>
                            <div className="space-y-1 border-l border-gray-100 pl-8">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Guests & Rooms</label>
                                <div className="flex items-center gap-2 text-sm font-black text-gray-900">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    {adults} Adults, {rooms} Room
                                </div>
                            </div>
                            <div className="flex items-center justify-end">
                                <Button
                                    variant="outline"
                                    className="h-11 px-6 border-blue-200 text-blue-600 hover:bg-blue-50 font-black rounded-xl gap-2 transition-all active:scale-95"
                                    onClick={() => setIsEditOpen(true)}
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Modify Selection
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 mb-4 md:mb-8 rounded-2xl overflow-hidden h-[300px] md:h-[500px] relative">
                    {/* Main Image */}
                    <div className="md:col-span-2 md:row-span-2 relative cursor-pointer" onClick={() => openGallery(hotelImages, 0)}>
                        <Image
                            src={hotelImages[0]}
                            alt={hotel.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Side Images (only visible on desktop) */}
                    <div className="hidden md:block relative cursor-pointer" onClick={() => openGallery(hotelImages, 1)}>
                        <Image
                            src={hotelImages[1] || hotelImages[0]}
                            alt={hotel.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="hidden md:block relative cursor-pointer" onClick={() => openGallery(hotelImages, 2)}>
                        <Image
                            src={hotelImages[2] || hotelImages[0]}
                            alt={hotel.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="hidden md:block relative cursor-pointer" onClick={() => openGallery(hotelImages, 3)}>
                        <Image
                            src={hotelImages[3] || hotelImages[0]}
                            alt={hotel.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="hidden md:block relative cursor-pointer" onClick={() => openGallery(hotelImages, 4)}>
                        <Image
                            src={hotelImages[4] || hotelImages[0]}
                            alt={hotel.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    <div className="absolute bottom-4 left-4 md:left-auto md:right-4 flex gap-2">
                        <button
                            onClick={() => openGallery(hotelImages, 0)}
                            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-white transition-colors"
                        >
                            Property Photos ({hotelImages.length})
                        </button>
                    </div>
                </div>

                {/* Image Gallery Modal */}
                <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                    <DialogContent className="max-w-5xl w-[95%] h-[80vh] p-0 overflow-hidden bg-black border-none" aria-describedby={undefined}>
                        <DialogHeader className="sr-only">
                            <DialogTitle>Image Gallery</DialogTitle>
                        </DialogHeader>
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={galleryImages[activeImageIndex]}
                                alt={`Gallery ${activeImageIndex}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format";
                                }}
                            />

                            {/* Navigation */}
                            <button
                                onClick={() => setActiveImageIndex((activeImageIndex - 1 + galleryImages.length) % galleryImages.length)}
                                className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
                            >
                                <ArrowLeftRight className="w-6 h-6 text-white rotate-180" />
                            </button>
                            <button
                                onClick={() => setActiveImageIndex((activeImageIndex + 1) % galleryImages.length)}
                                className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
                            >
                                <ArrowLeftRight className="w-6 h-6 text-white" />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold">
                                {activeImageIndex + 1} / {galleryImages.length}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Property Highlights Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hotel.highlights?.coupleFriendly && hotel.highlights.coupleFriendly.toLowerCase() !== 'no' && hotel.highlights.coupleFriendly.toLowerCase() !== 'false' && (
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900">Couple Friendly</p>
                                <p className="text-sm text-gray-500">{hotel.highlights.coupleFriendly}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-900">
                                Policy and privacy
                                <Link href="/privacy" target="_blank" className="text-xs font-normal text-blue-600 hover:underline ml-2">
                                    *Read our policy
                                </Link>
                            </p>
                            <p className="text-sm text-gray-600">Check our standard cancellation policy.</p>
                        </div>
                    </div>
                    {hotel.highlights?.bookAtZero && (
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">₹</div>
                            <div>
                                <p className="text-base font-bold text-blue-600">Book@0 is available</p>
                                <p className="text-sm text-gray-500">Pay nothing at the time of booking</p>
                            </div>
                        </div>
                    )}
                    {hotel.highlights?.mobileDeal && (
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-gray-900" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900">Mobile Deal</p>
                                <p className="text-sm text-gray-600">{hotel.highlights.mobileDeal}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Trip Summary Card for Mobile */}
                <div className="md:hidden bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex justify-between items-center flex-wrap gap-2">
                    <div className="text-sm font-bold text-gray-700 flex-1 min-w-[200px]">
                        {format(dateRange.from!, "d MMM, EEE")} - {format(dateRange.to!, "d MMM, EEE")}
                        <div className="text-xs text-gray-500 mt-1">{adults} Guests, {rooms} {rooms > 1 ? 'Rooms' : 'Room'}</div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-6 rounded-lg h-9 border-none shrink-0"
                        onClick={() => setIsEditOpen(true)}
                    >
                        Edit
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">About this hotel</h2>
                            <p className={`text-gray-600 leading-relaxed text-sm ${!showFullDescription && "line-clamp-3"}`}>
                                {hotel.description}
                            </p>
                            <button
                                onClick={() => setShowFullDescription(!showFullDescription)}
                                className="text-blue-600 font-bold text-sm mt-2 flex items-center gap-1"
                            >
                                {showFullDescription ? "Read less" : "Read more"} <ChevronRight className={`w-4 h-4 transition-transform ${showFullDescription ? "rotate-90" : ""}`} />
                            </button>
                        </section>

                        {/* Amenities */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {hotelAmenities.slice(0, showAllAmenities ? undefined : 6).map((amenity: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                            {hotelAmenities.length > 6 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="text-blue-600 font-bold text-sm mt-4"
                                >
                                    {showAllAmenities ? "Show less" : `Show all ${hotelAmenities.length} amenities`}
                                </button>
                            )}
                        </section>

                        {/* Location Map */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[400px] relative z-0 flex items-center justify-center bg-gray-50">
                            {hotel.embedUrl ? (
                                <iframe
                                    src={hotel.embedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            ) : (
                                <div className="text-center text-gray-400 font-medium">
                                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Maps not available</p>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm border pointer-events-none">
                                {hotel.address?.city || "Location"}
                            </div>
                        </section>

                        {/* Room Selection */}
                        <section id="rooms" className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Select your room</h2>
                            {hotelRooms.map((room) => {
                                const roomName = getRoomName(room);
                                const roomImage = getRoomImage(room);
                                const combinedRoomAmenities = Array.from(new Set([...(room.amenities || []), ...(room.features || [])]));

                                return (
                                    <div
                                        key={room._id}
                                        onClick={() => setSelectedRoomId(room._id || null)}
                                        className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${selectedRoomId === room._id ? "border-blue-500 ring-4 ring-blue-50" : "border-gray-100 hover:border-gray-300 shadow-sm"}`}
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 bg-gray-50 px-4 py-3 border-b border-gray-100">{roomName}</h3>
                                        <div className="flex flex-col md:flex-row">
                                            <div
                                                className="md:w-1/3 relative h-48 md:h-auto md:min-h-[220px] bg-gray-100 cursor-pointer group"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openGallery(room.images && room.images.length > 0 ? room.images : [roomImage], 0);
                                                }}
                                            >
                                                <Image src={roomImage} alt={roomName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                                        View Photos
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 p-4">
                                                <div className="mb-4 space-y-3">
                                                    <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                                                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Max Capacity: {room.capacity}</div>
                                                        <div className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-400" /> {room.available} Rooms Available</div>
                                                    </div>

                                                    {/* Amenities - Horizontal scroll on mobile, wrap on desktop */}
                                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                        {combinedRoomAmenities.map((feature: string, i: number) => (
                                                            <div key={i} className="flex items-center gap-1.5 text-green-600 text-xs font-medium min-w-fit">
                                                                <Check className="w-3 h-3 flex-shrink-0" /> {feature}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                    <div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xl font-black text-gray-900">₹{room.price}</span>
                                                                <span className="text-gray-400 font-medium">/</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 font-bold uppercase -mt-1">night</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm" variant="outline"
                                                            className="h-10 text-xs font-bold gap-2 border-gray-200 rounded-xl"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const rId = room._id || "";
                                                                setCompareRoomId(rId);
                                                                if (hotelRooms.length <= 2) {
                                                                    setCompareSelection(hotelRooms.map((r: any) => r._id || ""));
                                                                    setIsComparingMode(true);
                                                                } else {
                                                                    setCompareSelection([rId]);
                                                                    setIsComparingMode(false);
                                                                }
                                                            }}
                                                        >
                                                            <ArrowLeftRight className="w-4 h-4" /> Compare
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className={`h-10 text-xs font-bold px-6 rounded-xl transition-all ${selectedRoomId === room._id ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (selectedRoomId === room._id) {
                                                                    setSelectedRoomId(null);
                                                                } else {
                                                                    setSelectedRoomId(room._id || null);
                                                                }
                                                            }}
                                                        >
                                                            {selectedRoomId === room._id ? "Selected" : "Select"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    </div>

                    <div className="hidden lg:block space-y-6">
                        <div className="sticky top-24 bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="flex items-center gap-2 group">
                                                <span className="text-3xl font-black text-gray-900">₹{displayPrice}</span>
                                                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-72 p-4 rounded-2xl shadow-xl" align="start" sideOffset={8}>
                                            <h4 className="font-black text-gray-900 text-sm mb-4">Price Breakdown</h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Base Price</span>
                                                    <span className="font-bold text-gray-900">₹{displayPrice}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Taxes & GST (12%)</span>
                                                    <span className="font-bold text-gray-900">₹{Math.round(displayPrice * 0.12)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Service Fee</span>
                                                    <span className="font-bold text-gray-900">₹50</span>
                                                </div>
                                                <div className="flex justify-between pt-3 border-t border-gray-100">
                                                    <span className="font-black text-gray-900">Total</span>
                                                    <span className="font-black text-green-600">₹{displayPrice + Math.round(displayPrice * 0.12) + 50}</span>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Per Night</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-blue-600 font-bold mb-1 flex items-center justify-end gap-1">
                                        <Link href="/privacy" target="_blank" className="hover:underline">
                                            Policy and privacy
                                        </Link>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold">Inclusive of all taxes</p>
                                </div>
                            </div>

                            <div
                                onClick={() => setIsEditOpen(true)}
                                className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 cursor-pointer hover:bg-blue-50 transition-all group"
                            >
                                <div className="grid grid-cols-2 gap-4 mb-3 pb-3 border-b border-blue-100/50">
                                    <div>
                                        <label className="text-[10px] font-black text-blue-600 uppercase mb-1 block">Check-in</label>
                                        <p className="text-sm font-black text-gray-900">{format(dateRange.from!, "d MMM ''yy")}</p>
                                    </div>
                                    <div className="text-right">
                                        <label className="text-[10px] font-black text-blue-600 uppercase mb-1 block">Check-out</label>
                                        <p className="text-sm font-black text-gray-900">{format(dateRange.to!, "d MMM ''yy")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-[10px] font-black text-blue-600 uppercase mb-1 block">Guests & Rooms</label>
                                        <p className="text-sm font-black text-gray-900">{adults} Guests, {rooms} Room</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Pencil className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {isCapacityExceeded && (
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-[11px] text-red-600 font-bold flex items-start gap-2 animate-pulse">
                                        <X className="w-4 h-4 flex-shrink-0" />
                                        <span>Capacity exceeded! For {adults} guests, you need more than {rooms} {rooms > 1 ? 'rooms' : 'room'} of this type.</span>
                                    </div>
                                )}
                                {!selectedRoomId && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-600 font-bold flex items-start gap-2">
                                        <Plus className="w-4 h-4 flex-shrink-0" />
                                        <span>Please select a room type to continue your booking.</span>
                                    </div>
                                )}
                                <Button
                                    disabled={!canContinue}
                                    onClick={(e) => {
                                        if (status !== "authenticated") {
                                            e.preventDefault();
                                            setIsLoginModalOpen(true);
                                        } else {
                                            router.push(`/booking/${hotel._id}?room=${selectedRoomId}&from=${dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}&to=${dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}&adults=${adults}&rooms=${rooms}`);
                                        }
                                    }}
                                    className={`w-full h-14 text-lg font-black rounded-2xl shadow-lg uppercase tracking-wide transition-all ${canContinue
                                        ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                                        : "bg-gray-300 shadow-none cursor-not-allowed"
                                        }`}
                                >
                                    {isCapacityExceeded ? "Capacity Exceeded" : "Continue to Book"}
                                </Button>
                                <p className="text-center text-[11px] text-gray-500 font-medium">
                                    You won&apos;t be charged yet. Payment is required at checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Modal / Search Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-md w-[95%] rounded-3xl p-0 overflow-hidden border-none shadow-2xl top-[40%]">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Edit Trip Details</DialogTitle>
                        </DialogHeader>
                        <div className="p-4 border-b border-gray-100 flex items-start gap-4">
                            <button onClick={() => setIsEditOpen(false)} className="mt-1">
                                <ChevronRight className="w-6 h-6 rotate-180 text-blue-600" />
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900">{hotel.name}</h2>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {format(dateRange.from!, "d MMM")} - {format(dateRange.to!, "d MMM")}, {adults} Adults
                                </p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">Area, Landmark or Property</label>
                                <div className="flex items-center gap-2">
                                    <Search className="w-5 h-5 text-gray-400" />
                                    <span className="text-lg font-bold text-gray-700">{hotelLocation}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-blue-200 shadow-sm transition-all active:scale-95">
                                            <div>
                                                <label className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">Checkin date</label>
                                                <p className="text-sm font-black text-gray-900">{format(dateRange.from!, "d MMM ''yy")}</p>
                                            </div>
                                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-auto rounded-2xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateRange.from}
                                            onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-blue-200 shadow-sm transition-all active:scale-95">
                                            <div>
                                                <label className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">Checkout date</label>
                                                <p className="text-sm font-black text-gray-900">{format(dateRange.to!, "d MMM ''yy")}</p>
                                            </div>
                                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-auto rounded-2xl" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={dateRange.to}
                                            onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-blue-200 shadow-sm transition-all active:scale-95">
                                            <div>
                                                <label className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">Guests</label>
                                                <p className="text-sm font-black text-gray-900">{adults} Adults</p>
                                            </div>
                                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-4 rounded-2xl shadow-xl">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm">Adults</span>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-1 rounded-full border border-gray-200"><Minus className="w-4 h-4" /></button>
                                                    <span className="font-black text-sm">{adults}</span>
                                                    <button onClick={() => setAdults(adults + 1)} className="p-1 rounded-full border border-gray-200"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-blue-200 shadow-sm transition-all active:scale-95">
                                            <div>
                                                <label className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">Rooms</label>
                                                <p className="text-sm font-black text-gray-900">{rooms} Room</p>
                                            </div>
                                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-4 rounded-2xl shadow-xl">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm">Rooms</span>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="p-1 rounded-full border border-gray-200"><Minus className="w-4 h-4" /></button>
                                                    <span className="font-black text-sm">{rooms}</span>
                                                    <button onClick={() => setRooms(rooms + 1)} className="p-1 rounded-full border border-gray-200"><Plus className="w-4 h-4" /></button>
                                                </div>
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


                {/* Comparison Modal */}
                {
                    compareRoomId && (
                        <Dialog open={!!compareRoomId} onOpenChange={(open) => {
                            if (!open) {
                                setCompareRoomId(null);
                                setCompareSelection([]);
                                setIsComparingMode(false);
                            }
                        }}>
                            <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                                {!isComparingMode ? (
                                    <>
                                        <div className="p-6 bg-white border-b border-gray-100">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-bold text-gray-900">Select Rooms to Compare</DialogTitle>
                                            </DialogHeader>
                                            <p className="text-sm text-gray-500 mt-1">Select exactly 2 rooms to compare their features and prices.</p>
                                        </div>
                                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                            {hotelRooms.map((room: any) => (
                                                <div key={room._id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                                    <Checkbox
                                                        checked={compareSelection.includes(room._id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                if (compareSelection.length < 2) {
                                                                    setCompareSelection([...compareSelection, room._id]);
                                                                }
                                                            } else {
                                                                setCompareSelection(compareSelection.filter(id => id !== room._id));
                                                            }
                                                        }}
                                                        disabled={!compareSelection.includes(room._id) && compareSelection.length >= 2}
                                                    />
                                                    <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image src={getRoomImage(room)} alt={getRoomName(room)} fill className="object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-sm">{getRoomName(room)}</h4>
                                                        <p className="text-xs text-gray-500">₹{room.price} / night</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                                            <Button
                                                onClick={() => setIsComparingMode(true)}
                                                disabled={compareSelection.length !== 2}
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                            >
                                                Compare Rooms
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <DialogHeader className="sr-only">
                                            <DialogTitle>Room Comparison</DialogTitle>
                                        </DialogHeader>
                                        <div className="p-6 bg-blue-600 text-white text-center relative">
                                            {hotelRooms.length > 2 && (
                                                <button
                                                    onClick={() => setIsComparingMode(false)}
                                                    className="absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xs font-bold flex items-center gap-1"
                                                >
                                                    <ChevronRight className="w-4 h-4 rotate-180" /> Back
                                                </button>
                                            )}
                                            <h2 className="text-xl font-black">Room Comparison</h2>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-2 gap-4 divide-x divide-gray-100">
                                                {hotelRooms.filter((r: any) => compareSelection.includes(r._id)).map((room: any) => (
                                                    <div key={room._id} className="px-2 space-y-4">
                                                        <div className="relative h-32 rounded-xl overflow-hidden mb-2">
                                                            <Image src={getRoomImage(room)} alt={getRoomName(room)} fill className="object-cover" />
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 text-sm leading-tight h-10">{getRoomName(room)}</h3>
                                                        <div className="text-[10px] space-y-3">
                                                            <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase">Price</span><span className="text-gray-900 font-black text-lg">₹{room.price}</span></div>
                                                            <div className="space-y-2 mt-2">
                                                                {Array.from(new Set([...(room.amenities || []), ...(room.features || [])])).slice(0, 5).map((f: string, i: number) => (
                                                                    <div key={i} className="flex items-center gap-1.5 text-gray-700 font-bold">
                                                                        <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                                                        <span className="truncate">{f}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={() => { setSelectedRoomId(room._id || null); setCompareRoomId(null); }}
                                                            className={`w-full text-xs font-bold rounded-xl h-10 ${room._id === selectedRoomId ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"}`}
                                                        >
                                                            {room._id === selectedRoomId ? "Selected" : "Select"}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    )
                }

                {/* Reviews Section */}
                <Reviews hotelId={hotel._id} />

                {/* Mobile Sticky Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 lg:hidden shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex gap-4 items-center">
                        <div className="flex-shrink-0">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900">₹{displayPrice}</span>
                                <span className="text-xs text-gray-400 line-through">₹{Math.round(displayPrice * 1.3)}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold">Incl. taxes & fees per night</p>
                        </div>
                        {selectedRoomId ? (
                            <Button
                                disabled={!canContinue}
                                onClick={(e) => {
                                    if (status !== "authenticated") {
                                        e.preventDefault();
                                        setIsLoginModalOpen(true);
                                    } else {
                                        router.push(`/booking/${hotel._id}?room=${selectedRoomId}&from=${dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}&to=${dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}&adults=${adults}&rooms=${rooms}`);
                                    }
                                }}
                                className={`flex-1 font-black h-14 rounded-2xl shadow-lg transition-all ${canContinue
                                    ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                                    : "bg-gray-300 shadow-none"
                                    }`}
                            >
                                {isCapacityExceeded ? "Capacity Exceeded" : "Book Now"}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl active:scale-95 transition-all"
                            >
                                Select Room
                            </Button>
                        )}
                    </div>
                </div>
                <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                />
            </div >
        </div >
    );
}
