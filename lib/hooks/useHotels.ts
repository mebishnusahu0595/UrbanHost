import { useQuery } from "@tanstack/react-query";
import { hotelsApi, type Hotel, type SearchParams } from "../api";

export function useTrendingHotels() {
    return useQuery<Hotel[]>({
        queryKey: ["hotels", "trending"],
        queryFn: hotelsApi.getTrending,
    });
}

export function useHotels(params?: any) {
    return useQuery<Hotel[]>({
        queryKey: ["hotels", params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.city) queryParams.append('city', params.city);
            if (params?.sort) queryParams.append('sort', params.sort);
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const response = await fetch(`/api/properties?${queryParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch hotels');
            const data = await response.json();
            // API returns { hotels: [...] } or { properties: [...] } - handle both
            return data.hotels || data.properties || data || [];
        },
    });
}

export function useSearchHotels(params: SearchParams, enabled = true) {
    return useQuery({
        queryKey: ["hotels", "search", params],
        queryFn: () => hotelsApi.search(params),
        enabled,
    });
}

export function useHotel(id: string) {
    return useQuery({
        queryKey: ["hotels", id],
        queryFn: () => hotelsApi.getById(id),
        enabled: !!id,
    });
}

export function useHotelReviews(id: string) {
    return useQuery({
        queryKey: ["hotels", id, "reviews"],
        queryFn: () => hotelsApi.getReviews(id),
        enabled: !!id,
    });
}
