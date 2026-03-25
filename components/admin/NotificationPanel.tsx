"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MdNotifications,
    MdClose,
    MdUpdate,
    MdLock,
    MdHotel,
    MdPerson,
    MdDoneAll
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    _id: string;
    type: 'PROFILE_UPDATE' | 'PASSWORD_CHANGE' | 'HOTEL_UPDATE' | 'NEW_BOOKING' | 'SYSTEM';
    title: string;
    message: string;
    userName: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/notifications');
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id?: string) => {
        try {
            const body = id ? { id } : { markAllAsRead: true };
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                body: JSON.stringify(body)
            });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'PROFILE_UPDATE': return <MdUpdate className="text-blue-500" />;
            case 'PASSWORD_CHANGE': return <MdLock className="text-orange-500" />;
            case 'HOTEL_UPDATE': return <MdHotel className="text-green-500" />;
            case 'NEW_BOOKING': return <MdPerson className="text-purple-500" />;
            default: return <MdNotifications className="text-gray-500" />;
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Toggle notifications"
            >
                <MdNotifications className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 z-[60]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b flex items-center justify-between bg-[#1E3A8A] text-white">
                                <div className="flex items-center gap-2">
                                    <MdNotifications className="h-6 w-6" />
                                    <h2 className="text-lg font-black uppercase tracking-widest">Activity Logs</h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <MdClose className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {unreadCount} New Alerts
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-8 text-[#1E3A8A] font-bold"
                                    onClick={() => markAsRead()}
                                >
                                    <MdDoneAll className="mr-1 h-4 w-4" />
                                    Mark all read
                                </Button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                        <MdNotifications className="h-12 w-12 mb-4 opacity-20" />
                                        <p className="font-medium">No activity recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className={cn(
                                                    "p-4 hover:bg-gray-50 transition-colors group cursor-pointer",
                                                    !n.isRead && "bg-blue-50/50"
                                                )}
                                                onClick={() => markAsRead(n._id)}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="mt-1 h-10 w-10 shrink-0 rounded-xl bg-white border flex items-center justify-center shadow-sm">
                                                        {getIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-sm font-black text-gray-900 truncate">
                                                                {n.title}
                                                            </p>
                                                            <span className="text-[10px] font-bold text-gray-400">
                                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                                            {n.message}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] h-5 py-0 px-2 font-bold uppercase tracking-tight">
                                                                {n.userName}
                                                            </Badge>
                                                            {!n.isRead && (
                                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t bg-gray-50">
                                <Button className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold h-10">
                                    View All Logs
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
