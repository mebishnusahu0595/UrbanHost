"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    FiSearch,
    FiMapPin,
    FiEye,
    FiCheck,
    FiX,
    FiMail,
    FiPhone,
    FiUser,
    FiHome,
    FiClock,
    FiCheckCircle,
} from "react-icons/fi";
import { Loader2, FileText } from "lucide-react";


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
    images: string[];
    photos?: {
        exterior?: string[];
        interior?: string[];
    };
    category: string;
    status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';
    contactInfo: {
        phone: string;
        email: string;
    };
    documents: {
        idProof?: string;
        addressProof?: string;
        ownershipProof?: string;
    };
    rooms: any[];
    createdAt: string;
    owner?: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
}

export default function AdminPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [rejecting, setRejecting] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await fetch('/api/admin/properties');
            const data = await response.json();
            // Ensure properties is always an array to prevent .filter errors
            if (Array.isArray(data)) {
                setProperties(data);
            } else {
                console.error('API returned non-array data:', data);
                setProperties([]);
            }
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (propertyId: string) => {
        try {
            const response = await fetch(`/api/admin/properties/${propertyId}/approve`, {
                method: 'POST',
            });
            const data = await response.json();

            if (response.ok) {
                alert(`Property approved! Login credentials sent to ${data.email}`);
                fetchProperties();
            } else {
                alert(data.error || 'Failed to approve property');
            }
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Failed to approve property');
        }
    };

    const handleReject = (propertyId: string) => {
        setSelectedPropertyId(propertyId);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedPropertyId || !rejectionReason.trim()) return;

        setRejecting(true);
        try {
            const response = await fetch(`/api/admin/properties/${selectedPropertyId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (response.ok) {
                alert('Property rejected');
                setIsRejectDialogOpen(false);
                fetchProperties();
            } else {
                alert('Failed to reject property');
            }
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('An error occurred');
        } finally {
            setRejecting(false);
        }
    };

    const router = useRouter();

    const viewPropertyDetails = (property: Property) => {
        router.push(`/admin/properties/${property._id}`);
    };
    const filteredProperties = properties.filter((property) => {
        // Exclude draft properties from admin view
        if (property.status === 'draft') return false;

        const matchesSearch =
            property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || 
            property.status === statusFilter ||
            (statusFilter === "pending" && (property.status === "pending" || property.status === "submitted"));

        return matchesSearch && matchesStatus;
    });

    const pendingCount = Array.isArray(properties) ? properties.filter(p => p.status === 'pending' || p.status === 'submitted').length : 0;
    const approvedCount = Array.isArray(properties) ? properties.filter(p => p.status === 'approved').length : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/dashboard">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Property Listings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-xl md:text-3xl font-semibold">Property Listings</h1>
                <p className="text-xs md:text-base text-muted-foreground">
                    Review and approve property applications from owners.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <Card>
                    <CardContent className="flex items-center justify-between p-3 md:p-5">
                        <div>
                            <p className="text-[10px] md:text-base font-medium text-muted-foreground">Total</p>
                            <div className="text-lg md:text-3xl font-semibold">{properties.length}</div>
                        </div>
                        <div className="flex items-center justify-center h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-xl bg-blue-100">
                            <FiHome className="size-4 md:size-5 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-3 md:p-5">
                        <div>
                            <p className="text-[10px] md:text-base font-medium text-muted-foreground">Pending</p>
                            <div className="text-lg md:text-3xl font-semibold">{pendingCount}</div>
                        </div>
                        <div className="flex items-center justify-center h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-xl bg-orange-100">
                            <FiClock className="size-4 md:size-5 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-3 md:p-5">
                        <div>
                            <p className="text-[10px] md:text-base font-medium text-muted-foreground">Approved</p>
                            <div className="text-lg md:text-3xl font-semibold">{approvedCount}</div>
                        </div>
                        <div className="flex items-center justify-center h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-xl bg-green-100">
                            <FiCheckCircle className="size-4 md:size-5 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Requests Button - Always visible */}
            <div className="flex justify-end">
                <Button
                    onClick={() => setStatusFilter("pending")}
                    className={pendingCount > 0
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed"
                    }
                    disabled={pendingCount === 0}
                >
                    <FiClock className="mr-2 h-4 w-4" />
                    {pendingCount > 0 ? `View Requests (${pendingCount})` : 'No Pending Requests'}
                </Button>
            </div>


            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3 top-3 text-muted-foreground size-4" />
                    <Input
                        placeholder="Search properties..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredProperties.map((property) => {
                    // Get first image from either images array or photos object
                    const firstImage = property.images?.[0] || 
                                      property.photos?.exterior?.[0] || 
                                      property.photos?.interior?.[0] || 
                                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400";
                    return (
                    <Card key={property._id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex gap-3 p-3">
                                <Image
                                    src={firstImage}
                                    alt={property.name}
                                    width={80}
                                    height={80}
                                    className="rounded-lg object-cover w-20 h-20 flex-shrink-0"
                                    unoptimized
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-sm truncate">{property.name}</h3>
                                        <Badge
                                            variant={property.status === 'approved' ? 'default' : (property.status === 'pending' || property.status === 'submitted') ? 'secondary' : 'destructive'}
                                            className="text-[10px] px-2 py-0.5 flex-shrink-0"
                                        >
                                            {property.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <FiMapPin className="size-3" />
                                        <span className="truncate">{property.address?.city}, {property.address?.state}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <FiMail className="size-3" />
                                        <span className="truncate">{property.contactInfo?.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end border-t px-3 py-2 bg-gray-50 gap-2">
                                <Button size="sm" variant="outline" onClick={() => viewPropertyDetails(property)}>
                                    <FiEye className="size-4 mr-1" /> View
                                </Button>
                                {(property.status === 'pending' || property.status === 'submitted') && (
                                    <>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(property._id)}>
                                            <FiCheck className="size-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleReject(property._id)}>
                                            <FiX className="size-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
                })}
                {filteredProperties.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No properties found.</p>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Property</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProperties.map((property) => {
                                // Get first image from either images array or photos object
                                const firstImage = property.images?.[0] || 
                                                  property.photos?.exterior?.[0] || 
                                                  property.photos?.interior?.[0] || 
                                                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400";
                                return (
                                <TableRow key={property._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={firstImage}
                                                alt={property.name}
                                                width={56}
                                                height={56}
                                                className="rounded-lg object-cover"
                                                unoptimized
                                            />
                                            <div>
                                                <p className="font-semibold">{property.name}</p>
                                                <p className="text-sm text-muted-foreground">{property.rooms?.length || 0} Rooms</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FiMapPin className="text-muted-foreground size-4" />
                                            {property.address?.city}, {property.address?.state}
                                        </div>
                                    </TableCell>
                                    <TableCell>{property.category}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="flex items-center gap-1">
                                                <FiMail className="size-3" /> {property.contactInfo?.email}
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <FiPhone className="size-3" /> {property.contactInfo?.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={property.status === 'approved' ? 'default' : (property.status === 'pending' || property.status === 'submitted') ? 'secondary' : 'destructive'}
                                        >
                                            {property.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => viewPropertyDetails(property)}>
                                                <FiEye className="size-4 mr-1" /> View
                                            </Button>
                                            {(property.status === 'pending' || property.status === 'submitted') && (
                                                <>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(property._id)}>
                                                        <FiCheck className="size-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleReject(property._id)}>
                                                        <FiX className="size-4 mr-1" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                            })}
                            {filteredProperties.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No properties found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reject Property Listing</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-gray-500">
                            Please provide a reason for rejecting this property.
                        </p>
                        <textarea
                            className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectConfirm}
                            disabled={!rejectionReason.trim() || rejecting}
                        >
                            {rejecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Rejection
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
