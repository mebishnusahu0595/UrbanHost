import { create } from "zustand";

interface SearchFilters {
    location: string;
    checkIn: Date | null;
    checkOut: Date | null;
    guests: number;
    priceRange: [number, number];
    amenities: string[];
    rating: number | null;
    propertyType: string[];
}

interface SearchState {
    filters: SearchFilters;
    isSearching: boolean;
    setLocation: (location: string) => void;
    setDates: (checkIn: Date | null, checkOut: Date | null) => void;
    setGuests: (guests: number) => void;
    setPriceRange: (range: [number, number]) => void;
    setAmenities: (amenities: string[]) => void;
    setRating: (rating: number | null) => void;
    setPropertyType: (types: string[]) => void;
    setIsSearching: (isSearching: boolean) => void;
    resetFilters: () => void;
}

const initialFilters: SearchFilters = {
    location: "",
    checkIn: null,
    checkOut: null,
    guests: 1,
    priceRange: [0, 1000],
    amenities: [],
    rating: null,
    propertyType: [],
};

export const useSearchStore = create<SearchState>((set) => ({
    filters: initialFilters,
    isSearching: false,
    setLocation: (location) =>
        set((state) => ({ filters: { ...state.filters, location } })),
    setDates: (checkIn, checkOut) =>
        set((state) => ({ filters: { ...state.filters, checkIn, checkOut } })),
    setGuests: (guests) =>
        set((state) => ({ filters: { ...state.filters, guests } })),
    setPriceRange: (priceRange) =>
        set((state) => ({ filters: { ...state.filters, priceRange } })),
    setAmenities: (amenities) =>
        set((state) => ({ filters: { ...state.filters, amenities } })),
    setRating: (rating) =>
        set((state) => ({ filters: { ...state.filters, rating } })),
    setPropertyType: (propertyType) =>
        set((state) => ({ filters: { ...state.filters, propertyType } })),
    setIsSearching: (isSearching) => set({ isSearching }),
    resetFilters: () => set({ filters: initialFilters }),
}));
