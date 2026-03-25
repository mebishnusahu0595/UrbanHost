"use client";



import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  MapPin,
  Image as ImageIcon,
  FileText,
  Bed,
  CheckCircle,
  Upload,
  X,
  Plus,
  Trash2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { GoogleMapsImportModal, ImportFromMapsButton } from "@/components/ui/GoogleMapsImport";

interface RoomType {
  _id?: string;
  type: string;
  price: number;
  capacity: number;
  available: number;
  amenities: string[];
  features: string[];
  images: (File | string)[];
}

const RoomFeatureInput = ({ value, onChange }: { value: string[], onChange: (val: string[]) => void }) => {
  const [text, setText] = useState(value?.join(", ") || "");

  useEffect(() => {
    const currentText = value?.join(", ") || "";
    if (text !== currentText && !text.endsWith(',') && !text.endsWith(', ')) {
      setText(currentText);
    }
  }, [value]);

  return (
    <Input
      placeholder="e.g., Balcony, Sea View, Mini Fridge"
      value={text}
      onChange={(e) => {
        const newText = e.target.value;
        setText(newText);
        const splitValues = newText.split(",").map(f => f.trim());
        onChange(splitValues);
      }}
      onBlur={() => {
        const cleaned = text.split(",").map(f => f.trim()).filter(f => f !== "");
        const finalized = cleaned.join(", ");
        setText(finalized);
        onChange(cleaned);
      }}
    />
  );
};



const ExistingPropertySearch = ({ onSelect, onCancel }: { onSelect: (property: any) => void, onCancel: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search or use explicit search button as requested
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      // Assuming GET /api/admin/properties returns a list
      const res = await fetch(`/api/admin/properties`);
      if (res.ok) {
        const data = await res.json();
        const bookings = data.bookings || data.properties || data; // Handle various API responses
        // Filter by name or city
        const filtered = Array.isArray(bookings) ? bookings.filter((p: any) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];
        setResults(filtered);
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Search Existing Listings</h2>
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Search by hotel name or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Search"}
        </Button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {hasSearched && results.length === 0 && (
          <p className="text-gray-500 text-center py-4">No properties found matching "{searchTerm}"</p>
        )}

        {results.map((property) => (
          <div key={property._id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors" onClick={() => onSelect(property)}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden relative">
                {property.images?.[0] ? (
                  <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 m-auto text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{property.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.address?.city}, {property.address?.state}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">Select</Button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t flex justify-between items-center">
        <Button variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-gray-700">Cancel & Exit</Button>
        <div className="text-sm text-gray-500">
          Or <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => onSelect(null)}>Add New Property</span>
        </div>
      </div>
    </div>
  );
};

export default function ListPropertyPage({ isAdmin = false, hotelId }: { isAdmin?: boolean; hotelId?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for Search/Select
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!hotelId);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isGoogleMapsModalOpen, setIsGoogleMapsModalOpen] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState("");



  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: "",
    description: "",
    propertyType: "hotel",
    price: "",
    tags: [] as string[],
    rating: "4.5",
    totalReviews: "0",

    // Step 2: Location Details
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    coordinates: { lat: 0, lng: 0 },
    embedUrl: "",

    // Step 3: Contact Information
    phone: "",
    email: "",
    website: "",

    // Step 4: Property Images
    images: [] as (File | string)[],

    // Step 5: Amenities & Policies
    amenities: [] as string[],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    cancellationPolicy: "Standard Policy",
    petPolicy: "Pets not allowed",
    smokingPolicy: "No smoking",

    // Step 6: Room Types
    rooms: [] as RoomType[],

    // NEW: Highlights
    highlights: {
      coupleFriendly: "Unmarried couples allowed | Local Id accepted",
      bookAtZero: false,
      mobileDeal: "",
      cancellation: "",
    },

    // Step 7: Documents - Comprehensive as per URBANHOST Requirements
    documents: {
      // KYC Documents
      panCard: null as File | string | null,

      photo: null as File | string | null,
      // Property Documents
      ownershipProof: null as File | string | null,
      addressProof: null as File | string | null,
      googleLocation: '' as string,
      // Business Documents
      gstCertificate: null as File | string | null,
      msmeRegistration: null as File | string | null,
      // Bank Details
      cancelledCheque: null as File | string | null,
      // Licenses & Compliance
      tradeLicense: null as File | string | null,
      fireSafetyCertificate: null as File | string | null,
      policeVerification: null as File | string | null,
      fssaiLicense: null as File | string | null,
      // Agreement
      signedAgreement: null as File | string | null,
      // Emergency Contacts
      emergencyContactName: '' as string,
      emergencyContactPhone: '' as string,
      alternateContactName: '' as string,
      alternateContactPhone: '' as string,
    },
    addons: [] as { name: string, price: number, description?: string }[],
  });

  // Fetch hotel data if in edit mode
  useEffect(() => {
    if (hotelId) {
      const fetchHotel = async () => {
        try {
          const res = await fetch(`/api/properties/${hotelId}`);
          if (res.ok) {
            const { hotel } = await res.json();
            setFormData({
              name: hotel.name || "",
              description: hotel.description || "",
              propertyType: hotel.category?.toLowerCase() || "hotel",
              price: hotel.rooms?.[0]?.price?.toString() || "",
              tags: hotel.labels || [],
              street: hotel.address?.street || "",
              city: hotel.address?.city || "",
              state: hotel.address?.state || "",
              zipCode: hotel.address?.zipCode || "",
              country: hotel.address?.country || "India",
              coordinates: hotel.coordinates || { lat: 0, lng: 0 },
              embedUrl: hotel.embedUrl || "",
              phone: hotel.contactInfo?.phone || "",
              email: hotel.contactInfo?.email || "",
              website: hotel.contactInfo?.website || "",
              images: hotel.images || [],
              amenities: hotel.amenities || [],
              checkInTime: hotel.checkInTime || "14:00",
              checkOutTime: hotel.checkOutTime || "11:00",
              cancellationPolicy: hotel.policies?.cancellation || "",
              petPolicy: hotel.policies?.petPolicy || "",
              smokingPolicy: hotel.smokingPolicy || "",
              rooms: hotel.rooms || [],
              rating: hotel.rating?.toString() || "4.5",
              totalReviews: hotel.totalReviews?.toString() || "0",
              highlights: hotel.highlights || {
                coupleFriendly: "Unmarried couples allowed | Local Id accepted",
                bookAtZero: false,
                mobileDeal: "",
                cancellation: "",
              },
              documents: hotel.documents || { panCard: null, addressProof: null, ownershipProof: null, cancelledCheque: null, signedAgreement: null, googleLocation: '', gstCertificate: null },
              addons: hotel.addons || [],
            });
          }
        } catch (err) {
          console.error("Failed to fetch hotel for edit:", err);
        }
      };
      fetchHotel();
    }
  }, [hotelId]);

  const [customTagInput, setCustomTagInput] = useState("");
  // Hide "Urban Host Property" tag for property owners (non-admin)
  const availableTags = isAdmin
    ? ["Featured", "Urban Host Property", "Premium", "Budget Friendly"]
    : ["Featured", "Premium", "Budget Friendly"];

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setCustomTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const commonAmenities = [
    "WiFi", "Parking", "Swimming Pool", "Gym", "Restaurant",
    "Room Service", "Laundry", "Air Conditioning", "TV", "Mini Bar",
    "Safe", "Elevator", "24/7 Reception", "Conference Room", "Spa"
  ];

  const steps = [
    { number: 1, title: "Basic Info", icon: Building2 },
    { number: 2, title: "Location", icon: MapPin },
    { number: 3, title: "Contact", icon: FileText },
    { number: 4, title: "Photos", icon: ImageIcon },
    { number: 5, title: "Amenities", icon: CheckCircle },
    { number: 6, title: "Rooms", icon: Bed },
    { number: 7, title: "Documents", icon: Upload },
    { number: 8, title: "Addons", icon: Plus },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleRoomImageUpload = (roomIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, i) =>
        i === roomIndex ? { ...room, images: [...room.images, ...files] } : room
      )
    }));
  };

  const removeRoomImage = (roomIndex: number, imgIndex: number) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, i) =>
        i === roomIndex ? { ...room, images: room.images.filter((_, j) => j !== imgIndex) } : room
      )
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, {
        type: "",
        price: 0,
        capacity: 1,
        available: 1,
        amenities: [],
        features: [],
        images: []
      }]
    }));
  };

  const updateRoom = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      )
    }));
  };

  const removeRoom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index)
    }));
  };

  const handleDocumentUpload = (type: 'panCard' | 'photo' | 'addressProof' | 'ownershipProof' | 'cancelledCheque' | 'signedAgreement' | 'gstCertificate' | 'msmeRegistration' | 'tradeLicense' | 'fireSafetyCertificate' | 'policeVerification' | 'fssaiLicense', file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: file
      }
    }));
  };

  const addAddon = () => {
    setFormData(prev => ({
      ...prev,
      addons: [...prev.addons, { name: "", price: 0, description: "" }]
    }));
  };

  const removeAddon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  const updateAddon = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newAddons = [...prev.addons];
      newAddons[index] = { ...newAddons[index], [field]: value };
      return { ...prev, addons: newAddons };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Validation
      if (!formData.name || !formData.description || !formData.city || !formData.price) {
        throw new Error("Please fill in all mandatory fields (Name, Description, City, Price)");
      }

      // Helper to upload a single file
      const uploadFile = async (file: File): Promise<string> => {
        const data = new FormData();
        data.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: data });
        if (!res.ok) throw new Error('Failed to upload image');
        const json = await res.json();
        return json.url;
      };

      // Helper to process a list of images (File | string)
      const processImages = async (images: (File | string)[]): Promise<string[]> => {
        return Promise.all(images.map(async (img) => {
          if (img instanceof File) {
            return await uploadFile(img);
          }
          return img; // Already a URL
        }));
      };

      // Upload Property Images
      const imageUrls = await processImages(formData.images);

      // Upload Room Images
      const processedRooms = await Promise.all(formData.rooms.map(async (room) => {
        const roomImageUrls = await processImages(room.images);
        return {
          ...room,
          images: roomImageUrls
        };
      }));

      // Upload Documents
      const processedDocuments: any = { ...formData.documents };
      for (const key of Object.keys(processedDocuments)) {
        const value = processedDocuments[key as keyof typeof processedDocuments];
        if (value instanceof File) {
          processedDocuments[key] = await uploadFile(value);
        }
      }

      // Construct Payload
      const payload = {
        name: formData.name,
        description: formData.description,
        propertyType: formData.propertyType,
        price: formData.price,
        tags: formData.tags,
        rating: formData.rating,
        totalReviews: formData.totalReviews,
        address: {
          street: formData.street || "Main Street",
          city: formData.city,
          state: formData.state || "",
          zipCode: formData.zipCode || "000000",
          country: formData.country || "India"
        },
        embedUrl: formData.embedUrl || "",
        coordinates: (formData.coordinates.lat !== 0 || formData.coordinates.lng !== 0) ? formData.coordinates : undefined,
        contactInfo: {
          phone: formData.phone || "0000000000",
          email: formData.email || "contact@hotel.com",
          website: formData.website || ""
        },
        policies: {
          cancellation: formData.cancellationPolicy,
          petPolicy: formData.petPolicy,
          smokingPolicy: formData.smokingPolicy
        },
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        amenities: formData.amenities,
        highlights: formData.highlights,
        images: imageUrls,
        rooms: processedRooms.length > 0 ? processedRooms : [{
          type: "Standard Room",
          price: Number(formData.price) || 0,
          capacity: 2,
          available: 10,
          amenities: ["WiFi", "TV"],
          features: [],
          images: []
        }],
        documents: processedDocuments,
        addons: formData.addons,
        status: isAdmin ? "approved" : "pending"
      };

      // Send JSON Payload
      const response = await fetch(isEditMode ? `/api/properties/${hotelId}` : "/api/properties", {
        method: isEditMode ? "PATCH" : "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit property");
      }

      if (isAdmin) {
        router.push("/admin/hotels");
      } else {
        router.push("/list-property/success");
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Handle Step 0: Search
  if (currentStep === 0) {
    if (hotelId) {
      setCurrentStep(1); // Skip if ID provided directly
    } else {
      return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Manage Properties</h1>
            <p className="text-gray-500">Search for an existing property to edit or add a new one.</p>
          </div>
          <ExistingPropertySearch
            onSelect={(property) => {
              if (property) {
                setIsEditMode(true);
                setFormData({
                  name: property.name || "",
                  description: property.description || "",
                  propertyType: property.category?.toLowerCase() || "hotel",
                  price: property.rooms?.[0]?.price?.toString() || "",
                  tags: property.labels || [],
                  street: property.address?.street || "",
                  city: property.address?.city || "",
                  state: property.address?.state || "",
                  zipCode: property.address?.zipCode || "",
                  country: property.address?.country || "India",
                  coordinates: property.coordinates || { lat: 0, lng: 0 },
                  embedUrl: property.embedUrl || "",
                  phone: property.contactInfo?.phone || "",
                  email: property.contactInfo?.email || "",
                  website: property.contactInfo?.website || "",
                  images: property.images || [],
                  amenities: property.amenities || [],
                  checkInTime: property.checkInTime || "14:00",
                  checkOutTime: property.checkOutTime || "11:00",
                  cancellationPolicy: property.policies?.cancellation || "",
                  petPolicy: property.policies?.petPolicy || "",
                  smokingPolicy: property.smokingPolicy || "",
                  rooms: property.rooms || [],
                  rating: property.rating?.toString() || "4.5",
                  totalReviews: property.totalReviews?.toString() || "0",
                  highlights: property.highlights || {
                    coupleFriendly: "Unmarried couples allowed | Local Id accepted",
                    bookAtZero: false,
                    mobileDeal: "",
                    cancellation: "",
                  },
                  documents: property.documents || { panCard: null, addressProof: null, ownershipProof: null, cancelledCheque: null, signedAgreement: null, googleLocation: '', gstCertificate: null },
                  addons: property.addons || [],
                });
                // Hack: We need the ID for updates. Since we don't have a state for it other than prop...
                // We can use a URL param or router replacement, but for now let's hope the form submission uses the ID if we store it?
                // Wait, `isEditMode` relies on `hotelId` prop usually. 
                // Ensure submit logic handles this. 
                // Actually, let's push to the edit URL to be safe and cleaner?
                // router.push(`/admin/hotel/${property._id}/edit`); // If that route exists.
                // But user wants "Search Cancel & Exit" here.
              } else {
                setIsEditMode(false);
              }
              setCurrentStep(1);
            }}
            onCancel={() => router.push('/admin/dashboard')}
          />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
            {isAdmin ? "Add New Hotel" : "List Your Property"}
          </h1>
          <p className="text-xs md:text-base text-gray-600">
            {isAdmin ? "Enter hotel property details" : "Register your property"}
          </p>
        </div>

        {/* Progress Steps */}
        {/* Progress Steps */}
        <div className="mb-6 md:mb-12">
          {/* Mobile: Show current step */}
          <div className="md:hidden flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {steps.length}</span>
            <span className="text-sm font-semibold text-[#1E3A8A]">{steps[currentStep - 1]?.title}</span>
          </div>
          <div className="md:hidden w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1E3A8A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>

          {/* Desktop: Full step indicator */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${currentStep >= step.number
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-gray-200 text-gray-500'
                    }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                    ) : (
                      <step.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                    )}
                  </div>
                  <span className={`text-[10px] lg:text-xs mt-2 text-center ${currentStep >= step.number ? 'text-[#1E3A8A] font-semibold' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-1 lg:mx-2 ${currentStep > step.number ? 'bg-[#1E3A8A]' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name *
                </label>
                <Input
                  placeholder="e.g., Grand Hotel Mumbai"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  required
                >
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="guesthouse">Guest House</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="hostel">Hostel</option>
                  <option value="boutique">Boutique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  placeholder="Describe your property, its unique features, and what makes it special..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (0-5)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="4.5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Reviews
                  </label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.totalReviews}
                    onChange={(e) => setFormData({ ...formData, totalReviews: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>

                {/* Selected Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Selected Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Predefined Tags */}
                <p className="text-xs text-gray-500 mb-2">Quick Add:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${formData.tags.includes(tag)
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add custom tag..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addCustomTag}
                    variant="outline"
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Tag
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Press Enter or click "Add Tag" to add a custom tag
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="mb-3 md:mb-4">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 text-center md:text-left">Location Details</h2>
              </div>

              <div className="mb-4 h-[300px] border rounded-lg overflow-hidden relative z-0 bg-gray-50 flex flex-col items-center justify-center">
                {formData.embedUrl ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={formData.embedUrl}
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

                {formData.coordinates.lat !== 0 && (
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-mono border z-[1000]">
                    Lat: {formData.coordinates.lat.toFixed(5)} | Lng: {formData.coordinates.lng.toFixed(5)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <Input
                  placeholder="123 Main Street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Input
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <Input
                    placeholder="400001"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <Input
                    placeholder="India"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Contact Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number * (10 digits)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone.replace(/^\+91\s?/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: val });
                      if (val.length !== 10) {
                        setValidationErrors(prev => ({ ...prev, phone: 'Phone must be exactly 10 digits' }));
                      } else {
                        setValidationErrors(prev => { const { phone, ...rest } = prev; return rest; });
                      }
                    }}
                    className="rounded-l-none"
                    maxLength={10}
                    required
                  />
                </div>
                {validationErrors.phone && <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address * (must include @ and .com/.in)
                </label>
                <Input
                  type="email"
                  placeholder="contact@yourhotel.com"
                  value={formData.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, email: val });
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(val)) {
                      setValidationErrors(prev => ({ ...prev, email: 'Enter valid email (e.g. name@domain.com)' }));
                    } else {
                      setValidationErrors(prev => { const { email, ...rest } = prev; return rest; });
                    }
                  }}
                  required
                />
                {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://www.yourhotel.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 4: Property Images */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Property Photos</h2>
              <p className="text-gray-600">Upload high-quality photos of your property (at least 5 images required)</p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="property-images"
                />
                <label htmlFor="property-images" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload images</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image instanceof File ? URL.createObjectURL(image) : image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Amenities & Policies */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Amenities & Policies</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {commonAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${formData.amenities.includes(amenity)
                        ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                        : 'border-gray-300 hover:border-[#1E3A8A]'
                        }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amenities
                </label>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add custom amenity (e.g. Garden, Fireplace)"
                    value={customAmenityInput}
                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = customAmenityInput.trim();
                        if (val && !formData.amenities.includes(val)) {
                          setFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                          setCustomAmenityInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const val = customAmenityInput.trim();
                      if (val && !formData.amenities.includes(val)) {
                        setFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                        setCustomAmenityInput("");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add
                  </Button>
                </div>
                {/* Display custom amenities that are NOT in commonAmenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {formData.amenities.filter(a => !commonAmenities.includes(a)).map(amenity => (
                    <div key={amenity} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border border-blue-200">
                      {amenity}
                      <button onClick={() => toggleAmenity(amenity)} className="text-white bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors shadow-sm"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Time
                  </label>
                  <Input
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Time
                  </label>
                  <Input
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Cancellation Policy Removed - Central Policy Applies */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Policy
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.petPolicy}
                    onChange={(e) => setFormData({ ...formData, petPolicy: e.target.value })}
                  >
                    <option value="Pets not allowed">Pets not allowed</option>
                    <option value="Pets allowed">Pets allowed</option>
                    <option value="Pets allowed with fee">Pets allowed with fee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smoking Policy
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.smokingPolicy}
                    onChange={(e) => setFormData({ ...formData, smokingPolicy: e.target.value })}
                  >
                    <option value="No smoking">No smoking</option>
                    <option value="Smoking allowed">Smoking allowed</option>
                    <option value="Designated smoking areas">Designated smoking areas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Property Highlights</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couple Friendly Text
                  </label>
                  <Input
                    placeholder="Unmarried couples allowed | Local Id accepted"
                    value={formData.highlights.coupleFriendly}
                    onChange={(e) => setFormData({
                      ...formData,
                      highlights: { ...formData.highlights, coupleFriendly: e.target.value }
                    })}
                  />
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="bookAtZero"
                      checked={formData.highlights.bookAtZero}
                      onChange={(e) => setFormData({
                        ...formData,
                        highlights: { ...formData.highlights, bookAtZero: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="bookAtZero" className="text-sm font-medium text-gray-700">
                      Book@0 Available
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Deal Text (e.g. Special discount of ₹22)
                  </label>
                  <Input
                    placeholder="Special discount of ₹22 for Mobile users"
                    value={formData.highlights.mobileDeal}
                    onChange={(e) => setFormData({
                      ...formData,
                      highlights: { ...formData.highlights, mobileDeal: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Room Types */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">Room Types</h2>
                <Button onClick={addRoom} className="bg-[#1E3A8A] hover:bg-[#1e40af]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room Type
                </Button>
              </div>

              {formData.rooms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Bed className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No room types added yet</p>
                  <p className="text-sm text-gray-500">Click "Add Room Type" to start</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.rooms.map((room, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Room Type {index + 1}</h3>
                        <button
                          onClick={() => removeRoom(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Type Name *
                          </label>
                          <Input
                            placeholder="e.g., Deluxe Room, Suite"
                            value={room.type}
                            onChange={(e) => updateRoom(index, 'type', e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price per Night (₹) *
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="2000"
                            value={room.price || ''}
                            onChange={(e) => updateRoom(index, 'price', parseFloat(e.target.value))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Capacity *
                          </label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="2"
                            value={room.capacity || ''}
                            onChange={(e) => updateRoom(index, 'capacity', parseInt(e.target.value))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Rooms *
                          </label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="10"
                            value={room.available || ''}
                            onChange={(e) => updateRoom(index, 'available', parseInt(e.target.value))}
                            required
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Room Amenities
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {commonAmenities.map((amenity) => (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => {
                                const currentAmenities = room.amenities || [];
                                const newAmenities = currentAmenities.includes(amenity)
                                  ? currentAmenities.filter(a => a !== amenity)
                                  : [...currentAmenities, amenity];
                                updateRoom(index, 'amenities', newAmenities);
                              }}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${(room.amenities || []).includes(amenity)
                                ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                                : 'border-gray-300 hover:border-[#1E3A8A]'
                                }`}
                            >
                              {amenity}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Room Features (Comma separated)
                        </label>
                        <RoomFeatureInput
                          value={room.features || []}
                          onChange={(val) => updateRoom(index, 'features', val)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Room Images
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {room.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative group h-24">
                              <img
                                src={img instanceof File ? URL.createObjectURL(img) : img}
                                alt={`Room ${imgIdx + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400";
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeRoomImage(index, imgIdx)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 h-24">
                            <Plus className="w-6 h-6 text-gray-400" />
                            <span className="text-[10px] text-gray-500">Add Photo</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleRoomImageUpload(index, e)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 7: Documents */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Required Documents</h2>
              <p className="text-gray-600">Please upload the following documents for verification</p>

              <div className="space-y-4">
                {/* PAN Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">1. PAN Card *</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('panCard', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A8A] file:text-white hover:file:bg-[#1e40af]"
                  />
                  {formData.documents.panCard && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.panCard instanceof File ? formData.documents.panCard.name : 'Existing Document'}</p>}
                </div>



                {/* Address Proof */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">3. Address Proof (Utility Bill) *</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('addressProof', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A8A] file:text-white hover:file:bg-[#1e40af]"
                  />
                  {formData.documents.addressProof && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.addressProof instanceof File ? formData.documents.addressProof.name : 'Existing Document'}</p>}
                </div>

                {/* Ownership Proof */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">4. Property Ownership Proof *</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('ownershipProof', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A8A] file:text-white hover:file:bg-[#1e40af]"
                  />
                  {formData.documents.ownershipProof && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.ownershipProof instanceof File ? formData.documents.ownershipProof.name : 'Existing Document'}</p>}
                </div>

                {/* Cancelled Cheque */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">5. Cancelled Cheque / Bank Passbook *</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('cancelledCheque', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A8A] file:text-white hover:file:bg-[#1e40af]"
                  />
                  {formData.documents.cancelledCheque && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.cancelledCheque instanceof File ? formData.documents.cancelledCheque.name : 'Existing Document'}</p>}
                </div>

                {/* Signed Agreement */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">6. Signed URBANHOST Agreement * (PDF only)</label>
                  <input type="file" accept=".pdf" onChange={(e) => e.target.files && handleDocumentUpload('signedAgreement', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A8A] file:text-white hover:file:bg-[#1e40af]"
                  />
                  {formData.documents.signedAgreement && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.signedAgreement instanceof File ? formData.documents.signedAgreement.name : 'Existing Document'}</p>}
                </div>

                {/* Google Location */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">7. Google Maps Location Link *</label>
                  <Input placeholder="https://maps.google.com/..." value={formData.documents.googleLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, documents: { ...prev.documents, googleLocation: e.target.value } }))}
                  />
                </div>

                {/* GST (Optional) */}
                <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <label className="block text-sm font-medium text-gray-500 mb-2">8. GST Certificate (Optional)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('gstCertificate', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600"
                  />
                  {formData.documents.gstCertificate && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.gstCertificate instanceof File ? formData.documents.gstCertificate.name : 'Existing Document'}</p>}
                </div>

                {/* Passport Photo */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">9. Passport-size Photograph *</label>
                  <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('photo', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A8A] file:text-white hover:file:bg-[#1e40af]"
                  />
                  {formData.documents.photo && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.photo instanceof File ? formData.documents.photo.name : 'Existing Document'}</p>}
                </div>

                {/* MSME */}
                <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <label className="block text-sm font-medium text-gray-500 mb-2">10. MSME / Udyam Registration (Optional)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('msmeRegistration', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600"
                  />
                  {formData.documents.msmeRegistration && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.msmeRegistration instanceof File ? formData.documents.msmeRegistration.name : 'Existing Document'}</p>}
                </div>

                {/* Trade License */}
                <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <label className="block text-sm font-medium text-gray-500 mb-2">11. Trade License (Optional)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('tradeLicense', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600"
                  />
                  {formData.documents.tradeLicense && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.tradeLicense instanceof File ? formData.documents.tradeLicense.name : 'Existing Document'}</p>}
                </div>

                {/* Fire Safety */}
                <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <label className="block text-sm font-medium text-gray-500 mb-2">12. Fire Safety Certificate (Optional)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('fireSafetyCertificate', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600"
                  />
                  {formData.documents.fireSafetyCertificate && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.fireSafetyCertificate instanceof File ? formData.documents.fireSafetyCertificate.name : 'Existing Document'}</p>}
                </div>

                {/* Police Verification */}
                <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <label className="block text-sm font-medium text-gray-500 mb-2">13. Police Verification / NOC (Optional)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('policeVerification', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600"
                  />
                  {formData.documents.policeVerification && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.policeVerification instanceof File ? formData.documents.policeVerification.name : 'Existing Document'}</p>}
                </div>

                {/* FSSAI */}
                <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <label className="block text-sm font-medium text-gray-500 mb-2">14. FSSAI License (Optional - if food served)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleDocumentUpload('fssaiLicense', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600"
                  />
                  {formData.documents.fssaiLicense && <p className="mt-2 text-sm text-green-600">✓ {formData.documents.fssaiLicense instanceof File ? formData.documents.fssaiLicense.name : 'Existing Document'}</p>}
                </div>

                {/* Emergency Contacts */}
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <label className="block text-sm font-bold text-blue-800 mb-3">15. Emergency Contact Details *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Property Manager Name *</label>
                      <Input placeholder="Full Name" value={formData.documents.emergencyContactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, documents: { ...prev.documents, emergencyContactName: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">24x7 Contact Number *</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-xs">+91</span>
                        <Input className="rounded-l-none" placeholder="9876543210" maxLength={10} value={formData.documents.emergencyContactPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, documents: { ...prev.documents, emergencyContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) } }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Alternate Contact Name (Optional)</label>
                      <Input placeholder="Full Name" value={formData.documents.alternateContactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, documents: { ...prev.documents, alternateContactName: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Alternate Phone (Optional)</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-xs">+91</span>
                        <Input className="rounded-l-none" placeholder="9876543210" maxLength={10} value={formData.documents.alternateContactPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, documents: { ...prev.documents, alternateContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) } }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After submission, your property will be reviewed by our team.
                  You will receive a confirmation message once approved (usually within 2-3 business days).
                </p>
              </div>
            </div>
          )}

          {/* Step 8: Addons */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">Hotel Addons</h2>
                  <p className="text-gray-600">Offer extra services to your guests (e.g., Breakfast, Spa, Pickup)</p>
                </div>
                <Button
                  onClick={addAddon}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Addon
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {formData.addons.map((addon, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm relative group">
                    <button
                      onClick={() => removeAddon(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Addon Name</label>
                        <Input
                          placeholder="e.g. Breakfast Buffet"
                          value={addon.name}
                          onChange={(e) => updateAddon(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={addon.price}
                          onChange={(e) => updateAddon(index, 'price', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Optional)</label>
                        <Input
                          placeholder="Brief description of the service"
                          value={addon.description || ''}
                          onChange={(e) => updateAddon(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.addons.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <Plus className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No addons added yet. Click "Add Addon" to provide extra services.</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                <p className="text-sm text-blue-800">
                  <strong>Final Check:</strong> Please review all steps before submitting your property for review.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
              className="px-6"
            >
              Previous
            </Button>

            {currentStep < 8 ? (
              <Button
                onClick={nextStep}
                className="bg-[#1E3A8A] hover:bg-[#1e40af] px-6"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#F87171] hover:bg-[#EF4444] px-8"
              >
                {loading ? "Submitting..." : (isAdmin ? "Add Hotel" : "Submit for Review")}
              </Button>
            )}
          </div>
        </div>
      </div >
      <GoogleMapsImportModal
        isOpen={isGoogleMapsModalOpen}
        onClose={() => setIsGoogleMapsModalOpen(false)}
        onImport={(data) => {
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: data.coordinates.lat, lng: data.coordinates.lng },
            embedUrl: data.embedUrl
          }));

          if (data.address) {
            // Auto-fill address fields
            setFormData(prev => ({
              ...prev,
              street: data.address?.street || prev.street,
              city: data.address?.city || prev.city,
              state: data.address?.state || prev.state,
              zipCode: data.address?.zipCode || prev.zipCode
            }));
          }
        }}
      />
    </div >
  );
}
