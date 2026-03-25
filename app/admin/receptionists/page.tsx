"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiUser, FiPhone, FiSearch } from "react-icons/fi";
import { MdBusiness } from "react-icons/md";
import { Loader2 } from "lucide-react";

interface Receptionist {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    assignedHotel?: {
        _id: string;
        name: string;
        address?: {
            city?: string;
        };
    };
    createdAt: string;
}

export default function ReceptionistsPage() {
    const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentReceptionist, setCurrentReceptionist] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        assignedHotel: "",
        password: "",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [filterHotel, setFilterHotel] = useState("all");

    useEffect(() => {
        fetchReceptionists();
        fetchHotels();
    }, []);

    const fetchReceptionists = async () => {
        try {
            const response = await fetch("/api/admin/receptionists");
            if (response.ok) {
                const data = await response.json();
                setReceptionists(data.receptionists || []);
            }
        } catch (error) {
            console.error("Failed to fetch receptionists:", error);
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

    const handleOpenModal = (receptionist?: Receptionist) => {
        if (receptionist) {
            setIsEditMode(true);
            setCurrentReceptionist(receptionist);
            setFormData({
                name: receptionist.name,
                email: receptionist.email,
                phone: receptionist.phone || "",
                assignedHotel: receptionist.assignedHotel?._id || "",
                password: "",
            });
        } else {
            setIsEditMode(false);
            setCurrentReceptionist(null);
            setFormData({
                name: "",
                email: "",
                phone: "",
                assignedHotel: "",
                password: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = isEditMode
                ? `/api/admin/receptionists/${currentReceptionist._id}`
                : "/api/admin/receptionists";

            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert(isEditMode ? "Receptionist updated successfully!" : "Receptionist created successfully!");
                setIsModalOpen(false);
                fetchReceptionists();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to save receptionist");
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete receptionist "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/receptionists/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Receptionist deleted successfully!");
                fetchReceptionists();
            } else {
                alert("Failed to delete receptionist");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred");
        }
    };

    const handleResendCredentials = async (id: string, email: string) => {
        if (!confirm(`Resend credentials to ${email}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/receptionists/${id}/resend`, {
                method: "POST",
            });

            if (response.ok) {
                alert("Credentials sent successfully!");
            } else {
                alert("Failed to send credentials");
            }
        } catch (error) {
            console.error("Resend error:", error);
            alert("An error occurred");
        }
    };
    const filteredReceptionists = receptionists.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.assignedHotel?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesHotel = filterHotel === "all" || r.assignedHotel?._id === filterHotel;

        return matchesSearch && matchesHotel;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Receptionists</h1>
                    <p className="text-gray-600 mt-1">Manage hotel reception staff</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Add Receptionist
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Receptionists</p>
                                <p className="text-3xl font-bold text-blue-600">{filteredReceptionists.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiUser className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Assigned Hotels</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {filteredReceptionists.filter(r => r.assignedHotel).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <MdBusiness className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Unassigned</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {filteredReceptionists.filter(r => !r.assignedHotel).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <FiUser className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>All Receptionists</CardTitle>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative w-full sm:w-64">
                                <Input
                                    placeholder="Search name, hotel, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <select
                                value={filterHotel}
                                onChange={(e) => setFilterHotel(e.target.value)}
                                className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="all">All Hotels</option>
                                {hotels.map((hotel) => (
                                    <option key={hotel._id} value={hotel._id}>
                                        {hotel.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {receptionists.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FiUser className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">No receptionists yet</p>
                            <p className="text-sm">Click "Add Receptionist" to create one</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Assigned Hotel</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReceptionists.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No matches found for your search/filter
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReceptionists.map((receptionist) => (
                                            <TableRow key={receptionist._id}>
                                                <TableCell className="font-medium">{receptionist.name}</TableCell>
                                                <TableCell>{receptionist.email}</TableCell>
                                                <TableCell>{receptionist.phone || "-"}</TableCell>
                                                <TableCell>
                                                    {receptionist.assignedHotel ? (
                                                        <div>
                                                            <p className="font-medium">{receptionist.assignedHotel.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {receptionist.assignedHotel.address?.city || ""}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Not assigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(receptionist.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleResendCredentials(receptionist._id, receptionist.email)}
                                                            title="Resend Credentials"
                                                        >
                                                            <FiMail className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenModal(receptionist)}
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(receptionist._id, receptionist.name)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? "Edit Receptionist" : "Add New Receptionist"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? "Update receptionist information"
                                : "Create a new receptionist account for a hotel"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john.doe@urbanhost.com"
                                    required
                                    disabled={isEditMode}
                                />
                                {!isEditMode && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Recommended: firstname.lastname@urbanhost.com
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 9876543210"
                                />
                            </div>

                            <div>
                                <Label htmlFor="hotel">Assigned Hotel <span className="text-red-500">*</span></Label>
                                <select
                                    id="hotel"
                                    value={formData.assignedHotel}
                                    onChange={(e) => setFormData({ ...formData, assignedHotel: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a hotel</option>
                                    {hotels.map((hotel) => (
                                        <option key={hotel._id} value={hotel._id}>
                                            {hotel.name} - {hotel.address?.city || ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {!isEditMode && (
                                <div>
                                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="password"
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="hotelname@123"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Recommended: hotelname@123
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {isEditMode ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>{isEditMode ? "Update" : "Create"} Receptionist</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
