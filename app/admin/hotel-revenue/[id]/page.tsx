"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    MdAttachMoney,
    MdHotel,
    MdTrendingUp,
    MdTrendingDown,
    MdArrowBack,
    MdCalendarToday,
    MdDownload,
} from "react-icons/md";
import { FiMapPin, FiStar, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

interface HotelRevenue {
    _id: string;
    name: string;
    category: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    images: string[];
    rating: number;
    totalReviews: number;
    owner: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    contactInfo: {
        phone: string;
        email: string;
    };
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    monthlyRevenue: {
        year: number;
        month: number;
        revenue: number;
        bookings: number;
    }[];
    recentBookings: {
        _id: string;
        user: { name: string };
        roomType: string;
        checkInDate: string;
        checkOutDate: string;
        totalPrice: number;
        status: string;
    }[];
    growth: number;
}

export default function HotelRevenueDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const hotelId = params.id as string;

    const [hotel, setHotel] = useState<HotelRevenue | null>(null);
    const [loading, setLoading] = useState(true);

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

    // Fetch hotel data
    useEffect(() => {
        if (hotelId) {
            fetchHotelDetails();
        }
    }, [hotelId]);

    const fetchHotelDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/hotel-revenue/${hotelId}`);
            const data = await response.json();

            if (response.ok) {
                setHotel(data.hotel);
            } else {
                console.error('Failed to fetch hotel:', data.error);
            }
        } catch (error) {
            console.error('Failed to fetch hotel details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getMonthName = (month: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1] || '';
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            confirmed: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            cancelled: "bg-red-100 text-red-800",
            completed: "bg-blue-100 text-blue-800",
        };
        return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <MdHotel className="w-16 h-16 text-gray-400" />
                <p className="text-lg text-gray-600">Hotel not found</p>
                <Button onClick={() => router.push('/admin/hotel-revenue')} variant="outline">
                    <MdArrowBack className="mr-2 h-4 w-4" />
                    Back to Hotels
                </Button>
            </div>
        );
    }

    const chartData = hotel.monthlyRevenue?.map((item) => ({
        month: `${getMonthName(item.month)} ${item.year}`,
        revenue: item.revenue,
        bookings: item.bookings,
    })) || [];

    return (
        <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="space-y-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/hotel-revenue">Hotel Revenue</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{hotel.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/admin/hotel-revenue')}
                        className="w-fit"
                    >
                        <MdArrowBack className="mr-2 h-4 w-4" />
                        Back to All Hotels
                    </Button>
                    <Button size="sm" className="w-fit text-white bg-blue-900 hover:bg-blue-800">
                        <MdDownload className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Hotel Info Card */}
            <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Hotel Image */}
                        <div className="flex-shrink-0">
                            <Image
                                src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400"}
                                alt={hotel.name}
                                width={200}
                                height={150}
                                className="rounded-xl object-cover w-full md:w-[200px] h-[150px]"
                            />
                        </div>

                        {/* Hotel Details */}
                        <div className="flex-1 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{hotel.name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline">{hotel.category}</Badge>
                                        <div className="flex items-center gap-1 text-sm">
                                            <FiStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-medium">{hotel.rating?.toFixed(1) || '0.0'}</span>
                                            <span className="text-gray-500">({hotel.totalReviews} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge
                                    className={`text-lg px-4 py-2 ${hotel.growth >= 0
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {hotel.growth >= 0 ? <MdTrendingUp className="mr-2 h-5 w-5" /> : <MdTrendingDown className="mr-2 h-5 w-5" />}
                                    {Math.abs(hotel.growth)}% Growth
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiMapPin className="h-4 w-4" />
                                    <span>{hotel.address?.street}, {hotel.address?.city}, {hotel.address?.state} - {hotel.address?.zipCode}</span>
                                </div>
                                {hotel.contactInfo?.phone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiPhone className="h-4 w-4" />
                                        <span>{hotel.contactInfo.phone}</span>
                                    </div>
                                )}
                                {hotel.contactInfo?.email && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiMail className="h-4 w-4" />
                                        <span>{hotel.contactInfo.email}</span>
                                    </div>
                                )}
                                {hotel.owner && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiUser className="h-4 w-4" />
                                        <span>Owner: {hotel.owner.name} ({hotel.owner.email})</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Revenue Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-xs md:text-sm font-medium text-green-700">Total Revenue</p>
                        <p className="text-xl md:text-2xl font-bold text-green-800">
                            {formatCurrency(hotel.totalRevenue)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-xs md:text-sm font-medium text-blue-700">Total Bookings</p>
                        <p className="text-xl md:text-2xl font-bold text-blue-800">
                            {hotel.totalBookings}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <p className="text-xs md:text-sm font-medium text-purple-700">Confirmed</p>
                        <p className="text-xl md:text-2xl font-bold text-purple-800">
                            {hotel.confirmedBookings}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <p className="text-xs md:text-sm font-medium text-orange-700">Completed</p>
                        <p className="text-xl md:text-2xl font-bold text-orange-800">
                            {hotel.completedBookings}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <p className="text-xs md:text-sm font-medium text-red-700">Cancelled</p>
                        <p className="text-xl md:text-2xl font-bold text-red-800">
                            {hotel.cancelledBookings}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length > 0 ? (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                                    <Tooltip
                                        formatter={(value: any, name: any) => {
                                            const numValue = Number(value) || 0;
                                            if (name === 'revenue') return [formatCurrency(numValue), 'Revenue'];
                                            return [numValue, 'Bookings'];
                                        }}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#1E3A8A"
                                        strokeWidth={2}
                                        fill="url(#revenueGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <MdCalendarToday className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No revenue data available</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest bookings for this hotel</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {hotel.recentBookings && hotel.recentBookings.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead>Guest</TableHead>
                                    <TableHead>Room Type</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hotel.recentBookings.map((booking) => (
                                    <TableRow key={booking._id}>
                                        <TableCell className="font-medium">{booking.user.name}</TableCell>
                                        <TableCell>{booking.roomType}</TableCell>
                                        <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                                        <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                                        <TableCell className="font-semibold text-green-700">
                                            {formatCurrency(booking.totalPrice)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadge(booking.status)}>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-8 text-center text-gray-500">
                            <MdCalendarToday className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No bookings yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
