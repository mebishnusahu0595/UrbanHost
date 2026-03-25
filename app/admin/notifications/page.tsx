"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MdNotifications, MdCheck, MdCalendarToday, MdFilterList, MdHotel, MdClose } from "react-icons/md";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface ChangeDetail {
    field: string;
    oldValue: any;
    newValue: any;
}

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    userName: string;
    userRole: string;
    hotelName?: string;
    hotelId?: string;
    changeDetails?: ChangeDetail[];
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    // Filters
    const [timeFilter, setTimeFilter] = useState<string>("all");
    const [hotelFilter, setHotelFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
    const [searchQuery, setSearchQuery] = useState("");

    // Unique hotels for filter
    const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [notifications, timeFilter, hotelFilter, dateRange, searchQuery]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);

                // Extract unique hotels
                const uniqueHotels = data.notifications
                    .filter((n: Notification) => n.hotelName && n.hotelId)
                    .reduce((acc: any[], n: Notification) => {
                        if (!acc.find(h => h.id === n.hotelId)) {
                            acc.push({ id: n.hotelId!, name: n.hotelName! });
                        }
                        return acc;
                    }, []);
                setHotels(uniqueHotels);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...notifications];

        // Time filter
        if (timeFilter !== "all") {
            const now = new Date();
            let startDate: Date;

            switch (timeFilter) {
                case "recent":
                    startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                    break;
                case "1day":
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case "1week":
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case "1month":
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case "1year":
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }

            filtered = filtered.filter(n => new Date(n.createdAt) >= startDate);
        }

        // Date range filter
        if (dateRange.from) {
            filtered = filtered.filter(n => new Date(n.createdAt) >= dateRange.from!);
        }
        if (dateRange.to) {
            const endOfDay = new Date(dateRange.to);
            endOfDay.setHours(23, 59, 59, 999);
            filtered = filtered.filter(n => new Date(n.createdAt) <= endOfDay);
        }

        // Hotel filter
        if (hotelFilter !== "all") {
            filtered = filtered.filter(n => n.hotelId === hotelFilter);
        }

        // Search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.message.toLowerCase().includes(query) ||
                n.userName.toLowerCase().includes(query) ||
                n.hotelName?.toLowerCase().includes(query)
            );
        }

        setFilteredNotifications(filtered);
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true })
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'HOTEL_UPDATE':
                return <MdHotel className="h-5 w-5 text-blue-600" />;
            case 'PASSWORD_CHANGE':
                return <MdNotifications className="h-5 w-5 text-orange-600" />;
            case 'PROFILE_UPDATE':
                return <MdNotifications className="h-5 w-5 text-green-600" />;
            default:
                return <MdNotifications className="h-5 w-5 text-gray-600" />;
        }
    };

    const formatFieldName = (field: string) => {
        return field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return 'None';
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return value.length > 0 ? value.join(', ') : 'Empty';
            }
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white">
                                {unreadCount} new
                            </Badge>
                        )}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Stay updated with property changes and system activities
                    </p>
                </div>
                <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    className="gap-2"
                    disabled={unreadCount === 0}
                >
                    <MdCheck className="h-4 w-4" />
                    Mark all as read
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MdFilterList className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Time Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Time Period</label>
                            <Select value={timeFilter} onValueChange={setTimeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="recent">Recent (3 days)</SelectItem>
                                    <SelectItem value="1day">Last 24 Hours</SelectItem>
                                    <SelectItem value="1week">Last Week</SelectItem>
                                    <SelectItem value="1month">Last Month</SelectItem>
                                    <SelectItem value="1year">Last Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Hotel Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Hotel</label>
                            <Select value={hotelFilter} onValueChange={setHotelFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All hotels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Hotels</SelectItem>
                                    {hotels.map(hotel => (
                                        <SelectItem key={hotel.id} value={hotel.id}>
                                            {hotel.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">From Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <MdCalendarToday className="mr-2 h-4 w-4" />
                                        {dateRange.from ? format(dateRange.from, "PPP") : "Pick date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange.from}
                                        onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">To Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <MdCalendarToday className="mr-2 h-4 w-4" />
                                        {dateRange.to ? format(dateRange.to, "PPP") : "Pick date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange.to}
                                        onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Search */}
                    <div>
                        <Input
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-md"
                        />
                    </div>

                    {/* Clear Filters */}
                    {(timeFilter !== "all" || hotelFilter !== "all" || dateRange.from || dateRange.to || searchQuery) && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setTimeFilter("all");
                                setHotelFilter("all");
                                setDateRange({});
                                setSearchQuery("");
                            }}
                            className="gap-2"
                        >
                            <MdClose className="h-4 w-4" />
                            Clear All Filters
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
                <CardContent className="p-0">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <MdNotifications className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No notifications found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedNotification(notification);
                                        if (!notification.isRead) {
                                            markAsRead(notification._id);
                                        }
                                    }}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {notification.title}
                                                        {!notification.isRead && (
                                                            <Badge className="ml-2 bg-blue-500 text-white text-xs">New</Badge>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                    {notification.hotelName && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <MdHotel className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm text-gray-700 font-medium">
                                                                {notification.hotelName}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                        <span>{notification.userName} ({notification.userRole})</span>
                                                        <span>•</span>
                                                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Detail Dialog */}
            <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    {selectedNotification && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    {getNotificationIcon(selectedNotification.type)}
                                    {selectedNotification.title}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Details</h4>
                                    <p className="text-sm text-gray-600">{selectedNotification.message}</p>
                                </div>

                                {selectedNotification.hotelName && (
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <MdHotel className="h-5 w-5" />
                                            Hotel
                                        </h4>
                                        <p className="text-sm">{selectedNotification.hotelName}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Updated By</p>
                                        <p className="font-medium">{selectedNotification.userName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Role</p>
                                        <p className="font-medium">{selectedNotification.userRole}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Date & Time</p>
                                        <p className="font-medium">
                                            {new Date(selectedNotification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Type</p>
                                        <p className="font-medium">{selectedNotification.type.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>

                                {selectedNotification.changeDetails && selectedNotification.changeDetails.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Changes Made</h4>
                                        <div className="space-y-3">
                                            {selectedNotification.changeDetails.map((change, idx) => (
                                                <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                                                    <h5 className="font-medium text-sm mb-2">
                                                        {formatFieldName(change.field)}
                                                    </h5>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <p className="text-gray-600 mb-1">Old Value</p>
                                                            <div className="bg-red-50 p-2 rounded border border-red-200">
                                                                <pre className="whitespace-pre-wrap break-all">
                                                                    {formatValue(change.oldValue)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 mb-1">New Value</p>
                                                            <div className="bg-green-50 p-2 rounded border border-green-200">
                                                                <pre className="whitespace-pre-wrap break-all">
                                                                    {formatValue(change.newValue)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
