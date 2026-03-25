"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FiUpload,
    FiCheckCircle,
    FiX,
    FiAlertCircle
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

interface DocumentUploadProps {
    onComplete: (documents: any) => void;
    initialData?: any;
}

interface DocumentField {
    key: string;
    label: string;
    required: boolean;
    category: string;
    description?: string;
}

const documentFields: DocumentField[] = [
    // Ownership Proof
    { key: "ownershipProof", label: "Property Ownership Document (Registry/Sale Deed)", required: true, category: "Ownership Proof", description: "Required for property verification" },
    { key: "leaseAgreement", label: "Rent/Lease Agreement", required: false, category: "Ownership Proof", description: "If property is leased" },
    { key: "authorizationLetter", label: "Authorization Letter", required: false, category: "Ownership Proof", description: "If managing on behalf of owner" },

    // Property Address Proof
    { key: "propertyAddressProof", label: "Property Address Proof (Utility Bill/Tax Receipt)", required: true, category: "Property Address Proof" },
    { key: "googleLocationLink", label: "Google Location Link", required: true, category: "Property Address Proof" },

    // Owner KYC
    { key: "panCard", label: "PAN Card", required: true, category: "Owner KYC" },
    { key: "aadhaarCard", label: "Aadhaar Card", required: false, category: "Owner KYC" },
    { key: "ownerPhoto", label: "Passport Size Photograph", required: true, category: "Owner KYC" },
    { key: "passport", label: "Passport", required: false, category: "Owner KYC", description: "Optional" },
    { key: "voterID", label: "Voter ID", required: false, category: "Owner KYC", description: "Optional" },

    // Business Registration
    { key: "gstCertificate", label: "GST Registration Certificate", required: false, category: "Business Registration", description: "If GST registered" },
    { key: "msmeRegistration", label: "MSME/Udyam Registration", required: false, category: "Business Registration", description: "Optional" },
    { key: "partnershipDeed", label: "Partnership Deed", required: false, category: "Business Registration", description: "If partnership firm" },
    { key: "incorporationCertificate", label: "Certificate of Incorporation", required: false, category: "Business Registration", description: "If Pvt Ltd" },

    // Bank Details
    { key: "cancelledCheque", label: "Cancelled Cheque", required: true, category: "Bank Details" },
    { key: "bankPassbook", label: "Bank Passbook Front Page", required: false, category: "Bank Details" },

    // Licenses & Compliance
    { key: "tradeLicense", label: "Trade License", required: true, category: "Licenses & Compliance" },
    { key: "hotelLicense", label: "Hotel License", required: false, category: "Licenses & Compliance", description: "If applicable" },
    { key: "fireSafetyCertificate", label: "Fire Safety Certificate", required: false, category: "Licenses & Compliance", description: "For large hotels" },
    { key: "pollutionCertificate", label: "Pollution/NOC Certificate", required: false, category: "Licenses & Compliance", description: "Where required" },

    // Optional Premium
    { key: "fssaiLicense", label: "FSSAI License", required: false, category: "Optional Documents", description: "If food is served" },
    { key: "liquorLicense", label: "Liquor License", required: false, category: "Optional Documents", description: "If bar is operational" },
    { key: "poolSafetyCertificate", label: "Swimming Pool Safety Certificate", required: false, category: "Optional Documents", description: "If applicable" },
    { key: "insuranceCertificate", label: "Insurance Coverage", required: false, category: "Optional Documents", description: "Recommended" },
];

export default function DocumentUpload({ onComplete, initialData }: DocumentUploadProps) {
    const [documents, setDocuments] = useState<any>(initialData || {});
    const [uploading, setUploading] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFileUpload = async (key: string, file: File) => {
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors({ ...errors, [key]: "File size must be less than 5MB" });
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setErrors({ ...errors, [key]: "Only JPG, PNG, and PDF files are allowed" });
            return;
        }

        setUploading(key);
        setErrors({ ...errors, [key]: "" });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'property-documents');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setDocuments({ ...documents, [key]: data.url });
        } catch (error) {
            setErrors({ ...errors, [key]: "Upload failed. Please try again." });
        } finally {
            setUploading(null);
        }
    };

    const handleRemove = (key: string) => {
        const newDocs = { ...documents };
        delete newDocs[key];
        setDocuments(newDocs);
    };

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        // Validate required documents
        documentFields.forEach(field => {
            if (field.required && !documents[field.key]) {
                newErrors[field.key] = "This document is required";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onComplete(documents);
    };

    const groupedFields = documentFields.reduce((acc, field) => {
        if (!acc[field.category]) {
            acc[field.category] = [];
        }
        acc[field.category].push(field);
        return acc;
    }, {} as Record<string, DocumentField[]>);

    const requiredCount = documentFields.filter(f => f.required).length;
    const uploadedRequired = documentFields.filter(f => f.required && documents[f.key]).length;
    const progress = Math.round((uploadedRequired / requiredCount) * 100);

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Document Upload
                </h1>
                <p className="text-gray-600">
                    Please upload all required documents to complete your property registration
                </p>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Required Documents: {uploadedRequired}/{requiredCount}
                        </span>
                        <span className="text-sm font-medium text-blue-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Document Categories */}
            <div className="space-y-8">
                {Object.entries(groupedFields).map(([category, fields]) => (
                    <Card key={category}>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                {category}
                                {fields.some(f => f.required) && (
                                    <span className="text-sm font-normal text-red-600">* Required</span>
                                )}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fields.map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            {field.label}
                                            {field.required && <span className="text-red-600">*</span>}
                                        </Label>
                                        {field.description && (
                                            <p className="text-xs text-gray-500">{field.description}</p>
                                        )}

                                        {documents[field.key] ? (
                                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <FiCheckCircle className="text-green-600 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-green-800 truncate">
                                                        Document uploaded
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(field.key)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        accept="image/*,.pdf"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleFileUpload(field.key, file);
                                                        }}
                                                        disabled={uploading === field.key}
                                                        className="hidden"
                                                        id={field.key}
                                                    />
                                                    <label
                                                        htmlFor={field.key}
                                                        className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${errors[field.key]
                                                            ? 'border-red-300 bg-red-50'
                                                            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                                            }`}
                                                    >
                                                        {uploading === field.key ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                                <span className="text-sm text-blue-600">Uploading...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiUpload className="w-4 h-4 text-gray-600" />
                                                                <span className="text-sm text-gray-600">
                                                                    Click to upload
                                                                </span>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                                {errors[field.key] && (
                                                    <div className="flex items-center gap-1 text-red-600 text-xs">
                                                        <FiAlertCircle className="w-3 h-3" />
                                                        <span>{errors[field.key]}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-4">
                <Button
                    onClick={handleSubmit}
                    disabled={progress < 100}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                    Continue to Agreement
                </Button>
            </div>

            {/* Info Box */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-semibold mb-1">Important Notes:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-800">
                                <li>All documents must be clear and readable</li>
                                <li>Accepted formats: JPG, PNG, PDF (Max 5MB per file)</li>
                                <li>Documents will be verified within 2-3 business days</li>
                                <li>Ensure all information matches across documents</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
