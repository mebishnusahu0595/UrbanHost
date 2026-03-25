"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FiSave,
    FiArrowLeft,
    FiHome,
    FiImage,
    FiDollarSign,
    FiSettings,
    FiFileText,
    FiUsers,
    FiPlus,
    FiTrash2,
    FiEdit2,
    FiUpload,
    FiX
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";


interface PropertyEditProps {
    params: Promise<{ id: string }>;
}

export default function PropertyEditPage({ params }: PropertyEditProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [property, setProperty] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("basic");
    const [newImages, setNewImages] = useState<string[]>([]);
    const [newDocuments, setNewDocuments] = useState<any[]>([]);
    const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

    useEffect(() => {
        fetchProperty();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        // Check if user has edit access
        if (session?.user && (session.user as any).canEditHotels === false) {
            alert("You don't have permission to edit properties. You have view-only access.");
            router.push("/property-owner/properties");
        }
    }, [session, router]);

    const fetchProperty = async () => {
        try {
            const response = await fetch(`/api/hotels/${id}`);
            if (response.ok) {
                const data = await response.json();
                // Ensure arrays are initialized
                if (!data.documents) data.documents = [];
                if (!data.images) data.images = [];
                if (!data.amenities) data.amenities = [];
                if (!data.emergencyContacts) data.emergencyContacts = [];
                if (!data.rooms) data.rooms = [];
                if (!data.addons) data.addons = [];
                // Ensure description exists
                if (!data.description) data.description = "";

                setProperty(data);
                setEmergencyContacts(data.emergencyContacts);
            }
        } catch (error) {
            console.error("Failed to fetch property:", error);
            alert("Failed to load property");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    uploadedUrls.push(data.url);
                }
            }

            setNewImages([...newImages, ...uploadedUrls]);
            setProperty({
                ...property,
                images: [...(property.images || []), ...uploadedUrls],
            });
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedDocs: any[] = [];

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    uploadedDocs.push({
                        name: file.name,
                        url: data.url,
                        type: file.type,
                        uploadedAt: new Date().toISOString(),
                    });
                }
            }

            setNewDocuments([...newDocuments, ...uploadedDocs]);
            setProperty({
                ...property,
                documents: [...(property.documents || []), ...uploadedDocs],
            });
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload documents");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        if (!property) return;
        const updatedImages = property.images?.filter((_: any, i: number) => i !== index) || [];
        setProperty({ ...property, images: updatedImages });
    };

    const handleRemoveDocument = (index: number) => {
        if (!property) return;
        const updatedDocs = property.documents?.filter((_: any, i: number) => i !== index) || [];
        setProperty({ ...property, documents: updatedDocs });
    };

    const toggleAmenity = (amenity: string) => {
        const currentAmenities = property.amenities || [];
        const updated = currentAmenities.includes(amenity)
            ? currentAmenities.filter((a: string) => a !== amenity)
            : [...currentAmenities, amenity];
        setProperty({ ...property, amenities: updated });
    };

    const handleAddContact = () => {
        setEmergencyContacts([
            ...emergencyContacts,
            { name: "", phone: "", role: "", available24x7: false },
        ]);
    };

    const handleRemoveContact = (index: number) => {
        setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
    };

    const handleContactChange = (index: number, field: string, value: any) => {
        const updated = [...emergencyContacts];
        updated[index] = { ...updated[index], [field]: value };
        setEmergencyContacts(updated);
    };

    const handleRoomImageUpload = async (roomIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    uploadedUrls.push(data.url);
                }
            }

            const updatedRooms = [...property.rooms];
            updatedRooms[roomIndex] = {
                ...updatedRooms[roomIndex],
                images: [...(updatedRooms[roomIndex].images || []), ...uploadedUrls],
            };
            setProperty({ ...property, rooms: updatedRooms });
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveRoomImage = (roomIndex: number, imageIndex: number) => {
        if (!property || !property.rooms) return;
        const updatedRooms = [...property.rooms];
        updatedRooms[roomIndex] = {
            ...updatedRooms[roomIndex],
            images: updatedRooms[roomIndex]?.images?.filter((_: any, i: number) => i !== imageIndex) || [],
        };
        setProperty({ ...property, rooms: updatedRooms });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedProperty = {
                ...property,
                emergencyContacts,
            };

            const response = await fetch(`/api/hotels/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProperty),
            });

            if (response.ok) {
                // Send notification to admin
                await fetch("/api/admin/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "HOTEL_UPDATE",
                        title: "Property Updated",
                        message: `Property "${property.name}" has been updated by property owner ${session?.user?.name || "Unknown"}`,
                        userId: session?.user?.id,
                        userName: session?.user?.name || "Property Owner",
                        userRole: "property-owner",
                        details: {
                            propertyId: id,
                            propertyName: property.name,
                            updates: {
                                photos: newImages.length > 0,
                                documents: newDocuments.length > 0,
                                amenities: true,
                                contacts: emergencyContacts.length > 0,
                                addons: true
                            },
                        },
                    }),
                });

                alert("Property updated successfully!");
                router.push("/property-owner/properties");
            } else {
                alert("Failed to update property");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleAddRoom = () => {
        if (!property) return;
        const newRoom = {
            type: "",
            price: 0,
            capacity: 1,
            amenities: [],
            features: [],
            images: [],
            available: 1,
        };
        setProperty({
            ...property,
            rooms: [...(property.rooms || []), newRoom],
        });
    };

    const handleRemoveRoom = (index: number) => {
        if (!property) return;
        const updatedRooms = property.rooms?.filter((_: any, i: number) => i !== index) || [];
        setProperty({ ...property, rooms: updatedRooms });
    };

    const handleRoomChange = (index: number, field: string, value: any) => {
        if (!property || !property.rooms) return;
        const updatedRooms = [...property.rooms];
        updatedRooms[index] = { ...updatedRooms[index], [field]: value };
        setProperty({ ...property, rooms: updatedRooms });
    };

    const handleAddAddon = () => {
        if (!property) return;
        setProperty({
            ...property,
            addons: [...(property.addons || []), { name: "", price: 0, description: "" }]
        });
    };

    const handleRemoveAddon = (index: number) => {
        if (!property) return;
        const updatedAddons = property.addons.filter((_: any, i: number) => i !== index);
        setProperty({ ...property, addons: updatedAddons });
    };

    const handleAddonChange = (index: number, field: string, value: any) => {
        if (!property || !property.addons) return;
        const updatedAddons = [...property.addons];
        updatedAddons[index] = { ...updatedAddons[index], [field]: value };
        setProperty({ ...property, addons: updatedAddons });
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
            <div className="flex items-center justify-center min-h-screen">
                <p>Property not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <FiArrowLeft />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
                            <p className="text-gray-600">{property.name}</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-7 mb-6">
                        <TabsTrigger value="basic" className="flex items-center gap-2">
                            <FiHome className="w-4 h-4" />
                            <span className="hidden md:inline">Basic Info</span>
                        </TabsTrigger>
                        <TabsTrigger value="rooms" className="flex items-center gap-2">
                            <FiDollarSign className="w-4 h-4" />
                            <span className="hidden md:inline">Rooms</span>
                        </TabsTrigger>
                        <TabsTrigger value="images" className="flex items-center gap-2">
                            <FiImage className="w-4 h-4" />
                            <span className="hidden md:inline">Photos</span>
                        </TabsTrigger>
                        <TabsTrigger value="amenities" className="flex items-center gap-2">
                            <FiSettings className="w-4 h-4" />
                            <span className="hidden md:inline">Amenities</span>
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2">
                            <FiFileText className="w-4 h-4" />
                            <span className="hidden md:inline">Documents</span>
                        </TabsTrigger>
                        <TabsTrigger value="contacts" className="flex items-center gap-2">
                            <FiUsers className="w-4 h-4" />
                            <span className="hidden md:inline">Contacts</span>
                        </TabsTrigger>
                        <TabsTrigger value="addons" className="flex items-center gap-2">
                            <FiPlus className="w-4 h-4" />
                            <span className="hidden md:inline">Addons</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Property Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={property.name || ""}
                                            onChange={(e) => setProperty({ ...property, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Category <span className="text-red-500">*</span></Label>
                                        <select
                                            value={property.category || ""}
                                            onChange={(e) => setProperty({ ...property, category: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Hotel">Hotel</option>
                                            <option value="Resort">Resort</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="Guesthouse">Guesthouse</option>
                                            <option value="Hostel">Hostel</option>
                                            <option value="Boutique">Boutique</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Description <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        value={property.description || ""}
                                        onChange={(e) => setProperty({ ...property, description: e.target.value })}
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Street Address <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={property.address?.street || ""}
                                            onChange={(e) => setProperty({
                                                ...property,
                                                address: { ...property.address, street: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>City <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={property.address?.city || ""}
                                            onChange={(e) => setProperty({
                                                ...property,
                                                address: { ...property.address, city: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>State <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={property.address?.state || ""}
                                            onChange={(e) => setProperty({
                                                ...property,
                                                address: { ...property.address, state: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>ZIP Code <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={property.address?.zipCode || ""}
                                            onChange={(e) => setProperty({
                                                ...property,
                                                address: { ...property.address, zipCode: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>Phone <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={property.contactInfo?.phone || ""}
                                            onChange={(e) => setProperty({
                                                ...property,
                                                contactInfo: { ...property.contactInfo, phone: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Email <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="email"
                                            value={property.contactInfo?.email || ""}
                                            onChange={(e) => setProperty({
                                                ...property,
                                                contactInfo: { ...property.contactInfo, email: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Website</Label>
                                        <Input
                                            value={property.contactInfo?.website || ""}
                                            onChange={(e) => setProperty({
                                                ...property,
                                                contactInfo: { ...property.contactInfo, website: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Rooms Tab */}
                    <TabsContent value="rooms">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Room Types & Pricing</CardTitle>
                                <Button
                                    onClick={handleAddRoom}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                >
                                    <FiPlus />
                                    Add Room Type
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {property.rooms?.map((room: any, index: number) => (
                                    <Card key={index} className="border-2">
                                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <FiEdit2 className="w-4 h-4" />
                                                Room Type {index + 1}
                                            </h3>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemoveRoom(index)}
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Room Type <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        value={room.type || ""}
                                                        onChange={(e) => handleRoomChange(index, "type", e.target.value)}
                                                        placeholder="e.g., Deluxe, Suite"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Price per Night (₹) <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        type="number"
                                                        value={room.price || ""}
                                                        onChange={(e) => handleRoomChange(index, "price", parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Capacity (Guests) <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        type="number"
                                                        value={room.capacity || ""}
                                                        onChange={(e) => handleRoomChange(index, "capacity", parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Available Rooms <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="number"
                                                    value={room.available || ""}
                                                    onChange={(e) => handleRoomChange(index, "available", parseInt(e.target.value))}
                                                />
                                            </div>

                                            {/* Room Images Section */}
                                            <div className="border-t pt-4 mt-4">
                                                <Label className="text-base font-semibold">Room Images</Label>
                                                <div className="mt-2 flex items-center gap-4">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => handleRoomImageUpload(index, e)}
                                                        disabled={uploading}
                                                        className="cursor-pointer"
                                                    />
                                                    {uploading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                                    {room.images?.map((image: string, imgIndex: number) => (
                                                        <div key={imgIndex} className="relative group">
                                                            <div className="relative h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                                                                <Image
                                                                    src={image}
                                                                    alt={`Room ${index + 1} image ${imgIndex + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                                                onClick={() => handleRemoveRoomImage(index, imgIndex)}
                                                            >
                                                                <FiX className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {(!room.images || room.images.length === 0) && (
                                                    <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-lg mt-4">
                                                        <FiImage className="w-8 h-8 mx-auto mb-1 opacity-50" />
                                                        <p>No images for this room yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {(!property.rooms || property.rooms.length === 0) && (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>No rooms added yet. Click "Add Room Type" to get started.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="images">
                        <Card>
                            <CardHeader>
                                <CardTitle>Property Photos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Upload New Photos</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="cursor-pointer"
                                        />
                                        {uploading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                                    {property.images?.map((image: string, index: number) => (
                                        <div key={index} className="relative group">
                                            <div className="relative h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                                                <Image
                                                    src={image}
                                                    alt={`Property image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <FiX className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {(!property.images || property.images.length === 0) && (
                                    <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                                        <FiImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No images uploaded yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="amenities">
                        <Card>
                            <CardHeader>
                                <CardTitle>Amenities & Facilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {[
                                        "WiFi",
                                        "Parking",
                                        "Swimming Pool",
                                        "Gym",
                                        "Restaurant",
                                        "Room Service",
                                        "Bar",
                                        "Spa",
                                        "Air Conditioning",
                                        "Laundry",
                                        "24/7 Front Desk",
                                        "Pet Friendly",
                                        "Airport Shuttle",
                                        "Conference Room",
                                        "Elevator",
                                        "Garden",
                                        "Terrace",
                                        "BBQ Facilities",
                                        "Hot Tub",
                                        "Sauna",
                                    ].map((amenity) => (
                                        <div
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${property.amenities?.includes(amenity)
                                                    ? "bg-blue-50 border-blue-600 text-blue-700"
                                                    : "bg-white border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{amenity}</span>
                                                {property.amenities?.includes(amenity) && (
                                                    <FiSettings className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Upload Documents (License, Certificates, etc.)</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={handleDocumentUpload}
                                            disabled={uploading}
                                            className="cursor-pointer"
                                        />
                                        {uploading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                                    </div>
                                </div>

                                <div className="space-y-2 mt-6">
                                    {property.documents && Object.keys(property.documents).length > 0 ? (
                                        Object.entries(property.documents)
                                            .filter(([key, value]) => value && typeof value === 'string' && value.trim() !== '')
                                            .map(([key, url]: [string, any], index: number) => {
                                                // Format field name for display
                                                const displayName = key
                                                    .replace(/([A-Z])/g, ' $1')
                                                    .replace(/^./, str => str.toUpperCase())
                                                    .trim();

                                                return (
                                                    <div
                                                        key={key}
                                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <FiFileText className="w-5 h-5 text-blue-600" />
                                                            <div>
                                                                <p className="font-medium">{displayName}</p>
                                                                <p className="text-sm text-gray-500 truncate max-w-md">{url}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(url, "_blank")}
                                                            >
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (!property) return;
                                                                    const updatedDocs = { ...property.documents };
                                                                    delete updatedDocs[key];
                                                                    setProperty({ ...property, documents: updatedDocs });
                                                                }}
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                                            <FiFileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No documents uploaded yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contacts">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Emergency Contacts</CardTitle>
                                <Button
                                    onClick={handleAddContact}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                >
                                    <FiPlus />
                                    Add Contact
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {emergencyContacts?.map((contact, index) => (
                                    <Card key={index} className="border-2">
                                        <CardContent className="pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Contact Name <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        value={contact.name || ""}
                                                        onChange={(e) =>
                                                            handleContactChange(index, "name", e.target.value)
                                                        }
                                                        placeholder="e.g., Manager Name"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Phone Number <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        value={contact.phone || ""}
                                                        onChange={(e) =>
                                                            handleContactChange(index, "phone", e.target.value)
                                                        }
                                                        placeholder="e.g., +91 98765 43210"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Role <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        value={contact.role || ""}
                                                        onChange={(e) =>
                                                            handleContactChange(index, "role", e.target.value)
                                                        }
                                                        placeholder="e.g., Manager, Security"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 mt-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={contact.available24x7 || false}
                                                        onChange={(e) =>
                                                            handleContactChange(index, "available24x7", e.target.checked)
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                    <Label className="mb-0">Available 24x7</Label>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => handleRemoveContact(index)}
                                            >
                                                <FiTrash2 className="w-4 h-4 mr-2" />
                                                Remove Contact
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}

                                {(!emergencyContacts || emergencyContacts.length === 0) && (
                                    <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                                        <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No emergency contacts added yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="addons">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Property Addons (Extra Services)</CardTitle>
                                <Button
                                    onClick={handleAddAddon}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                >
                                    <FiPlus />
                                    Add New Addon
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {property.addons?.length > 0 ? (
                                    <div className="space-y-4">
                                        {property.addons.map((addon: any, index: number) => (
                                            <div key={index} className="p-4 border-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <Label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Addon Name</Label>
                                                        <Input
                                                            value={addon.name}
                                                            onChange={(e) => handleAddonChange(index, "name", e.target.value)}
                                                            placeholder="e.g., Breakfast, Pick-up Service"
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-48">
                                                        <Label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Price (₹)</Label>
                                                        <Input
                                                            type="number"
                                                            value={addon.price}
                                                            onChange={(e) => handleAddonChange(index, "price", parseFloat(e.target.value))}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleRemoveAddon(index)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <FiTrash2 />
                                                            <span className="hidden md:inline">Remove</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <Label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Description (Optional)</Label>
                                                    <Input
                                                        value={addon.description || ""}
                                                        onChange={(e) => handleAddonChange(index, "description", e.target.value)}
                                                        placeholder="Description of the service"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FiPlus className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">No Addons Available</h3>
                                        <p className="text-gray-500 max-w-xs mx-auto mt-1">
                                            Add extra services like breakfast, airport transfers, or laundry for your guests.
                                        </p>
                                        <Button
                                            onClick={handleAddAddon}
                                            variant="outline"
                                            className="mt-6 border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                            Add Your First Addon
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
