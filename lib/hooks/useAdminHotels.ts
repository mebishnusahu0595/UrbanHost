
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const fetchHotels = async () => {
    // In a real app, you might have a specific admin endpoint or pass params to get all
    const res = await fetch("/api/hotels");
    if (!res.ok) throw new Error("Failed to fetch hotels");
    return res.json();
};

export const useAdminHotels = () => {
    return useQuery({
        queryKey: ["admin", "hotels"],
        queryFn: fetchHotels,
    });
};

export const updateHotelStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/hotels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update hotel");
    return res.json();
};

export const deleteHotel = async (id: string) => {
    const res = await fetch(`/api/hotels/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete hotel");
    return res.json();
};
