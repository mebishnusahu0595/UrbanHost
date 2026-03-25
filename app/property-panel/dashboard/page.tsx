
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Building2, MapPin, Clock, Edit, AlertCircle, Trash2 } from "lucide-react";

export default function PropertyPanelDashboard() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/property-panel/properties");
            if (res.ok) {
                const data = await res.json();
                setProperties(data.properties);
            }
        } catch (error) {
            console.error("Failed to fetch properties", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = properties.filter(p => {
        if (filter === "all") return true;
        return p.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
            case 'published':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Live</span>;
            case 'pending':
            case 'submitted':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase">Under Review</span>;
            case 'draft':
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">Draft</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">Action Required</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">{status}</span>;
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this submission? It will move back to drafts.")) return;
        try {
            const res = await fetch(`/api/property-panel/properties/${id}/revoke`, { method: "POST" });
            if (res.ok) fetchProperties();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Property Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage all your property listings in one place.</p>
                </div>
                <Link href="/property-panel/properties/add">
                    <Button className="bg-[#1E3A8A] hover:bg-[#1e40af] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        List New Property
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'approved', 'pending', 'draft', 'rejected'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === f
                                ? "bg-[#1E3A8A] text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
                </div>
            ) : filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No properties found</h3>
                    <p className="text-gray-500 mt-2 mb-6">Get started by listing your first property.</p>
                    <Link href="/property-panel/properties/add">
                        <Button variant="outline">List Property</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                        <div key={property._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow bg-white">
                            <div className="relative h-48 bg-gray-100">
                                {property.images?.[0] ? (
                                    <Image
                                        src={property.images[0]}
                                        alt={property.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <Building2 className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(property.status)}
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{property.name || "Untitled Property"}</h3>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                    <span className="truncate">{property.address?.city || "No location"}, {property.address?.state}</span>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                                    <div className="text-xs text-gray-400 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Updated: {new Date(property.updatedAt).toLocaleDateString()}
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Actions based on status */}
                                        {(property.status === 'draft' || property.status === 'rejected') && (
                                            <Link href={`/property-panel/properties/${property._id}/edit`}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    <Edit className="w-3 h-3 mr-1" /> Edit
                                                </Button>
                                            </Link>
                                        )}

                                        {(property.status === 'pending' || property.status === 'submitted') && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                onClick={() => handleRevoke(property._id)}
                                            >
                                                Revoke
                                            </Button>
                                        )}

                                        {(property.status === 'approved' || property.status === 'published') && (
                                            <Link href={`/hotels/${property._id}`} target="_blank">
                                                <Button size="sm" variant="ghost" className="h-8 text-blue-600">
                                                    View
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {property.status === 'rejected' && property.rejectionReason && (
                                    <div className="mt-4 bg-red-50 p-3 rounded-lg text-xs text-red-700 flex gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{property.rejectionReason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
