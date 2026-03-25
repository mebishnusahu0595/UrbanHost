"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Building2,
    Home,
    Hotel,
    MapPin,
    ArrowRight,
    Copy,
    Plus,
    Upload,
    Check,
    X,
    Save,
    Info,
    Loader2,
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { GoogleMapsImportModal, ImportFromMapsButton } from "@/components/ui/GoogleMapsImport";

type Step = "location" | "type" | "name" | "address" | "contact" | "overview" | "amenities" | "rooms" | "documents" | "photos" | "post-submission";

interface PropertyWizardProps {
    isEditMode?: boolean;
    initialData?: any;
    isAdmin?: boolean;
    propertyId?: string; // Add propertyId prop for edit mode
}

export default function PropertyWizard({ isEditMode, initialData, isAdmin, propertyId }: PropertyWizardProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState<Step>("location");
    const [submissionType, setSubmissionType] = useState<'draft' | 'submitted'>('draft');

    const [hoveredInfo, setHoveredInfo] = useState<{ title: string, desc: string, top: number, left: number } | null>(null);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const handleHover = (e: React.MouseEvent, title: string, desc: string) => {
        if (!sidebarRef.current) return;
        const sidebarRect = sidebarRef.current.getBoundingClientRect();

        // Hide on small screens where sidebar is hidden/collapsed
        if (sidebarRect.width === 0) return;

        setHoveredInfo({
            title,
            desc,
            top: e.clientY - 80,
            left: sidebarRect.left
        });
    };

    // Form State
    const [location, setLocation] = useState("IN");
    const [propertyType, setPropertyType] = useState<string | null>(null);
    const [propertyName, setPropertyName] = useState("");



    // Map State
    const [mapPos, setMapPos] = useState<[number, number] | null>(null);

    // Address State
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [streetAddressLocal, setStreetAddressLocal] = useState("");
    const [zipCode, setZipCode] = useState("");

    // Contact State
    const [phoneNumber, setPhoneNumber] = useState("");
    const [emailBusiness, setEmailBusiness] = useState("");
    const [emailReservation, setEmailReservation] = useState("");

    // Validation Errors
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Overview State
    const [starRating, setStarRating] = useState("");
    const [description, setDescription] = useState("");
    const [checkInTime, setCheckInTime] = useState("12:00");
    const [checkOutTime, setCheckOutTime] = useState("11:00");
    const [customAmenityInput, setCustomAmenityInput] = useState("");
    const [roomCustomInputs, setRoomCustomInputs] = useState<{ [key: number]: string }>({});


    const [cancellationPolicy, setCancellationPolicy] = useState("");
    const [petPolicy, setPetPolicy] = useState("No Pets Allowed");
    const [smokingPolicy, setSmokingPolicy] = useState("Non-Smoking");
    const [coupleFriendly, setCoupleFriendly] = useState(false);

    // Photos state
    const [exteriorPhotos, setExteriorPhotos] = useState<(string | File)[]>([]);
    const [interiorPhotos, setInteriorPhotos] = useState<(string | File)[]>([]);

    // Amenities & Rooms State
    const [amenities, setAmenities] = useState<string[]>([]);
    const [rooms, setRooms] = useState<any[]>([
        { type: "Standard Room", price: 2000, capacity: 2, available: 10, images: [] }
    ]);

    // Documents State - Comprehensive as per URBANHOST Requirements
    const [documents, setDocuments] = useState<{
        // KYC Documents
        panCard: File | string | null;

        ownerPhoto: File | string | null;
        // Property Documents
        ownershipProof: File | string | null;
        propertyAddressProof: File | string | null;
        googleLocationLink: string;
        // Business Documents
        gstCertificate: File | string | null;
        msmeRegistration: File | string | null;
        // Bank Details
        cancelledCheque: File | string | null;
        // Licenses & Compliance
        tradeLicense: File | string | null;
        fireSafetyCertificate: File | string | null;
        policeVerification: File | string | null;
        fssaiLicense: File | string | null;
        // Agreement
        signedAgreement: File | string | null;
        // Emergency Contacts
        emergencyContactName: string;
        emergencyContactPhone: string;
        alternateContactName: string;
        alternateContactPhone: string;
    }>({
        panCard: null,

        ownerPhoto: null,
        ownershipProof: null,
        propertyAddressProof: null,
        googleLocationLink: '',
        gstCertificate: null,
        msmeRegistration: null,
        cancelledCheque: null,
        tradeLicense: null,
        fireSafetyCertificate: null,
        policeVerification: null,
        fssaiLicense: null,
        signedAgreement: null,
        emergencyContactName: '',
        emergencyContactPhone: '',
        alternateContactName: '',
        alternateContactPhone: '',
    });

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleMapsModalOpen, setIsGoogleMapsModalOpen] = useState(false);
    const [googleMapsEmbedUrl, setGoogleMapsEmbedUrl] = useState("");

    // Auto-scroll to top on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [step]);

    // Navigation handlers
    const handleLocationNext = () => setStep("type");
    const handleTypeNext = () => { if (propertyType) setStep("name"); };
    const handleNameNext = () => { if (propertyName) setStep("address"); };
    const handleAddressNext = () => { if (state && city && streetAddress && zipCode) setStep("contact"); };
    const handleContactNext = () => {
        const errors: { [key: string]: string } = {};

        // Mobile Validation: Exactly 10 digits
        if (!/^\d{10}$/.test(phoneNumber)) {
            errors.phoneNumber = "Phone number must be exactly 10 digits.";
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailBusiness)) {
            errors.emailBusiness = "Invalid business email address.";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});
        if (phoneNumber && emailBusiness) setStep("overview");
    };

    const handleOverviewNext = () => setStep("amenities");
    const handleAmenitiesNext = () => setStep("rooms");
    const handleRoomsNext = () => setStep("documents");
    const handleDocumentsNext = () => setStep("photos");

    // State initialization for Edit Mode
    useEffect(() => {
        // Fetch property data if propertyId is provided
        const fetchPropertyData = async () => {
            if (propertyId && !isEditMode && !initialData) {
                try {
                    const response = await fetch(`/api/properties/${propertyId}`);
                    if (response.ok) {
                        const responseData = await response.json();
                        const propertyData = responseData.hotel || responseData;
                        loadPropertyData(propertyData);
                    }
                } catch (error) {
                    console.error('Failed to fetch property:', error);
                }
            } else if (isEditMode && initialData) {
                loadPropertyData(initialData);
            }
        };

        fetchPropertyData();
    }, [propertyId, isEditMode, initialData]);

    const loadPropertyData = (data: any) => {
        if (!data) return;

        setLocation(data.address?.country === "India" ? "IN" : "IN");
        setPropertyType(data.category?.toLowerCase() || data.propertyType || null);
        setPropertyName(data.name || "");

        setDescription(data.description || "");

        const addr = data.address || {};
        if (addr.country === "India" || !addr.country) {
            const states = State.getStatesOfCountry("IN");
            const matchedState = states.find(s => s.name === addr.state || s.isoCode === addr.state);
            if (matchedState) setState(matchedState.isoCode);
        }

        setCity(addr.city || "");
        setStreetAddress(addr.street || "");
        setStreetAddressLocal(addr.streetLocal || "");
        setZipCode(addr.zipCode || "");

        if (data.location?.coordinates) {
            const lat = data.location.coordinates[1];
            const lng = data.location.coordinates[0];
            setMapPos([lat, lng]);

            if (data.embedUrl) {
                setGoogleMapsEmbedUrl(data.embedUrl);
            } else {
                setGoogleMapsEmbedUrl(`https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`);
            }
        } else if (data.embedUrl) {
            setGoogleMapsEmbedUrl(data.embedUrl);
        }

        if (data.contactInfo) {
            const phoneRaw = data.contactInfo.phone || "";
            if (phoneRaw.includes("-")) {
                const parts = phoneRaw.split("-");
                setPhoneNumber(parts[1] || parts[0]);
            } else {
                setPhoneNumber(phoneRaw);
            }
            setEmailBusiness(data.contactInfo.email || "");
            setEmailReservation(data.contactInfo.website || "");
        }

        if (data.rating) {
            setStarRating(data.rating?.toString() || "");
        }

        if (data.checkInTime) setCheckInTime(data.checkInTime);
        if (data.checkOutTime) setCheckOutTime(data.checkOutTime);
        if (data.cancellationPolicy) setCancellationPolicy(data.cancellationPolicy);
        if (data.petPolicy) setPetPolicy(data.petPolicy);
        if (data.smokingPolicy) setSmokingPolicy(data.smokingPolicy);
        if (data.coupleFriendly !== undefined) setCoupleFriendly(data.coupleFriendly);

        setAmenities(data.amenities || []);
        setRooms(data.rooms || []);

        // Handle photos - support both formats
        if (data.photos) {
            setExteriorPhotos(data.photos.exterior || []);
            setInteriorPhotos(data.photos.interior || []);
        } else if (data.images) {
            setExteriorPhotos(data.images);
        }

        // Documents mapping
        if (data.documents) {
            setDocuments((prev: any) => ({ ...prev, ...data.documents }));
        }
    };

    const handleSaveDraft = async () => {
        setSubmissionType('draft');
        await handleSubmit('draft');
    };

    const handleFinalSubmit = async () => {
        setSubmissionType('submitted');
        setIsSuccessModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        await handleSubmit('submitted');
        setIsSuccessModalOpen(false);
    };

    const handleSubmit = async (status: 'draft' | 'submitted') => {
        setIsSubmitting(true);

        // Resolve Names
        const countryName = Country.getCountryByCode(location)?.name || location;
        const stateName = State.getStateByCodeAndCountry(state, location)?.name || state;

        try {
            // Upload all document files first
            console.log('Starting document upload process...');
            console.log('Documents state:', documents);
            const uploadedDocuments: any = {};
            let uploadCount = 0;
            let successCount = 0;
            let failCount = 0;

            for (const [key, value] of Object.entries(documents)) {
                if (value instanceof File) {
                    uploadCount++;
                    console.log(`Uploading ${key} (${value.name}, ${value.size} bytes)...`);

                    // Upload file
                    const formData = new FormData();
                    formData.append('file', value);

                    try {
                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                        });

                        const uploadData = await uploadRes.json();

                        if (uploadRes.ok && uploadData.url) {
                            uploadedDocuments[key] = uploadData.url;
                            successCount++;
                            console.log(`✓ Uploaded ${key}:`, uploadData.url);
                        } else {
                            failCount++;
                            console.error(`✗ Failed to upload ${key}:`, uploadData.error || 'Unknown error');
                            alert(`Failed to upload ${key}: ${uploadData.error || 'Unknown error'}`);
                        }
                    } catch (uploadErr) {
                        failCount++;
                        console.error(`✗ Error uploading ${key}:`, uploadErr);
                        alert(`Error uploading ${key}: ${uploadErr}`);
                    }
                } else if (typeof value === 'string' && value.trim() !== '') {
                    // Already a string (URL or text)
                    uploadedDocuments[key] = value;
                    console.log(`Using existing string for ${key}:`, value.substring(0, 50) + '...');
                }
            }

            console.log(`Document upload complete: ${successCount}/${uploadCount} files uploaded successfully, ${failCount} failed`);
            console.log('Final uploadedDocuments:', uploadedDocuments);

            // Upload Property Images (Exterior & Interior)
            const uploadImage = async (file: File) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) return data.url;
                throw new Error(data.error || 'Upload failed');
            };

            const processImages = async (images: (string | File)[]) => {
                return await Promise.all(images.map(async (img) => {
                    if (img instanceof File) {
                        return await uploadImage(img);
                    }
                    return img;
                }));
            };

            const payloadExteriorPhotos = await processImages(exteriorPhotos);
            const payloadInteriorPhotos = await processImages(interiorPhotos);

            // Upload Room Images
            const payloadRooms = await Promise.all(rooms.map(async (room) => {
                const roomImages = room.images ? await processImages(room.images) : [];
                return { ...room, price: Number(room.price), images: roomImages };
            }));

            const payload: any = {
                name: propertyName,
                description,
                propertyType,
                address: {
                    street: streetAddress,
                    city,
                    state: stateName,
                    zipCode,
                    country: countryName
                },
                contactInfo: {
                    phone: `91-${phoneNumber}`, // Hardcoded 91 as per current UI assumption
                    email: emailBusiness,
                    website: emailReservation
                },
                location: {
                    type: 'Point',
                    coordinates: mapPos ? [mapPos[1], mapPos[0]] : [0, 0] // GeoJSON [lng, lat]
                },
                embedUrl: googleMapsEmbedUrl || "",
                rating: Number(starRating),
                totalReviews: 0,
                checkInTime,
                checkOutTime,
                price: rooms.length > 0 ? Number(rooms[0].price) : 0,
                policies: {
                    cancellation: cancellationPolicy,
                    petPolicy,
                    smokingPolicy
                },
                highlights: {
                    coupleFriendly,
                    bookAtZero: false,
                    mobileDeal: "",
                    cancellation: ""
                },
                amenities,

                rooms: payloadRooms,
                images: [...payloadExteriorPhotos, ...payloadInteriorPhotos],
                status: isAdmin ? 'approved' : status, // If admin, set to approved, otherwise use draft/submitted
                documents: uploadedDocuments,
                owner: "" // handled by backend session
            };

            // Fallback for embedUrl if not set via map importer
            if (!payload.embedUrl && (uploadedDocuments as any).googleLocationLink) {
                const link = (uploadedDocuments as any).googleLocationLink;
                if (link.includes('google.com/maps')) {
                    // Try to make it an embed link if it isn't one
                    payload.embedUrl = link.includes('embed') ? link : `https://www.google.com/maps?q=${mapPos ? `${mapPos[0]},${mapPos[1]}` : ''}&output=embed`;
                } else if (link.startsWith('http')) {
                    payload.embedUrl = link;
                }
            }

            console.log('Submitting with documents:', uploadedDocuments);

            const url = isEditMode && initialData?._id ? `/api/properties/${initialData._id}` : (isAdmin ? '/api/properties' : '/api/property-panel/properties');
            const method = isEditMode ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                if (status === 'draft' && !isEditMode) { // Only redirect to dashboard if new draft
                    const userRole = (session?.user as any)?.role;
                    if (userRole === 'propertyOwner' || userRole === 'hotelOwner') {
                        router.push('/property-owner/properties');
                    } else {
                        router.push('/property-panel/dashboard');
                    }
                } else {
                    setStep("post-submission");
                }
            } else {
                const err = await res.json();
                alert(`Submission failed: ${err.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-[#0f294d] pb-24">
            <main className="max-w-6xl mx-auto px-4 py-8">

                {/* Progress Bar */}
                {step !== "post-submission" && (
                    <div className="flex gap-1 mb-8 max-w-3xl mx-auto">
                        <div className={`h-1.5 flex-1 rounded-full ${["location", "type", "name", "address", "contact"].indexOf(step) >= 0 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full ${["overview", "amenities", "rooms", "photos"].indexOf(step) >= 0 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                    </div>
                )}

                <div className="flex justify-center">
                    <div className="relative w-full max-w-4xl">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-10 min-h-[500px] w-full z-10">

                            {step === "location" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-4">Start listing your property</h1>
                                    <div className="mb-8">
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Country or region</label>
                                        <Select value={location} onValueChange={setLocation}>
                                            <SelectTrigger className="w-full h-12 text-base bg-white border-gray-300"><SelectValue placeholder="Select country" /></SelectTrigger>
                                            <SelectContent>
                                                {Country.getAllCountries().map((country) => (
                                                    <SelectItem key={country.isoCode} value={country.isoCode}>
                                                        <span className="flex items-center gap-2">
                                                            <span>{country.flag}</span>
                                                            {country.name}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <WizardFooter onNext={handleLocationNext} />
                                </div>
                            )}

                            {step === "type" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-8">What kind of property is it?</h1>


                                    {/* Hover info display removed from here, now in sidebar */}

                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Frequently selected</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        {[
                                            { id: "hotel", label: "Hotel", icon: Hotel, desc: "An establishment providing accommodation, meals, and other services for travelers and tourists." },
                                            { id: "apartment", label: "Apartment", icon: Building2, desc: "A self-contained housing unit that occupies only part of a building." },
                                            { id: "homestay", label: "Homestay", icon: Home, desc: "An accommodation where guests stay in the home of a local family." }
                                        ].map((type) => (
                                            <div
                                                key={type.id}
                                                onClick={() => {
                                                    setPropertyType(type.id);
                                                    setStep("name");
                                                    setHoveredInfo(null);
                                                }}
                                                onMouseMove={(e) => handleHover(e, type.label, type.desc)}
                                                onMouseLeave={() => setHoveredInfo(null)}
                                                className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 h-32 hover:border-blue-500 hover:bg-blue-50/30 ${propertyType === type.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
                                            >
                                                <type.icon className={`w-8 h-8 ${propertyType === type.id ? "text-blue-600" : "text-gray-400"}`} />
                                                <span className="font-bold">{type.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Other property types</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        {[
                                            { id: "resort", label: "Resort", desc: "A place seeking to provide recreation and entertainment in addition to accommodation." },
                                            { id: "villa", label: "Villa", desc: "A large and luxurious country residence, often renting entirely to one group." },
                                            { id: "vacation_home", label: "Vacation home", desc: "A furnished apartment or house let on a temporary basis to tourists." },
                                            { id: "guest_house", label: "Guest house", desc: "A private house offering accommodation to paying guests." },
                                            { id: "inn", label: "Inn", desc: "A small hotel/pub, usually providing accommodation, food, and drink." },
                                            { id: "bnb", label: "Bed and breakfast", desc: "Accommodation offering overnight stay and breakfast." },
                                            { id: "motel", label: "Motel", desc: "A roadside hotel designed primarily for motorists." },
                                            { id: "hostel", label: "Hostel", desc: "An establishment which provides inexpensive food and lodging for specific groups of people." },
                                            { id: "capsule_hotel", label: "Capsule hotel", desc: "A hotel featuring many small bed-sized rooms." },
                                            { id: "love_hotel", label: "Love hotel", desc: "A hotel that can be hired by the hour." },
                                            { id: "serviced_apt", label: "Serviced apartment", desc: "A fully furnished apartment suitable for short or long-term stays." },
                                            { id: "campsite", label: "Campsite", desc: "A place used for camping." },
                                            { id: "country_house", label: "Country house", desc: "A house in the country, often with extensive grounds." },
                                            { id: "farm_stay", label: "Farm stay", desc: "Any accommodation on a working farm." },
                                            { id: "lodge", label: "Lodge", desc: "A small house at the gates of a park or in a forest." },
                                            { id: "chalet", label: "Chalet", desc: "A wooden house or cottage with overhanging eaves." },
                                            { id: "holiday_park", label: "Holiday park", desc: "An accommodation complex with various amenities." },
                                            { id: "cruise", label: "Cruise", desc: "A large ship that carries people on voyages for pleasure." },
                                            { id: "boat", label: "Boat", desc: "Accommodation on a watercraft." },
                                            { id: "unique_stay", label: "Unique Stays", desc: "Unconventional accommodation types." }
                                        ].map((type) => (
                                            <div
                                                key={type.id}
                                                onClick={() => {
                                                    setPropertyType(type.id);
                                                    setStep("name");
                                                    setHoveredInfo(null);
                                                }}
                                                onMouseMove={(e) => handleHover(e, type.label, type.desc)}
                                                onMouseLeave={() => setHoveredInfo(null)}

                                                className={`cursor-pointer h-14 px-4 rounded-xl border transition-all flex items-center gap-4 hover:border-blue-500 hover:bg-blue-50/10 ${propertyType === type.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${propertyType === type.id ? "border-blue-600" : "border-gray-300"}`}>
                                                    {propertyType === type.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                                </div>
                                                <span className="font-medium">{type.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <WizardFooter onNext={handleTypeNext} onBack={() => setStep("location")} disabled={!propertyType} />
                                </div>
                            )}

                            {step === "name" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-8">Property Name</h1>
                                    <div className="mb-8 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Property name (English)</label>
                                            <Input
                                                className="h-12 border-gray-300 text-base"
                                                placeholder="e.g. Urban Luxury Hotel"
                                                value={propertyName}
                                                onChange={(e) => setPropertyName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <WizardFooter onNext={handleNameNext} onBack={() => setStep("type")} disabled={!propertyName} />
                                </div>
                            )}

                            {step === "address" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6">
                                        <h1 className="text-2xl font-bold text-center md:text-left">Location Details</h1>
                                    </div>

                                    {/* Google Maps Section */}
                                    <div className="mb-8 h-[400px] rounded-xl overflow-hidden border border-gray-200 relative bg-gray-50 flex flex-col items-center justify-center">
                                        {googleMapsEmbedUrl ? (
                                            <div className="relative w-full h-full">
                                                <iframe
                                                    src={googleMapsEmbedUrl}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                                <div className="absolute top-4 right-4 z-[100]">
                                                    <Button size="sm" onClick={() => setIsGoogleMapsModalOpen(true)} className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 font-bold shadow-sm gap-2">
                                                        <MapPin className="w-4 h-4" /> Change Location
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-6">
                                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <MapPin className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Import Location from Google Maps</h3>
                                                <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                                                    To display the precise location map, please import the location using the button below.
                                                </p>
                                                <div className="flex justify-center w-full">
                                                    <ImportFromMapsButton onClick={() => setIsGoogleMapsModalOpen(true)} className="ml-[7px]" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Coordinates Display */}
                                        {mapPos && (
                                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-mono border z-[10]">
                                                Lat: {mapPos[0].toFixed(5)} | Long: {mapPos[1].toFixed(5)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div><label className="block text-sm font-bold mb-1 text-gray-700">Country or region</label><div className="text-xl font-bold text-gray-900 flex items-center gap-2"><span>{Country.getCountryByCode(location)?.flag}</span>{Country.getCountryByCode(location)?.name}</div></div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">State or province</label>
                                            <Select value={state} onValueChange={(val) => { setState(val); setCity(""); }}>
                                                <SelectTrigger className="w-full h-12 text-base bg-white border-gray-300"><SelectValue placeholder="Select state" /></SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {State.getStatesOfCountry(location).map(s => (
                                                        <SelectItem key={s.isoCode} value={s.isoCode}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">City</label>
                                            <Select value={city} onValueChange={setCity}>
                                                <SelectTrigger className="w-full h-12 text-base bg-white border-gray-300"><SelectValue placeholder="Select city" /></SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {state ? (
                                                        City.getCitiesOfState(location, state).map(c => (
                                                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-gray-500">Select a state first</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-gray-700">Street address</label>
                                            <Input className="h-12 border-gray-300 text-base" placeholder="e.g. 123 Main St" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
                                            <p className="text-xs text-gray-500 mt-1">Search on the map above to auto-fill.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-gray-700">Zip Code / Pincode</label>
                                            <Input
                                                className="h-12 border-gray-300 text-base"
                                                placeholder="e.g. 110001"
                                                value={zipCode}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setZipCode(val);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <WizardFooter onNext={handleAddressNext} onBack={() => setStep("name")} disabled={!state || !city || !streetAddress || !zipCode} />
                                </div>
                            )}

                            {step === "contact" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-8">Contact Information</h1>
                                    <div className="space-y-6 mb-8">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone number <span className="text-red-500">*</span> (10 digits)</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                                                    +91
                                                </span>
                                                <Input
                                                    className="h-12 border-gray-300 text-base rounded-l-none"
                                                    placeholder="9876543210"
                                                    value={phoneNumber}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setPhoneNumber(val);
                                                    }}
                                                    maxLength={10}
                                                />
                                            </div>
                                            {phoneNumber && phoneNumber.length !== 10 && (
                                                <p className="text-xs text-red-500 mt-1">Phone must be exactly 10 digits</p>
                                            )}
                                            {validationErrors.phoneNumber && (
                                                <p className="text-xs text-red-500 mt-1">{validationErrors.phoneNumber}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email address <span className="text-red-500">*</span> (include @ and .com)</label>
                                            <Input
                                                className="h-12 border-gray-300 text-base"
                                                placeholder="business@example.com"
                                                value={emailBusiness}
                                                onChange={(e) => setEmailBusiness(e.target.value)}
                                            />
                                            {emailBusiness && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBusiness) && (
                                                <p className="text-xs text-red-500 mt-1">Enter valid email (e.g. name@domain.com)</p>
                                            )}
                                            {validationErrors.emailBusiness && (
                                                <p className="text-xs text-red-500 mt-1">{validationErrors.emailBusiness}</p>
                                            )}
                                        </div>
                                    </div>
                                    <WizardFooter onNext={handleContactNext} onBack={() => setStep("address")} disabled={!phoneNumber || phoneNumber.length !== 10 || !emailBusiness || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBusiness)} />
                                </div>
                            )}

                            {step === "overview" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-8">Property Details</h1>
                                    <div className="space-y-6 mb-8">
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label><textarea className="w-full p-3 border border-gray-300 rounded-md h-32 text-base" placeholder="Describe your property..." value={description} onChange={(e) => setDescription(e.target.value)} /></div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Star rating</label><Select value={starRating} onValueChange={setStarRating}><SelectTrigger className="h-12 bg-white border-gray-300"><SelectValue placeholder="Select star rating" /></SelectTrigger><SelectContent><SelectItem value="1">1 Star</SelectItem><SelectItem value="2">2 Stars</SelectItem><SelectItem value="3">3 Stars</SelectItem><SelectItem value="4">4 Stars</SelectItem><SelectItem value="5">5 Stars</SelectItem></SelectContent></Select></div>
                                            <div className="flex items-center space-x-2 pt-8">
                                                <input type="checkbox" id="coupleFriendly" checked={coupleFriendly} onChange={(e) => setCoupleFriendly(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                <label htmlFor="coupleFriendly" className="text-sm font-bold text-gray-700">Couple Friendly</label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Check-in Time</label><Input type="time" className="h-12 border-gray-300 text-base" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} /></div>
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Check-out Time</label><Input type="time" className="h-12 border-gray-300 text-base" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} /></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Pet Policy</label><Select value={petPolicy} onValueChange={setPetPolicy}><SelectTrigger className="h-12 bg-white border-gray-300"><SelectValue placeholder="Select pet policy" /></SelectTrigger><SelectContent><SelectItem value="Pets Allowed">Pets Allowed</SelectItem><SelectItem value="No Pets Allowed">No Pets Allowed</SelectItem></SelectContent></Select></div>
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Smoking Policy</label><Select value={smokingPolicy} onValueChange={setSmokingPolicy}><SelectTrigger className="h-12 bg-white border-gray-300"><SelectValue placeholder="Select smoking policy" /></SelectTrigger><SelectContent><SelectItem value="Smoking Allowed">Smoking Allowed</SelectItem><SelectItem value="Non-Smoking">Non-Smoking</SelectItem></SelectContent></Select></div>
                                        </div>
                                    </div>
                                    <WizardFooter onNext={handleOverviewNext} onBack={() => setStep("contact")} disabled={!description || !starRating || !checkInTime || !checkOutTime} />
                                </div>
                            )}

                            {step === "amenities" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-4">Amenities</h1>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        {["WiFi", "Parking", "AC", "TV", "Pool", "Gym"].map((amenity) => (
                                            <div
                                                key={amenity}
                                                onClick={() => {
                                                    if (amenities.includes(amenity)) setAmenities(amenities.filter(a => a !== amenity));
                                                    else setAmenities([...amenities, amenity]);
                                                }}
                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${amenities.includes(amenity) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"}`}
                                            >
                                                <span className="text-sm font-bold">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-12">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Custom Amenities</label>
                                        <div className="flex gap-2 mb-4">
                                            <Input
                                                placeholder="Add custom amenity (e.g. Garden, Fireplace)"
                                                value={customAmenityInput}
                                                onChange={(e) => setCustomAmenityInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = customAmenityInput.trim();
                                                        if (val && !amenities.includes(val)) {
                                                            setAmenities([...amenities, val]);
                                                            setCustomAmenityInput("");
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    const val = customAmenityInput.trim();
                                                    if (val && !amenities.includes(val)) {
                                                        setAmenities([...amenities, val]);
                                                        setCustomAmenityInput("");
                                                    }
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Add
                                            </Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {amenities.filter(a => !["WiFi", "Parking", "AC", "TV", "Pool", "Gym"].includes(a)).map(amenity => (
                                                <div key={amenity} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                    {amenity}
                                                    <button onClick={() => setAmenities(amenities.filter(a => a !== amenity))} className="text-white bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors shadow-sm"><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <WizardFooter onNext={handleAmenitiesNext} onBack={() => setStep("overview")} />
                                </div>
                            )}

                            {step === "rooms" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-4">Rooms</h1>
                                    <div className="space-y-6 mb-12">
                                        {rooms.map((room, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-xl border relative">
                                                <button onClick={() => setRooms(rooms.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 p-1 rounded-full shadow-md transition-all hover:scale-110"><X className="w-5 h-5" /></button>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="text-xs font-bold uppercase">Type</label><Input value={room.type} onChange={(e) => { const n = [...rooms]; n[index].type = e.target.value; setRooms(n); }} /></div>
                                                    <div><label className="text-xs font-bold uppercase">Price</label><Input type="number" value={room.price} onChange={(e) => { const n = [...rooms]; n[index].price = parseInt(e.target.value); setRooms(n); }} /></div>
                                                </div>

                                                <div className="mt-4">
                                                    <label className="block text-xs font-bold uppercase mb-2">Room Amenities</label>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {["TV", "AC", "WiFi", "Heater", "Iron", "Wardrobe", "Balcony", "Bathtub", "Minibar", "Kettle"].map((a) => (
                                                            <button
                                                                key={a}
                                                                onClick={() => {
                                                                    const n = [...rooms];
                                                                    const current = n[index].amenities || [];
                                                                    if (current.includes(a)) {
                                                                        n[index].amenities = current.filter((x: string) => x !== a);
                                                                    } else {
                                                                        n[index].amenities = [...current, a];
                                                                    }
                                                                    setRooms(n);
                                                                }}
                                                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${(room.amenities || []).includes(a)
                                                                    ? "bg-blue-600 text-white border-blue-600"
                                                                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                                                                    }`}
                                                            >
                                                                {a}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Add custom amenity..."
                                                            className="h-8 text-xs"
                                                            value={roomCustomInputs[index] || ""}
                                                            onChange={(e) => setRoomCustomInputs({ ...roomCustomInputs, [index]: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const val = (roomCustomInputs[index] || "").trim();
                                                                    if (val) {
                                                                        const n = [...rooms];
                                                                        const current = n[index].amenities || [];
                                                                        if (!current.includes(val)) {
                                                                            n[index].amenities = [...current, val];
                                                                            setRooms(n);
                                                                            setRoomCustomInputs({ ...roomCustomInputs, [index]: "" });
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => {
                                                                const val = (roomCustomInputs[index] || "").trim();
                                                                if (val) {
                                                                    const n = [...rooms];
                                                                    const current = n[index].amenities || [];
                                                                    if (!current.includes(val)) {
                                                                        n[index].amenities = [...current, val];
                                                                        setRooms(n);
                                                                        setRoomCustomInputs({ ...roomCustomInputs, [index]: "" });
                                                                    }
                                                                }
                                                            }}
                                                            className="h-8 text-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            Add
                                                        </Button>
                                                    </div>
                                                    {room.amenities && room.amenities.filter((a: string) => !["TV", "AC", "WiFi", "Heater", "Iron", "Wardrobe", "Balcony", "Bathtub", "Minibar", "Kettle"].includes(a)).length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {room.amenities.filter((a: string) => !["TV", "AC", "WiFi", "Heater", "Iron", "Wardrobe", "Balcony", "Bathtub", "Minibar", "Kettle"].includes(a)).map((a: string) => (
                                                                <span key={a} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                                                    {a}
                                                                    <button
                                                                        onClick={() => {
                                                                            const n = [...rooms];
                                                                            n[index].amenities = (n[index].amenities || []).filter((x: string) => x !== a);
                                                                            setRooms(n);
                                                                        }}
                                                                        className="text-white bg-red-500 hover:bg-red-600 rounded-full p-0.5 transition-colors shadow-sm"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-4 border-t pt-4">
                                                    <label className="block text-xs font-bold uppercase mb-2">Room Images</label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {(room.images || []).map((img: string | File, imgIdx: number) => (
                                                            <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                                                                <img src={img instanceof File ? URL.createObjectURL(img) : img} alt="Room" className="object-cover w-full h-full" />
                                                                <button
                                                                    onClick={() => {
                                                                        const newRooms = [...rooms];
                                                                        newRooms[index].images = newRooms[index].images.filter((_: string, i: number) => i !== imgIdx);
                                                                        setRooms(newRooms);
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg z-10 transition-all hover:scale-110"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 aspect-square transition-all hover:border-blue-400">
                                                            <Plus className="w-5 h-5 text-gray-400" />
                                                            <span className="text-[10px] text-gray-500 mt-1 font-bold">Add Photo</span>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    if (e.target.files) {
                                                                        const files = Array.from(e.target.files);
                                                                        const newRooms = [...rooms];
                                                                        if (!newRooms[index].images) newRooms[index].images = [];
                                                                        newRooms[index].images.push(...files);
                                                                        setRooms(newRooms);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button onClick={() => setRooms([...rooms, { type: "New Room", price: 2000, capacity: 2, available: 5, images: [], amenities: [] }])} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Room</Button>
                                    </div>
                                    <WizardFooter onNext={handleRoomsNext} onBack={() => setStep("amenities")} />
                                </div>
                            )}

                            {step === "documents" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-2">Required Documents</h1>
                                    <p className="text-gray-600 mb-6">Upload verification documents. Fields marked with * are mandatory.</p>

                                    <div className="space-y-4 mb-6">
                                        {/* PAN Card */}
                                        <div className="p-4 bg-gray-50 rounded-lg border">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">PAN Card <span className="text-red-500">*</span></label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, panCard: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.panCard && (
                                                    <a
                                                        href={documents.panCard instanceof File ? URL.createObjectURL(documents.panCard) : documents.panCard}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.panCard && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>



                                        {/* Address Proof */}
                                        <div className="p-4 bg-gray-50 rounded-lg border">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Address Proof (Utility Bill) <span className="text-red-500">*</span></label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, propertyAddressProof: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.propertyAddressProof && (
                                                    <a
                                                        href={documents.propertyAddressProof instanceof File ? URL.createObjectURL(documents.propertyAddressProof) : documents.propertyAddressProof}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.propertyAddressProof && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* Ownership Proof */}
                                        <div className="p-4 bg-gray-50 rounded-lg border">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Ownership Proof (Property Papers) <span className="text-red-500">*</span></label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, ownershipProof: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.ownershipProof && (
                                                    <a
                                                        href={documents.ownershipProof instanceof File ? URL.createObjectURL(documents.ownershipProof) : documents.ownershipProof}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.ownershipProof && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* Google Location */}
                                        <div className="p-4 bg-gray-50 rounded-lg border">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Google Maps Location Link <span className="text-red-500">*</span></label>
                                            <Input placeholder="https://maps.google.com/..." value={documents.googleLocationLink}
                                                onChange={(e) => setDocuments(prev => ({ ...prev, googleLocationLink: e.target.value }))}
                                            />
                                        </div>

                                        {/* Bank Details */}
                                        <div className="p-4 bg-gray-50 rounded-lg border">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Cancelled Cheque / Bank Passbook <span className="text-red-500">*</span></label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, cancelledCheque: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.cancelledCheque && (
                                                    <a
                                                        href={documents.cancelledCheque instanceof File ? URL.createObjectURL(documents.cancelledCheque) : documents.cancelledCheque}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.cancelledCheque && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* Signed Agreement */}
                                        <div className="p-4 bg-gray-50 rounded-lg border">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Signed URBANHOST Agreement <span className="text-red-500">*</span></label>
                                            <p className="text-xs text-gray-500 mb-2">PDF only</p>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, signedAgreement: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.signedAgreement && (
                                                    <a
                                                        href={documents.signedAgreement instanceof File ? URL.createObjectURL(documents.signedAgreement) : documents.signedAgreement}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.signedAgreement && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* GST (Optional) */}
                                        <div className="p-4 bg-gray-50/50 rounded-lg border border-dashed">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">GST Certificate (Optional)</label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, gstCertificate: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.gstCertificate && (
                                                    <a
                                                        href={documents.gstCertificate instanceof File ? URL.createObjectURL(documents.gstCertificate) : documents.gstCertificate}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.gstCertificate && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* Passport Photo */}
                                        <div className="p-4 bg-gray-50 rounded-lg border">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Passport-size Photograph <span className="text-red-500">*</span></label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, ownerPhoto: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.ownerPhoto && (
                                                    <a
                                                        href={documents.ownerPhoto instanceof File ? URL.createObjectURL(documents.ownerPhoto) : documents.ownerPhoto}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.ownerPhoto && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* MSME */}
                                        <div className="p-4 bg-gray-50/50 rounded-lg border border-dashed">
                                            <label className="block text-sm font-bold text-gray-600 mb-2">MSME / Udyam Registration (Optional)</label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, msmeRegistration: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.msmeRegistration && (
                                                    <a
                                                        href={documents.msmeRegistration instanceof File ? URL.createObjectURL(documents.msmeRegistration) : documents.msmeRegistration}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.msmeRegistration && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* Trade License */}
                                        <div className="p-4 bg-gray-50/50 rounded-lg border border-dashed">
                                            <label className="block text-sm font-bold text-gray-600 mb-2">Trade License (Optional)</label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, tradeLicense: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.tradeLicense && (
                                                    <a
                                                        href={documents.tradeLicense instanceof File ? URL.createObjectURL(documents.tradeLicense) : documents.tradeLicense}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.tradeLicense && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* Fire Safety */}
                                        <div className="p-4 bg-gray-50/50 rounded-lg border border-dashed">
                                            <label className="block text-sm font-bold text-gray-600 mb-2">Fire Safety Certificate (Optional)</label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            setDocuments(prev => ({ ...prev, fireSafetyCertificate: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.fireSafetyCertificate && (
                                                    <a
                                                        href={documents.fireSafetyCertificate instanceof File ? URL.createObjectURL(documents.fireSafetyCertificate) : documents.fireSafetyCertificate}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.fireSafetyCertificate && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* Police Verification */}
                                        <div className="p-4 bg-gray-50/50 rounded-lg border border-dashed">
                                            <label className="block text-sm font-bold text-gray-600 mb-2">Police Verification / NOC (Optional)</label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            setDocuments(prev => ({ ...prev, policeVerification: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.policeVerification && (
                                                    <a
                                                        href={documents.policeVerification instanceof File ? URL.createObjectURL(documents.policeVerification) : documents.policeVerification}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.policeVerification && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* FSSAI */}
                                        <div className="p-4 bg-gray-50/50 rounded-lg border border-dashed">
                                            <label className="block text-sm font-bold text-gray-600 mb-2">FSSAI License (Optional - if food served)</label>
                                            <div className="flex gap-2">
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full px-3 py-2 border rounded-md text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            const file = e.target.files[0];
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                alert("File size must be less than 10MB");
                                                                e.target.value = "";
                                                                return;
                                                            }
                                                            setDocuments(prev => ({ ...prev, fssaiLicense: file }));
                                                        }
                                                    }}
                                                />
                                                {documents.fssaiLicense && (
                                                    <a
                                                        href={documents.fssaiLicense instanceof File ? URL.createObjectURL(documents.fssaiLicense) : documents.fssaiLicense}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-blue-200"
                                                    >
                                                        <Upload className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </div>
                                            {documents.fssaiLicense && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                                        </div>

                                        {/* Emergency Contacts */}
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <label className="block text-sm font-bold text-blue-800 mb-3">Emergency Contact Details <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Property Manager Name <span className="text-red-500">*</span></label>
                                                    <Input placeholder="Full Name" value={documents.emergencyContactName} onChange={(e) => setDocuments(prev => ({ ...prev, emergencyContactName: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">24x7 Contact Number <span className="text-red-500">*</span></label>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-xs">+91</span>
                                                        <Input className="rounded-l-none" placeholder="9876543210" maxLength={10} value={documents.emergencyContactPhone} onChange={(e) => setDocuments(prev => ({ ...prev, emergencyContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Alternate Contact Name (Optional)</label>
                                                    <Input placeholder="Full Name" value={documents.alternateContactName} onChange={(e) => setDocuments(prev => ({ ...prev, alternateContactName: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Alternate Phone (Optional)</label>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-xs">+91</span>
                                                        <Input className="rounded-l-none" placeholder="9876543210" maxLength={10} value={documents.alternateContactPhone} onChange={(e) => setDocuments(prev => ({ ...prev, alternateContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <WizardFooter
                                        onNext={handleDocumentsNext}
                                        onBack={() => setStep("rooms")}
                                        disabled={
                                            !documents.panCard ||

                                            !documents.ownerPhoto ||
                                            !documents.propertyAddressProof ||
                                            !documents.ownershipProof ||
                                            !documents.googleLocationLink ||
                                            !documents.cancelledCheque ||
                                            !documents.signedAgreement ||
                                            !documents.emergencyContactName ||
                                            !documents.emergencyContactPhone ||
                                            documents.emergencyContactPhone.length !== 10
                                        }
                                    />
                                </div>
                            )}

                            {step === "photos" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl font-bold mb-8">Photos</h1>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        {/* Exterior Photos */}
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 mb-1">Exterior photos *</h3>
                                                <p className="text-xs text-gray-500 mb-2">Upload at least 1 photo of the building.</p>

                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    {exteriorPhotos.map((url, idx) => (
                                                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                                                            <img src={url instanceof File ? URL.createObjectURL(url) : url} alt="Exterior" className="object-cover w-full h-full" />
                                                            <button
                                                                onClick={() => setExteriorPhotos(exteriorPhotos.filter((_, i) => i !== idx))}
                                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50/10 transition-all cursor-pointer bg-gray-50/50">
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <p className="text-sm font-bold text-gray-700">Add Exterior Photo</p>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => {
                                                            if (e.target.files) {
                                                                const files = Array.from(e.target.files);
                                                                setExteriorPhotos(prev => [...prev, ...files]);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Interior Photos */}
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 mb-1">Interior photos *</h3>
                                                <p className="text-xs text-gray-500 mb-2">Upload at least 3 photos of rooms/facilities.</p>

                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    {interiorPhotos.map((url, idx) => (
                                                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                                                            <img src={url instanceof File ? URL.createObjectURL(url) : url} alt="Interior" className="object-cover w-full h-full" />
                                                            <button
                                                                onClick={() => setInteriorPhotos(interiorPhotos.filter((_, i) => i !== idx))}
                                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50/10 transition-all cursor-pointer bg-gray-50/50">
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <p className="text-sm font-bold text-gray-700">Add Interior Photo</p>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => {
                                                            if (e.target.files) {
                                                                const files = Array.from(e.target.files);
                                                                setInteriorPhotos(prev => [...prev, ...files]);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {(exteriorPhotos.length < 1 || interiorPhotos.length < 3) && (
                                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                            ⚠️ Validations:
                                            <ul className="list-disc pl-5 mt-1">
                                                {exteriorPhotos.length < 1 && <li>Upload at least 1 exterior photo.</li>}
                                                {interiorPhotos.length < 3 && <li>Upload at least 3 interior photos.</li>}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-8 border-t">
                                        <Button variant="outline" onClick={() => setStep("documents")} className="font-bold">Back</Button>
                                        <div className="flex gap-4">
                                            <Button
                                                onClick={handleSaveDraft}
                                                variant="outline"
                                                className="font-bold border-blue-600 text-blue-600"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting && submissionType === 'draft' ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : "Save Draft"}
                                            </Button>
                                            <Button
                                                onClick={handleFinalSubmit}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                                disabled={exteriorPhotos.length < 1 || interiorPhotos.length < 3 || isSubmitting}
                                            >
                                                {isSubmitting && submissionType === 'submitted' ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : "Submit for Review"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === "post-submission" && (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto">
                                        <Check className="w-10 h-10" />
                                    </div>
                                    <h1 className="text-2xl font-bold mb-4">Property Submitted!</h1>
                                    <p className="text-gray-600 mb-8">Your property is now under review. You can track status in your dashboard.</p>
                                    <Button onClick={() => router.push(isAdmin ? '/admin/hotels' : '/property-panel/dashboard')} className="bg-blue-600 text-white font-bold px-8">
                                        Go to {isAdmin ? 'Admin Hotels' : 'Dashboard'}
                                    </Button>
                                </div>
                            )}

                        </div>

                        {/* Side Info Panel - shows only on active hover, absolutely positioned relative to form container */}
                        <div ref={sidebarRef} className="hidden xl:block absolute left-full top-0 ml-8 w-80 shrink-0 h-full">
                            {hoveredInfo && (
                                <div
                                    style={{ position: 'fixed', top: hoveredInfo.top, left: hoveredInfo.left, width: '320px', pointerEvents: 'none', zIndex: 50 }}
                                    className="p-6 bg-transparent animate-in fade-in slide-in-from-left-4 duration-300"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#0f294d] mb-3">{hoveredInfo.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-base font-medium">{hoveredInfo.desc}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >

            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent aria-describedby="confirm-submission-desc">
                    <DialogHeader>
                        <DialogTitle>Confirm Submission</DialogTitle>
                        <DialogDescription id="confirm-submission-desc">
                            Please review all details before submitting.
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-gray-600">Once submitted, you cannot edit the property until it is reviewed. Is everything correct?</p>
                    <div className="flex gap-4 pt-4 justify-end">
                        <Button onClick={() => setIsSuccessModalOpen(false)} variant="ghost">Cancel</Button>
                        <Button onClick={handleConfirmSubmit} className="bg-blue-600 text-white" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : "Yes, Submit"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <GoogleMapsImportModal
                isOpen={isGoogleMapsModalOpen}
                onClose={() => setIsGoogleMapsModalOpen(false)}
                onImport={(data) => {
                    setMapPos([data.coordinates.lat, data.coordinates.lng]);
                    setGoogleMapsEmbedUrl(data.embedUrl);

                    if (data.address) {
                        // Auto-fill address fields
                        if (data.address.state) {
                            const states = State.getStatesOfCountry(location || "IN");
                            const matchedState = states.find(s =>
                                s.name.toLowerCase().includes(data.address!.state!.toLowerCase()) ||
                                data.address!.state!.toLowerCase().includes(s.name.toLowerCase())
                            );
                            if (matchedState) {
                                setState(matchedState.isoCode);
                                if (data.address.city) {
                                    const cities = City.getCitiesOfState(location || "IN", matchedState.isoCode);
                                    const matchedCity = cities.find(c =>
                                        c.name.toLowerCase().includes(data.address!.city!.toLowerCase()) ||
                                        data.address!.city!.toLowerCase().includes(c.name.toLowerCase())
                                    );
                                    if (matchedCity) setCity(matchedCity.name);
                                    else setCity(data.address.city);
                                }
                            }
                        }
                        if (data.address.street) setStreetAddress(data.address.street);
                        if (data.address.zipCode) setZipCode(data.address.zipCode);
                    }
                }}
            />
        </div >
    );
}

function WizardFooter({ onNext, onBack, disabled = false }: { onNext: () => void, onBack?: () => void, disabled?: boolean }) {
    const router = useRouter();
    return (
        <div className="flex justify-between items-center pt-8 border-t mt-8">
            <button onClick={() => router.push('/property-panel/dashboard')} className="text-gray-400 font-bold hover:text-red-500 text-sm">Cancel</button>
            <div className="flex gap-4">
                {onBack && (<Button variant="outline" onClick={onBack} className="font-bold">Back</Button>)}
                <Button onClick={onNext} disabled={disabled} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Next</Button>
            </div>
        </div>
    );
}
