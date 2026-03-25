"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MdHotel, MdSearch, MdEdit, MdVisibility, MdAdd, MdLocationOn, MdClose, MdBed, MdStar, MdPhone, MdEmail, MdAccessTime } from "react-icons/md";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface Property {
    _id: string;
    name: string;
    description?: string;
    address: {
        city: string;
        state: string;
        street?: string;
        zipCode?: string;
        country?: string;
    };
    location?: {
        type: string;
        coordinates: [number, number];
    };
    images?: string[];
    status: string;
    rooms: any[];
    rating?: number;
    amenities?: string[];
    price?: number;
    contactInfo?: {
        phone?: string;
        email?: string;
    };
    checkInTime?: string;
    checkOutTime?: string;
    createdAt: string;
}

export default function PropertiesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    
    // Check if user has edit access
    const canEdit = (session?.user as any)?.canEditHotels !== false;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user && !['propertyOwner', 'hotelOwner'].includes((session.user as any).role)) {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch("/api/property-owner/properties");
                if (response.ok) {
                    const data = await response.json();
                    setProperties(data.properties);
                }
            } catch (error) {
                console.error("Failed to fetch properties:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchProperties();
        }
    }, [session]);

    const filteredProperties = properties.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            approved: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            rejected: "bg-red-100 text-red-800",
            draft: "bg-gray-100 text-gray-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin border-blue-600 mx-auto mb-4" />
                    <p>Loading properties...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 pb-20 md:pb-6">
            {/* Access Level Banner */}
            {!canEdit && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <MdVisibility className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900">View-Only Access</p>
                                <p className="text-sm text-blue-700">You can view properties but cannot edit them. Contact admin for edit access.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">My Properties</h1>
                    <p className="text-sm md:text-lg text-muted-foreground mt-1">
                        Manage your property listings
                    </p>
                </div>
                <Link href="/property-owner/add-property" className="w-full md:w-auto">
                    <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-10 md:h-11 md:text-base" disabled={!canEdit}>
                        <MdAdd className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Add New Property
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg md:text-xl font-bold">All Properties</CardTitle>
                            <CardDescription className="text-xs md:text-base mt-1">
                                Total {filteredProperties.length} properties
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-auto">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search properties..."
                                className="pl-10 w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-2 md:pt-0">
                    {filteredProperties.length === 0 ? (
                        <div className="text-center py-8 md:py-12 text-muted-foreground">
                            <MdHotel className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-base md:text-lg font-medium">No properties yet</p>
                            <p className="text-xs md:text-sm mt-2">Add your first property to get started</p>
                            <Link href="/property-owner/add-property">
                                <Button className="mt-4" size="sm">Add Property</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProperties.map((property) => (
                                <Card key={property._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                                    {/* Property Image */}
                                    <div className="relative h-40 md:h-48 bg-gradient-to-br from-blue-100 to-blue-50">
                                        {property.images && property.images.length > 0 ? (
                                            <Image
                                                src={property.images[0]}
                                                alt={property.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <MdHotel className="h-16 w-16 text-blue-300" />
                                            </div>
                                        )}
                                        <Badge className={`absolute top-3 right-3 ${getStatusBadge(property.status)}`}>
                                            {property.status}
                                        </Badge>
                                        {property.rating && (
                                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                                                <MdStar className="h-4 w-4 text-yellow-500" />
                                                <span className="text-sm font-bold">{property.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <CardTitle className="text-base md:text-lg truncate">{property.name}</CardTitle>
                                                {(property.address?.city || property.address?.state) && (
                                                    <CardDescription className="mt-1 flex items-center gap-1 text-xs md:text-sm truncate">
                                                        <MdLocationOn className="h-3.5 w-3.5 flex-shrink-0" />
                                                        {property.address?.city && property.address?.state 
                                                            ? `${property.address.city}, ${property.address.state}`
                                                            : property.address?.city || property.address?.state}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="space-y-2 text-xs md:text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-2">
                                                <MdBed className="h-4 w-4 text-gray-400" />
                                                <span>{property.rooms?.length || 0} Room Types</span>
                                            </div>
                                            {property.price && (
                                                <p className="font-semibold text-blue-600">
                                                    Starting from {formatCurrency(property.price)}
                                                </p>
                                            )}
                                            <p className="text-gray-400 text-xs">
                                                Listed: {new Date(property.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 h-9 text-xs md:text-sm"
                                                onClick={() => { setActiveImageIndex(0); setSelectedProperty(property); }}
                                            >
                                                <MdVisibility className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4" />
                                                View
                                            </Button>
                                            {canEdit ? (
                                                <Link href={`/property-owner/properties/${property._id}/edit`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full h-9 text-xs md:text-sm">
                                                        <MdEdit className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 h-9 text-xs md:text-sm opacity-50 cursor-not-allowed" 
                                                    disabled
                                                    title="You have view-only access"
                                                >
                                                    <MdEdit className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4" />
                                                    Edit
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Property Details Modal */}
            {selectedProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header with Image */}
                        <div className="relative h-56 md:h-72">
                            {selectedProperty.images && selectedProperty.images.length > 0 ? (
                                <Image
                                    src={selectedProperty.images[activeImageIndex] || selectedProperty.images[0]}
                                    alt={selectedProperty.name}
                                    fill
                                    className="object-cover rounded-t-2xl"
                                />
                            ) : (
                                <div className="h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-t-2xl flex items-center justify-center">
                                    <MdHotel className="h-24 w-24 text-white/50" />
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedProperty(null)}
                                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                            >
                                <MdClose className="h-5 w-5" />
                            </button>
                            <Badge className={`absolute top-4 left-4 ${getStatusBadge(selectedProperty.status)}`}>
                                {selectedProperty.status}
                            </Badge>
                            {/* Image Gallery Thumbnails */}
                            {selectedProperty.images && selectedProperty.images.length > 1 && (
                                <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2">
                                    {selectedProperty.images.slice(0, 6).map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden border-2 shadow cursor-pointer transition-all ${activeImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-300' : 'border-white hover:border-blue-300'}`}
                                        >
                                            <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                    {selectedProperty.images.length > 6 && (
                                        <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-black/60 flex items-center justify-center text-white text-sm font-bold">
                                            +{selectedProperty.images.length - 6}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedProperty.name}</h2>
                                    {(selectedProperty.address?.city || selectedProperty.address?.state) && (
                                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                                            <MdLocationOn className="h-4 w-4" />
                                            {selectedProperty.address?.street && `${selectedProperty.address.street}, `}
                                            {selectedProperty.address?.city && selectedProperty.address?.state
                                                ? `${selectedProperty.address.city}, ${selectedProperty.address.state}`
                                                : selectedProperty.address?.city || selectedProperty.address?.state}
                                        </p>
                                    )}
                                </div>
                                {selectedProperty.rating && (
                                    <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
                                        <MdStar className="h-5 w-5 text-yellow-500" />
                                        <span className="font-bold">{selectedProperty.rating}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {selectedProperty.description && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{selectedProperty.description}</p>
                                </div>
                            )}

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <MdBed className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                                    <p className="font-bold text-lg">{selectedProperty.rooms?.length || 0}</p>
                                    <p className="text-xs text-gray-500">Room Types</p>
                                </div>
                                {selectedProperty.checkInTime && (
                                    <div className="bg-green-50 p-4 rounded-xl text-center">
                                        <MdAccessTime className="h-6 w-6 mx-auto text-green-600 mb-1" />
                                        <p className="font-bold text-lg">{selectedProperty.checkInTime}</p>
                                        <p className="text-xs text-gray-500">Check-in</p>
                                    </div>
                                )}
                                {selectedProperty.checkOutTime && (
                                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                                        <MdAccessTime className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                                        <p className="font-bold text-lg">{selectedProperty.checkOutTime}</p>
                                        <p className="text-xs text-gray-500">Check-out</p>
                                    </div>
                                )}
                                {selectedProperty.price && (
                                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                                        <p className="font-bold text-lg text-purple-600">{formatCurrency(selectedProperty.price)}</p>
                                        <p className="text-xs text-gray-500">Starting Price</p>
                                    </div>
                                )}
                            </div>

                            {/* Amenities */}
                            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-700 mb-3">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProperty.amenities.map((amenity, idx) => (
                                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rooms */}
                            {selectedProperty.rooms && selectedProperty.rooms.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-700 mb-3">Room Types</h3>
                                    <div className="space-y-3">
                                        {selectedProperty.rooms.map((room, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    {room.images && room.images.length > 0 ? (
                                                        <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                                                            <Image src={room.images[0]} alt={room.type} fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <MdBed className="h-6 w-6 text-blue-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{room.type}</p>
                                                        <p className="text-xs text-gray-500">Capacity: {room.capacity} guests</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-600">{formatCurrency(room.price)}</p>
                                                    <p className="text-xs text-gray-500">{room.available} available</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contact Info */}
                            {selectedProperty.contactInfo && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {selectedProperty.contactInfo.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MdPhone className="h-4 w-4" />
                                                <span className="text-sm">{selectedProperty.contactInfo.phone}</span>
                                            </div>
                                        )}
                                        {selectedProperty.contactInfo.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MdEmail className="h-4 w-4" />
                                                <span className="text-sm">{selectedProperty.contactInfo.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setSelectedProperty(null)}
                                >
                                    Close
                                </Button>
                                <Link href={`/property-owner/properties/${selectedProperty._id}/edit`} className="flex-1">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <MdEdit className="mr-2 h-4 w-4" />
                                        Edit Property
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
