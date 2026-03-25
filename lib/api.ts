// API configuration and base functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    headers?: Record<string, string>;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const config: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        credentials: "include",
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "An error occurred" }));
        throw new Error(error.message || "API request failed");
    }

    return response.json();
}

// Hotel types
export interface Room {
    _id?: string;
    id?: string;
    name?: string;
    type: string;
    price: number;
    taxes?: number;
    capacity?: number;
    guests?: number;
    amenities?: string[];
    images?: string[];
    image?: string;
    available?: number;
    bed?: string;
    size?: string;
    maxOccupancy?: number;
    features?: string[];
}

export interface Addon {
    name: string;
    price: number;
    description?: string;
}

export interface Hotel {
    _id: string;
    id?: string;
    name: string;
    description: string;
    propertyType: string;
    category?: string;
    featured: boolean;
    labels: string[];
    rating: number;
    totalReviews?: number;
    reviewCount?: number;
    images: string[];
    amenities: string[];
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    location?: {
        type: string;
        coordinates: number[];
    };
    embedUrl?: string;
    rooms: Room[];
    addons?: Addon[];
    highlights?: {
        coupleFriendly: string;
        bookAtZero: boolean;
        mobileDeal: string;
        cancellation: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface SearchParams {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    priceMin?: number;
    priceMax?: number;
    amenities?: string[];
    rating?: number;
    propertyType?: string[];
    page?: number;
    limit?: number;
}

export interface Destination {
    id: string;
    name: string;
    country: string;
    image: string;
    propertyCount: number;
}

export interface Booking {
    _id: string;
    id?: string;
    hotel: string | Hotel;
    user?: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        image?: string;
        createdAt: string;
    };
    guestInfo?: {
        name: string;
        email: string;
        phone: string;
    };
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfRooms: number;
    guests: {
        adults: number;
        children: number;
    };
    totalPrice: number;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    paymentStatus: "pending" | "paid" | "refunded";
    paymentMethod?: string;
    specialRequests?: string;
    createdAt: string;
}

export interface Review {
    id: string;
    _id?: string;
    hotelId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

// API functions
export const hotelsApi = {
    getTrending: () => api<{ hotels: Hotel[] }>("/properties?status=approved&limit=10").then(res => res.hotels),
    search: (params: SearchParams) => {
        const queryParams = new URLSearchParams();
        if (params.location) queryParams.set('city', params.location);
        return api<{ hotels: Hotel[] }>(`/properties?${queryParams.toString()}`).then(res => ({
            hotels: res.hotels || [],
            total: res.hotels?.length || 0,
            page: 1
        }));
    },
    getById: (id: string) => api<{ hotel: Hotel }>(`/properties/${id}`).then(res => res.hotel),
    getReviews: (id: string) => api<Review[]>(`/properties/${id}/reviews`).catch(() => []),
};

export const destinationsApi = {
    getPopular: () => Promise.resolve<Destination[]>([
        {
            id: "1",
            name: "Mumbai",
            country: "India",
            image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f",
            propertyCount: 250
        },
        {
            id: "2",
            name: "Delhi",
            country: "India",
            image: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
            propertyCount: 180
        },
        {
            id: "3",
            name: "Bangalore",
            country: "India",
            image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2",
            propertyCount: 150
        },
        {
            id: "4",
            name: "Goa",
            country: "India",
            image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
            propertyCount: 120
        }
    ]),
};

export const bookingsApi = {
    create: (data: any) => api<{ booking: Booking }>("/bookings", { method: "POST", body: data }).then(res => res.booking),
    getMyBookings: () => api<{ bookings: Booking[] }>("/bookings").then(res => res.bookings || []),
    getById: (id: string) => api<{ booking: Booking }>(`/bookings/${id}`).then(res => res.booking),
    cancel: (id: string) => api<{ booking: Booking }>(`/bookings/${id}`, { method: "PATCH", body: { status: "cancelled" } }).then(res => res.booking),
};

export const userApi = {
    getProfile: () => api<{ id: string; name: string; email: string; avatar?: string }>("/user/profile"),
    updateProfile: (data: { name?: string; email?: string; avatar?: string }) =>
        api("/user/profile", { method: "PUT", body: data }),
};
