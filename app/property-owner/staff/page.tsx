"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Users, Pencil, Trash2, Mail, Building } from "lucide-react";

interface Staff {
    _id: string;
    name: string;
    email: string;
    assignedHotel: {
        _id: string;
        name: string;
    };
    role: string;
}

interface Hotel {
    _id: string;
    name: string;
}

export default function StaffManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        assignedHotel: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch Staff
                const staffRes = await fetch("/api/property-owner/staff");
                if (staffRes.ok) {
                    const data = await staffRes.json();
                    setStaffList(data);
                }

                // Fetch Hotels for dropdown
                const hotelsRes = await fetch("/api/property-owner/properties");
                if (hotelsRes.ok) {
                    const data = await hotelsRes.json();
                    // Normalized property data
                    const hotelArray = Array.isArray(data) ? data : (data.properties || []);
                    const formattedHotels = hotelArray.map((h: any) => ({ _id: h._id, name: h.name }));
                    setHotels(formattedHotels);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchData();
        }
    }, [session]);

    const handleCreate = () => {
        setModalMode('create');
        setFormData({ name: "", email: "", password: "", assignedHotel: "" });
        setSelectedStaff(null);
        setIsModalOpen(true);
    };

    const handleEdit = (staff: Staff) => {
        setModalMode('edit');
        setFormData({
            name: staff.name,
            email: staff.email,
            password: "", // Don't show password
            assignedHotel: staff.assignedHotel._id,
        });
        setSelectedStaff(staff);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this staff member?")) return;

        try {
            const res = await fetch(`/api/property-owner/staff/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setStaffList(prev => prev.filter(s => s._id !== id));
            } else {
                alert("Failed to delete staff");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = modalMode === 'create'
                ? "/api/property-owner/staff"
                : `/api/property-owner/staff/${selectedStaff?._id}`;

            const method = modalMode === 'create' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updatedStaff = await res.json();
                if (modalMode === 'create') {
                    // We need to match the structure for the list, specifically nested assignedHotel
                    // The API returns the user object where assignedHotel is likely just an ID initially unless populated
                    // Let's reload the list to be safe or manually construct it
                    const hotelName = hotels.find(h => h._id === formData.assignedHotel)?.name || "Unknown";
                    const newStaffEntry = {
                        ...updatedStaff,
                        assignedHotel: { _id: formData.assignedHotel, name: hotelName }
                    };
                    setStaffList([...staffList, newStaffEntry]);
                } else {
                    setStaffList(prev => prev.map(s => {
                        if (s._id === updatedStaff._id) {
                            const hotelName = hotels.find(h => h._id === formData.assignedHotel)?.name || s.assignedHotel.name;
                            return { ...updatedStaff, assignedHotel: { _id: formData.assignedHotel, name: hotelName } };
                        }
                        return s;
                    }));
                }
                setIsModalOpen(false);
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Operation failed");
            }
        } catch (error) {
            console.error("Submit error", error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage receptionists and staff for your properties.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                </Button>
            </div>

            {staffList.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No staff members found</h3>
                        <p className="text-sm text-gray-500 max-w-sm mt-1">
                            Add receptionists to help manage your bookings and guests.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={handleCreate}>
                            Add your first staff member
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffList.map((staff) => (
                        <Card key={staff._id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                        {staff.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => handleEdit(staff)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => handleDelete(staff._id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="mt-3 text-lg">{staff.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5 mt-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    {staff.email}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center gap-2 text-gray-700">
                                    <Building className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium truncate">{staff.assignedHotel?.name || "Unassigned"}</span>
                                </div>
                                <div className="mt-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                        {staff.role}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalMode === 'create' ? 'Add New Staff' : 'Edit Staff'}</DialogTitle>
                        <DialogDescription>
                            {modalMode === 'create' ? 'Create a new account for your receptionist.' : 'Update staff details.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="staff@urbanhost.in"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={modalMode === 'create' ? "******" : ""}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={modalMode === 'create'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hotel">Assigned Hotel</Label>
                            <Select
                                value={formData.assignedHotel}
                                onValueChange={(val) => setFormData({ ...formData, assignedHotel: val })}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a hotel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hotels.length === 0 ? (
                                        <div className="p-2 text-xs text-muted-foreground text-center">
                                            No properties found. Please add a property first.
                                        </div>
                                    ) : (
                                        hotels.map((hotel) => (
                                            <SelectItem key={hotel._id} value={hotel._id}>{hotel.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground">The staff member will only manage this hotel.</p>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {modalMode === 'create' ? 'Create Account' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
