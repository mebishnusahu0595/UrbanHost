"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { FiPlus, FiEdit, FiTrash2, FiKey, FiEye, FiEyeOff } from "react-icons/fi";
import { MdHotel } from "react-icons/md";
import { Loader2 } from "lucide-react";

interface Hotel {
    _id: string;
    name: string;
    address?: {
        city?: string;
        state?: string;
    };
}

interface HotelOwner {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    assignedHotels: Hotel[];
    canEditHotels?: boolean;
    createdAt: string;
}

export default function HotelOwnersPage() {
    const [owners, setOwners] = useState<HotelOwner[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState<HotelOwner | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        assignedHotels: [] as string[],
        canEditHotels: false,
    });
    const [newPassword, setNewPassword] = useState("");

    const fetchOwners = async () => {
        try {
            const response = await fetch("/api/admin/hotel-owners");
            if (response.ok) {
                const data = await response.json();
                setOwners(data.hotelOwners || []);
            }
        } catch (error) {
            console.error("Failed to fetch hotel owners:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHotels = async () => {
        try {
            const response = await fetch("/api/admin/hotels");
            if (response.ok) {
                const data = await response.json();
                setHotels(data.hotels || []);
            }
        } catch (error) {
            console.error("Failed to fetch hotels:", error);
        }
    };

    useEffect(() => {
        fetchOwners();
        fetchHotels();
    }, []);

    const handleCreate = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            alert("Name, email and password are required");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/admin/hotel-owners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsCreateOpen(false);
                setFormData({ name: "", email: "", password: "", phone: "", assignedHotels: [], canEditHotels: false });
                fetchOwners();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to create hotel owner");
            }
        } catch (error) {
            console.error("Error creating hotel owner:", error);
            alert("Failed to create hotel owner");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedOwner) return;

        setSaving(true);
        try {
            const response = await fetch("/api/admin/hotel-owners", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedOwner._id,
                    name: formData.name,
                    phone: formData.phone,
                    assignedHotels: formData.assignedHotels,
                    canEditHotels: formData.canEditHotels,
                }),
            });

            if (response.ok) {
                setIsEditOpen(false);
                setSelectedOwner(null);
                fetchOwners();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to update hotel owner");
            }
        } catch (error) {
            console.error("Error updating hotel owner:", error);
            alert("Failed to update hotel owner");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!selectedOwner || !newPassword) {
            alert("New password is required");
            return;
        }

        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/admin/hotel-owners", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedOwner._id,
                    newPassword: newPassword,
                }),
            });

            if (response.ok) {
                setIsChangePasswordOpen(false);
                setSelectedOwner(null);
                setNewPassword("");
                alert("Password changed successfully");
            } else {
                const data = await response.json();
                alert(data.error || "Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (owner: HotelOwner) => {
        if (!confirm(`Are you sure you want to delete ${owner.name}?`)) return;

        try {
            const response = await fetch(`/api/admin/hotel-owners?userId=${owner._id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchOwners();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete hotel owner");
            }
        } catch (error) {
            console.error("Error deleting hotel owner:", error);
            alert("Failed to delete hotel owner");
        }
    };

    const openEditDialog = (owner: HotelOwner) => {
        setSelectedOwner(owner);
        setFormData({
            name: owner.name,
            email: owner.email,
            password: "",
            phone: owner.phone || "",
            assignedHotels: owner.assignedHotels?.map(h => h._id) || [],
            canEditHotels: owner.canEditHotels || false,
        });
        setIsEditOpen(true);
    };

    const openChangePasswordDialog = (owner: HotelOwner) => {
        setSelectedOwner(owner);
        setNewPassword("");
        setIsChangePasswordOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">Hotel Owners</h1>
                    <p className="text-xs md:text-base text-muted-foreground">
                        Manage property owners with read-only access
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2 text-xs md:text-sm w-full md:w-auto" size="sm">
                    <FiPlus className="w-4 h-4" />
                    Add Hotel Owner
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <Card>
                    <CardContent className="p-3 md:p-6">
                        <p className="text-[10px] md:text-sm text-muted-foreground">Total Owners</p>
                        <div className="text-lg md:text-2xl font-bold">{owners.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 md:p-6">
                        <p className="text-[10px] md:text-sm text-muted-foreground">With Hotels</p>
                        <div className="text-lg md:text-2xl font-bold">
                            {owners.filter(o => o.assignedHotels?.length > 0).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 md:p-6">
                        <p className="text-[10px] md:text-sm text-muted-foreground">Hotels</p>
                        <div className="text-lg md:text-2xl font-bold">{hotels.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {owners.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <p className="text-sm">No hotel owners yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    owners.map((owner) => (
                        <Card key={owner._id}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-sm truncate">{owner.name}</p>
                                            {(owner as any).isPropertyOwner && (
                                                <Badge variant="outline" className="text-[9px] px-1 py-0">Property Owner</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{owner.email}</p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(owner)}>
                                            <FiEdit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openChangePasswordDialog(owner)}>
                                            <FiKey className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(owner)}>
                                            <FiTrash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {owner.assignedHotels?.length > 0 ? (
                                        owner.assignedHotels.slice(0, 2).map((hotel) => (
                                            <Badge key={hotel._id} variant="secondary" className="text-[10px]">
                                                {hotel.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No hotels assigned</span>
                                    )}
                                    {owner.assignedHotels?.length > 2 && (
                                        <Badge variant="outline" className="text-[10px]">
                                            +{owner.assignedHotels.length - 2}
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-2">
                                    {owner.canEditHotels ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">Edit Access</Badge>
                                    ) : (
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px]">Read-only Access</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table */}
            <Card className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Access</TableHead>
                                <TableHead>Assigned Hotels</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {owners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No hotel owners yet. Click &quot;Add Hotel Owner&quot; to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                owners.map((owner) => (
                                    <TableRow key={owner._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {owner.name}
                                                {(owner as any).isPropertyOwner && (
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">Property Owner</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{owner.email}</TableCell>
                                        <TableCell>{owner.phone || "-"}</TableCell>
                                        <TableCell>
                                            {owner.canEditHotels ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Full Edit</Badge>
                                            ) : (
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Read-only</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {owner.assignedHotels?.length > 0 ? (
                                                    owner.assignedHotels.map((hotel) => (
                                                        <Badge key={hotel._id} variant="secondary" className="text-xs">
                                                            {hotel.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No hotels assigned</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(owner.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(owner)} title="Edit">
                                                    <FiEdit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openChangePasswordDialog(owner)} title="Change Password">
                                                    <FiKey className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(owner)} className="text-red-500 hover:text-red-700" title="Delete">
                                                    <FiTrash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base md:text-lg">Add New Hotel Owner</DialogTitle>
                        <DialogDescription className="text-xs md:text-sm">
                            Create a read-only account for a property owner.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 md:space-y-4 py-4">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Name <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Full Name"
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Email <span className="text-red-500">*</span></label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimum 6 characters"
                                    className="text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Phone</label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Assign Hotels</label>
                            <div className="max-h-32 md:max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                                {hotels.map((hotel) => (
                                    <label key={hotel._id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.assignedHotels.includes(hotel._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        assignedHotels: [...formData.assignedHotels, hotel._id],
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        assignedHotels: formData.assignedHotels.filter(id => id !== hotel._id),
                                                    });
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-xs md:text-sm">{hotel.name}</span>
                                    </label>
                                ))}
                                {hotels.length === 0 && (
                                    <p className="text-xs md:text-sm text-muted-foreground">No hotels available</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Hotel Access Level</label>
                            <div className="flex items-center gap-4 border rounded-lg p-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="accessLevel"
                                        checked={!formData.canEditHotels}
                                        onChange={() => setFormData({ ...formData, canEditHotels: false })}
                                        className="text-blue-600"
                                    />
                                    <span className="text-xs md:text-sm">Read-only</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="accessLevel"
                                        checked={formData.canEditHotels}
                                        onChange={() => setFormData({ ...formData, canEditHotels: true })}
                                        className="text-blue-600"
                                    />
                                    <span className="text-xs md:text-sm">Normal (Edit)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col gap-2 md:flex-row">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="text-xs md:text-sm">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={saving} className="text-xs md:text-sm">
                            {saving ? "Creating..." : "Create Hotel Owner"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base md:text-lg">Edit Hotel Owner</DialogTitle>
                        <DialogDescription className="text-xs md:text-sm">
                            Update hotel owner details and assigned hotels
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 md:space-y-4 py-4">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Email</label>
                            <Input value={formData.email} disabled className="bg-gray-50 text-sm" />
                            <p className="text-[10px] md:text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Phone</label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Assign Hotels</label>
                            <div className="max-h-32 md:max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                                {hotels.map((hotel) => (
                                    <label key={hotel._id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.assignedHotels.includes(hotel._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        assignedHotels: [...formData.assignedHotels, hotel._id],
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        assignedHotels: formData.assignedHotels.filter(id => id !== hotel._id),
                                                    });
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-xs md:text-sm">{hotel.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">Hotel Access Level</label>
                            <div className="flex items-center gap-4 border rounded-lg p-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="accessLevelEdit"
                                        checked={!formData.canEditHotels}
                                        onChange={() => setFormData({ ...formData, canEditHotels: false })}
                                        className="text-blue-600"
                                    />
                                    <span className="text-xs md:text-sm">Read-only</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="accessLevelEdit"
                                        checked={formData.canEditHotels}
                                        onChange={() => setFormData({ ...formData, canEditHotels: true })}
                                        className="text-blue-600"
                                    />
                                    <span className="text-xs md:text-sm">Normal (Edit)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col gap-2 md:flex-row">
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} className="text-xs md:text-sm">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={saving} className="text-xs md:text-sm">
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base md:text-lg">Change Password</DialogTitle>
                        <DialogDescription className="text-xs md:text-sm">
                            Set a new password for {selectedOwner?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 md:space-y-4 py-4">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-xs md:text-sm font-medium">New Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col gap-2 md:flex-row">
                        <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)} className="text-xs md:text-sm">
                            Cancel
                        </Button>
                        <Button onClick={handleChangePassword} disabled={saving} className="text-xs md:text-sm">
                            {saving ? "Changing..." : "Change Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
