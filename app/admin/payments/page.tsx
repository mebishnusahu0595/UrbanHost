"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdAttachMoney, MdFileDownload, MdCalendarToday, MdFilterList, MdSearch } from "react-icons/md";
import { Loader2 } from "lucide-react";

interface Payment {
    _id: string;
    hotel: { name: string };
    user: { name: string; email: string; phone: string };
    totalPrice: number;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    createdAt: string;
}

export default function PaymentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user && (session.user as any).role !== "admin") {
            router.push("/");
        }
    }, [status, session, router]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/payments?range=${range}`;
            if (range === "custom" && startDate && endDate) {
                url += `&start=${startDate}&end=${endDate}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPayments(data.payments || []);
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchPayments();
        }
    }, [session, range, startDate, endDate]);

    const handleExportCSV = () => {
        if (payments.length === 0) return;

        const headers = ["Date", "Customer", "Email", "Hotel", "Amount", "Method", "Payment Status", "Booking Status"];
        const csvContent = [
            headers.join(","),
            ...payments.map(p => [
                new Date(p.createdAt).toLocaleDateString(),
                `"${p.user.name}"`,
                p.user.email,
                `"${p.hotel.name}"`,
                p.totalPrice,
                p.paymentMethod || "N/A",
                p.paymentStatus,
                p.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredPayments = payments.filter(p =>
        p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = filteredPayments
        .filter(p => p.status !== 'cancelled')
        .reduce((acc, curr) => acc + curr.totalPrice, 0);

    const successfulTransactions = filteredPayments.filter(p => p.status !== 'cancelled').length;

    if (loading && payments.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">Payments & Revenue</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Track all successful transactions and earnings
                    </p>
                </div>
                <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 h-10 md:h-11">
                    <MdFileDownload className="mr-2 h-5 w-5" />
                    Export CSV
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1E3A8A] text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80 text-white">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs mt-1 opacity-70">Based on current filters</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-bold">{successfulTransactions}</div>
                        <p className="text-xs mt-1 text-muted-foreground">Confirmed & Completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Ticket Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-bold">
                            ₹{successfulTransactions > 0 ? (totalRevenue / successfulTransactions).toFixed(0).toLocaleString() : 0}
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">Per booking average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 md:p-6">
                    <h3 className="text-lg font-bold mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Period</label>
                            <Select value={range} onValueChange={setRange}>
                                <SelectTrigger className="w-full h-11 bg-white">
                                    <SelectValue placeholder="Select Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="1day">Today</SelectItem>
                                    <SelectItem value="1week">Last 7 Days</SelectItem>
                                    <SelectItem value="1year">Last 1 Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {range === "custom" && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">From</label>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">To</label>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11" />
                                </div>
                            </>
                        )}

                        <div className={`space-y-2 ${range === 'custom' ? 'md:col-span-1' : 'md:col-span-3'}`}>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Search</label>
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Search by customer, hotel..."
                                    className="pl-10 h-11"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="py-4 px-6 text-left font-bold text-gray-700">Date</th>
                                    <th className="py-4 px-6 text-left font-bold text-gray-700">Customer</th>
                                    <th className="py-4 px-6 text-left font-bold text-gray-700">Hotel</th>
                                    <th className="py-4 px-6 text-left font-bold text-gray-700">Amount</th>
                                    <th className="py-4 px-6 text-left font-bold text-gray-700">Method</th>
                                    <th className="py-4 px-6 text-left font-bold text-gray-700 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-gray-500">
                                            {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> : "No payments found for this period"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((p) => (
                                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">
                                                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    {new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-[#1E3A8A]">{p.user.name}</div>
                                                <div className="text-[11px] text-gray-500">{p.user.email}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium truncate max-w-[150px]">{p.hotel.name}</div>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-gray-900">
                                                ₹{p.totalPrice.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 capitalize">
                                                {p.paymentMethod || "Online"}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <Badge className={
                                                    p.status === 'cancelled'
                                                        ? "bg-red-100 text-red-700 border-red-200 capitalize"
                                                        : "bg-green-100 text-green-700 border-green-200 capitalize"
                                                }>
                                                    {p.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
