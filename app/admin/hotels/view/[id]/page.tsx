"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
    MapPin,
    Users,
    Check,
    ArrowLeft,
    Loader2,
    Heart,
    Building,
} from "lucide-react";
import { useHotel } from "@/lib/hooks/useHotels";
import { updateHotelStatus } from "@/lib/hooks/useAdminHotels";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminHotelViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: hotelId } = use(params);

    // Fetch real hotel data
    const { data: hotel, isLoading, error } = useHotel(hotelId);

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const queryClient = useQueryClient();

    const handleStatusUpdate = async (status: string) => {
        try {
            await updateHotelStatus(hotelId, status);
            queryClient.invalidateQueries({ queryKey: ["hotels", hotelId] });
            // Optionally force reload or show toast
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Error state
    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h2>
                    <p className="text-sm md:text-base text-gray-600 mb-6">The hotel details could not be retrieved.</p>
                    <Link href="/admin/hotels">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 md:px-8 text-sm md:text-base">
                            Back to Management
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const hotelImages = hotel.images && hotel.images.length > 0
        ? hotel.images
        : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format"];
    const hotelRooms = hotel.rooms || [];
    const hotelLocation = hotel.address ? `${hotel.address.city}, ${hotel.address.state}` : "Location";

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Admin Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href="/admin/hotels">
                            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 md:w-10 md:h-10">
                                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-sm md:text-xl font-bold text-gray-900 truncate max-w-[150px] md:max-w-none">Hotel Preview</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/addhotel?id=${hotel._id}`}>
                            <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 md:h-9">Edit</Button>
                        </Link>
                        {hotel.status === 'pending' && (
                            <>
                                <Button onClick={() => handleStatusUpdate('approved')} variant="default" size="sm" className="bg-green-600 hover:bg-green-700 h-8 md:h-9">Approve</Button>
                                <Button onClick={() => handleStatusUpdate('rejected')} variant="destructive" size="sm" className="h-8 md:h-9">Reject</Button>
                            </>
                        )}
                        <Badge variant={hotel.status === 'approved' ? 'default' : 'secondary'} className="h-8 hidden md:flex">
                            {hotel.status?.toUpperCase()}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-8">
                {/* Property Header */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6 gap-2">
                    <div>
                        <div className="flex justify-between items-center w-full md:w-auto">
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">{hotel.name}</h1>
                            <Badge variant={hotel.status === 'approved' ? 'default' : 'secondary'} className="h-6 flex md:hidden ml-2 flex-shrink-0">
                                {hotel.status?.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <span className="bg-green-600 text-white px-1.5 py-0.5 rounded-[4px] text-[10px] md:text-xs font-bold">{hotel.rating}/5</span>
                                <span className="font-medium">{hotel.reviewCount || 0} Ratings</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600">
                                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="truncate max-w-[200px] md:max-w-none">{hotelLocation}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 mb-6 md:mb-8 rounded-xl md:rounded-2xl overflow-hidden h-[250px] md:h-[500px] relative">
                    <div className="md:col-span-2 md:row-span-2 relative cursor-pointer h-full" onClick={() => { setActiveImageIndex(0); setIsGalleryOpen(true); }}>
                        <Image src={hotelImages[0]} alt={hotel.name} fill className="object-cover" />
                    </div>
                    {[1, 2, 3, 4].map((idx) => (
                        <div key={idx} className="hidden md:block relative cursor-pointer" onClick={() => { setActiveImageIndex(idx); setIsGalleryOpen(true); }}>
                            <Image src={hotelImages[idx] || hotelImages[0]} alt={hotel.name} fill className="object-cover" />
                        </div>
                    ))}
                    <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
                        <button
                            onClick={() => setIsGalleryOpen(true)}
                            className="bg-white/90 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold shadow-lg"
                        >
                            View Photos ({hotelImages.length})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        {/* Highlights */}
                        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-4 h-4 md:w-6 md:h-6 text-red-500 fill-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm md:text-base font-bold text-gray-900">Couple Friendly</p>
                                    <p className="text-xs md:text-sm text-gray-500">{hotel.highlights?.coupleFriendly || "Default policy"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm md:text-base font-bold text-gray-900">Cancellation Policy</p>
                                    <p className="text-xs md:text-sm text-gray-600">{hotel.highlights?.cancellation || "Standard policy"}</p>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-2">Description</h2>
                            <p className={`text-gray-600 leading-relaxed text-xs md:text-sm ${!showFullDescription && "line-clamp-4 md:line-clamp-6"}`}>
                                {hotel.description}
                            </p>
                            {hotel.description?.length > 200 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="text-blue-600 font-bold text-xs md:text-sm mt-2 flex items-center gap-1"
                                >
                                    {showFullDescription ? "Read less" : "Read more"}
                                </button>
                            )}
                        </section>

                        {/* Rooms List (Non-interactive for Admin) */}
                        <section className="space-y-4">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">Room Configurations</h2>
                            {hotelRooms.map((room: any) => (
                                <div key={room._id} className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-1/3 relative h-40 md:h-auto bg-gray-100">
                                            <Image src={room.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400"} alt={room.type} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 p-4">
                                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{room.type}</h3>
                                            <div className="grid grid-cols-2 gap-y-2 mb-4 text-[10px] md:text-xs text-gray-600">
                                                <div className="flex items-center gap-2"><Users className="w-3 h-3 md:w-4 md:h-4" /> Capacity: {room.capacity}</div>
                                                <div className="flex items-center gap-2"><Building className="w-3 h-3 md:w-4 md:h-4" /> {room.available} Rooms</div>
                                                {room.amenities?.slice(0, 4).map((amenity: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-green-600">
                                                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3" /> {amenity}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-3 md:pt-4 border-t border-gray-50 flex items-baseline">
                                                <span className="text-lg md:text-xl font-black text-gray-900">₹{room.price}</span>
                                                <span className="text-[10px] md:text-xs text-gray-500 font-medium ml-1">/ night base price</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Addons List */}
                        <section className="space-y-4">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-4">Property Addons (Extra Services)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hotel.addons && hotel.addons.length > 0 ? (
                                    hotel.addons.map((addon: any, index: number) => (
                                        <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{addon.name}</h3>
                                                {addon.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
                                                )}
                                            </div>
                                            <span className="font-black text-blue-600">₹{addon.price}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="md:col-span-2 text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-500 italic">No addons available for this property</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar with property info */}
                    <div className="lg:block">
                        <div className="sticky top-20 md:top-24 space-y-6">
                            <Card className="rounded-2xl md:rounded-3xl shadow-lg border-gray-100 overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3 md:pb-4 p-4 md:p-6">
                                    <CardTitle className="text-sm md:text-base font-bold text-gray-900">Property Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                                    <div className="flex justify-between items-center text-xs md:text-sm">
                                        <span className="text-gray-500 font-medium">Starting Price</span>
                                        <span className="text-lg md:text-xl font-black text-gray-900">₹{hotelRooms[0]?.price || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs md:text-sm border-t border-gray-50 pt-3 md:pt-4">
                                        <span className="text-gray-500 font-medium">Total Room Types</span>
                                        <span className="font-bold text-gray-900">{hotelRooms.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs md:text-sm border-t border-gray-50 pt-3 md:pt-4">
                                        <span className="text-gray-500 font-medium">Amenities</span>
                                        <span className="font-bold text-gray-900">{hotel.amenities?.length || 0}</span>
                                    </div>
                                    <div className="pt-4 md:pt-6">
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-xs text-blue-800 leading-relaxed font-bold">
                                            Admin Preview Mode. Booking functionality disabled.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Popup */}
            <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogContent className="max-w-5xl w-[95%] h-[60vh] md:h-[80vh] p-0 overflow-hidden bg-black border-none rounded-xl md:rounded-lg">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Image src={hotelImages[activeImageIndex]} alt="Gallery" fill className="object-contain" />
                        <button onClick={() => setActiveImageIndex((activeImageIndex - 1 + hotelImages.length) % hotelImages.length)} className="absolute left-2 md:left-4 p-1.5 md:p-2 bg-white/10 rounded-full text-white"><ArrowLeft className="w-5 h-5 md:w-6 md:h-6 rotate-180" /></button>
                        <button onClick={() => setActiveImageIndex((activeImageIndex + 1) % hotelImages.length)} className="absolute right-2 md:right-4 p-1.5 md:p-2 bg-white/10 rounded-full text-white"><ArrowLeft className="w-5 h-5 md:w-6 md:h-6" /></button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
