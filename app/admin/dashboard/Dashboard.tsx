"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MdCalendarToday, MdDownload, MdAttachMoney, MdEventNote, MdPeople, MdHotel, MdTrendingUp, MdTrendingDown, MdNotifications } from "react-icons/md";
import { RevenueChart } from '@/app/admin/dashboard/revenue-chart';
import { OccupancyChart } from '@/app/admin/dashboard/occupancy-chart';
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardStats {
    totalHotels: number;
    approvedHotels: number;
    pendingHotels: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    activeGuests: number;
    availableRooms: number;
    totalUsers: number;
    propertyOwners: number;
    totalRevenue: number;
    revenueGrowth: number;
    bookingsGrowth: number;
    usersGrowth: number;
}

interface Booking {
    _id: string;
    hotel: {
        name: string;
    };
    user: {
        name: string;
    };
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    totalPrice: number;
}

interface TopHotel {
    _id: string;
    name: string;
    category: string;
    images: string[];
    rating: number;
    totalReviews: number;
    address: {
        city: string;
        state: string;
    };
    totalRevenue: number;
    totalBookings: number;
    growth: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [topHotels, setTopHotels] = useState<TopHotel[]>([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
    const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);
    const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
    const [revenuePeriod, setRevenuePeriod] = useState<'monthly' | 'weekly' | 'daily'>('daily');
    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);

    // Redirect if not logged in or not admin
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user) {
            const userRole = (session.user as any).role;
            if (userRole === "user") {
                router.push("/profile");
            } else if (userRole === "propertyOwner") {
                router.push("/property-owner/dashboard");
            }
        }
    }, [status, session, router]);

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/admin/stats?range=${timeRange}`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                    setRecentBookings(data.recentBookings || []);
                    setMonthlyRevenue(data.monthlyRevenue || []);
                    setWeeklyRevenue(data.weeklyRevenue || []);
                    setDailyRevenue(data.dailyRevenue || []);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            }
        };

        const fetchTopHotels = async () => {
            try {
                const response = await fetch("/api/admin/hotel-revenue?sortBy=revenue&sortOrder=desc");
                if (response.ok) {
                    const data = await response.json();
                    setTopHotels((data.hotels || []).slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch top hotels:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchStats();
            fetchTopHotels();
        }
    }, [session, timeRange]);

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin border-blue-500 mx-auto mb-4" />
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

    const getGrowthLabel = () => {
        switch (timeRange) {
            case '1y': return "from previous year";
            case '1m': return "from previous month";
            case '1w': return "from previous week";
            case '1d': return "from yesterday";
            case '30d': return "from last month";
            default: return "from previous period";
        }
    }

    const GrowthIndicator = ({ value, label }: { value: number; label: string }) => {
        const isPositive = value >= 0;
        return (
            <div className={`flex items-center gap-1 text-[10px] md:text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                    <MdTrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                    <MdTrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                )}
                <span className="font-medium">{isPositive ? '+' : ''}{value}%</span>
                <span className="text-gray-500">{label}</span>
            </div>
        );
    };

    const handleExport = () => {
        if (!stats) return;

        const csvRows = [];

        // Header
        csvRows.push(['Dashboard Report', new Date().toLocaleString()]);
        csvRows.push([]);

        // Statistics
        csvRows.push(['--- Statistics ---']);
        csvRows.push(['Metric', 'Value']);
        csvRows.push(['Total Revenue', stats.totalRevenue]);
        csvRows.push(['Total Bookings', stats.totalBookings]);
        csvRows.push(['Active Guests', stats.activeGuests]);
        csvRows.push(['Available Rooms', stats.availableRooms]);
        csvRows.push(['Approved Hotels', stats.approvedHotels]);
        csvRows.push(['Pending Hotels', stats.pendingHotels]);
        csvRows.push([]);

        // Recent Bookings
        csvRows.push(['--- Recent Bookings ---']);
        csvRows.push(['Booking ID', 'Guest', 'Room Type', 'Check In', 'Check Out', 'Amount', 'Status']);

        recentBookings.forEach(booking => {
            csvRows.push([
                booking._id,
                booking.user?.name || 'Unknown',
                booking.roomType,
                new Date(booking.checkInDate).toLocaleDateString(),
                new Date(booking.checkOutDate).toLocaleDateString(),
                booking.totalPrice,
                booking.status
            ]);
        });

        const csvContent = csvRows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 pb-20 md:pb-6 bg-gray-50/50 min-h-screen">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
                Dashboard / <span className="text-gray-900 font-medium">Overview</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-xs md:text-base text-muted-foreground mt-1">
                        Welcome back, here's what's happening today.
                    </p>
                </div>
            </div>

            {/* Top Action Bar */}
            <div className="flex items-center gap-2 md:gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[140px] md:w-[180px] bg-white h-9 md:h-10 text-xs md:text-sm">
                        <MdCalendarToday className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1d">Last 24 Hours</SelectItem>
                        <SelectItem value="1w">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="1m">Last 1 Month</SelectItem>
                        <SelectItem value="1y">Last 1 Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    size="sm"
                    onClick={handleExport}
                    className="flex-1 md:flex-none text-xs md:text-sm h-9 md:h-10 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                >
                    <MdDownload className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    Export Report
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
                    <CardHeader className="flex flex-row items-center justify-between p-3 md:p-5 pb-2 md:pb-2 space-y-0">
                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
                            <MdAttachMoney className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-5 pt-0 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold text-gray-900">
                            {stats ? formatCurrency(stats.totalRevenue) : '₹0'}
                        </div>
                        <GrowthIndicator value={stats?.revenueGrowth || 0} label={getGrowthLabel()} />
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
                    <CardHeader className="flex flex-row items-center justify-between p-3 md:p-5 pb-2 md:pb-2 space-y-0">
                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                            <MdEventNote className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-5 pt-0 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</div>
                        <GrowthIndicator value={stats?.bookingsGrowth || 0} label={getGrowthLabel()} />
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
                    <CardHeader className="flex flex-row items-center justify-between p-3 md:p-5 pb-2 md:pb-2 space-y-0">
                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Active Guests</CardTitle>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                            <MdPeople className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-5 pt-0 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold text-gray-900">{stats?.activeGuests || 0}</div>
                        <GrowthIndicator value={stats?.usersGrowth || 0} label={getGrowthLabel()} />
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
                    <CardHeader className="flex flex-row items-center justify-between p-3 md:p-5 pb-2 md:pb-2 space-y-0">
                        <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Available Rooms</CardTitle>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                            <MdHotel className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-5 pt-0 md:pt-0">
                        <div className="text-lg md:text-2xl font-bold text-gray-900">{stats?.availableRooms || 0}</div>
                        <div className="text-[10px] md:text-xs text-gray-500 mt-1">
                            {stats?.pendingHotels || 0} pending approval
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 bg-white shadow-sm border-0">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-sm md:text-base font-bold text-gray-900">Revenue Analysis</CardTitle>
                                <CardDescription className="text-xs md:text-sm mt-0.5 text-gray-500">Revenue vs Bookings over time</CardDescription>
                            </div>
                            <Tabs value={revenuePeriod} onValueChange={(val) => setRevenuePeriod(val as any)} className="w-full md:w-auto">
                                <TabsList className="w-full md:w-auto grid grid-cols-3 h-8 md:h-9 bg-gray-100">
                                    <TabsTrigger value="monthly" className="text-[10px] md:text-xs h-full px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Monthly</TabsTrigger>
                                    <TabsTrigger value="weekly" className="text-[10px] md:text-xs h-full px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Weekly</TabsTrigger>
                                    <TabsTrigger value="daily" className="text-[10px] md:text-xs h-full px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Daily</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <RevenueChart
                            monthlyData={monthlyRevenue}
                            weeklyData={weeklyRevenue}
                            dailyData={dailyRevenue}
                            period={revenuePeriod}
                        />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 bg-white shadow-sm border-0">
                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                        <CardTitle className="text-sm md:text-base font-bold text-gray-900">Occupancy Rate</CardTitle>
                        <CardDescription className="text-xs md:text-sm mt-0.5 text-gray-500">Property approval status</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <OccupancyChart
                            approvedHotels={stats?.approvedHotels || 0}
                            pendingHotels={stats?.pendingHotels || 0}
                            totalHotels={stats?.totalHotels || 0}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="bg-white shadow-sm border-0">
                <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm md:text-base font-bold text-gray-900">Recent Bookings</CardTitle>
                        <CardDescription className="text-xs md:text-sm mt-0.5 hidden md:block text-gray-500">Latest booking activity</CardDescription>
                    </div>
                    <Link href="/admin/bookings">
                        <Button variant="link" size="sm" className="text-xs md:text-sm text-blue-600 hover:text-blue-700 p-0">
                            View All Bookings →
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0 md:p-6 md:pt-0">
                    {recentBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <MdEventNote className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-2 md:mb-3 opacity-50" />
                            <p className="text-xs md:text-sm">No bookings yet</p>
                        </div>
                    ) : (
                        <>
                            {/* Table Header - Desktop */}
                            <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div>Guest</div>
                                <div>Room Type</div>
                                <div>Check In - Out</div>
                                <div>Status</div>
                                <div className="text-right">Amount</div>
                            </div>
                            <div className="divide-y">
                                {recentBookings.slice(0, 5).map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="flex flex-col gap-2 p-4 hover:bg-gray-50 transition-colors md:grid md:grid-cols-5 md:gap-4 md:items-center"
                                    >
                                        {/* Guest Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="font-bold text-white text-xs md:text-sm">
                                                    {booking.user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 truncate text-xs md:text-sm">{booking.user.name}</p>
                                                <p className="text-[10px] md:text-xs text-gray-500 truncate">ID: #BK-{booking._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                            <span className="md:hidden font-bold text-gray-900 text-xs">{formatCurrency(booking.totalPrice)}</span>
                                        </div>

                                        {/* Room Type - Hidden on mobile, shown in row below */}
                                        <div className="hidden md:block text-sm text-gray-700">
                                            {booking.roomType}
                                        </div>

                                        {/* Check In/Out */}
                                        <div className="hidden md:block text-sm text-gray-600">
                                            <div>{formatDate(booking.checkInDate)}</div>
                                            <div className="text-xs text-gray-400">
                                                {Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} Nights
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="hidden md:block">
                                            <Badge className={`${getStatusBadge(booking.status)} font-medium`}>
                                                {booking.status}
                                            </Badge>
                                        </div>

                                        {/* Amount */}
                                        <div className="hidden md:block text-right font-bold text-gray-900">
                                            {formatCurrency(booking.totalPrice)}
                                        </div>

                                        {/* Mobile Second Row */}
                                        <div className="flex items-center justify-between text-[10px] text-gray-500 md:hidden mt-1 px-1">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{booking.roomType}</span>
                                                <span>{formatDate(booking.checkInDate)}</span>
                                            </div>
                                            <Badge className={`${getStatusBadge(booking.status)} text-[10px] h-5 px-1.5`}>
                                                {booking.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <Link href="/admin/hotels" className="block">
                    <Card className="hover:shadow-md transition-all cursor-pointer h-full bg-white border-0 shadow-sm group">
                        <CardHeader className="p-4 md:p-5">
                            <CardTitle className="flex items-center gap-2 text-sm md:text-base text-gray-800 group-hover:text-blue-600 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                    <MdHotel className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                Manage Hotels
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 text-gray-500">
                                View and approve listings
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/admin/hotel-revenue" className="block">
                    <Card className="hover:shadow-md transition-all cursor-pointer h-full bg-white border-0 shadow-sm group">
                        <CardHeader className="p-4 md:p-5">
                            <CardTitle className="flex items-center gap-2 text-sm md:text-base text-gray-800 group-hover:text-green-600 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                    <MdAttachMoney className="h-4 w-4 text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                Hotel Revenue
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 text-gray-500">
                                Per hotel analytics
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/admin/users" className="block">
                    <Card className="hover:shadow-md transition-all cursor-pointer h-full bg-white border-0 shadow-sm group">
                        <CardHeader className="p-4 md:p-5">
                            <CardTitle className="flex items-center gap-2 text-sm md:text-base text-gray-800 group-hover:text-purple-600 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                    <MdPeople className="h-4 w-4 text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                User Management
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 text-gray-500">
                                Admins, Owners & Users
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>

            {/* Top Performing Hotels */}
            <Card className="bg-white shadow-sm border-0">
                <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm md:text-base font-bold text-gray-900">Top Performing Hotels</CardTitle>
                        <CardDescription className="text-xs md:text-sm mt-0.5 hidden md:block text-gray-500">Highest revenue generating properties</CardDescription>
                    </div>
                    <Link href="/admin/hotel-revenue">
                        <Button variant="link" size="sm" className="text-xs md:text-sm text-blue-600 hover:text-blue-700 p-0">
                            View All Hotels →
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0 md:p-6 md:pt-0">
                    {topHotels.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <MdHotel className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-2 md:mb-3 opacity-50" />
                            <p className="text-xs md:text-sm">No hotels data available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-0">
                            {topHotels.map((hotel) => (
                                <Link key={hotel._id} href={`/admin/hotel-revenue/${hotel._id}`}>
                                    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-0 shadow-sm">
                                        <div className="relative h-40">
                                            <img
                                                src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400"}
                                                alt={hotel.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge
                                                    className={hotel.growth >= 0
                                                        ? "bg-green-500 text-white"
                                                        : "bg-red-500 text-white"
                                                    }
                                                >
                                                    {hotel.growth >= 0 ? <MdTrendingUp className="mr-1 h-3 w-3" /> : <MdTrendingDown className="mr-1 h-3 w-3" />}
                                                    {Math.abs(hotel.growth)}%
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-bold text-base mb-1 truncate">{hotel.name}</h3>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                                <MdHotel className="h-3 w-3" />
                                                {hotel.address?.city}, {hotel.address?.state}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500">Revenue</p>
                                                    <p className="text-lg font-bold text-green-700">
                                                        {formatCurrency(hotel.totalRevenue)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Bookings</p>
                                                    <p className="text-lg font-bold text-blue-700">
                                                        {hotel.totalBookings}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
