"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MdDownload } from "react-icons/md";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface StatsData {
    totalRevenue: number;
    totalBookings: number;
    totalHotels: number;
    approvedHotels: number;
    totalUsers: number;
}

interface ChartData {
    revenueChart: { labels: string[]; data: number[] };
    bookingsChart: { labels: string[]; data: number[] };
    propertyChart: { labels: string[]; data: number[] };
}

export default function ReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user && (session.user as any).role !== "admin") {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartsRes] = await Promise.all([
                    fetch("/api/admin/stats"),
                    fetch("/api/admin/reports/charts")
                ]);

                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data.stats);
                }
                if (chartsRes.ok) {
                    const data = await chartsRes.json();
                    setChartData(data);
                }
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchData();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Loading reports...</p>
                </div>
            </div>
        );
    }

    const revenueOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return '₹' + value.toLocaleString('en-IN');
                    }
                }
            }
        }
    };

    const bookingOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    const handleExport = () => {
        if (!stats) return;

        const csvRows = [];

        // Header
        csvRows.push(['Analytics Report', new Date().toLocaleString()]);
        csvRows.push([]);

        // Key Stats
        csvRows.push(['--- Overview ---']);
        csvRows.push(['Metric', 'Value']);
        csvRows.push(['Total Revenue', stats.totalRevenue]);
        csvRows.push(['Total Bookings', stats.totalBookings]);
        csvRows.push(['Total Users', stats.totalUsers]);
        csvRows.push(['Total Hotels', stats.totalHotels]);
        csvRows.push(['Approved Hotels', stats.approvedHotels]);
        csvRows.push([]);

        // Revenue Trends if available
        if (chartData?.revenueChart) {
            csvRows.push(['--- Revenue Trends ---']);
            csvRows.push(['Period', 'Revenue']);
            chartData.revenueChart.labels.forEach((label, index) => {
                csvRows.push([label, chartData.revenueChart.data[index]]);
            });
            csvRows.push([]);
        }

        // Booking Trends if available
        if (chartData?.bookingsChart) {
            csvRows.push(['--- Booking Trends ---']);
            csvRows.push(['Period', 'Bookings']);
            chartData.bookingsChart.labels.forEach((label, index) => {
                csvRows.push([label, chartData.bookingsChart.data[index]]);
            });
            csvRows.push([]);
        }

        const csvContent = csvRows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl md:text-4xl font-bold">Reports & Analytics</h1>
                    <p className="text-xs md:text-lg text-muted-foreground mt-1">
                        Platform performance and insights
                    </p>
                </div>
                <Button size="sm" onClick={handleExport} className="w-full md:w-auto">
                    <MdDownload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">Export Report</span>
                </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
                    <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
                    <TabsTrigger value="revenue" className="text-xs md:text-sm">Revenue</TabsTrigger>
                    <TabsTrigger value="bookings" className="text-xs md:text-sm">Bookings</TabsTrigger>
                    <TabsTrigger value="properties" className="text-xs md:text-sm">Properties</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4 md:mt-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="p-3 md:p-6 pb-2">
                                <CardTitle className="text-[10px] md:text-sm font-medium">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 md:p-6 pt-0">
                                <div className="text-base md:text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">All time</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-3 md:p-6 pb-2">
                                <CardTitle className="text-[10px] md:text-sm font-medium">Total Bookings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 md:p-6 pt-0">
                                <div className="text-base md:text-2xl font-bold">{stats?.totalBookings || 0}</div>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">All time</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-3 md:p-6 pb-2">
                                <CardTitle className="text-[10px] md:text-sm font-medium">Active Properties</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 md:p-6 pt-0">
                                <div className="text-base md:text-2xl font-bold">{stats?.approvedHotels || 0}</div>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Listed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-3 md:p-6 pb-2">
                                <CardTitle className="text-[10px] md:text-sm font-medium">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 md:p-6 pt-0">
                                <div className="text-base md:text-2xl font-bold">{stats?.totalUsers || 0}</div>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Registered</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue Chart */}
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="text-sm md:text-base">Revenue Trends</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Monthly revenue over the last 12 months</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0">
                            <div className="h-[250px] md:h-[400px] w-full">
                                {chartData && (
                                    <Line
                                        options={{ ...revenueOptions, maintainAspectRatio: false }}
                                        data={{
                                            labels: chartData.revenueChart.labels,
                                            datasets: [
                                                {
                                                    label: 'Revenue',
                                                    data: chartData.revenueChart.data,
                                                    borderColor: 'rgb(249, 115, 22)',
                                                    backgroundColor: 'rgba(249, 115, 22, 0.5)',
                                                    tension: 0.3,
                                                },
                                            ],
                                        }}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4 mt-4 md:mt-6">
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="text-sm md:text-base">Revenue Analytics</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Detailed revenue breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0">
                            <div className="h-[250px] md:h-[400px] w-full">
                                {chartData && (
                                    <Bar
                                        options={{ ...revenueOptions, maintainAspectRatio: false }}
                                        data={{
                                            labels: chartData.revenueChart.labels,
                                            datasets: [
                                                {
                                                    label: 'Revenue',
                                                    data: chartData.revenueChart.data,
                                                    backgroundColor: 'rgba(249, 115, 22, 0.8)',
                                                },
                                            ],
                                        }}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4 mt-4 md:mt-6">
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="text-sm md:text-base">Booking Analytics</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Booking trends and patterns</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0">
                            <div className="h-[250px] md:h-[400px] w-full">
                                {chartData && (
                                    <Line
                                        options={{ ...bookingOptions, maintainAspectRatio: false }}
                                        data={{
                                            labels: chartData.bookingsChart.labels,
                                            datasets: [
                                                {
                                                    label: 'Bookings',
                                                    data: chartData.bookingsChart.data,
                                                    borderColor: 'rgb(59, 130, 246)',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                                    tension: 0.3,
                                                },
                                            ],
                                        }}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="properties" className="space-y-4 mt-4 md:mt-6">
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="text-sm md:text-base">Property Status Distribution</CardTitle>
                            <CardDescription className="text-xs md:text-sm">Current status of all listed properties</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0">
                            <div className="h-[250px] md:h-[400px] w-full flex justify-center">
                                {chartData && (
                                    <div className="w-full max-w-[300px] md:max-w-[400px]">
                                        <Doughnut
                                            data={{
                                                labels: chartData.propertyChart.labels,
                                                datasets: [
                                                    {
                                                        label: 'Properties',
                                                        data: chartData.propertyChart.data,
                                                        backgroundColor: [
                                                            'rgba(34, 197, 94, 0.8)',
                                                            'rgba(234, 179, 8, 0.8)',
                                                            'rgba(239, 68, 68, 0.8)',
                                                        ],
                                                        borderColor: [
                                                            'rgba(34, 197, 94, 1)',
                                                            'rgba(234, 179, 8, 1)',
                                                            'rgba(239, 68, 68, 1)',
                                                        ],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
