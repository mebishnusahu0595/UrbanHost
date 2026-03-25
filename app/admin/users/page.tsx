"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdPeople, MdSearch, MdFilterList, MdEdit, MdDelete } from "react-icons/md";

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user && (session.user as any).role !== "admin") {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/admin/users");
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data.users);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchUsers();
        }
    }, [session]);

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setUsers(users.filter((u) => u._id !== id));
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Delete user error:", error);
            alert("Something went wrong while deleting the user.");
        }
    };

    const handleEditRole = async (user: User) => {
        const newRole = prompt(`Update role for ${user.name} (user, propertyOwner, receptionist, admin):`, user.role);
        if (!newRole || newRole === user.role) return;

        if (!["user", "propertyOwner", "receptionist", "admin"].includes(newRole)) {
            alert("Invalid role. Please use: user, propertyOwner, receptionist, or admin");
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${user._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                setUsers(users.map(u => u._id === user._id ? { ...u, role: newRole } : u));
            } else {
                const data = await response.json();
                alert(data.error || "Failed to update role");
            }
        } catch (error) {
            console.error("Update role error:", error);
            alert("Something went wrong while updating the user role.");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === "all" || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-red-100 text-red-800",
            propertyOwner: "bg-blue-100 text-blue-800",
            receptionist: "bg-purple-100 text-purple-800",
            user: "bg-green-100 text-green-800",
        };
        return colors[role] || "bg-gray-100 text-gray-800";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-4xl font-bold">User Management</h1>
                <p className="text-xs md:text-lg text-muted-foreground mt-1">
                    Manage all users and property owners
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                <Card>
                    <CardContent className="p-3 md:p-6">
                        <p className="text-[10px] md:text-sm text-muted-foreground">Users</p>
                        <div className="text-lg md:text-3xl font-bold">
                            {users.filter(u => u.role === "user").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 md:p-6">
                        <p className="text-[10px] md:text-sm text-muted-foreground">Owners</p>
                        <div className="text-lg md:text-3xl font-bold">
                            {users.filter(u => u.role === "propertyOwner").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 md:p-6">
                        <p className="text-[10px] md:text-sm text-muted-foreground">Receptionists</p>
                        <div className="text-lg md:text-3xl font-bold">
                            {users.filter(u => u.role === "receptionist").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 md:p-6">
                        <p className="text-[10px] md:text-sm text-muted-foreground">Admins</p>
                        <div className="text-lg md:text-3xl font-bold">
                            {users.filter(u => u.role === "admin").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users List */}
            <Card>
                <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-base md:text-xl font-bold">All Users</CardTitle>
                            <CardDescription className="text-xs md:text-base mt-1">
                                {filteredUsers.length} users found
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-9 md:pl-10 w-full md:w-64 text-sm md:text-base h-9 md:h-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={filterRole} onValueChange={setFilterRole}>
                                <SelectTrigger className="w-full md:w-[160px] h-9 md:h-10 text-sm md:text-base">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="user">Users</SelectItem>
                                    <SelectItem value="propertyOwner">Property Owners</SelectItem>
                                    <SelectItem value="receptionist">Receptionists</SelectItem>
                                    <SelectItem value="admin">Admins</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No users found</p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div key={user._id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="font-bold text-blue-600 text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${getRoleBadge(user.role)} text-[10px] px-2 py-0.5`}>
                                            {user.role === "propertyOwner" ? "Owner" :
                                                user.role === "receptionist" ? "Receptionist" : user.role}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex gap-4 text-muted-foreground">
                                            <span>{user.phone || "No phone"}</span>
                                            <span>Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEditRole(user)}
                                            >
                                                <MdEdit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600"
                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                            >
                                                <MdDelete className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Phone</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Joined</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="font-bold text-blue-600">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-4 px-4 text-gray-600">{user.phone || "-"}</td>
                                            <td className="py-4 px-4">
                                                <Badge className={getRoleBadge(user.role)}>
                                                    {user.role === "propertyOwner" ? "Property Owner" :
                                                        user.role === "receptionist" ? "Receptionist" : user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditRole(user)}
                                                        title="Edit Role"
                                                    >
                                                        <MdEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 font-bold"
                                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                                        title="Delete User"
                                                    >
                                                        <MdDelete className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
