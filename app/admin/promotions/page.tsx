"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Percent, Tag, Zap, Calendar, Clock, DollarSign, Plus } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used, if not I'll standard alert

// Dummy Promotions Data (MMT Style)
const promotionsData = [
    {
        id: 1,
        title: "Basic Promotion",
        description: "Offer recurring discounts to improve occupancy.",
        icon: <Percent className="w-8 h-8 text-blue-500" />,
        color: "bg-blue-50",
        active: 1
    },
    {
        id: 2,
        title: "Last Minute Promotion",
        description: "Offer last-minute discounts to guests who book 0, 1, or 2 days before check-in.",
        icon: <Clock className="w-8 h-8 text-orange-500" />,
        color: "bg-orange-50",
        active: 0
    },
    {
        id: 3,
        title: "Early Bird Promotion",
        description: "Offer exclusive discounts to those who reserve their stays well in advance.",
        icon: <Calendar className="w-8 h-8 text-green-500" />,
        color: "bg-green-50",
        active: 0
    },
    {
        id: 4,
        title: "Long Stay Promotion",
        description: "Offer guests free nights or discounted prices to promote longer stays.",
        icon: <Zap className="w-8 h-8 text-purple-500" />,
        color: "bg-purple-50",
        active: 1
    }
];

export default function PromotionsPage() {
    const [activeTab, setActiveTab] = useState("promotions");
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // New Coupon Form Data
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discountType: "percentage",
        discountAmount: "",
        minOrderValue: "0",
        maxDiscount: "0",
        startDate: "",
        endDate: "",
        applicableHotels: "all",
        adminRevenueShare: "10",
        isActive: true,
        usageLimit: "0"
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/admin/coupons");
            const data = await res.json();
            if (data.success) {
                setCoupons(data.coupons);
            }
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        }
    };

    const handleCreateCoupon = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newCoupon,
                    discountAmount: Number(newCoupon.discountAmount),
                    minOrderValue: Number(newCoupon.minOrderValue),
                    maxDiscount: Number(newCoupon.maxDiscount),
                    adminRevenueShare: Number(newCoupon.adminRevenueShare),
                    usageLimit: Number(newCoupon.usageLimit)
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Coupon Created Successfully!"); // Replace with toast if available
                setIsCreateModalOpen(false);
                fetchCoupons();
                // Reset form
                setNewCoupon({
                    code: "",
                    discountType: "percentage",
                    discountAmount: "",
                    minOrderValue: "0",
                    maxDiscount: "0",
                    startDate: "",
                    endDate: "",
                    applicableHotels: "all",
                    adminRevenueShare: "10",
                    isActive: true,
                    usageLimit: "0"
                });
            } else {
                alert(data.error || "Failed to create coupon");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating coupon");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Promotions & Coupons</h1>
                <p className="text-gray-500">Manage marketing campaigns, create coupons, and boost hotel revenue.</p>
            </div>

            <Tabs defaultValue="promotions" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="promotions">Promotions (Ad)</TabsTrigger>
                    <TabsTrigger value="coupons">Coupons (Admin)</TabsTrigger>
                </TabsList>

                {/* PROMOTIONS TAB (Dummy / Visual Only) */}
                <TabsContent value="promotions" className="mt-6 space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center gap-3 text-yellow-800 mb-6">
                        <Tag className="h-5 w-5" />
                        <span className="font-medium">One-stop solution to offer the best promotions & ads to guests. Boost your visibility!</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {promotionsData.map((promo) => (
                            <Card key={promo.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className={`p-3 rounded-lg ${promo.color}`}>
                                        {promo.icon}
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{promo.title}</CardTitle>
                                        {promo.active > 0 && <Badge variant="secondary" className="mt-1 text-green-600 bg-green-50">{promo.active} ACTIVE</Badge>}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-500 leading-relaxed">{promo.description}</p>
                                </CardContent>
                                <CardFooter className="flex justify-end pt-0">
                                    <Button variant="outline" onClick={() => alert("This feature is currently simulated for visual reference.")}>Create</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="border rounded-lg p-6 bg-white mt-8">
                        <h3 className="text-lg font-bold mb-4">Special Audience Promotions (Tier 2)</h3>
                        <p className="text-gray-500 mb-4">Offer exclusive discounts to specific sets of target audience including Mobile Users, Corporate, Members, Geographical Audience & More.</p>
                        <Button onClick={() => alert("Coming Soon!")}>Create Now</Button>
                    </div>
                </TabsContent>


                {/* COUPONS TAB (Functional) */}
                <TabsContent value="coupons" className="mt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Active Coupons</h2>
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4 mr-2" /> Create New Coupon</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create Coupon</DialogTitle>
                                    <DialogDescription>Generate a new discount coupon for users. Admin gets a revenue share.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Coupon Code</Label>
                                            <Input placeholder="SUMMER50" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Discount Type</Label>
                                            <Select value={newCoupon.discountType} onValueChange={(val) => setNewCoupon({ ...newCoupon, discountType: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Discount Value {newCoupon.discountType === 'percentage' ? '(%)' : '(₹)'}</Label>
                                            <Input type="number" placeholder="10" value={newCoupon.discountAmount} onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Min. Order Value (₹)</Label>
                                            <Input type="number" placeholder="0" value={newCoupon.minOrderValue} onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })} />
                                        </div>
                                    </div>

                                    {newCoupon.discountType === 'percentage' && (
                                        <div className="space-y-2">
                                            <Label>Max Discount Limit (₹) - Optional</Label>
                                            <Input type="number" placeholder="Enter max limit or 0 for unlimited" value={newCoupon.maxDiscount} onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })} />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input type="date" value={newCoupon.startDate} onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input type="date" value={newCoupon.endDate} onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Usage Limit (Total)</Label>
                                            <Input type="number" placeholder="0 for unlimited" value={newCoupon.usageLimit} onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-blue-700 font-bold">Admin Revenue Share (%)</Label>
                                            <Input type="number" placeholder="10" value={newCoupon.adminRevenueShare} onChange={(e) => setNewCoupon({ ...newCoupon, adminRevenueShare: e.target.value })} />
                                            <p className="text-xs text-gray-500">Percentage of revenue admin keeps from bookings using this coupon.</p>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateCoupon} disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Coupon'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Admin Share</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">No coupons active. Create one to get started.</TableCell>
                                    </TableRow>
                                ) : (
                                    coupons.map((coupon) => (
                                        <TableRow key={coupon._id}>
                                            <TableCell className="font-bold font-mono">{coupon.code}</TableCell>
                                            <TableCell>
                                                {coupon.discountType === 'flat' ? `₹${coupon.discountAmount}` : `${coupon.discountAmount}%`}
                                                {coupon.maxDiscount > 0 && <span className="text-xs text-gray-400 block">Up to ₹{coupon.maxDiscount}</span>}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {new Date(coupon.startDate).toLocaleDateString()} - <br />
                                                {new Date(coupon.endDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}</TableCell>
                                            <TableCell className="text-blue-600 font-bold">{coupon.adminRevenueShare}%</TableCell>
                                            <TableCell>
                                                <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
