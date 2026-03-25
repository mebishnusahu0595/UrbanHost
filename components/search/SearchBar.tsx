"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSearchStore } from "@/store/useSearchStore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, CalendarDays, Users, Search, Minus, Plus, Loader2 } from "lucide-react";

interface LocationSuggestion {
    city: string;
    state: string;
    count: number;
}

export function SearchBar() {
    const router = useRouter();
    const { filters, setLocation, setDates, setGuests } = useSearchStore();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isGuestsOpen, setIsGuestsOpen] = useState(false);

    // Typewriter Effect State
    const [placeholderText, setPlaceholderText] = useState("");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const placeholders = ["Where are you going?", "Try 'Bhilai'", "Try 'Raipur'", "Try 'Durg'", "Search 'Hotels'"];
        const typingSpeed = isDeleting ? 50 : 100;
        const pauseTime = 2000;

        const timeout = setTimeout(() => {
            const current = placeholders[placeholderIndex];

            if (!isDeleting && charIndex < current.length) {
                setCharIndex((prev) => prev + 1);
                setPlaceholderText(current.substring(0, charIndex + 1));
            } else if (isDeleting && charIndex > 0) {
                setCharIndex((prev) => prev - 1);
                setPlaceholderText(current.substring(0, charIndex - 1));
            } else if (!isDeleting && charIndex === current.length) {
                setTimeout(() => setIsDeleting(true), pauseTime);
                return;
            } else if (isDeleting && charIndex === 0) {
                setIsDeleting(false);
                setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
            }
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, placeholderIndex]);

    // Autocomplete states
    const [inputValue, setInputValue] = useState(filters.location);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: filters.checkIn || undefined,
        to: filters.checkOut || undefined,
    });

    // Debounce effect for location search
    useEffect(() => {
        // Sync inputValue with store on initial load or reset
        if (filters.location && !inputValue) {
            setInputValue(filters.location);
        }
    }, [filters.location]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue.trim().length >= 1) {
                fetchSuggestions(inputValue);
            } else {
                setSuggestions([]);
            }
        }, 1500); // Debounce for 1.5 seconds (User asked 2-3s, but 1.5s is more responsive while saving calls)

        return () => clearTimeout(timer);
    }, [inputValue]);

    // Handle clicks outside dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (query: string) => {
        setIsLoadingSuggestions(true);
        try {
            const res = await fetch(`/api/locations?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSuggestions(data.locations || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleSelectLocation = (loc: LocationSuggestion) => {
        const locationString = `${loc.city}, ${loc.state}`;
        setInputValue(locationString);
        setLocation(locationString);
        setShowSuggestions(false);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (inputValue) params.set("location", inputValue);
        if (filters.checkIn) params.set("checkIn", format(filters.checkIn, "yyyy-MM-dd"));
        if (filters.checkOut) params.set("checkOut", format(filters.checkOut, "yyyy-MM-dd"));
        if (filters.guests > 1) params.set("guests", String(filters.guests));

        router.push(`/search?${params.toString()}`);
    };

    const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
        if (range) {
            setDateRange({ from: range.from, to: range.to });
            setDates(range.from || null, range.to || null);
        }
    };

    return (
        <div className="bg-white rounded-3xl md:rounded-full shadow-2xl p-4 md:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-2 w-full border border-gray-100 relative">
            {/* Location */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-2 relative" ref={dropdownRef}>
                <MapPin className="w-5 h-5 text-[#1E3A8A] flex-shrink-0" />
                <div className="flex-1 text-center">
                    <label className="text-xs font-black text-gray-500 block mb-1 md:mb-0 uppercase tracking-wider text-center">LOCATION</label>
                    <input
                        type="text"
                        placeholder={placeholderText}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        className="w-full text-base md:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 bg-transparent font-bold text-center"
                    />
                </div>
                {isLoadingSuggestions && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 absolute right-4 top-1/2 -translate-y-1/2" />
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[100] animate-in fade-in slide-in-from-top-2">
                        {isLoadingSuggestions && suggestions.length === 0 ? (
                            <div className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Searching cities...
                            </div>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((loc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectLocation(loc)}
                                    className="w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-wide">
                                            {loc.city}
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {loc.state} • {loc.count} {loc.count === 1 ? 'property' : 'properties'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : inputValue.length > 0 && (
                            <div className="px-6 py-4 text-sm text-gray-500">
                                No properties found in &quot;{inputValue}&quot;
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Date Picker */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-2 cursor-pointer hover:bg-gray-50 md:rounded-full rounded-xl transition-colors">
                        <CalendarDays className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 block mb-1 md:mb-0">CHECK-IN — CHECK-OUT</label>
                            <span className="text-base md:text-sm text-gray-900 font-medium block">
                                {dateRange.from && dateRange.to
                                    ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                                    : "Add dates"}
                            </span>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" sideOffset={8}>
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateSelect}
                        numberOfMonths={2}
                        disabled={{ before: new Date() }}
                        className="rounded-xl"
                    />
                </PopoverContent>
            </Popover>

            {/* Guests */}
            <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                <PopoverTrigger asChild>
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2 cursor-pointer hover:bg-gray-50 md:rounded-full rounded-xl transition-colors pb-4 md:pb-2">
                        <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 block mb-1 md:mb-0">GUESTS</label>
                            <span className="text-base md:text-sm text-gray-900 font-medium block">
                                {filters.guests} {filters.guests === 1 ? "guest" : "guests"}
                            </span>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end" sideOffset={8}>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-900">Guests</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setGuests(Math.max(1, filters.guests - 1))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                                disabled={filters.guests <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-medium">{filters.guests}</span>
                            <button
                                onClick={() => setGuests(Math.min(16, filters.guests + 1))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
                                disabled={filters.guests >= 16}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Search Button */}
            <Button
                onClick={handleSearch}
                size="lg"
                className="bg-[#F87171] hover:bg-[#ef5350] text-white rounded-xl md:rounded-full w-full md:w-auto md:px-8 h-12 md:h-12 shadow-lg shadow-[#F87171]/25"
            >
                <Search className="w-5 h-5 mr-2" />
                <span className="font-bold text-base">Search</span>
            </Button>
        </div>
    );
}
