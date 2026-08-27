"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiHome, FiCheckCircle, FiClock } from "react-icons/fi";
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
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import { useAdminHotels, deleteHotel } from "@/lib/hooks/useAdminHotels";
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

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
    const hotelsData: Hotel[] = useMemo(() => {
        return apiHotels.map((hotel: any) => ({
            id: hotel.id || hotel._id,
            name: hotel.name || 'Untitled Property',
            location: hotel.address?.city ? `${hotel.address.city}, ${hotel.address.state || hotel.address.country}` : hotel.city || 'Unknown',
            rating: hotel.rating || 0,
            reviews: hotel.totalReviews || hotel.reviewCount || 0,
            price: hotel.pricePerNight > 5000 ? '$$$$' : hotel.pricePerNight > 3000 ? '$$$' : '$$',
            active: hotel.status === 'approved',
            image: hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400',
            status: hotel.status,
            labels: hotel.labels || [],
        }));
    }, [apiHotels]);

    // Filter hotels based on search and filters
    const filteredHotels = useMemo(() => {
        return hotelsData.filter((hotel) => {
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
    }, [hotelsData, searchTerm, locationFilter, statusFilter, labelFilter]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, locationFilter, statusFilter, labelFilter]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredHotels.length / itemsPerPage));
    const paginatedHotels = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredHotels.slice(start, start + itemsPerPage);
    }, [filteredHotels, currentPage, itemsPerPage]);

    // Toggle hotel active status
    const toggleHotelStatus = async (id: string) => {
        try {
            const hotel = hotelsData.find(h => h.id === id);
            const newStatus = hotel?.active ? 'pending' : 'approved';
            await fetch(`/api/admin/hotels/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
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
        <div className="p-4 md:p-6 space-y-6 w-full max-w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/admin/dashboard" className="text-sm">
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm">Hotels</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Hotel Management</h1>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Manage all {hotelsData.length} property listings, categories, pricing, and live status.
                    </p>
                </div>

                <Link href="/admin/addhotel">
                    <Button className="gap-2 text-sm w-full md:w-auto shadow-sm bg-blue-600 hover:bg-blue-700 font-semibold">
                        <FiPlus className="size-4" />
                        Add New Hotel
                    </Button>
                </Link>
            </div>

            {/* Taxes & Fees Configuration */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2 text-gray-900">
                        <FiTag className="w-5 h-5 text-blue-600" />
                        Global Taxes & Fees
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-3 md:items-end">
                        <div className="flex-1 max-w-xs">
                            <label htmlFor="taxPercentage" className="text-xs font-semibold text-gray-700 mb-1.5 block">
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
                                className="text-sm bg-white"
                                placeholder="e.g., 12"
                            />
                        </div>
                        <Button 
                            onClick={handleSaveTaxPercentage}
                            disabled={isSavingTax}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
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
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-5">
                <StatCard
                    title="Total Hotels"
                    value={hotelsData.length.toString()}
                    icon={<FiHome className="size-5 text-blue-600" />}
                    iconBg="bg-blue-100"
                />
                <StatCard
                    title="Active / Live"
                    value={hotelsData.filter(h => h.active).length.toString()}
                    icon={<FiCheckCircle className="size-5 text-green-600" />}
                    iconBg="bg-green-100"
                />
                <StatCard
                    title="Pending Review"
                    value={hotelsData.filter(h => h.status === 'pending').length.toString()}
                    icon={<FiClock className="size-5 text-orange-600" />}
                    iconBg="bg-orange-100"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3.5 top-3 text-muted-foreground size-4" />
                    <Input
                        placeholder="Search hotels by name, city, state..."
                        className="pl-10 text-sm bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2.5 flex-wrap">
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-auto min-w-[140px] text-xs md:text-sm bg-white">
                            <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {Array.from(new Set(hotelsData.map(h => h.location).filter(Boolean))).slice(0, 40).map(location => (
                                <SelectItem key={location} value={location.toLowerCase()}>
                                    {location}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-auto min-w-[120px] text-xs md:text-sm bg-white">
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
                        <SelectTrigger className="w-auto min-w-[150px] text-xs md:text-sm bg-white">
                            <SelectValue placeholder="Filter by Label" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Labels</SelectItem>
                            <SelectItem value="StayNTour Verified">StayNTour Verified</SelectItem>
                            <SelectItem value="Authentic BnB">Authentic BnB</SelectItem>
                            <SelectItem value="Top Rated Host">Top Rated Host</SelectItem>
                            <SelectItem value="Featured">Featured</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block shadow-sm border-gray-200 overflow-hidden w-full">
                <CardContent className="p-0 w-full">
                    <Table className="w-full">
                        <TableHeader className="bg-gray-50/80">
                            <TableRow>
                                <TableHead className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[38%]">Hotel Property</TableHead>
                                <TableHead className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[24%]">Location</TableHead>
                                <TableHead className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[10%]">Price Range</TableHead>
                                <TableHead className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[14%]">Status</TableHead>
                                <TableHead className="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right w-[14%]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedHotels.map((hotel) => (
                                <TableRow key={hotel.id} className="hover:bg-blue-50/30 transition-colors">
                                    <TableCell className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-xs">
                                                <Image
                                                    src={hotel.image}
                                                    alt={hotel.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-900 truncate" title={hotel.name}>
                                                    {hotel.name}
                                                </p>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                    <div className="flex items-center text-amber-500 font-semibold">
                                                        <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                                                        <span>{hotel.rating}</span>
                                                    </div>
                                                    <span className="text-gray-400">•</span>
                                                    <span>{hotel.reviews} reviews</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-3.5 px-4">
                                        <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-700 truncate">
                                            <FiMapPin className="text-rose-500 size-4 shrink-0" />
                                            <span className="truncate">{hotel.location}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-3.5 px-4 font-semibold text-gray-900 text-sm">
                                        {hotel.price}
                                    </TableCell>

                                    <TableCell className="py-3.5 px-4">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={hotel.active}
                                                onCheckedChange={() => toggleHotelStatus(hotel.id)}
                                            />
                                            <Badge
                                                variant={hotel.active ? "default" : "secondary"}
                                                className={`text-xs px-2.5 py-0.5 font-semibold ${hotel.active ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0" : "bg-gray-100 text-gray-700"}`}
                                            >
                                                {hotel.status === 'pending' ? 'Pending' : hotel.active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-3.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        title="Manage Labels"
                                                        className={`h-8 w-8 ${hotel.labels && hotel.labels.length > 0 ? "text-blue-600 bg-blue-50" : "text-gray-400"}`}
                                                    >
                                                        <FiTag className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Manage Labels</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {["StayNTour Verified", "Authentic BnB", "Top Rated Host", "Featured"].map((label) => (
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

                                            <Link href={`/hotels/${hotel.id}`} target="_blank">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50" title="View Property Page">
                                                    <FiEye className="size-4" />
                                                </Button>
                                            </Link>

                                            <Link href={`/admin/hotels/${hotel.id}/edit`}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="Edit Hotel">
                                                    <FiEdit className="size-4" />
                                                </Button>
                                            </Link>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteHotel(hotel.id)}
                                                title="Delete Hotel"
                                            >
                                                <FiTrash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredHotels.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        No hotels found matching your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {filteredHotels.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, filteredHotels.length)}</span> of <span className="text-gray-900 font-bold">{filteredHotels.length}</span> properties
                    </p>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 px-2.5 text-xs font-semibold gap-1"
                        >
                            <FiChevronLeft className="size-4" />
                            Prev
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                                .map((p, idx, arr) => {
                                    const prev = arr[idx - 1];
                                    return (
                                        <div key={p} className="flex items-center gap-1">
                                            {prev && p - prev > 1 && (
                                                <span className="text-xs text-gray-400 px-1">...</span>
                                            )}
                                            <Button
                                                variant={currentPage === p ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(p)}
                                                className={`h-8 w-8 text-xs font-bold p-0 ${currentPage === p ? "bg-blue-600 text-white" : "text-gray-700"}`}
                                            >
                                                {p}
                                            </Button>
                                        </div>
                                    );
                                })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 px-2.5 text-xs font-semibold gap-1"
                        >
                            Next
                            <FiChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}
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
        <Card className="shadow-xs border-gray-200">
            <CardContent className="flex items-center justify-between p-4 md:p-5">
                <div>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <div className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{value}</div>
                </div>
                <div
                    className={`flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-xl ${iconBg}`}
                >
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}
