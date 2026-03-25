"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    FiMapPin,
    FiMail,
    FiPhone,
    FiCheck,
    FiX,
    FiArrowLeft,
    FiGlobe,
    FiCalendar,
    FiStar,
    FiHome,
    FiCheckCircle,
    FiAlertCircle,
    FiChevronLeft,
    FiChevronRight,
    FiMaximize2
} from "react-icons/fi";
import { Loader2, Hotel, Building2, BedDouble, Users, Coffee } from "lucide-react";

interface Room {
    _id?: string;
    type: string;
    price: number;
    capacity: number;
    available: number;
    amenities: string[];
    features: string[];
    images: string[];
}

interface Property {
    _id: string;
    name: string;
    description: string;
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
    images: string[];
    category: string;
    rating?: number;
    totalReviews?: number;
    status: 'pending' | 'approved' | 'rejected';
    contactInfo: {
        phone: string;
        email: string;
    };
    overview?: {
        starRating?: string;
        openingDate?: string;
        isChain?: boolean;
        chainName?: string;
        brandName?: string;
        isManagementCompany?: boolean;
        managementCompany?: string;
        isChannelManager?: boolean;
        channelManager?: string;
    };
    rooms: Room[];
    amenities?: string[];
    contract?: {
        contractSignatoryEmail?: string;
        contractSignatoryName?: string;
        contractSignatoryPhone?: string;
        contractingParty?: string;
    };
    createdAt: string;
    owner?: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    documents?: {
        // KYC
        panCard?: string;
        aadhaarCard?: string;
        ownerPhoto?: string;
        // Property
        ownershipProof?: string;
        propertyAddressProof?: string;
        googleLocationLink?: string;
        // Business
        gstCertificate?: string;
        msmeRegistration?: string;
        // Bank
        cancelledCheque?: string;
        // Licenses
        tradeLicense?: string;
        fireSafetyCertificate?: string;
        policeVerification?: string;
        fssaiLicense?: string;
        // Agreement
        signedAgreement?: string;
        // Emergency Contacts
        emergencyContactName?: string;
        emergencyContactPhone?: string;
        alternateContactName?: string;
        alternateContactPhone?: string;
    };
}

export default function PropertyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    // Image Modal State
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [allImages, setAllImages] = useState<string[]>([]);

    // Document Preview State
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedDocUrl, setSelectedDocUrl] = useState("");
    const [selectedDocName, setSelectedDocName] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const openImageModal = (index: number, images: string[]) => {
        setAllImages(images);
        setSelectedImageIndex(index);
        setIsImageModalOpen(true);
    };

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const openDocModal = (url: string, name: string) => {
        setSelectedDocUrl(url);
        setSelectedDocName(name);
        setIsDocModalOpen(true);
    };

    useEffect(() => {
        if (params.id) {
            fetchProperty(params.id as string);
        }
    }, [params.id]);

    const fetchProperty = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/properties/${id}`);
            if (!response.ok) {
                console.error('Failed to fetch property:', response.statusText);
                return;
            }
            const data = await response.json();
            console.log('Property data received:', data);
            console.log('Documents available:', data.documents);
            
            // CRITICAL FIX: Handle both old and new image formats
            // If images array is empty but photos object exists, merge exterior and interior
            if ((!data.images || data.images.length === 0) && data.photos) {
                const exteriorPhotos = data.photos.exterior || [];
                const interiorPhotos = data.photos.interior || [];
                data.images = [...exteriorPhotos, ...interiorPhotos];
                console.log('Fixed images from photos object:', data.images);
            }
            
            setProperty(data);
        } catch (error) {
            console.error('Failed to fetch property:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!property) return;
        setApproving(true);
        try {
            const response = await fetch(`/api/admin/properties/${property._id}/approve`, {
                method: 'POST',
            });
            const data = await response.json();

            if (response.ok) {
                let message = `Property approved successfully!`;
                if (data.password) {
                    message += `\n\nCREDENTIALS GENERATED:\nEmail: ${data.email}\nPassword: ${data.password}\n\nPlease share these with the property owner manually if they don't receive the email.`;
                }
                alert(message);
                router.push('/admin/properties');
            } else {
                alert(data.error || 'Failed to approve property');
            }
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Failed to approve property');
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!property || !rejectionReason.trim()) return;

        setRejecting(true);
        try {
            const response = await fetch(`/api/admin/properties/${property._id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (response.ok) {
                alert('Property rejected and notification sent.');
                setIsRejectDialogOpen(false);
                fetchProperty(property._id); // Refresh data
            } else {
                alert('Failed to reject property');
            }
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('An error occurred while rejecting');
        } finally {
            setRejecting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-xl font-bold text-gray-500 mb-4">Property not found</p>
                <Button onClick={() => router.push('/admin/properties')}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="pl-0 hover:bg-transparent text-gray-500 hover:text-gray-900" onClick={() => router.back()}>
                    <FiArrowLeft className="mr-2 h-5 w-5" /> Back to Listings
                </Button>
            </div>

            {/* Title Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                    <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <FiMapPin className="w-4 h-4" />
                        <span>{property.address.street}, {property.address.city}, {property.address.state}, {property.address.country}</span>
                        <Badge variant="outline" className="ml-2">{property.category}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge
                        variant={property.status === 'approved' ? 'default' : property.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-sm px-4 py-1.5 h-auto capitalize"
                    >
                        {property.status}
                    </Badge>
                </div>
            </div>

            {/* Action Bar (Sticky) */}
            <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                    {property.status === 'pending' ? (
                        <>
                            <FiAlertCircle className="w-5 h-5 text-orange-600" />
                            <span className="text-orange-700">This property is pending approval.</span>
                        </>
                    ) : property.status === 'approved' ? (
                        <>
                            <FiCheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-700">This property is currently active.</span>
                        </>
                    ) : (
                        <>
                            <FiX className="w-5 h-5 text-red-600" />
                            <span className="text-red-700">This property is rejected/inactive.</span>
                        </>
                    )}
                </div>
                <div className="flex gap-3">
                    {property.status !== 'rejected' && (
                        <Button
                            onClick={() => setIsRejectDialogOpen(true)}
                            variant="destructive"
                            disabled={rejecting}
                            className="gap-2"
                        >
                            <FiX className="w-4 h-4" /> {property.status === 'approved' ? 'Deactivate / Reject' : 'Reject'}
                        </Button>
                    )}

                    {property.status !== 'approved' && (
                        <Button
                            onClick={handleApprove}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            disabled={approving}
                        >
                            <FiCheck className="w-4 h-4" /> {property.status === 'rejected' ? 'Re-Approve' : 'Approve Listing'}
                        </Button>
                    )}

                    <Button variant="outline" onClick={() => router.back()} className="gap-2">
                        Cancel
                    </Button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Main Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Images Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Property Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {property.images.length > 0 ? property.images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 group cursor-pointer"
                                        onClick={() => openImageModal(idx, property.images)}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Property image ${idx + 1}`}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <FiMaximize2 className="text-white w-8 h-8 drop-shadow-lg" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        No images uploaded
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rejection Reason (if rejected) */}
                    {property.status === 'rejected' && (property as any).rejectionReason && (
                        <Card className="border-red-200 bg-red-50/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-red-800 text-lg flex items-center gap-2">
                                    <FiAlertCircle className="w-5 h-5" /> Rejection Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-red-700 font-medium">{(property as any).rejectionReason}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 leading-relaxed">{property.description || "No description provided."}</p>
                        </CardContent>
                    </Card>

                    {/* Overview & Amenities */}
                    <Card>
                        <CardHeader><CardTitle>Overview & Amenities</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500Uppercase font-bold mb-1">Star Rating</div>
                                    <div className="flex items-center gap-1 font-bold text-gray-900"><FiStar className="text-yellow-500 fill-yellow-500" /> {property.rating || 0} Stars</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500Uppercase font-bold mb-1">Total Reviews</div>
                                    <div className="flex items-center gap-1 font-bold text-gray-900"><FiStar className="text-blue-500" /> {property.totalReviews || 0} Reviews</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500Uppercase font-bold mb-1">Category</div>
                                    <div className="font-bold text-gray-900">{property.category || "Hotel"}</div>
                                </div>
                            </div>

                            {/* Hotel Amenities */}
                            {property.amenities && property.amenities.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Hotel Amenities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {property.amenities.map((amenity, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-medium flex items-center gap-1">
                                                <FiCheckCircle className="w-3 h-3" /> {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rooms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Types ({property.rooms?.length || 0})</CardTitle>
                            <CardDescription>Available accommodation details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {property.rooms && property.rooms.length > 0 ? (
                                <div className="space-y-6">
                                    {property.rooms.map((room, i) => (
                                        <div key={i} className="flex flex-col md:flex-row gap-6 p-6 border rounded-xl bg-gray-50/50">
                                            <div className="w-full md:w-1/3 flex overflow-x-auto gap-2 p-1 no-scrollbar snap-x">
                                                {room.images && room.images.length > 0 ? (
                                                    room.images.map((img, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative w-40 h-40 shrink-0 rounded-lg overflow-hidden border snap-start cursor-pointer group"
                                                            onClick={() => openImageModal(idx, room.images)}
                                                        >
                                                            <Image
                                                                src={img}
                                                                alt={`${room.type} image ${idx + 1}`}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                            <div className="absolute inset-0 group-hover:bg-black/10 transition-colors" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No images</div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-bold text-gray-900">{room.type}</h3>
                                                    <div className="text-right">
                                                        <div className="text-xl font-black text-gray-900">₹{room.price}</div>
                                                        <div className="text-xs text-gray-500">per night</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1"><Users className="w-4 h-4" /> Max: {room.capacity}</div>
                                                    <div className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> {room.available} units</div>
                                                </div>
                                                {room.amenities && room.amenities.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="text-xs font-bold text-gray-500 mb-2">Room Amenities</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {room.amenities.map((a, ai) => (
                                                                <span key={ai} className="px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center gap-1">
                                                                    <Coffee className="w-3 h-3" /> {a}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {room.features && room.features.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="text-xs font-bold text-gray-500 mb-2">Room Features</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {room.features.map((f, fi) => (
                                                                <span key={fi} className="px-2 py-1 bg-white border rounded text-xs text-gray-600 flex items-center gap-1">
                                                                    <FiCheckCircle className="w-3 h-3 text-green-500" /> {f}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">No rooms added yet.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Sidebar Info */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Email (Business)</label>
                                <div className="flex items-center gap-2 mt-1 font-medium"><FiMail className="text-blue-600" /> {property.contactInfo.email}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                <div className="flex items-center gap-2 mt-1 font-medium"><FiPhone className="text-blue-600" /> {property.contactInfo.phone}</div>
                            </div>
                            {property.address && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                                    <div className="flex items-start gap-2 mt-1 font-medium"><FiMapPin className="text-blue-600 mt-1 shrink-0" /> {property.address.street}, {property.address.city}, {property.address.state}, {property.address.zipCode}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Owner Info */}
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Owner Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {property.owner ? (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {property.owner.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{property.owner.name}</div>
                                            <div className="text-xs text-gray-500">Property Owner</div>
                                        </div>
                                    </div>
                                    <div className="text-sm space-y-2">
                                        <div className="flex gap-2"><FiMail className="w-4 h-4 text-gray-400" /> {property.owner.email}</div>
                                        {property.owner.phone && <div className="flex gap-2"><FiPhone className="w-4 h-4 text-gray-400" /> {property.owner.phone}</div>}
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500">No owner information linked.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Google Maps Location */}
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Location Map</CardTitle></CardHeader>
                        <CardContent>
                            {property.embedUrl ? (
                                <div className="w-full h-64 rounded-lg overflow-hidden border">
                                    <iframe
                                        src={(property.embedUrl.includes('google.com/maps') || property.embedUrl.includes('maps.google')) ? property.embedUrl : `https://www.google.com/maps?q=${property.location?.coordinates[1]},${property.location?.coordinates[0]}&output=embed`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            ) : property.documents?.googleLocationLink ? (
                                <div className="space-y-2">
                                    <a
                                        href={property.documents.googleLocationLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-2"
                                    >
                                        <FiMapPin /> Open in Google Maps
                                    </a>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    <FiMapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No location map available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documents Section */}
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg flex items-center justify-between">
                                Uploaded Documents
                                <Badge variant="outline" className="text-[10px] font-normal">Review Required</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {[
                                {
                                    title: "KYC Documents",
                                    fields: [
                                        { key: "panCard", label: "PAN Card" },
                                        { key: "ownerPhoto", label: "Owner Photo" },
                                    ]
                                },
                                {
                                    title: "Property Documents",
                                    fields: [
                                        { key: "ownershipProof", label: "Ownership Proof (Sale Deed/Registry)" },
                                        { key: "propertyAddressProof", label: "Property Address Proof" },
                                        { key: "googleLocationLink", label: "Google Maps Link", isLink: true },
                                    ]
                                },
                                {
                                    title: "Business & Bank",
                                    fields: [
                                        { key: "gstCertificate", label: "GST Certificate" },
                                        { key: "msmeRegistration", label: "MSME Registration" },
                                        { key: "cancelledCheque", label: "Cancelled Cheque" },
                                    ]
                                },
                                {
                                    title: "Licenses & Compliance",
                                    fields: [
                                        { key: "tradeLicense", label: "Trade License" },
                                        { key: "fireSafetyCertificate", label: "Fire Safety Certificate" },
                                        { key: "policeVerification", label: "Police Verification" },
                                        { key: "fssaiLicense", label: "FSSAI License" },
                                    ]
                                },
                                {
                                    title: "Agreement",
                                    fields: [
                                        { key: "signedAgreement", label: "UrbanHost Agreement" },
                                    ]
                                }
                            ].map((group, gIdx) => (
                                <div key={gIdx} className="border-b last:border-0">
                                    <div className="bg-gray-50 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center justify-between">
                                        {group.title}
                                        <div className="flex gap-1 h-3">
                                            {group.fields.filter(f => property.documents?.[f.key as keyof typeof property.documents]).length} / {group.fields.length}
                                        </div>
                                    </div>
                                    <div className="divide-y">
                                        {group.fields.map((field, fIdx) => {
                                            const value = property.documents?.[field.key as keyof typeof property.documents];
                                            return (
                                                <div key={fIdx} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                                        {!value && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Missing</span>}
                                                    </div>
                                                    {field.isLink ? (
                                                        value ? (
                                                            <a href={value as string} target="_blank" rel="noopener" className="text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">Open Map</a>
                                                        ) : (
                                                            <span className="text-[10px] text-gray-400 font-mono">N/A</span>
                                                        )
                                                    ) : (
                                                        value ? (
                                                            <Button
                                                                variant="link"
                                                                onClick={() => openDocModal(value as string, field.label)}
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 p-0 h-auto"
                                                            >
                                                                VIEW DOC
                                                            </Button>
                                                        ) : (
                                                            <div className="w-8 h-1 bg-gray-100 rounded-full" />
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Emergency Contacts Section */}
                            {(property.documents?.emergencyContactName || property.documents?.emergencyContactPhone || property.documents?.alternateContactName || property.documents?.alternateContactPhone) && (
                                <div className="p-4 bg-yellow-50/50">
                                    <h4 className="text-[11px] font-black uppercase text-yellow-800 mb-3 tracking-wider">Emergency Contacts</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {(property.documents.emergencyContactName || property.documents.emergencyContactPhone) && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-yellow-700 font-bold uppercase border-b border-yellow-200/50 pb-0.5 mb-1">Primary Manager</span>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{property.documents.emergencyContactName || "Not Provided"}</span>
                                                    {property.documents.emergencyContactPhone && (
                                                        <a href={`tel:+91${property.documents.emergencyContactPhone}`} className="text-sm font-bold text-blue-700 hover:underline">+91 {property.documents.emergencyContactPhone}</a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {(property.documents.alternateContactName || property.documents.alternateContactPhone) && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-yellow-700 font-bold uppercase border-b border-yellow-200/50 pb-0.5 mb-1">Alternate Contact</span>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{property.documents.alternateContactName || "Not Provided"}</span>
                                                    {property.documents.alternateContactPhone && (
                                                        <a href={`tel:+91${property.documents.alternateContactPhone}`} className="text-sm font-bold text-blue-700 hover:underline">+91 {property.documents.alternateContactPhone}</a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>


            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reject Property Listing</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-gray-500">
                            Please provide a reason for rejecting this property. This will be sent to the owner via email to help them improve their listing.
                        </p>
                        <textarea
                            className="w-full h-32 p-3 border rounded-lg active:ring-2 active:ring-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Example: Missing quality photos of the interior, or document verification failed..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectionReason.trim() || rejecting}
                        >
                            {rejecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Rejection
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Viewer Modal */}
            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogContent className="max-w-4xl p-0 bg-black/95 border-none text-white overflow-hidden">
                    <DialogTitle className="sr-only">Image Viewer</DialogTitle>
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                        >
                            <FiX className="w-6 h-6" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 z-40 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
                        >
                            <FiChevronLeft className="w-8 h-8" />
                        </button>

                        <div className="relative w-full h-full">
                            <Image
                                src={allImages[selectedImageIndex] || ''}
                                alt={`View ${selectedImageIndex + 1}`}
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 z-40 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
                        >
                            <FiChevronRight className="w-8 h-8" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium bg-black/50 px-4 py-1 rounded-full">
                            {selectedImageIndex + 1} / {allImages.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Document Viewer Modal */}
            <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
                <DialogContent className="max-w-4xl p-0 h-[85vh] flex flex-col">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>{selectedDocName}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 bg-gray-100 p-4 border overflow-hidden relative">
                        {selectedDocUrl.toLowerCase().match(/\.(jpeg|jpg|png|gif|webp)$/) ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={selectedDocUrl}
                                    alt={selectedDocName}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <iframe
                                src={selectedDocUrl}
                                className="w-full h-full rounded bg-white shadow-sm"
                                title="Document Viewer"
                            />
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => window.open(selectedDocUrl, '_blank')}>
                            Open in New Tab
                        </Button>
                        <Button onClick={() => setIsDocModalOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
