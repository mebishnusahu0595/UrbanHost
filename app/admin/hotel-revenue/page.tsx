"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    MdSearch,
    MdFilterList,
    MdAttachMoney,
    MdHotel,
    MdTrendingUp,
    MdTrendingDown,
    MdCalendarToday,
    MdDownload,
    MdArrowUpward,
    MdArrowDownward,
} from "react-icons/md";
import { FiMapPin, FiStar, FiEye } from "react-icons/fi";
import { Loader2 } from "lucide-react";

interface HotelRevenue {
    _id: string;
    name: string;
    category: string;
    address: {
        city: string;
        state: string;
    };
    images: string[];
    rating: number;
    totalReviews: number;
    owner: {
        name: string;
        email: string;
    };
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    growth: number;
}

interface Stats {
    totalRevenue: number;
    totalBookings: number;
    averageRevenue: number;
    topPerformer: string;
    totalHotels: number;
}

interface Filters {
    cities: string[];
    categories: string[];
}

export default function HotelRevenuePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [hotels, setHotels] = useState<HotelRevenue[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [filters, setFilters] = useState<Filters>({ cities: [], categories: [] });
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [city, setCity] = useState("all");
    const [category, setCategory] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortBy, setSortBy] = useState("revenue");
    const [sortOrder, setSortOrder] = useState("desc");

    // Redirect if not admin
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user) {
            const userRole = (session.user as any).role;
            if (userRole !== "admin") {
                router.push("/");
            }
        }
    }, [status, session, router]);

    // Fetch data
    useEffect(() => {
        fetchHotelRevenue();
    }, [city, category, startDate, endDate, sortBy, sortOrder]);

    const fetchHotelRevenue = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (city && city !== 'all') params.append('city', city);
            if (category && category !== 'all') params.append('category', category);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('sortBy', sortBy);
            params.append('sortOrder', sortOrder);

            const response = await fetch(`/api/admin/hotel-revenue?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setHotels(data.hotels || []);
                setStats(data.stats || null);
                setFilters(data.filters || { cities: [], categories: [] });
            }
        } catch (error) {
            console.error('Failed to fetch hotel revenue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchHotelRevenue();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const toggleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    // Filter hotels by search
    const filteredHotels = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(search.toLowerCase()) ||
        hotel.address?.city?.toLowerCase().includes(search.toLowerCase()) ||
        hotel.owner?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleExport = () => {
        if (!hotels || hotels.length === 0) return;

        const csvRows = [];

        // Header
        csvRows.push(['Hotel Revenue Report', new Date().toLocaleString()]);
        csvRows.push([]);

        // Data Columns
        csvRows.push([
            'Hotel Name',
            'Category',
            'City',
            'State',
            'Total Revenue',
            'Total Bookings',
            'Confirmed',
            'Completed',
            'Cancelled',
            'Rating',
            'Reviews'
        ]);

        hotels.forEach(hotel => {
            csvRows.push([
                hotel.name,
                hotel.category,
                hotel.address?.city || '',
                hotel.address?.state || '',
                hotel.totalRevenue,
                hotel.totalBookings,
                hotel.confirmedBookings,
                hotel.completedBookings,
                hotel.cancelledBookings,
                hotel.rating,
                hotel.totalReviews
            ]);
        });

        const csvContent = csvRows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `hotel_revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Hotel Revenue</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold">Hotel Revenue Analytics</h1>
                        <p className="text-xs md:text-base text-muted-foreground mt-1">
                            View per-hotel revenue with search and filter options
                        </p>
                    </div>
                    <Button size="sm" onClick={handleExport} className="w-fit text-white bg-blue-900 hover:bg-blue-800">
                        <MdDownload className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-green-700">Total Revenue</p>
                                <p className="text-lg md:text-2xl font-bold text-green-800">
                                    {stats ? formatCurrency(stats.totalRevenue) : '₹0'}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <MdAttachMoney className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-blue-700">Total Bookings</p>
                                <p className="text-lg md:text-2xl font-bold text-blue-800">
                                    {stats?.totalBookings || 0}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <MdCalendarToday className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-orange-700">Avg per Hotel</p>
                                <p className="text-lg md:text-2xl font-bold text-orange-800">
                                    {stats ? formatCurrency(stats.averageRevenue) : '₹0'}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <MdHotel className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-purple-700">Top Performer</p>
                                <p className="text-sm md:text-lg font-bold text-purple-800 truncate max-w-[120px] md:max-w-[150px]">
                                    {stats?.topPerformer || 'N/A'}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <MdTrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by hotel name, city, or owner..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={city} onValueChange={setCity}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="City" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Cities</SelectItem>
                                    {filters.cities.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {filters.categories.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                placeholder="Start Date"
                                className="w-[140px]"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />

                            <Input
                                type="date"
                                placeholder="End Date"
                                className="w-[140px]"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />

                            <Button variant="outline" onClick={handleSearch}>
                                <MdFilterList className="mr-2 h-4 w-4" />
                                Apply
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Hotel Revenue Table - Mobile */}
            <div className="md:hidden space-y-3">
                {filteredHotels.map((hotel) => (
                    <Card key={hotel._id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex gap-3 p-3">
                                <Image
                                    src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400"}
                                    alt={hotel.name}
                                    width={70}
                                    height={70}
                                    className="rounded-lg object-cover w-[70px] h-[70px] flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-sm truncate">{hotel.name}</h3>
                                        <Badge
                                            className={hotel.growth >= 0
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }
                                        >
                                            {hotel.growth >= 0 ? <MdTrendingUp className="mr-1 h-3 w-3" /> : <MdTrendingDown className="mr-1 h-3 w-3" />}
                                            {Math.abs(hotel.growth)}%
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <FiMapPin className="h-3 w-3" />
                                        {hotel.address?.city}, {hotel.address?.state}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-base font-bold text-green-700">
                                            {formatCurrency(hotel.totalRevenue)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({hotel.totalBookings} bookings)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t px-3 py-2 bg-gray-50">
                                <div className="flex items-center gap-1 text-xs">
                                    <FiStar className="h-3 w-3 text-yellow-500" />
                                    <span>{hotel.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="text-gray-400">({hotel.totalReviews})</span>
                                </div>
                                <Link href={`/admin/hotel-revenue/${hotel._id}`}>
                                    <Button size="sm" variant="outline">
                                        <FiEye className="h-4 w-4 mr-1" /> View Details
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredHotels.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <MdHotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hotels found</p>
                    </div>
                )}
            </div>

            {/* Hotel Revenue Table - Desktop */}
            <Card className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold">Hotel</TableHead>
                                <TableHead className="font-semibold">Location</TableHead>
                                <TableHead className="font-semibold">Category</TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('revenue')}
                                >
                                    <div className="flex items-center gap-1">
                                        Revenue
                                        {sortBy === 'revenue' && (
                                            sortOrder === 'desc'
                                                ? <MdArrowDownward className="h-4 w-4" />
                                                : <MdArrowUpward className="h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('bookings')}
                                >
                                    <div className="flex items-center gap-1">
                                        Bookings
                                        {sortBy === 'bookings' && (
                                            sortOrder === 'desc'
                                                ? <MdArrowDownward className="h-4 w-4" />
                                                : <MdArrowUpward className="h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="font-semibold cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('growth')}
                                >
                                    <div className="flex items-center gap-1">
                                        Growth
                                        {sortBy === 'growth' && (
                                            sortOrder === 'desc'
                                                ? <MdArrowDownward className="h-4 w-4" />
                                                : <MdArrowUpward className="h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHotels.map((hotel) => (
                                <TableRow key={hotel._id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400"}
                                                alt={hotel.name}
                                                width={48}
                                                height={48}
                                                className="rounded-lg object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold">{hotel.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <FiStar className="h-3 w-3 text-yellow-500" />
                                                    {hotel.rating?.toFixed(1) || '0.0'} ({hotel.totalReviews})
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <FiMapPin className="h-4 w-4 text-gray-400" />
                                            {hotel.address?.city}, {hotel.address?.state}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{hotel.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-green-700">
                                            {formatCurrency(hotel.totalRevenue)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <span className="font-semibold">{hotel.totalBookings}</span>
                                            <span className="text-gray-500 text-xs ml-1">
                                                ({hotel.confirmedBookings} confirmed)
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={hotel.growth >= 0
                                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                : "bg-red-100 text-red-700 hover:bg-red-100"
                                            }
                                        >
                                            {hotel.growth >= 0 ? <MdTrendingUp className="mr-1 h-3 w-3" /> : <MdTrendingDown className="mr-1 h-3 w-3" />}
                                            {Math.abs(hotel.growth)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/hotel-revenue/${hotel._id}`}>
                                            <Button size="sm" variant="outline">
                                                <FiEye className="h-4 w-4 mr-1" /> View
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredHotels.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        <MdHotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No hotels found</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
