import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi, type Booking } from "../api";

export function useMyBookings() {
    return useQuery<Booking[]>({
        queryKey: ["bookings", "my"],
        queryFn: bookingsApi.getMyBookings,
    });
}

export function useBooking(id: string) {
    return useQuery({
        queryKey: ["bookings", id],
        queryFn: () => bookingsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bookingsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bookingsApi.cancel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
}
