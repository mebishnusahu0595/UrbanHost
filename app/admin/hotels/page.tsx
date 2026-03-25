"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiHome, FiCheckCircle, FiClock, FiLoader } from "react-icons/fi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    FiPlus,
    FiSearch,
    FiMapPin,
    FiEdit,
    FiTrash2,
    FiEye,
    FiTag,
} from "react-icons/fi";
import { useAdminHotels, updateHotelStatus, deleteHotel } from "@/lib/hooks/useAdminHotels";
import { Loader2, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Hotel = {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    price: string;
    active: boolean;
    image: string;
    status?: string;
    labels?: string[];
};

export default function HotelManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [labelFilter, setLabelFilter] = useState("all");
    const [taxPercentage, setTaxPercentage] = useState<number>(12);
    const [isSavingTax, setIsSavingTax] = useState(false);

    const { data: apiHotels = [], isLoading, error } = useAdminHotels();
    const queryClient = useQueryClient();

    // Fetch current tax percentage
    useEffect(() => {
        fetch('/api/admin/settings?key=taxPercentage')
            .then(res => res.json())
            .then(data => {
                if (data.value !== null && data.value !== undefined) {
                    setTaxPercentage(data.value);
                }
            })
            .catch(err => console.error('Failed to fetch tax percentage:', err));
    }, []);

    // Save tax percentage
    const handleSaveTaxPercentage = async () => {
        if (taxPercentage < 0 || taxPercentage > 100) {
            alert('Tax percentage must be between 0 and 100');
            return;
        }

        setIsSavingTax(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'taxPercentage', value: taxPercentage }),
            });

            if (response.ok) {
                alert('Tax percentage updated successfully!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update tax percentage');
            }
        } catch (error) {
            console.error('Failed to update tax percentage:', error);
            alert('Failed to update tax percentage');
        } finally {
            setIsSavingTax(false);
        }
    };

    // Transform API hotels to match UI format
    const hotelsData: Hotel[] = apiHotels.map((hotel: any) => ({
        id: hotel.id || hotel._id,
        name: hotel.name || 'Untitled Property',
        location: hotel.address?.city ? `${hotel.address.city}, ${hotel.address.state || hotel.address.country}` : hotel.city || 'Unknown',
        rating: hotel.rating || 0,
        reviews: hotel.reviewCount || 0,
        price: hotel.pricePerNight > 5000 ? '₹₹₹₹' : hotel.pricePerNight > 3000 ? '₹₹₹' : '₹₹',
        active: hotel.status === 'approved',
        image: hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400',
        status: hotel.status,
        labels: hotel.labels || [],
    }));

    // Filter hotels based on search and filters
    const filteredHotels = hotelsData.filter((hotel) => {
        const matchesSearch =
            hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotel.id.toString().includes(searchTerm);

        const matchesLocation =
            locationFilter === "all" ||
            hotel.location.toLowerCase().includes(locationFilter.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && hotel.active) ||
            (statusFilter === "inactive" && !hotel.active) ||
            (statusFilter === "pending" && hotel.status === "pending");

        const matchesLabel =
            labelFilter === "all" ||
            (hotel.labels && hotel.labels.includes(labelFilter));

        return matchesSearch && matchesLocation && matchesStatus && matchesLabel;
    });

    // Toggle hotel active status
    const toggleHotelStatus = async (id: string) => {
        try {
            const hotel = hotelsData.find(h => h.id === id);
            const newStatus = hotel?.active ? 'pending' : 'approved';
            queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
        } catch (error) {
            console.error('Failed to update hotel status:', error);
            alert('Failed to update hotel status');
        }
    };

    // Toggle Labels
    const handleToggleLabel = async (id: string, label: string) => {
        try {
            await fetch(`/api/admin/hotels/${id}/toggle-label`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label }),
            });
            queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
        } catch (error) {
            console.error('Failed to update hotel label:', error);
            alert('Failed to update hotel label');
        }
    };

    const handleDeleteHotel = async (id: string) => {
        if (!confirm('Are you sure you want to delete this hotel?')) return;

        try {
            await deleteHotel(id);
            queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
        } catch (error) {
            console.error('Failed to delete hotel:', error);
            alert('Failed to delete hotel');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load hotels</p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] })}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="space-y-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/admin/dashboard" className="text-sm md:text-base">
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm md:text-base">Hotels</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-xl md:text-3xl font-semibold">Hotel Management</h1>
                    <p className="text-xs md:text-base text-muted-foreground">
                        Manage property listings and track status.
                    </p>
                </div>

                <Link href="/admin/addhotel" className="md:self-end">
                    <Button className="gap-2 text-sm md:text-base w-full md:w-auto">
                        <FiPlus className="size-4 md:size-5" />
                        Add New Hotel
                    </Button>
                </Link>
            </div>

            {/* Taxes & Fees Configuration */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                        <FiTag className="w-5 h-5 text-blue-600" />
                        Global Taxes & Fees
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-3 md:items-end">
                        <div className="flex-1 max-w-xs">
                            <label htmlFor="taxPercentage" className="text-sm font-medium text-gray-700 mb-2 block">
                                Tax Percentage (%)
                            </label>
                            <Input
                                id="taxPercentage"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={taxPercentage}
                                onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                                className="text-base"
                                placeholder="e.g., 12"
                            />
                        </div>
                        <Button 
                            onClick={handleSaveTaxPercentage}
                            disabled={isSavingTax}
                            className="gap-2"
                        >
                            {isSavingTax ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle className="w-4 h-4" />
                                    Save Tax Rate
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                        This percentage will be applied to all hotel bookings on the platform.
                    </p>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <StatCard
                    title="Total"
                    value={hotelsData.length.toString()}
                    icon={<FiHome className="size-4 md:size-5 text-blue-600" />}
                    iconBg="bg-blue-100"
                />
                <StatCard
                    title="Active"
                    value={hotelsData.filter(h => h.active).length.toString()}
                    icon={<FiCheckCircle className="size-4 md:size-5 text-green-600" />}
                    iconBg="bg-green-100"
                />
                <StatCard
                    title="Pending"
                    value={hotelsData.filter(h => h.status === 'pending').length.toString()}
                    icon={<FiClock className="size-4 md:size-5 text-orange-600" />}
                    iconBg="bg-orange-100"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3 top-3 text-muted-foreground size-4 md:size-5" />
                    <Input
                        placeholder="Search hotels..."
                        className="pl-10 text-sm md:text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-full md:w-[160px] text-xs md:text-base">
                            <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {Array.from(new Set(hotelsData.map(h => h.location).filter(Boolean))).map(location => (
                                <SelectItem key={location} value={location.toLowerCase()}>
                                    {location}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[140px] text-xs md:text-base">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={labelFilter} onValueChange={setLabelFilter}>
                        <SelectTrigger className="w-full md:w-[160px] text-xs md:text-base">
                            <SelectValue placeholder="Filter by Label" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Labels</SelectItem>
                            <SelectItem value="Urban Host Property">Urban Host Property</SelectItem>
                            <SelectItem value="Best Seller">Best Seller</SelectItem>
                            <SelectItem value="Featured">Featured</SelectItem>
                            <SelectItem value="Luxury">Luxury</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredHotels.map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex gap-3 p-3">
                                <Image
                                    src={hotel.image}
                                    alt={hotel.name}
                                    width={80}
                                    height={80}
                                    className="rounded-lg object-cover w-20 h-20 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-sm truncate">{hotel.name}</h3>
                                        <Badge
                                            variant={hotel.active ? "default" : "secondary"}
                                            className="text-[10px] px-2 py-0.5 flex-shrink-0"
                                        >
                                            {hotel.status === 'pending' ? 'Pending' : hotel.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <FiMapPin className="size-3" />
                                        <span className="truncate">{hotel.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span>{hotel.rating} ({hotel.reviews})</span>
                                        <span className="ml-2 font-medium text-gray-900">{hotel.price}</span>
                                    </div>
                                    {hotel.labels && hotel.labels.length > 0 && (
                                        <div className="flex gap-1 mt-2 flex-wrap">
                                            {hotel.labels.map(label => (
                                                <Badge key={label} variant="outline" className="text-[9px] px-1 py-0">{label}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t px-3 py-2 bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={hotel.active}
                                        onCheckedChange={() => toggleHotelStatus(hotel.id)}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {hotel.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    {/* Labels Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost" className={hotel.labels && hotel.labels.length > 0 ? "text-blue-600" : "text-gray-400"}>
                                                <FiTag className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Manage Labels</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {["Urban Host Property", "Best Seller", "Featured", "Luxury"].map((label) => (
                                                <DropdownMenuCheckboxItem
                                                    key={label}
                                                    checked={hotel.labels?.includes(label)}
                                                    onCheckedChange={() => handleToggleLabel(hotel.id, label)}
                                                >
                                                    {label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Link href={`/admin/hotels/view/${hotel.id}`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8">
                                            <FiEye className="size-4" />
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/hotels/${hotel.id}/edit`}>
                                        <Button size="icon" variant="ghost" title="Edit Hotel">
                                            <FiEdit className="size-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-500"
                                        onClick={() => handleDeleteHotel(hotel.id)}
                                    >
                                        <FiTrash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredHotels.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No hotels found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-base">Hotel Property</TableHead>
                                <TableHead className="text-base">Location</TableHead>
                                <TableHead className="text-base">Price Range</TableHead>
                                <TableHead className="text-base">Status</TableHead>
                                <TableHead className="text-right text-base">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredHotels.map((hotel) => (
                                <TableRow key={hotel.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={hotel.image}
                                                alt={hotel.name}
                                                width={56}
                                                height={56}
                                                className="rounded-lg object-cover"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-semibold">{hotel.name}</p>
                                                    {hotel.labels?.includes("Urban Host Property") && (
                                                        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-[10px] px-1.5 py-0">UH</Badge>
                                                    )}
                                                    {hotel.labels?.includes("Best Seller") && (
                                                        <Badge className="bg-blue-600 border-0 text-[10px] px-1.5 py-0">BS</Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                                    <span>{hotel.rating} ({hotel.reviews} reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2 text-base">
                                            <FiMapPin className="text-muted-foreground size-4" />
                                            {hotel.location}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-base font-medium">{hotel.price}</TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={hotel.active}
                                                onCheckedChange={() => toggleHotelStatus(hotel.id)}
                                            />
                                            <Badge
                                                variant={hotel.active ? "default" : "secondary"}
                                                className="text-sm px-3 py-1"
                                            >
                                                {hotel.status === 'pending' ? 'Pending' : hotel.active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-3">
                                            {/* Labels Dropdown */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        title="Manage Labels"
                                                        className={hotel.labels && hotel.labels.length > 0 ? "text-blue-600 bg-blue-50" : "text-gray-400"}
                                                    >
                                                        <FiTag className="size-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Manage Labels</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {["Urban Host Property", "Best Seller", "Featured", "Luxury"].map((label) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={label}
                                                            checked={hotel.labels?.includes(label)}
                                                            onCheckedChange={() => handleToggleLabel(hotel.id, label)}
                                                        >
                                                            {label}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Link href={`/admin/hotels/view/${hotel.id}`}>
                                                <Button size="icon" variant="ghost" title="View Details">
                                                    <FiEye className="size-5" />
                                                </Button>
                                            </Link>

                                            <Link href={`/admin/hotels/${hotel.id}/edit`}>
                                                <Button size="icon" variant="ghost" title="Edit Hotel">
                                                    <FiEdit className="size-5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-500"
                                                onClick={() => handleDeleteHotel(hotel.id)}
                                            >
                                                <FiTrash2 className="size-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredHotels.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No hotels found matching your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-sm md:text-base">
                <p className="text-muted-foreground text-center md:text-left">
                    Showing {filteredHotels.length} of {hotelsData.length} results
                </p>
                <div className="flex gap-2 justify-center md:justify-end">
                    <Button variant="outline" size="sm" className="text-xs md:text-base">
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs md:text-base">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    iconBg,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    iconBg: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-3 md:p-5">
                <div>
                    <p className="text-[10px] md:text-base font-medium text-muted-foreground">
                        {title}
                    </p>
                    <div className="text-lg md:text-3xl font-semibold">{value}</div>
                </div>
                <div
                    className={`flex items-center justify-center h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-xl ${iconBg}`}
                >
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}


