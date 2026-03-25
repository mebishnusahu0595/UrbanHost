"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MdHotel, MdEventNote, MdAttachMoney, MdAdd } from "react-icons/md";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { RevenueChart } from "./revenue-chart";

interface PropertyOwnerStats {
    totalProperties: number;
    approvedProperties: number;
    pendingProperties: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalEarnings: number;
    thisMonthEarnings: number;
}

interface Booking {
    _id: string;
    hotel: {
        name: string;
    };
    user: {
        name: string;
        email: string;
    };
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    totalPrice: number;
}

export default function PropertyOwnerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<PropertyOwnerStats | null>(null);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [dailyData, setDailyData] = useState<any[]>([]);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [loading, setLoading] = useState(true);

    const userRole = (session?.user as any)?.role;
    const canEdit = userRole === 'propertyOwner' || (session?.user as any)?.canEditHotels;

    // Redirect if not logged in or not propertyOwner
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user) {
            const userRole = (session.user as any).role;
            if (userRole === "user") {
                router.push("/profile");
            } else if (userRole === "admin") {
                router.push("/admin/dashboard");
            } else if (userRole === "hotelOwner") {
                router.push("/property-panel/dashboard");
            }
        }
    }, [status, session, router]);

    // Fetch property owner stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/property-owner/stats");
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                    setRecentBookings(data.recentBookings || []);
                    setMonthlyData(data.monthlyData || []);
                    setDailyData(data.dailyData || []);
                    setWeeklyData(data.weeklyData || []);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchStats();
        }
    }, [session]);

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin border-blue-600 mx-auto mb-4" />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

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

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            confirmed: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            cancelled: "bg-red-100 text-red-800",
            completed: "bg-blue-100 text-blue-800",
        };
        return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">Dashboard</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Welcome back, {session.user.name || 'Property Owner'}
                    </p>
                </div>
                {canEdit && (
                    <Link href="/property-owner/add-property" className="w-full md:w-auto">
                        <Button size="sm" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-10 md:h-11 md:text-base">
                            <MdAdd className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                            Add New Property
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">My Properties</CardTitle>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-md bg-blue-100 flex items-center justify-center">
                            <MdHotel className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold">{stats?.totalProperties || 0}</div>
                        <div className="flex flex-col md:flex-row md:items-center text-[10px] md:text-xs text-muted-foreground mt-1">
                            <span>{stats?.approvedProperties || 0} approved</span>
                            <span className="hidden md:inline px-1">,</span>
                            <span>{stats?.pendingProperties || 0} pending</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Bookings</CardTitle>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-md bg-purple-100 flex items-center justify-center">
                            <MdEventNote className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold">{stats?.totalBookings || 0}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground mt-1">
                            {stats?.confirmedBookings || 0} confirmed
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Earnings</CardTitle>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-md bg-green-100 flex items-center justify-center">
                            <MdAttachMoney className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold">
                            {stats ? formatCurrency(stats.totalEarnings) : '₹0'}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground mt-1">
                            From confirmed bookings
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">This Month</CardTitle>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-md bg-orange-100 flex items-center justify-center">
                            <MdAttachMoney className="h-4 w-4 md:h-6 md:w-6 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold">
                            {stats ? formatCurrency(stats.thisMonthEarnings) : '₹0'}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground mt-1">
                            Current month earnings
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
                <CardHeader className="p-4 md:p-6 pb-2 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm md:text-xl font-bold">Revenue Overview</CardTitle>
                        <CardDescription>
                            {timeframe === 'daily' ? 'Last 30 days performance' :
                                timeframe === 'weekly' ? 'Last 12 weeks performance' :
                                    'Yearly performance summary'}
                        </CardDescription>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setTimeframe('daily')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeframe === 'daily' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setTimeframe('weekly')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeframe === 'weekly' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setTimeframe('monthly')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeframe === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Monthly
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <RevenueChart
                        period={timeframe}
                        monthlyData={monthlyData}
                        dailyData={dailyData}
                        weeklyData={weeklyData}
                    />
                </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
                <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm md:text-xl font-bold">Recent Bookings</CardTitle>
                        <CardDescription className="text-xs md:text-sm mt-0.5">Latest bookings for your properties</CardDescription>
                    </div>
                    <Link href="/property-owner/bookings">
                        <Button variant="outline" size="sm" className="hidden md:flex">View All</Button>
                        <Button variant="ghost" size="sm" className="md:hidden text-xs px-2 h-8">View All</Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0 md:p-6 md:pt-0">
                    {recentBookings.length === 0 ? (
                        <div className="text-center py-8 md:py-12 text-muted-foreground">
                            <MdEventNote className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm md:text-base">No bookings yet</p>
                            <p className="text-xs md:text-sm mt-1">Add properties to start receiving bookings</p>
                        </div>
                    ) : (
                        <div className="divide-y md:divide-y-0 md:space-y-4">
                            {recentBookings.map((booking) => (
                                <div
                                    key={booking._id}
                                    className="flex flex-col gap-2 p-4 md:p-4 border-b md:border rounded-none md:rounded-lg hover:bg-gray-50 transition-colors last:border-0 md:last:border"
                                >
                                    {/* Mobile/Responsive Layout */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <span className="font-bold text-blue-600 text-sm">
                                                {booking.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{booking.user.name}</p>
                                                <div className="md:hidden text-right">
                                                    <p className="font-bold text-sm text-gray-900">{formatCurrency(booking.totalPrice)}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs md:text-sm text-gray-500 truncate">{booking.hotel.name}</p>
                                        </div>
                                    </div>

                                    {/* Mobile Bottom Row */}
                                    <div className="flex items-center justify-between mt-1 md:hidden text-xs">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <span>{booking.roomType}</span>
                                            <span>•</span>
                                            <span>{formatDate(booking.checkInDate)}</span>
                                        </div>
                                        <Badge className={`${getStatusBadge(booking.status)} text-[10px] h-5 px-1.5`}>
                                            {booking.status}
                                        </Badge>
                                    </div>

                                    {/* Desktop Details */}
                                    <div className="hidden md:flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                            <span>{booking.roomType}</span>
                                            <span>Check-in: {formatDate(booking.checkInDate)}</span>
                                            <span>{booking.user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className={getStatusBadge(booking.status)}>
                                                {booking.status}
                                            </Badge>
                                            <p className="font-bold">{formatCurrency(booking.totalPrice)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-3 md:gap-4 md:grid-cols-3">
                <Link href="/property-owner/properties">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                                <MdHotel className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                                Manage Properties
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm mt-1">
                                View and manage your property listings
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/property-owner/bookings">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                                <MdEventNote className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                                View Bookings
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm mt-1">
                                Monitor all reservations for your properties
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/property-owner/earnings">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                                <MdAttachMoney className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                Earnings Report
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm mt-1">
                                View detailed earnings and payouts
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
