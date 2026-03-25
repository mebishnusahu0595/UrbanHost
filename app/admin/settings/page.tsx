"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

import {
    FiUser,
    FiShield,
    FiLock,
    FiHelpCircle,
    FiEdit2,
    FiKey,
} from "react-icons/fi";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        notifications: {
            dailyReports: true,
            systemAlerts: true
        }
    });

    useEffect(() => {
        if (session?.user) {
            setProfile(prev => ({
                ...prev,
                name: session.user?.name || prev.name,
                email: session.user?.email || prev.email,
            }));
        }
    }, [session]);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("Settings saved successfully!");
        }, 1000);
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-3xl font-semibold">Profile Settings</h1>
                <p className="text-xs md:text-base text-[#475569]">
                    Update your personal information and security.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* LEFT PROFILE CARD */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2c4a9c] h-20 md:h-32"></div>
                    <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5 -mt-10 md:-mt-16">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                <Image
                                    src="https://i.pravatar.cc/150"
                                    alt="Admin Avatar"
                                    width={100}
                                    height={100}
                                    className="rounded-full border-4 border-white shadow-lg w-20 h-20 md:w-[100px] md:h-[100px]"
                                />
                                <button className="absolute bottom-0 right-0 bg-[#1E3A8A] text-white p-2 rounded-full shadow-lg hover:bg-[#2c4a9c]">
                                    <FiEdit2 className="w-3 h-3 md:w-4 md:h-4" />
                                </button>
                            </div>
                            <h3 className="font-bold text-lg md:text-2xl mt-3 md:mt-4">{profile.name}</h3>
                            <p className="text-sm md:text-base text-[#1E3A8A] font-medium">
                                Administrator
                            </p>
                            <p className="text-[10px] md:text-xs text-[#64748B] mt-1">{profile.email}</p>
                        </div>

                        <Separator />

                        <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                            <div className="flex justify-between items-center">
                                <span className="text-[#1E3A8A] font-medium">Status</span>
                                <Badge className="bg-green-100 text-green-700 border-0 text-xs md:text-sm">● Active</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#1E3A8A] font-medium">Workstation</span>
                                <span className="font-semibold text-gray-900 text-xs md:text-sm">
                                    LDN-882-AT
                                </span>
                            </div>
                        </div>

                        <Separator />

                    </CardContent>
                </Card>

                {/* RIGHT CONTENT */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* SECURITY SETTINGS */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-3 border-b">
                            <h2 className="text-base md:text-xl font-bold text-[#1E3A8A]">Account Security</h2>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-4 md:pt-6">
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

                                    setLoading(true);
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
                                        setLoading(false);
                                    }
                                }}
                                className="space-y-4 md:space-y-6"
                            >
                                <div className="space-y-2 text-sm md:text-base">
                                    <label className="font-medium block">Current Password</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                                        <Input
                                            name="currentPassword"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 text-sm md:text-base">
                                        <label className="font-medium block">New Password</label>
                                        <div className="relative">
                                            <FiKey className="absolute left-3 top-3.5 text-gray-400" />
                                            <Input
                                                name="newPassword"
                                                type="password"
                                                required
                                                placeholder="Min. 6 characters"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm md:text-base">
                                        <label className="font-medium block">Confirm New Password</label>
                                        <div className="relative">
                                            <FiKey className="absolute left-3 top-3.5 text-gray-400" />
                                            <Input
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                placeholder="Repeat new password"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="text-xs md:text-base px-6 md:px-8 bg-[#1E3A8A] hover:bg-[#2c4a9c]"
                                    >
                                        {loading ? "Updating..." : "Update Password"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    {/* PROFILE DETAILS */}
                    <Card>
                        <CardHeader className="p-4 md:p-6 pb-3 border-b">
                            <h2 className="text-base md:text-xl font-bold text-[#1E3A8A]">Profile Details</h2>
                        </CardHeader>

                        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-4 md:pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 block">Full Name</label>
                                    <Input
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 block">Email Address</label>
                                    <Input
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 block">Phone Number</label>
                                    <Input
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 block">Employee ID</label>
                                    <Input
                                        defaultValue="UH-2022-819"
                                        disabled
                                        className="text-sm md:text-base bg-gray-50"
                                    />
                                    <p className="text-[10px] md:text-xs text-[#38BDF8] mt-1">
                                        ⓘ Cannot be modified
                                    </p>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="space-y-3 md:space-y-4">
                                <p className="font-semibold text-[10px] md:text-sm uppercase tracking-wide">
                                    COMMUNICATION PREFERENCES
                                </p>

                                <label className="flex items-start gap-2 md:gap-3 text-xs md:text-sm cursor-pointer">
                                    <Checkbox
                                        checked={profile.notifications.dailyReports}
                                        onCheckedChange={(checked) => setProfile({
                                            ...profile,
                                            notifications: { ...profile.notifications, dailyReports: checked === true }
                                        })}
                                        className="mt-0.5 data-[state=checked]:bg-[#1E3A8A] data-[state=checked]:border-[#1E3A8A]"
                                    />
                                    <div>
                                        <p className="font-medium">Daily Summary Reports</p>
                                        <p className="text-[10px] md:text-xs text-muted-foreground">
                                            Receive daily bookings and revenue recap.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-2 md:gap-3 text-xs md:text-sm cursor-pointer">
                                    <Checkbox
                                        checked={profile.notifications.systemAlerts}
                                        onCheckedChange={(checked) => setProfile({
                                            ...profile,
                                            notifications: { ...profile.notifications, systemAlerts: checked === true }
                                        })}
                                        className="mt-0.5 data-[state=checked]:bg-[#1E3A8A] data-[state=checked]:border-[#1E3A8A]"
                                    />
                                    <div>
                                        <p className="font-medium">System Health Alerts</p>
                                        <p className="text-[10px] md:text-xs text-muted-foreground">
                                            Server status and platform notifications.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end md:gap-3 pt-4">
                                <Button variant="outline" className="text-xs md:text-base px-4 md:px-6" size="sm">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="text-xs md:text-base px-4 md:px-6 bg-[#F87171] hover:bg-[#ef5350]"
                                    size="sm"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
