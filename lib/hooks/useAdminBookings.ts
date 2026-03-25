import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAdminBookings() {
    return useQuery({
        queryKey: ["admin", "bookings"],
        queryFn: async () => {
            const response = await fetch('/api/admin/bookings');
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            return data.bookings || [];
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}

export function useUpdateBookingStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
            const response = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update status');
            }
            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
            queryClient.invalidateQueries({ queryKey: ["bookings", variables.bookingId] });
        },
    });
}
