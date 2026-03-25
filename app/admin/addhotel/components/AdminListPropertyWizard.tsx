"use client";

import dynamic from "next/dynamic";
import { GoogleMapsImportModal, ImportFromMapsButton } from "@/components/ui/GoogleMapsImport";

import { useState, useEffect, useRef } from "react";
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
} from "@/components/ui/dialog";
import {
    Building2,
    Home,
    Hotel,
    MapPin,
    Globe,
    ArrowRight,
    Copy,
    Plus,
    Info,
    Upload,
    Check,
    Image as ImageIcon,
    FileText,
    BedDouble,
    Coffee,
    CreditCard,
    X,
    Loader2
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";


type Step = "location" | "method" | "existing-details" | "type" | "name" | "address" | "map-pin" | "contact" | "overview" | "amenities" | "rooms" | "photos" | "contract" | "post-submission";

export default function AdminListPropertyWizard() {
    const router = useRouter();

    const [step, setStep] = useState<Step>("location");

    // Form State
    const [location, setLocation] = useState("IN"); // Default to India (ISO Code)
    const [propertyType, setPropertyType] = useState<string | null>(null);
    const [propertyName, setPropertyName] = useState("");

    const [description, setDescription] = useState("");

    const [mapPos, setMapPos] = useState<[number, number] | null>(null);
    const [googleMapsEmbedUrl, setGoogleMapsEmbedUrl] = useState("");
    const [isGoogleMapsModalOpen, setIsGoogleMapsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Address State
    const [existingQuery, setExistingQuery] = useState("");
    const [existingHotels, setExistingHotels] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedExisting, setSelectedExisting] = useState("");
    const [hoveredInfo, setHoveredInfo] = useState<{ title: string, desc: string, top: number, left: number } | null>(null);

    // Sidebar tracking
    const sidebarRef = useRef<HTMLDivElement>(null);
    const handleHover = (e: React.MouseEvent, title: string, desc: string) => {
        const rect = e.currentTarget.getBoundingClientRect();

        let leftPos = 0;
        if (sidebarRef.current) {
            const sidebarRect = sidebarRef.current.getBoundingClientRect();
            leftPos = sidebarRect.left;
        }

        setHoveredInfo({
            title,
            desc,
            top: rect.top + (rect.height / 2) - 80,
            left: leftPos
        });
    };

    const [state, setState] = useState(""); // State ISO Code
    const [city, setCity] = useState(""); // City Name
    const [streetAddress, setStreetAddress] = useState("");
    const [streetAddressLocal, setStreetAddressLocal] = useState("");

    // Contact State
    const [phoneType, setPhoneType] = useState("Mobile");
    const [phoneCode, setPhoneCode] = useState("91");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [emailBusiness, setEmailBusiness] = useState("");
    const [emailReservation, setEmailReservation] = useState("");

    // Validation Errors
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Overview State
    const [starRating, setStarRating] = useState("");
    const [openingDate, setOpeningDate] = useState("");
    const [isChain, setIsChain] = useState<boolean | null>(null);
    // Chain details
    const [chainName, setChainName] = useState("");
    const [brandName, setBrandName] = useState("");
    const [isManagementCompany, setIsManagementCompany] = useState<boolean | null>(null);
    const [managementCompany, setManagementCompany] = useState("");
    const [isChannelManager, setIsChannelManager] = useState<boolean | null>(null);
    const [channelManager, setChannelManager] = useState("");

    // Photos state
    const [exteriorPhotos, setExteriorPhotos] = useState<string[]>([]);
    const [interiorPhotos, setInteriorPhotos] = useState<string[]>([]);

    // Amenities & Rooms State
    const [amenities, setAmenities] = useState<string[]>([]);
    const [rooms, setRooms] = useState<any[]>([
        { type: "Standard Room", price: 2000, capacity: 2, available: 10, images: [] }
    ]);

    // Contract State
    const [contractSignatoryEmail, setContractSignatoryEmail] = useState("");
    const [contractSignatoryName, setContractSignatoryName] = useState("");
    const [contractSignatoryPhoneCode, setContractSignatoryPhoneCode] = useState("91");
    const [contractSignatoryPhone, setContractSignatoryPhone] = useState("");
    const [contractingParty, setContractingParty] = useState("");
    const [isContractAgreed, setIsContractAgreed] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Auto-scroll to top on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [step]);

    // Navigation handlers
    const handleLocationNext = () => setStep("method");
    const handleMethodNext = (method: string) => {
        if (method === 'create') setStep("type");
        else if (method === 'existing') setStep("existing-details");
    };
    const handleExistingNext = () => setStep("type");
    const handleTypeNext = () => { if (propertyType) setStep("name"); };
    const handleNameNext = () => { if (propertyName) setStep("address"); };
    const handleAddressNext = () => { if (state && city && streetAddress) setStep("contact"); };
    const handleMapNext = () => setStep("contact");

    const handleSearchExisting = async () => {
        if (!existingQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/hotels?status=all`);
            if (res.ok) {
                const data = await res.json();
                const filtered = data.hotels.filter((h: any) =>
                    h.name.toLowerCase().includes(existingQuery.toLowerCase()) ||
                    h.address.city.toLowerCase().includes(existingQuery.toLowerCase())
                );
                setExistingHotels(filtered);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCloneHotel = async (hotelId: string) => {
        try {
            const res = await fetch(`/api/properties/${hotelId}`);
            if (res.ok) {
                const { hotel } = await res.json();

                // Map data to state
                setPropertyType(hotel.category?.toLowerCase() || "hotel");
                setPropertyName(hotel.name);
                setDescription(hotel.description || "");
                setStreetAddress(hotel.address?.street || "");
                setCity(hotel.address?.city || "");

                // Handle State (Try to find ISO if possible, otherwise keep string)
                // Note: Wizard expects ISO for 'state' state variable.
                const states = State.getStatesOfCountry(location);
                const matchedState = states.find(s => s.name === hotel.address?.state);
                if (matchedState) {
                    setState(matchedState.isoCode);
                } else {
                    setState(hotel.address?.state || "");
                }

                setPhoneNumber(hotel.contactInfo?.phone || "");
                setEmailBusiness(hotel.contactInfo?.email || "");
                setEmailReservation(hotel.contactInfo?.email || "");
                setStarRating(hotel.rating?.toString() || "");
                setAmenities(hotel.amenities || []);
                setRooms(hotel.rooms || []);
                setExteriorPhotos(hotel.images || []);
                setInteriorPhotos([]);
                if (hotel.location?.coordinates) {
                    setMapPos([hotel.location.coordinates[1], hotel.location.coordinates[0]]); // [lat, lng]
                }
                setGoogleMapsEmbedUrl(hotel.embedUrl || "");

                // Additional details if available in source
                if (hotel.overview) {
                    setIsChain(hotel.overview.isChain ?? null);
                    setChainName(hotel.overview.chainName || "");
                    setBrandName(hotel.overview.brandName || "");
                }

                // Jump to type selection step
                setStep("type");
            }
        } catch (error) {
            console.error("Clone error:", error);
            alert("Failed to clone property details.");
        }
    };

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
        if (!emailRegex.test(emailReservation)) {
            errors.emailReservation = "Invalid reservation email address.";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});
        if (phoneNumber && emailBusiness && emailReservation) setStep("overview");
    };

    const handleOverviewNext = () => setStep("amenities");
    const handleAmenitiesNext = () => setStep("rooms");
    const handleRoomsNext = () => setStep("photos");
    const handlePhotosNext = () => setStep("contract");

    // Submission Logic
    const handleSubmit = () => {
        // Direct submission for Admin, skip modal if desired, or keep it for legality
        setIsSuccessModalOpen(true);
    };

    const handleFinalAgree = async () => {
        setIsSubmitting(true);
        // Resolve Names from ISO Codes
        const countryName = Country.getCountryByCode(location)?.name || location;
        const stateName = State.getStateByCodeAndCountry(state, location)?.name || state;
        // City is already stored as name typically if we used SelectValue or similar, 
        // BUT if we store code we need to find it. 
        // Currently setting city to name directly in the Select onValueChange below helps.
        // Wait, Select Item value must be unique. Using Name is risky if duplicates, but for Cities ok.
        // Actually, let's look at the implementation below.

        try {
            const res = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: countryName,
                    propertyType,
                    propertyName,
                    description,
                    address: { state: stateName, city, streetAddress },
                    contact: { phoneNumber, emailBusiness, emailReservation, phoneCode },
                    overview: { starRating, openingDate, isChain, chainName, brandName, isManagementCompany, managementCompany, isChannelManager, channelManager },
                    amenities,
                    rooms,
                    photos: { exterior: exteriorPhotos, interior: interiorPhotos },
                    contract: { contractSignatoryEmail, contractSignatoryName, contractSignatoryPhone, contractingParty },
                    status: 'approved', // Automatically approve for Admins
                    coordinates: mapPos ? { lat: mapPos[0], lng: mapPos[1] } : null,
                    embedUrl: googleMapsEmbedUrl || ""
                })
            });

            if (res.ok) {
                setIsSuccessModalOpen(false);
                setStep("post-submission");
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
            {/* Admin Header */}
            <header className="h-[72px] border-b flex items-center px-4 md:px-8 justify-between sticky top-0 bg-white z-20 shadow-sm">
                <Link href="/admin/dashboard" className="flex items-center -ml-2">
                    <Image
                        src="/list_property.png"
                        alt="Urban Host Icon"
                        width={50}
                        height={50}
                        className="h-9 w-auto"
                        priority
                        quality={100}
                        unoptimized
                    />
                    <div className="ml-2 font-bold text-xl text-gray-900">Admin Portal</div>
                </Link>
                <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Admin Mode</span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">

                {/* Progress Bar (Hidden on post-submission) */}
                {step !== "post-submission" && (
                    <div className="flex gap-1 mb-8 max-w-3xl mx-auto">
                        <div className={`h-1.5 flex-1 rounded-full ${["location", "method", "existing-details", "type", "name", "address", "map-pin", "contact", "overview", "amenities", "rooms", "photos", "contract"].indexOf(step) >= 0 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full ${["type", "name", "address", "map-pin", "contact", "overview", "amenities", "rooms", "photos", "contract"].indexOf(step) >= 0 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full ${["amenities", "rooms", "photos", "contract"].indexOf(step) >= 0 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full ${["contract"].indexOf(step) >= 0 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                    </div>
                )}

                <div className="flex justify-center">
                    <div className="relative w-full max-w-4xl">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-10 pb-24 md:pb-10 min-h-[500px] w-full z-10">

                            {/* STEPS */}
                            {step === "location" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-4">Where's the property located?</h1>
                                    <p className="text-gray-600 mb-8 text-sm md:text-base">Adding a property as Admin.</p>
                                    <div className="mb-8">
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Country or region</label>
                                        <Select value={location} onValueChange={setLocation}>
                                            <SelectTrigger className="w-full h-12 text-base bg-white border-gray-300 focus:ring-blue-600">
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
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

                            {step === "method" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center mb-12"><h1 className="text-2xl md:text-3xl font-bold mb-4">Admin Listing: How would you like to proceed?</h1></div>

                                    <div className="space-y-4 max-w-xl mx-auto">
                                        <button
                                            onClick={() => handleMethodNext('create')}
                                            onMouseEnter={(e) => handleHover(e, "Create a new listing", "Start fresh! Add a completely new property with unique photos, details, and amenities.")}
                                            onMouseLeave={() => setHoveredInfo(null)}
                                            className="w-full flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold text-lg text-gray-700">Create a new listing</span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        </button>

                                        <button
                                            onClick={() => handleMethodNext('existing')}
                                            onMouseEnter={(e) => handleHover(e, "Create based on an existing listing", "Save time by copying details from a property you've already listed. Perfect for chain hotels or similar units.")}
                                            onMouseLeave={() => setHoveredInfo(null)}
                                            className="w-full flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                    <Copy className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold text-lg text-gray-700">Clone/Import Listing</span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === "existing-details" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-8">Search Existing Listings</h1>
                                    <div className="mb-8">
                                        <div className="relative">
                                            <Input
                                                className="h-14 pl-4 pr-20 border-gray-300 text-base w-full"
                                                placeholder="Search by hotel name or city..."
                                                value={existingQuery}
                                                onChange={(e) => setExistingQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchExisting()}
                                            />
                                            <button
                                                onClick={handleSearchExisting}
                                                disabled={isSearching}
                                                className="absolute right-2 top-2 bottom-2 px-4 hover:bg-gray-100 rounded text-blue-600 font-bold text-sm disabled:opacity-50"
                                            >
                                                {isSearching ? "..." : "Search"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search Results */}
                                    <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {existingHotels.length > 0 ? (
                                            existingHotels.map((h) => (
                                                <div
                                                    key={h._id}
                                                    className={`p-4 border rounded-xl flex items-center justify-between transition-all hover:bg-gray-50 group ${selectedExisting === h._id ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                                            <img src={h.images?.[0] || "/hotel_placeholder.png"} alt={h.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800">{h.name}</p>
                                                            <p className="text-sm text-gray-500">{h.address.city}, {h.address.state}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleCloneHotel(h._id)}
                                                        variant="ghost"
                                                        className="text-blue-600 font-bold hover:bg-blue-600 hover:text-white"
                                                    >
                                                        Clone Details
                                                    </Button>
                                                </div>
                                            ))
                                        ) : existingQuery && !isSearching ? (
                                            <div className="text-center py-10 text-gray-400">
                                                <Info className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                                <p>No hotels found matching "{existingQuery}"</p>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <Button variant="ghost" onClick={() => setStep("method")} className="font-bold">
                                            Back
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === "type" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold mb-8">What kind of property are you listing?</h1>
                                        <div className="mb-8">
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Frequently selected</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                                {[
                                                    { id: "hotel", label: "Hotel", icon: Hotel, desc: "An establishment providing accommodation, meals, and other services for travelers and tourists." },
                                                    { id: "apartment", label: "Apartment", icon: Building2, desc: "A self-contained housing unit that occupies only part of a building." },
                                                    { id: "homestay", label: "Homestay", icon: Home, desc: "An accommodation where guests stay in the home of a local family." }
                                                ].map((type) => (
                                                    <div
                                                        key={type.id}
                                                        onClick={() => setPropertyType(type.id)}
                                                        onMouseEnter={(e) => handleHover(e, type.label, type.desc)}
                                                        onMouseLeave={() => setHoveredInfo(null)}
                                                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 h-32 hover:border-blue-500 hover:bg-blue-50/30 ${propertyType === type.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
                                                    >
                                                        <type.icon className={`w-8 h-8 ${propertyType === type.id ? "text-blue-600" : "text-gray-400"}`} />
                                                        <span className="font-bold">{type.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Other property types</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        onClick={() => setPropertyType(type.id)}
                                                        onMouseEnter={(e) => handleHover(e, type.label, type.desc)}
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
                                        </div>
                                        <WizardFooter onNext={handleTypeNext} onBack={() => setStep("location")} disabled={!propertyType} />
                                    </div>
                                </div>
                            )}

                            {step === "name" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-8">What's the name of the property?</h1>
                                    <div className="space-y-6 mb-12">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Property name (English)</label>
                                            <Input
                                                className="h-12 border-gray-300 text-base"
                                                placeholder="Enter the property's English name"
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
                                    <h1 className="text-2xl md:text-3xl font-bold mb-8">Where's the property located?</h1>

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
                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-gray-700">Country or region</label>
                                            <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <span>{Country.getCountryByCode(location)?.flag}</span>
                                                {Country.getCountryByCode(location)?.name}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">State or province</label>
                                            <Select value={state} onValueChange={(val) => {
                                                setState(val);
                                                setCity(""); // Reset city when state changes
                                            }}>
                                                <SelectTrigger className="w-full h-12 text-base bg-white border-gray-300">
                                                    <SelectValue placeholder="Select state" />
                                                </SelectTrigger>
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
                                                <SelectTrigger className="w-full h-12 text-base bg-white border-gray-300">
                                                    <SelectValue placeholder="Select city" />
                                                </SelectTrigger>
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

                                        <div><label className="block text-sm font-bold mb-1 text-gray-700">Street address (in English)</label><Input className="h-12 border-gray-300 text-base" placeholder="e.g. 123 Main St" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} /></div>
                                    </div>
                                    <WizardFooter onNext={handleAddressNext} onBack={() => setStep("name")} disabled={!state || !city || !streetAddress} />
                                </div>
                            )}

                            {step === "map-pin" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Pin the location</h1>
                                    <p className="text-gray-600 mb-6">Import the exact location from Google Maps.</p>
                                    <div className="bg-gray-100 rounded-xl overflow-hidden h-[400px] relative border border-gray-200 mb-8 flex items-center justify-center">
                                        {googleMapsEmbedUrl ? (
                                            <iframe
                                                src={googleMapsEmbedUrl}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        ) : (
                                            <div className="text-center p-6">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                                    <MapPin className="w-8 h-8" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-2">No location selected</h3>
                                                <div className="flex justify-center w-full">
                                                    <ImportFromMapsButton onClick={() => setIsGoogleMapsModalOpen(true)} className="ml-[7px]" />
                                                </div>
                                            </div>
                                        )}
                                        {mapPos && (
                                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-mono border z-[100] font-bold">
                                                Lat: {mapPos[0].toFixed(6)} | Lng: {mapPos[1].toFixed(6)}
                                            </div>
                                        )}
                                        {googleMapsEmbedUrl && (
                                            <div className="absolute top-4 right-4 z-[100]">
                                                <Button size="sm" onClick={() => setIsGoogleMapsModalOpen(true)} className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 font-bold shadow-sm gap-2">
                                                    <MapPin className="w-4 h-4" /> Change Location
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <WizardFooter onNext={handleMapNext} onBack={() => setStep("address")} disabled={!googleMapsEmbedUrl} />
                                </div>
                            )}

                            {step === "contact" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-8">Contact details</h1>
                                    <div className="space-y-8 mb-8">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone number</label>
                                            <div className="flex gap-2">
                                                <Select value={phoneType} onValueChange={setPhoneType}><SelectTrigger className="w-[120px] h-12 bg-white border-gray-300"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Mobile">Mobile</SelectItem><SelectItem value="Landline">Landline</SelectItem></SelectContent></Select>
                                                <Select value={phoneCode} onValueChange={setPhoneCode}><SelectTrigger className="w-[100px] h-12 bg-white border-gray-300"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="91">+91</SelectItem><SelectItem value="1">+1</SelectItem></SelectContent></Select>
                                                <Input className={`h-12 border-gray-300 text-base ${validationErrors.phoneNumber ? 'border-red-500 bg-red-50' : ''}`} placeholder="Main number" value={phoneNumber} onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setPhoneNumber(val);
                                                }} />
                                            </div>
                                            {validationErrors.phoneNumber && <p className="text-red-500 text-xs mt-1 font-bold">{validationErrors.phoneNumber}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email for business inquiries</label>
                                            <Input className={`h-12 border-gray-300 text-base ${validationErrors.emailBusiness ? 'border-red-500 bg-red-50' : ''}`} placeholder="Enter an email" value={emailBusiness} onChange={(e) => setEmailBusiness(e.target.value)} />
                                            {validationErrors.emailBusiness && <p className="text-red-500 text-xs mt-1 font-bold">{validationErrors.emailBusiness}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email for reservation management</label>
                                            <Input className={`h-12 border-gray-300 text-base ${validationErrors.emailReservation ? 'border-red-500 bg-red-50' : ''}`} placeholder="Enter an email used to confirm bookings" value={emailReservation} onChange={(e) => setEmailReservation(e.target.value)} />
                                            {validationErrors.emailReservation && <p className="text-red-500 text-xs mt-1 font-bold">{validationErrors.emailReservation}</p>}
                                        </div>
                                    </div>
                                    <WizardFooter onNext={handleContactNext} onBack={() => setStep("map-pin")} disabled={!phoneNumber || !emailBusiness || !emailReservation} />
                                </div>
                            )}

                            {step === "overview" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-8">Property overview</h1>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="w-full p-3 border border-gray-300 rounded-md h-32 text-base"
                                                    placeholder="Describe your property..."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                            </div>
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Star rating</label><Select value={starRating} onValueChange={setStarRating}><SelectTrigger className="h-12 bg-white border-gray-300"><SelectValue placeholder="Select star rating" /></SelectTrigger><SelectContent><SelectItem value="1">1 Star</SelectItem><SelectItem value="2">2 Stars (Economy)</SelectItem><SelectItem value="3">3 Stars</SelectItem><SelectItem value="4">4 Stars</SelectItem><SelectItem value="5">5 Stars</SelectItem></SelectContent></Select></div>
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Opening Date</label><Input type="month" className="h-12 border-gray-300 text-base" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} /></div>
                                        </div>
                                    </div>
                                    <WizardFooter onNext={handleOverviewNext} onBack={() => setStep("contact")} />
                                </div>
                            )}

                            {step === "amenities" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-4">Amenities & Facilities</h1>
                                    <p className="text-gray-600 mb-8">Select the amenities available at this property.</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                        {[
                                            "WiFi", "Parking", "Swimming Pool", "Gym", "Restaurant",
                                            "Room Service", "Laundry", "Air Conditioning", "TV", "Mini Bar",
                                            "Safe", "Elevator", "24/7 Reception", "Conference Room", "Spa"
                                        ].map((amenity) => (
                                            <div
                                                key={amenity}
                                                onClick={() => {
                                                    if (amenities.includes(amenity)) {
                                                        setAmenities(amenities.filter(a => a !== amenity));
                                                    } else {
                                                        setAmenities([...amenities, amenity]);
                                                    }
                                                }}
                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${amenities.includes(amenity) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-300"
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${amenities.includes(amenity) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                                    {amenities.includes(amenity) && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="text-sm font-bold">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <WizardFooter onNext={handleAmenitiesNext} onBack={() => setStep("overview")} />
                                </div>
                            )}

                            {step === "rooms" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-4">Room Types & Pricing</h1>
                                    <p className="text-gray-600 mb-8">Add the different types of rooms available at this property.</p>

                                    <div className="space-y-6 mb-12">
                                        {rooms.map((room, index) => (
                                            <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 relative">
                                                <button
                                                    onClick={() => setRooms(rooms.filter((_, i) => i !== index))}
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Type</label>
                                                        <Input
                                                            value={room.type}
                                                            onChange={(e) => {
                                                                const newRooms = [...rooms];
                                                                newRooms[index].type = e.target.value;
                                                                setRooms(newRooms);
                                                            }}
                                                            placeholder="Deluxe, Suite, etc."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price (₹)</label>
                                                        <Input
                                                            type="number"
                                                            value={room.price}
                                                            onChange={(e) => {
                                                                const newRooms = [...rooms];
                                                                newRooms[index].price = parseInt(e.target.value);
                                                                setRooms(newRooms);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Capacity</label>
                                                        <Input
                                                            type="number"
                                                            value={room.capacity}
                                                            onChange={(e) => {
                                                                const newRooms = [...rooms];
                                                                newRooms[index].capacity = parseInt(e.target.value);
                                                                setRooms(newRooms);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Available</label>
                                                        <Input
                                                            type="number"
                                                            value={room.available}
                                                            onChange={(e) => {
                                                                const newRooms = [...rooms];
                                                                newRooms[index].available = parseInt(e.target.value);
                                                                setRooms(newRooms);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-4 border-t pt-4">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Images</label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {(room.images || []).map((img: string, imgIdx: number) => (
                                                            <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                                                                <Image src={img} alt="Room" fill className="object-cover" unoptimized />
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
                                                                onChange={async (e) => {
                                                                    if (e.target.files) {
                                                                        const files = Array.from(e.target.files);
                                                                        for (const file of files) {
                                                                            const formData = new FormData();
                                                                            formData.append("file", file);
                                                                            try {
                                                                                const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                                                const data = await res.json();
                                                                                if (data.success) {
                                                                                    const newRooms = [...rooms];
                                                                                    if (!newRooms[index].images) newRooms[index].images = [];
                                                                                    newRooms[index].images.push(data.url);
                                                                                    setRooms(newRooms);
                                                                                }
                                                                            } catch (err) { console.error(err); }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <Button
                                            onClick={() => setRooms([...rooms, { type: "", price: 2000, capacity: 2, available: 5, images: [] }])}
                                            variant="outline"
                                            className="w-full h-14 border-dashed border-2 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all font-bold"
                                        >
                                            <Plus className="w-5 h-5 mr-2" />
                                            Add Another Room Type
                                        </Button>
                                    </div>
                                    <WizardFooter onNext={handleRoomsNext} onBack={() => setStep("amenities")} />
                                </div>
                            )}

                            {step === "photos" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-8">Photos</h1>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                                        {/* Exterior Photos */}
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 mb-1">Exterior photos *</h3>
                                                <p className="text-xs text-gray-500 mb-2">Upload at least 1 photo of the building.</p>

                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    {exteriorPhotos.map((url, idx) => (
                                                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                                                            <Image src={url} alt="Exterior" fill className="object-cover" unoptimized />
                                                            <button
                                                                onClick={() => setExteriorPhotos(exteriorPhotos.filter((_, i) => i !== idx))}
                                                                className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50/10 transition-all cursor-pointer bg-gray-50/50">
                                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                                        <Upload className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-700">Add Exterior Photo</p>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={async (e) => {
                                                            if (e.target.files) {
                                                                const files = Array.from(e.target.files);
                                                                for (const file of files) {
                                                                    const formData = new FormData();
                                                                    formData.append("file", file);
                                                                    try {
                                                                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                                        const data = await res.json();
                                                                        if (data.success) {
                                                                            setExteriorPhotos(prev => [...prev, data.url]);
                                                                        }
                                                                    } catch (err) {
                                                                        console.error("Upload failed", err);
                                                                    }
                                                                }
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
                                                            <Image src={url} alt="Interior" fill className="object-cover" unoptimized />
                                                            <button
                                                                onClick={() => setInteriorPhotos(interiorPhotos.filter((_, i) => i !== idx))}
                                                                className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50/10 transition-all cursor-pointer bg-gray-50/50">
                                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                                        <Upload className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-700">Add Interior Photo</p>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={async (e) => {
                                                            if (e.target.files) {
                                                                const files = Array.from(e.target.files);
                                                                for (const file of files) {
                                                                    const formData = new FormData();
                                                                    formData.append("file", file);
                                                                    try {
                                                                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                                        const data = await res.json();
                                                                        if (data.success) {
                                                                            setInteriorPhotos(prev => [...prev, data.url]);
                                                                        }
                                                                    } catch (err) {
                                                                        console.error("Upload failed", err);
                                                                    }
                                                                }
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

                                    <WizardFooter
                                        onNext={handlePhotosNext}
                                        onBack={() => setStep("overview")}
                                        disabled={exteriorPhotos.length < 1 || interiorPhotos.length < 3}
                                    />
                                </div>
                            )}

                            {step === "contract" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold mb-8">Legal & Approval (Admin Mode)</h1>
                                    <div className="max-w-3xl space-y-8 mb-12">
                                        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                                            <h3 className="font-bold text-lg text-yellow-800 mb-2">Admin Override Active</h3>
                                            <p className="text-sm text-yellow-700">Submitting this form will <strong>immediately approve and list</strong> this property on the live site. Ensure all details are verified locally.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Signatory's email</label><Input className="h-12 border-gray-300 text-base" value={contractSignatoryEmail} onChange={(e) => setContractSignatoryEmail(e.target.value)} placeholder="email@example.com" /></div>
                                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Signatory's name</label><Input className="h-12 border-gray-300 text-base" value={contractSignatoryName} onChange={(e) => setContractSignatoryName(e.target.value)} placeholder="Full Name" /></div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" onClick={() => setIsContractAgreed(!isContractAgreed)}>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors ${isContractAgreed ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}>{isContractAgreed && <Check className="w-3.5 h-3.5 text-white" />}</div>
                                            <p className="text-xs text-gray-600">I confirm that this property meets all UrbanHost standards and authorize immediate listing.</p>
                                        </div>
                                    </div>
                                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between items-center z-50 md:sticky md:bottom-0 mt-8 rounded-b-xl">
                                        <div className="flex gap-4">
                                            <Button variant="outline" onClick={() => setStep("photos")} className="border-gray-300 text-gray-700 font-bold px-8 h-12 rounded-lg" disabled={isSubmitting}>Back</Button>
                                            <Button onClick={handleSubmit} disabled={!isContractAgreed || isSubmitting} className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-200">
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Listing...
                                                    </>
                                                ) : "Approve & List Property"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === "post-submission" && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                                    <div className="flex flex-col items-center justify-center py-12 text-center h-[50vh]">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-lg animate-in zoom-in duration-300">
                                            <Check className="w-10 h-10" />
                                        </div>
                                        <h1 className="text-3xl font-black text-gray-900 mb-4">Property Listed Successfully!</h1>
                                        <p className="text-lg text-gray-600 max-w-md mb-8">The property is now <strong>Live</strong> and bookable on UrbanHost.</p>

                                        <div className="flex gap-4">
                                            <Button onClick={() => router.push('/admin/dashboard')} variant="outline" className="h-12 px-8 font-bold rounded-xl border-2">Return to Dashboard</Button>
                                            <Button onClick={() => window.location.reload()} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg">Add Another Property</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Side Info Panel - shows only on active hover, absolutely positioned relative to form container */}
                        <div ref={sidebarRef} className="hidden xl:block absolute left-full top-0 ml-8 w-80 shrink-0 h-full">
                            {hoveredInfo && (
                                <div
                                    style={{ position: 'fixed', top: hoveredInfo.top, left: hoveredInfo.left, width: '320px', pointerEvents: 'none' }}
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
            </main>

            {/* Confirmation Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent className="max-w-md text-center p-8 rounded-3xl">
                    <DialogHeader className="mb-4"><DialogTitle className="text-2xl font-black text-gray-900">Confirm Listing</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <p className="text-gray-600">Are you sure you want to make this property live immediately?</p>
                        <div className="flex gap-4 pt-4">
                            <Button onClick={() => setIsSuccessModalOpen(false)} variant="ghost" className="flex-1 h-12 font-bold rounded-xl" disabled={isSubmitting}>Cancel</Button>
                            <Button onClick={handleFinalAgree} className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-bold text-white rounded-xl" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Listing...
                                    </>
                                ) : "Confirm & List"}
                            </Button>
                        </div>
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
                        // ZipCode is currently not in this wizard's state/fields, skipping for now
                    }
                }}
            />
        </div>
    );
}

function WizardFooter({ onNext, onBack, disabled = false }: { onNext: () => void, onBack?: () => void, disabled?: boolean }) {
    const router = useRouter();
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between items-center z-50 md:sticky md:bottom-0 mt-8 rounded-b-xl border-t border-gray-100">
            <button onClick={() => router.push('/admin/dashboard')} className="text-gray-400 font-bold hover:text-red-500 text-sm transition-colors">Cancel & Exit</button>
            <div className="flex gap-4">
                {onBack && (<Button variant="outline" onClick={onBack} className="border-gray-300 text-gray-700 font-bold px-8 h-12 rounded-lg">Back</Button>)}
                <Button onClick={onNext} disabled={disabled} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">Next</Button>
            </div>
        </div>
    );
}
