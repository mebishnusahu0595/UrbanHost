"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MdAttachMoney, MdDownload, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface EarningsData {
    totalEarnings: number;
    thisMonthEarnings: number;
    lastMonthEarnings: number;
    pendingPayouts: number;
    completedPayouts: number;
    monthlyBreakdown: Array<{
        month: string;
        earnings: number;
        bookings: number;
        fullDate?: string;
    }>;
}

export default function EarningsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("year");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user && !['propertyOwner', 'hotelOwner'].includes((session.user as any).role)) {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchEarnings = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/property-owner/earnings?filter=${timeFilter}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Earnings data received:", data);
                    setEarnings(data);
                } else {
                    console.error("Failed to fetch earnings:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Failed to fetch earnings:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchEarnings();
        }
    }, [session, timeFilter]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateGrowth = () => {
        if (!earnings) return 0;
        if (earnings.lastMonthEarnings === 0) return earnings.thisMonthEarnings > 0 ? 100 : 0;
        return ((earnings.thisMonthEarnings - earnings.lastMonthEarnings) / earnings.lastMonthEarnings * 100).toFixed(1);
    };

    const handleDownloadReport = () => {
        if (!earnings?.monthlyBreakdown) return;

        const headers = ["Label/Date", "Earnings (INR)", "Bookings"];
        const rows = earnings.monthlyBreakdown.map(item => [
            item.month,
            item.earnings.toString(),
            item.bookings.toString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `earnings_report_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Chart Data for Line Chart
    const lineChartData = {
        labels: earnings?.monthlyBreakdown?.map(m => m.month) || [],
        datasets: [
            {
                label: 'Earnings',
                data: earnings?.monthlyBreakdown?.map(m => m.earnings) || [],
                fill: true,
                borderColor: '#3B82F6',
                backgroundColor: (context: any) => {
                    const ctx = context.chart?.ctx;
                    if (!ctx) return 'rgba(59, 130, 246, 0.1)';
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    return gradient;
                },
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    // Chart Data for Bar Chart (Bookings)
    const barChartData = {
        labels: earnings?.monthlyBreakdown?.map(m => m.month) || [],
        datasets: [
            {
                label: 'Bookings',
                data: earnings?.monthlyBreakdown?.map(m => m.bookings) || [],
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    // Doughnut Chart for Earnings Distribution
    const doughnutChartData = {
        labels: ['Completed Payouts', 'Pending Payouts'],
        datasets: [
            {
                data: [earnings?.completedPayouts || 0, earnings?.pendingPayouts || 0],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(251, 191, 36, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                borderColor: '#374151',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    label: (context: any) => `₹${context.parsed.y?.toLocaleString() || context.parsed?.toLocaleString()}`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#888888',
                    font: { size: 11 },
                },
            },
            y: {
                grid: {
                    color: '#f0f0f0',
                },
                ticks: {
                    color: '#888888',
                    font: { size: 11 },
                    callback: (value: any) => value >= 1000 ? `₹${value / 1000}k` : `₹${value}`,
                },
            },
        },
    };

    const barChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                ...chartOptions.plugins.tooltip,
                callbacks: {
                    label: (context: any) => `${context.parsed.y} bookings`,
                },
            },
        },
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                ticks: {
                    color: '#888888',
                    font: { size: 11 },
                    callback: (value: any) => value % 1 === 0 ? value : '',
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: { size: 12 },
                },
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                callbacks: {
                    label: (context: any) => `₹${context.parsed?.toLocaleString()}`,
                },
            },
        },
    };

    if (loading && !earnings) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-600" />
                    <p>Loading earnings...</p>
                </div>
            </div>
        );
    }

    const growth = calculateGrowth();
    const isPositiveGrowth = Number(growth) >= 0;

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 pb-20 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">Earnings</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Track your revenue and payouts
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="year">Last 6 Months</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleDownloadReport} className="flex-1 md:flex-none">
                        <MdDownload className="mr-2 h-5 w-5" />
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl md:text-3xl font-bold text-blue-900">
                            {earnings ? formatCurrency(earnings.totalEarnings) : '₹0'}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">All time</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">This Month</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl md:text-3xl font-bold text-green-900">
                            {earnings ? formatCurrency(earnings.thisMonthEarnings) : '₹0'}
                        </div>
                        <p className={`text-xs mt-1 flex items-center ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositiveGrowth ? <MdTrendingUp className="h-3 w-3 mr-1" /> : <MdTrendingDown className="h-3 w-3 mr-1" />}
                            {growth}% vs last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">Last Month</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl md:text-3xl font-bold text-purple-900">
                            {earnings ? formatCurrency(earnings.lastMonthEarnings) : '₹0'}
                        </div>
                        <p className="text-xs text-purple-600 mt-1">Previous month</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">Pending Payouts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl md:text-3xl font-bold text-amber-900">
                            {earnings ? formatCurrency(earnings.pendingPayouts) : '₹0'}
                        </div>
                        <p className="text-xs text-amber-600 mt-1">To be paid</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full md:w-auto">
                    <TabsTrigger value="overview" className="flex-1 md:flex-none">Overview</TabsTrigger>
                    <TabsTrigger value="monthly" className="flex-1 md:flex-none">Breakdown</TabsTrigger>
                    <TabsTrigger value="payouts" className="flex-1 md:flex-none">Payouts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Revenue Trend</CardTitle>
                                <CardDescription>Earnings over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        </div>
                                    ) : earnings?.monthlyBreakdown && earnings.monthlyBreakdown.length > 0 ? (
                                        <Line data={lineChartData} options={chartOptions} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <MdAttachMoney className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No earnings data for this period</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Booking Volume</CardTitle>
                                <CardDescription>Number of bookings over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                        </div>
                                    ) : earnings?.monthlyBreakdown && earnings.monthlyBreakdown.length > 0 ? (
                                        <Bar data={barChartData} options={barChartOptions} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <MdAttachMoney className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No booking data for this period</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Payout Distribution</CardTitle>
                            <CardDescription>Completed vs Pending Payouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] max-w-[300px] mx-auto">
                                {(earnings?.completedPayouts || earnings?.pendingPayouts) ? (
                                    <Doughnut data={doughnutChartData} options={doughnutOptions} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <MdAttachMoney className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No payout data yet</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="monthly" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Breakdown</CardTitle>
                            <CardDescription>Detailed earnings by period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : earnings?.monthlyBreakdown && earnings.monthlyBreakdown.length > 0 ? (
                                <div className="space-y-3">
                                    {earnings.monthlyBreakdown.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border rounded-xl hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                    <span className="font-bold text-blue-600 text-[10px] md:text-sm text-center px-1 leading-tight">
                                                        {item.month.split(' ')[0]} <br /> {item.month.split(' ')[1]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.month}</p>
                                                    <p className="text-sm text-gray-500">{item.bookings} bookings</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl text-blue-600">{formatCurrency(item.earnings)}</p>
                                                <p className="text-xs text-gray-400">
                                                    Avg: {formatCurrency(item.bookings > 0 ? item.earnings / item.bookings : 0)}/booking
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <MdAttachMoney className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>No earnings data available for this period</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payouts" className="space-y-4 mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-700">Completed Payouts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-green-800">
                                    {earnings ? formatCurrency(earnings.completedPayouts) : '₹0'}
                                </div>
                                <p className="text-sm text-green-600 mt-2">Successfully transferred to your account</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                            <CardHeader>
                                <CardTitle className="text-amber-700">Pending Payouts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-amber-800">
                                    {earnings ? formatCurrency(earnings.pendingPayouts) : '₹0'}
                                </div>
                                <p className="text-sm text-amber-600 mt-2">Will be processed in next payout cycle</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payout History</CardTitle>
                            <CardDescription>Track all your payouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <MdAttachMoney className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No payout history yet</p>
                                <p className="text-sm mt-2">Payouts will appear here once processed</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
