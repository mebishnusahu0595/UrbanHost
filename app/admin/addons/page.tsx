"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiDollarSign,
  FiSettings,
} from "react-icons/fi";
import { Loader2, Hotel as HotelIcon } from "lucide-react";
import { useAdminHotels } from "@/lib/hooks/useAdminHotels";
import { useQueryClient } from "@tanstack/react-query";

interface Addon {
  _id?: string;
  name: string;
  price: number;
  description?: string;
}

interface Hotel {
  _id: string;
  name: string;
  address?: {
    city?: string;
    state?: string;
  };
  addons: Addon[];
}

export default function AddonsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [formData, setFormData] = useState<Addon>({
    name: "",
    price: 0,
    description: "",
  });

  const { data: apiHotels = [], isLoading, error } = useAdminHotels();
  const queryClient = useQueryClient();

  // Transform API hotels to match our format
  const hotels: Hotel[] = apiHotels.map((hotel: any) => ({
    _id: hotel.id || hotel._id,
    name: hotel.name || 'Untitled Property',
    address: {
      city: hotel.address?.city || hotel.city || 'Unknown',
      state: hotel.address?.state || ''
    },
    addons: hotel.addons || []
  }));

  useEffect(() => {
    if (error) {
      console.error("Error fetching hotels:", error);
    }
  }, [error]);

  const openManageDialog = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsManageDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingAddon(null);
    setFormData({ name: "", price: 0, description: "" });
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (addon: Addon) => {
    setEditingAddon(addon);
    setFormData({ ...addon });
    setIsAddEditDialogOpen(true);
  };

  const handleSaveAddon = async () => {
    if (!selectedHotel) return;
    if (!formData.name || formData.price <= 0) {
      alert("Please enter valid addon name and price");
      return;
    }

    try {
      const updatedAddons = editingAddon
        ? selectedHotel.addons.map((a) =>
            a.name === editingAddon.name ? formData : a
          )
        : [...selectedHotel.addons, formData];

      const response = await fetch(`/api/hotels/${selectedHotel._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addons: updatedAddons }),
      });

      if (response.ok) {
        alert(
          editingAddon
            ? "Addon updated successfully!"
            : "Addon added successfully!"
        );
        queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
        // Update selectedHotel with fresh data
        const updatedHotel = hotels.find(h => h._id === selectedHotel._id);
        if (updatedHotel) setSelectedHotel(updatedHotel);
        setIsAddEditDialogOpen(false);
      } else {
        const errorText = await response.text();
        let errorMessage = "Failed to save addon";
        try {
          const data = JSON.parse(errorText);
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error saving addon:", error);
      alert("Failed to save addon: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDeleteAddon = async (addonName: string) => {
    if (!selectedHotel || !confirm("Are you sure you want to delete this addon?")) return;

    try {
      const updatedAddons = selectedHotel.addons.filter((a) => a.name !== addonName);

      const response = await fetch(`/api/hotels/${selectedHotel._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addons: updatedAddons }),
      });

      if (response.ok) {
        alert("Addon deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
        // Update selectedHotel with fresh data
        const updatedHotel = hotels.find(h => h._id === selectedHotel._id);
        if (updatedHotel) setSelectedHotel(updatedHotel);
      } else {
        const errorText = await response.text();
        let errorMessage = "Failed to delete addon";
        try {
          const data = JSON.parse(errorText);
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting addon:", error);
      alert("Failed to delete addon: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hotel.address?.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Addons Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Addons Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage addons for all hotels
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search hotels by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hotels List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-center">Addons Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHotels.map((hotel) => (
                  <TableRow key={hotel._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <HotelIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{hotel.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{hotel.address?.city || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {hotel.addons?.length || 0} addons
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => openManageDialog(hotel)}
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FiSettings className="mr-2" />
                        Manage Addons
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredHotels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-600">No hotels found matching your search</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Manage Addons Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Manage Addons - {selectedHotel?.name}
            </DialogTitle>
            <p className="text-sm text-gray-600">{selectedHotel?.address?.city || 'N/A'}</p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Current Addons</h3>
              <Button
                onClick={openAddDialog}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FiPlus className="mr-2" />
                Add New Addon
              </Button>
            </div>

            {selectedHotel && selectedHotel.addons && selectedHotel.addons.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Addon Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedHotel.addons.map((addon, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {addon.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ₹{addon.price}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {addon.description || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(addon)}
                            >
                              <FiEdit className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAddon(addon.name)}
                            >
                              <FiTrash2 className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-4">No addons available for this hotel</p>
                <Button
                  onClick={openAddDialog}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <FiPlus className="mr-2" />
                  Add First Addon
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Addon Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddon ? "Edit Addon" : "Add New Addon"}
            </DialogTitle>
            <p className="text-sm text-gray-600">{selectedHotel?.name}</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Addon Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="e.g., Breakfast, Airport Pickup"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) <span className="text-red-500">*</span></Label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the addon..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAddon}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingAddon ? "Update Addon" : "Add Addon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
