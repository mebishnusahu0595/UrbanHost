"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Star,
    MapPin,

    Search as SearchIcon,
    Wifi,
    Car,
    UtensilsCrossed,
    Waves,
    Wind,
    Coffee,
    ChevronDown,
    ArrowLeft,
    Pencil,
    Filter,
    Clock,
    Sparkles,
    Check,
    X,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHotels } from "@/lib/hooks/useHotels";

/**
 * SearchPageContent Component
 * Provides a comprehensive interface for filtering and viewing hotel listings.
 */
function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locationParam = searchParams.get("location") || "";
    const sortParam = searchParams.get("sort") || "rating";

    // Fetch real hotels from API
    const { data: hotels = [], isLoading, error } = useHotels({
        status: "approved",
        city: locationParam,
        sort: sortParam,
        limit: 50
    });

    // UI State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [editLocation, setEditLocation] = useState(locationParam);

    useEffect(() => {
        setEditLocation(locationParam);
    }, [locationParam]);

    // Filter State
    const [sortBy, setSortBy] = useState("Urban Host Properties");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Search State
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: new Date("2026-01-15"),
        to: new Date("2026-01-16"),
    });
    const [adults, setAdults] = useState(2);
    const [rooms, setRooms] = useState(1);

    const toggleFilter = (filter: string) => {
        setActiveFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    /**
     * Filters and sorts the hotel list based on current state.
     */
    const filteredHotels = hotels
        .filter(hotel => {
            const minPrice = hotel.rooms && hotel.rooms.length > 0 ? Math.min(...hotel.rooms.map((r: any) => r.price)) : 0;
            if (minPrice < priceRange[0] || minPrice > priceRange[1]) return false;

            // Star Rating (from Dialog)
            if (selectedStars.length > 0 && !selectedStars.includes(Math.floor(hotel.rating || 0))) {
                return false;
            }

            // Quick Filters
            if (activeFilters.includes("Cancellation Policy")) {
                const hasFreeCancel = hotel.highlights?.cancellation?.toLowerCase().includes("free");
                if (!hasFreeCancel) return false;
            }

            if (activeFilters.includes("Breakfast Included")) {
                const hasBreakfast = hotel.amenities?.some((a: string) => a.toLowerCase().includes("breakfast"));
                if (!hasBreakfast) return false;
            }

            if (activeFilters.includes("5 Star")) {
                if ((hotel.rating || 0) < 4.5) return false;
            }

            return true;
        })
        .sort((a, b) => {
            const aPrice = a.rooms && a.rooms.length > 0 ? Math.min(...a.rooms.map((r: any) => r.price)) : 0;
            const bPrice = b.rooms && b.rooms.length > 0 ? Math.min(...b.rooms.map((r: any) => r.price)) : 0;

            if (sortBy === "Price: Low to High") return aPrice - bPrice;
            if (sortBy === "Price: High to Low") return bPrice - aPrice;
            if (sortBy === "Rating") return (b.rating || 0) - (a.rating || 0);
            return 0; // Default to API order (Urban Host prioritized)
        });

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            {/* Header - Screenshot Style */}
            <div className="bg-white sticky top-16 z-40 shadow-sm border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                    <button onClick={() => router.back()} className="p-1">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>

                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="flex-1 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                    >
                        <div className="text-left">
                            <h2 className="text-sm font-bold text-gray-900 leading-tight">{locationParam}</h2>
                            <p className="text-[10px] text-gray-500 font-semibold">
                                {format(dateRange.from, "d MMM ''yy")} - {format(dateRange.to, "d MMM ''yy")}, {adults} Gts, {rooms} Rm
                            </p>
                        </div>
                        <SearchIcon className="w-5 h-5 text-blue-600" />
                    </button>

                    <button onClick={() => setIsEditOpen(true)} className="p-1">
                        <Pencil className="w-5 h-5 text-blue-600" />
                    </button>
                </div>

                {/* Filter / Sort Horizontal Bar */}
                <div className="bg-white border-t border-gray-100 max-w-3xl mx-auto">
                    <div className="flex items-center px-4 py-3 gap-3 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setIsSortOpen(true)}
                            className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Sort By: {sortBy} <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-1.5 whitespace-nowrap bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Filter className="w-3.5 h-3.5" /> All Filters
                        </button>

                        <div className="flex items-center gap-2">
                            {["Cancellation Policy", "Near Me", "Breakfast Included", "5 Star"].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => toggleFilter(filter)}
                                    className={`whitespace-nowrap border rounded-full px-4 py-1.5 text-xs font-bold transition-all ${activeFilters.includes(filter)
                                        ? "bg-blue-50 border-blue-500 text-blue-600"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600">Failed to load hotels. Please try again later.</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {/* Result count / Sort info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 font-bold mb-2">
                            <p>{filteredHotels.length} Hotels found{locationParam && ` in ${locationParam}`}</p>
                            <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-blue-600" />
                                <span>Best prices guaranteed</span>
                            </div>
                        </div>

                        {/* Hotel List */}
                        <div className="space-y-4">
                            {filteredHotels.map((hotel) => {
                                const minPrice = hotel.rooms && hotel.rooms.length > 0
                                    ? Math.min(...hotel.rooms.map((r: any) => r.price))
                                    : 0;
                                const hotelImage = hotel.images && hotel.images.length > 0
                                    ? hotel.images[0]
                                    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format";

                                return (
                                    <Link key={hotel._id} href={`/hotels/${hotel._id}`} className="block">
                                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                                            <div className="flex flex-col md:flex-row h-full">
                                                {/* Image Section */}
                                                <div className="md:w-36 lg:w-44 h-48 md:h-auto relative">
                                                    <Image
                                                        src={hotelImage}
                                                        alt={hotel.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />

                                                    {/* Badges */}
                                                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                                                        {hotel.labels?.includes("Urban Host Property") && (
                                                            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                Urban Host
                                                            </div>
                                                        )}
                                                        {hotel.labels?.includes("Best Seller") && (
                                                            <div className="bg-blue-600 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                Best Seller
                                                            </div>
                                                        )}
                                                        {hotel.labels?.includes("Featured") && (
                                                            <div className="bg-purple-600 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                Featured
                                                            </div>
                                                        )}
                                                        {hotel.labels?.includes("Luxury") && (
                                                            <div className="bg-black text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                Luxury
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-1 p-4 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start gap-2 mb-1">
                                                            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
                                                                {hotel.name}
                                                            </h3>
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                                                    {(hotel.rating || 4.0).toFixed(1)}/5
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <p className="text-[10px] text-gray-500 font-bold mb-2 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {hotel.address?.city || ""}, {hotel.address?.state || ""}
                                                        </p>

                                                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed mb-4 italic">
                                                            &quot;{hotel.description || 'Comfortable stay with modern amenities'}&quot;
                                                        </p>
                                                    </div>

                                                    <div className="flex items-end justify-between pt-2 border-t border-gray-50">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-xl font-bold text-gray-900">₹{minPrice.toLocaleString()}</span>
                                                                <span className="text-[10px] text-gray-500 font-bold">/ night</span>
                                                            </div>
                                                            <p className="text-[9px] text-green-600 font-bold uppercase mt-0.5">+ taxes & fees</p>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1">

                                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-6 h-9 rounded-xl shadow-lg shadow-blue-100 uppercase tracking-wide active:scale-95 transition-all">
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>



            {/* All Filters Drawer/Dialog */}
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogContent className="max-w-md w-full rounded-t-3xl md:rounded-3xl p-0 bottom-0 top-auto translate-y-0 md:top-[50%] md:translate-y-[-50%] animate-in slide-in-from-bottom duration-300">
                    <DialogHeader className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold text-gray-900">Filters</DialogTitle>
                            <button
                                onClick={() => {
                                    setPriceRange([0, 10000]);
                                    setSelectedStars([]);
                                }}
                                className="text-sm font-bold text-blue-600"
                            >
                                Reset All
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                        {/* Price Range */}
                        <div>
                            <h3 className="text-base font-bold text-gray-900 mb-6">Price Range</h3>
                            <div className="px-2">
                                <div className="flex justify-between text-sm font-bold text-gray-700 mb-4">
                                    <span>₹{priceRange[0]}</span>
                                    <span>₹{priceRange[1]}</span>
                                </div>
                                {/* Simple native range for demo or custom slider */}
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="500"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div>
                            <h3 className="text-base font-black text-gray-900 mb-4">Star Rating</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[5, 4, 3, 2].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => {
                                            if (selectedStars.includes(star)) {
                                                setSelectedStars(selectedStars.filter(s => s !== star));
                                            } else {
                                                setSelectedStars([...selectedStars, star]);
                                            }
                                        }}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedStars.includes(star)
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-gray-100 bg-gray-50 text-gray-600"
                                            }`}
                                    >
                                        <span className="font-black">{star} Stars</span>
                                        <Star className={`w-4 h-4 ${selectedStars.includes(star) ? "fill-blue-700" : "fill-gray-400"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100">
                        <Button
                            onClick={() => setIsFilterOpen(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl text-base font-black shadow-xl shadow-blue-100 uppercase tracking-widest active:scale-95 transition-all"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sort Modal */}
            <Dialog open={isSortOpen} onOpenChange={setIsSortOpen}>
                <DialogContent className="max-w-sm w-full rounded-3xl p-0 animate-in zoom-in-95 duration-200">
                    <DialogHeader className="p-6 border-b border-gray-100">
                        <DialogTitle className="text-xl font-bold">Sort By</DialogTitle>
                    </DialogHeader>
                    <div className="p-2">
                        {["Urban Host Properties", "Price: Low to High", "Price: High to Low", "Rating"].map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    setSortBy(option);
                                    setIsSortOpen(false);
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                            >
                                <span className={`font-bold ${sortBy === option ? "text-blue-600" : "text-gray-700"}`}>{option}</span>
                                {sortBy === option && <Check className="w-5 h-5 text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Trip Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md w-[95%] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Edit Trip</DialogTitle>
                    </DialogHeader>
                    {/* Edit Trip UI */}
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-black text-gray-900">Your Trip</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Destination */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">Destination</label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={editLocation}
                                        onChange={(e) => setEditLocation(e.target.value)}
                                        className="text-lg font-bold text-gray-900 bg-transparent outline-none focus:outline-none focus:ring-0 w-full placeholder:text-gray-400"
                                        placeholder="Where are you going?"
                                    />
                                </div>
                            </div>

                            {/* Check-in and Check-out */}
                            <div className="grid grid-cols-2 gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                                            <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">Check-in</label>
                                            <p className="font-bold text-gray-900">{format(dateRange.from, "d MMM ''yy")}</p>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-auto rounded-2xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateRange.from}
                                            onSelect={(d) => d && setDateRange(prev => ({ ...prev, from: d }))}
                                            disabled={{ before: new Date() }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                                            <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">Check-out</label>
                                            <p className="font-bold text-gray-900">{format(dateRange.to, "d MMM ''yy")}</p>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-auto rounded-2xl" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={dateRange.to}
                                            onSelect={(d) => d && setDateRange(prev => ({ ...prev, to: d }))}
                                            disabled={{ before: dateRange.from || new Date() }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Guests & Rooms - Separate controls */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">Guests & Rooms</label>

                                {/* Adults */}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-700">Adults</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setAdults(Math.max(1, adults - 1))}
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center font-bold text-gray-900">{adults}</span>
                                        <button
                                            onClick={() => setAdults(adults + 1)}
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Rooms */}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="font-bold text-gray-700">Rooms</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center font-bold text-gray-900">{rooms}</span>
                                        <button
                                            onClick={() => setRooms(rooms + 1)}
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setIsEditOpen(false);
                                const params = new URLSearchParams();
                                if (editLocation) params.set("location", editLocation);
                                router.push(`/search?${params.toString()}`);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl text-base font-black shadow-xl shadow-blue-100 uppercase tracking-widest active:scale-95 transition-all"
                        >
                            Update Search
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/**
 * SearchPage Component
 * Wraps SearchPageContent in a Suspense boundary to support client-side search parameters during build.
 */
export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
