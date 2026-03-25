"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, CheckCircle } from "lucide-react";
import Image from "next/image";
import Image1 from "../../public/google-maps-instruction.png";

interface GoogleMapsImportProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: {
        coordinates: { lat: number; lng: number };
        embedUrl: string;
        address?: {
            state?: string;
            city?: string;
            street?: string;
            zipCode?: string;
            country?: string;
            fullAddress?: string;
        };
    }) => void;
}

export function GoogleMapsImportModal({
    isOpen,
    onClose,
    onImport,
}: GoogleMapsImportProps) {
    const [mapUrl, setMapUrl] = useState("");
    const [error, setError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [lookupStatus, setLookupStatus] = useState("");
    const [detectedAddress, setDetectedAddress] = useState<any>(null);

    const parseGoogleMapsUrl = async (url: string) => {
        try {
            setError("");
            setIsProcessing(true);

            if (url.includes("<iframe")) {
                const srcMatch = url.match(/src="([^"]+)"/);
                if (srcMatch) url = srcMatch[1];
            }

            let lat: number | null = null;
            let lng: number | null = null;
            let embedUrl = "";

            const patterns = [
                /!2d([-\d.]+)!3d([-\d.]+)/,
                /@([-\d.]+),([-\d.]+)/,
                /!3d([-\d.]+)!4d([-\d.]+)/,
                /[?&]q=([-\d.]+),([-\d.]+)/,
                /ll=([-\d.]+),([-\d.]+)/,
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    // CRITICAL: Google Maps patterns have different orders for Lat/Lng
                    if (pattern.source.includes("!2d") && pattern.source.includes("!3d")) {
                        // !2d is Longitude, !3d is Latitude
                        lng = parseFloat(match[1]);
                        lat = parseFloat(match[2]);
                    } else if (pattern.source.includes("!3d") && pattern.source.includes("!4d")) {
                        // !3d is Latitude, !4d is Longitude
                        lat = parseFloat(match[1]);
                        lng = parseFloat(match[2]);
                    } else {
                        // Default for @lat,lng or q=lat,lng
                        lat = parseFloat(match[1]);
                        lng = parseFloat(match[2]);
                    }
                    if (!isNaN(lat) && !isNaN(lng)) break;
                }
            }

            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                // Ensure coordinates are within valid range (India is roughly Lat 8-37, Long 68-97)
                // If they are flipped (Lat > 60), swap them
                if (lat > 50 && lng < 50) {
                    console.warn("Coordinates appear to be flipped. Swapping.");
                    [lat, lng] = [lng, lat];
                }

                embedUrl = url.includes("google.com/maps/embed")
                    ? url
                    : `https://www.google.com/maps?q=${lat},${lng}&output=embed`;

                let addressInfo = undefined;
                setLookupStatus("Locating address details...");

                // Try to get address info via reverse geocoding (Nominatim - Free)
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                        headers: {
                            'Accept-Language': 'en',
                            'User-Agent': 'UrbanHost-Property-Importer'
                        }
                    });

                    if (!response.ok) throw new Error("Network error");

                    const geoData = await response.json();
                    console.log("Geocoding Raw Data:", geoData);

                    if (geoData && geoData.address) {
                        const a = geoData.address;
                        addressInfo = {
                            state: a.state || a.region || a.province || "",
                            city: a.city || a.town || a.village || a.suburb || a.city_district || a.municipality || "",
                            street: a.road || a.pedestrian || a.suburb || a.neighbourhood || a.locality || "",
                            zipCode: a.postcode || "",
                            country: a.country || "",
                            fullAddress: geoData.display_name || ""
                        };
                        setDetectedAddress(addressInfo);
                    }
                } catch (e) {
                    console.error("Reverse geocoding failed:", e);
                    setLookupStatus("Address details not found. Coordinates extracted.");
                }

                setLookupStatus("");
                onImport({ coordinates: { lat, lng }, embedUrl, address: addressInfo });

                // Show success feedback for a moment
                setTimeout(() => {
                    setMapUrl("");
                    setDetectedAddress(null);
                    onClose();
                }, addressInfo ? 800 : 300);
            } else {
                setError("Could not extract coordinates. Please paste a valid Google Maps URL.");
            }
        } catch {
            setError("Invalid URL format. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = () => {
        if (!mapUrl.trim()) {
            setError("Please paste a Google Maps URL");
            return;
        }
        parseGoogleMapsUrl(mapUrl);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[98vw] !max-w-none h-auto max-h-[95vh] p-8 sm:p-10 md:p-12 overflow-y-auto sm:max-w-none md:max-w-none lg:max-w-none">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-3 text-3xl">
                        <MapPin className="h-8 w-8 text-blue-600" />
                        Import from Google Maps
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8">
                    <p className="text-gray-600 text-center text-xl">
                        Share the location by following the steps below
                    </p>

                    <div className="space-y-4">
                        <label className="text-lg font-medium text-gray-700 text-center block">
                            <span className="text-red-500">*</span> Paste the link here
                        </label>
                        <div className="relative flex items-center">
                            <Input
                                placeholder="e.g https://www.google.com/maps/place/xxx or iframe code"
                                value={mapUrl}
                                onChange={(e) => {
                                    setMapUrl(e.target.value);
                                    setError("");
                                }}
                                className={`text-xl py-8 px-6 pr-28 ${error ? "border-red-500" : ""}`}
                            />
                            {mapUrl.trim() && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className="absolute right-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg h-auto rounded-lg shadow-sm transition-all active:scale-95"
                                >
                                    {isProcessing ? "..." : "OK"}
                                </Button>
                            )}
                        </div>
                        {error && (
                            <p className="text-lg text-red-500 text-center">{error}</p>
                        )}
                        {lookupStatus && (
                            <p className="text-lg text-blue-600 text-center animate-pulse">{lookupStatus}</p>
                        )}
                        {detectedAddress && (
                            <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-lg text-green-700 text-center animate-in fade-in zoom-in">
                                <p className="font-bold flex items-center justify-center gap-2 text-xl mb-2">
                                    <CheckCircle className="h-6 w-6" /> Address Detected
                                </p>
                                <p>{detectedAddress.city}, {detectedAddress.state}</p>
                            </div>
                        )}
                    </div>

                    {/* 🔥 Image size controlled - BIGGER */}
                    <div className="w-full flex justify-center">
                        <div className="relative w-full max-w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gray-50 border rounded-xl overflow-hidden shadow-sm">
                            <Image
                                src={Image1}
                                alt="Google Maps Instructions"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ImportFromMapsButton({ onClick, className }: { onClick: () => void, className?: string }) {
    return (
        <Button
            type="button"
            variant="outline"
            onClick={onClick}
            className={`inline-flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 ${className || ""}`}
        >
            <MapPin className="h-4 w-4" />
            Import from Google Maps
        </Button>
    );
}
