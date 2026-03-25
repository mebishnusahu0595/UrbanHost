import { useQuery } from "@tanstack/react-query";
import { destinationsApi, type Destination } from "../api";

export function usePopularDestinations() {
    return useQuery<Destination[]>({
        queryKey: ["destinations", "popular"],
        queryFn: destinationsApi.getPopular,
    });
}
