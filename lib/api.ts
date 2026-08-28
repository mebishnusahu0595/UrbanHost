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
    discount?: number;
    couponCode?: string;
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
        { id: "1", name: "New York", country: "United States", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9", propertyCount: 1450 },
        { id: "2", name: "Miami", country: "United States", image: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a", propertyCount: 890 },
        { id: "3", name: "Los Angeles", country: "United States", image: "https://images.unsplash.com/photo-1580655653885-65763b2597d0", propertyCount: 1120 },
        { id: "4", name: "Las Vegas", country: "United States", image: "https://images.unsplash.com/photo-1605833559746-6d2673002017", propertyCount: 760 },
        { id: "5", name: "San Francisco", country: "United States", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29", propertyCount: 640 },
        { id: "6", name: "Chicago", country: "United States", image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f", propertyCount: 820 },
        { id: "7", name: "Orlando", country: "United States", image: "https://images.unsplash.com/photo-1575089776834-8be34696ffb9", propertyCount: 980 },
        { id: "8", name: "Honolulu", country: "United States", image: "https://images.unsplash.com/photo-1542259009477-d625272157b7", propertyCount: 530 },
        { id: "9", name: "Seattle", country: "United States", image: "https://images.unsplash.com/photo-1502175353174-a7a70e73b362", propertyCount: 590 },
        { id: "10", name: "Austin", country: "United States", image: "https://images.unsplash.com/photo-1531218150217-54595bc2b934", propertyCount: 710 }
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
