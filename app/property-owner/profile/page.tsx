"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Lock,
    Shield,
    ChevronRight,
    LogOut,
    Wallet,
    Settings,
    Building2,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
    name: z.string().min(2, "Name is required"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    companyName: z.string().optional(),
    gstin: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PropertyOwnerProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "business">("profile");

    const user = session?.user;
    const userName = user?.name || "Property Owner";
    const userEmail = user?.email || "";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: userName,
            firstName: (user as any)?.firstName || "",
            lastName: (user as any)?.lastName || "",
            email: userEmail,
            phone: (user as any)?.phone || "",
            address: (user as any)?.address || "",
            city: (user as any)?.city || "",
            state: (user as any)?.state || "",
            pincode: (user as any)?.pincode || "",
            companyName: (user as any)?.companyName || "",
            gstin: (user as any)?.gstin || "",
        },
    });

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user) {
            const userRole = (session.user as any).role;
            if (userRole === "user") {
                router.push("/profile");
            } else if (userRole === "admin") {
                router.push("/admin/dashboard");
            } else if (userRole === "hotelOwner") {
                router.push("/property-panel/dashboard");
            }
        }
    }, [status, session, router]);

    if (status === "loading") {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!session?.user) {
        return null;
    }

    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/property-owner/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert("Profile updated successfully");
                setIsEditing(false);
                router.refresh(); // Refresh to update session data if needed
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            alert("An error occurred while updating profile");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Personal Info", icon: User },
        { id: "business", label: "Business Details", icon: Building2 },
        { id: "security", label: "Login & Security", icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your profile and business details</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Navigation Panel */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* User Mini Profile */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                            <div className="relative mb-4 group cursor-pointer">
                                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-50">
                                    <Image
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1E3A8A&color=fff&size=200`}
                                        alt={userName}
                                        width={96}
                                        height={96}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {userName}
                            </h2>
                            <p className="text-sm text-gray-500 mb-2">{userEmail}</p>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                <Building2 className="w-3 h-3" />
                                Property Owner
                            </span>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <nav className="flex flex-col">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                        className={`flex items-center gap-3 px-6 py-4 text-left transition-all border-l-4 ${activeTab === tab.id
                                            ? "bg-blue-50 border-blue-600 text-blue-700"
                                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-blue-600" : "text-gray-400"}`} />
                                        <span className="font-medium text-sm">{tab.label}</span>
                                        {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
                                    </button>
                                ))}
                                <div className="border-t border-gray-100 my-1"></div>
                                <Link
                                    href="/property-owner/dashboard"
                                    className="flex items-center gap-3 px-6 py-4 text-left border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    <Building2 className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium text-sm">Dashboard</span>
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-3 px-6 py-4 text-left border-l-4 border-transparent text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium text-sm">Sign Out</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-3">

                        {/* Personal Info Panel */}
                        {activeTab === "profile" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                        <p className="text-gray-500 text-sm mt-1">Update your personal details including name and contact.</p>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            className="rounded-xl border-gray-200"
                                        >
                                            Edit Details
                                        </Button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">First Name</label>
                                            <Input {...register("firstName")} disabled={!isEditing} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                                            <Input {...register("lastName")} disabled={!isEditing} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                                <Input {...register("email")} disabled={!isEditing} className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                                <Input {...register("phone")} disabled={!isEditing} className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                            <Input {...register("address")} disabled={!isEditing} className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">City</label>
                                            <Input {...register("city")} disabled={!isEditing} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">State</label>
                                            <Input {...register("state")} disabled={!isEditing} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Pincode</label>
                                            <Input {...register("pincode")} disabled={!isEditing} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditing(false)}
                                                className="h-11 px-6 rounded-xl border-gray-200 text-gray-700"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
                                            >
                                                {isSaving ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Business Details Panel */}
                        {activeTab === "business" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Business Details</h2>
                                        <p className="text-gray-500 text-sm mt-1">Your business information for tax and payment purposes.</p>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            className="rounded-xl border-gray-200"
                                        >
                                            Edit Details
                                        </Button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Company / Business Name</label>
                                        <Input {...register("companyName")} disabled={!isEditing} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" placeholder="Your Business Name" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">GSTIN (Optional)</label>
                                        <Input {...register("gstin")} disabled={!isEditing} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" placeholder="27XXXXX1234X1ZX" />
                                        <p className="text-xs text-gray-500">Provide your GST number for tax invoices</p>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditing(false)}
                                                className="h-11 px-6 rounded-xl border-gray-200 text-gray-700"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
                                            >
                                                {isSaving ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Security Panel */}
                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Login & Security</h2>

                                    <div className="space-y-8">
                                        <div className="pb-8 border-b border-gray-100">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <p className="font-semibold text-gray-900">Password</p>
                                                    <p className="text-sm text-gray-500">Update your account password</p>
                                                </div>
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>

                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    const target = e.target as typeof e.target & {
                                                        currentPassword: { value: string };
                                                        newPassword: { value: string };
                                                        confirmPassword: { value: string };
                                                    };
                                                    const currentPassword = target.currentPassword.value;
                                                    const newPassword = target.newPassword.value;
                                                    const confirmPassword = target.confirmPassword.value;

                                                    if (newPassword !== confirmPassword) {
                                                        alert("Passwords do not match");
                                                        return;
                                                    }

                                                    if (newPassword.length < 6) {
                                                        alert("Password must be at least 6 characters");
                                                        return;
                                                    }

                                                    setIsSaving(true);
                                                    try {
                                                        const response = await fetch("/api/auth/change-password", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ currentPassword, newPassword }),
                                                        });

                                                        const data = await response.json();
                                                        if (response.ok) {
                                                            alert("Password updated successfully");
                                                            (e.target as HTMLFormElement).reset();
                                                        } else {
                                                            alert(data.error || "Failed to update password");
                                                        }
                                                    } catch (error) {
                                                        console.error("Error updating password:", error);
                                                        alert("Failed to update password");
                                                    } finally {
                                                        setIsSaving(false);
                                                    }
                                                }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                            >
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                                                    <Input
                                                        name="currentPassword"
                                                        type="password"
                                                        required
                                                        placeholder="••••••••"
                                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">New Password</label>
                                                    <Input
                                                        name="newPassword"
                                                        type="password"
                                                        required
                                                        placeholder="Min. 6 characters"
                                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                                    <Input
                                                        name="confirmPassword"
                                                        type="password"
                                                        required
                                                        placeholder="Repeat new password"
                                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 pt-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={isSaving}
                                                        className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
                                                    >
                                                        {isSaving ? "Updating..." : "Update Password"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="max-w-md">
                                                <p className="font-semibold text-gray-900">Social Accounts</p>
                                                <p className="text-sm text-gray-500 mt-0.5">Manage your connected social accounts</p>
                                            </div>
                                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 px-4 rounded-xl">Manage</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
