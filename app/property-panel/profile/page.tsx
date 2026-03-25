"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, ArrowLeft, LogOut, Building2, Lock } from "lucide-react";

export default function PropertyPanelProfile() {
    const { data: session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || "",
                email: session.user.email || "",
                phone: (session.user as any).phone || "",
            });
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/property-panel/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage("Profile updated successfully!");
            } else {
                const data = await res.json();
                setMessage(data.error || "Failed to update profile");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/partner/login" });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/property-panel/dashboard")}
                    className="rounded-full"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your basic account information</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <div className="w-20 h-20 bg-[#1E3A8A] rounded-full mx-auto flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-white">
                                    {session?.user?.name?.substring(0, 2).toUpperCase() || "PP"}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg">{session?.user?.name || "Partner"}</h3>
                            <p className="text-sm text-gray-600 mt-1">{session?.user?.email}</p>
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                <Building2 className="w-3 h-3" />
                                Property Partner
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button
                                onClick={() => router.push("/property-panel/dashboard")}
                                className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                <Building2 className="w-4 h-4" />
                                My Properties
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Update your contact details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {message && (
                                    <div
                                        className={`p-3 rounded-lg text-sm ${
                                            message.includes("success")
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                        }`}
                                    >
                                        {message}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User className="w-4 h-4 inline mr-2" />
                                            Full Name
                                        </label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 inline mr-2" />
                                            Email Address
                                        </label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="bg-gray-50 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            Phone Number
                                        </label>
                                        <Input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => router.push("/property-panel/dashboard")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="bg-[#1E3A8A] hover:bg-[#1e40af]"
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Security Card - Simple version */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                Security
                            </CardTitle>
                            <CardDescription>
                                Manage your account security settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                To change your password, please contact support or use the forgot password option on the login page.
                            </p>
                            <Button 
                                variant="outline" 
                                onClick={() => router.push("/partner/login")}
                                className="w-full sm:w-auto"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
