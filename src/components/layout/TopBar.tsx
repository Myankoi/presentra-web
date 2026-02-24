import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notification';
import type { Notification } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Menu, LogOut, User } from 'lucide-react';

interface TopBarProps {
    onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await notificationService.getAll();
            setNotifications(res.data.data || []);
        } catch {
            // silent fail
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 lg:px-6">
            {/* Left: hamburger */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right: notifications + user menu */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            Notifikasi
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="text-[10px]">
                                    {unreadCount} baru
                                </Badge>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Tidak ada notifikasi
                            </div>
                        ) : (
                            notifications.slice(0, 5).map((n) => (
                                <DropdownMenuItem
                                    key={n.id}
                                    className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                                    onClick={() => navigate('/notifikasi')}
                                >
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        {!n.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                                        )}
                                        {n.judul}
                                    </span>
                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                        {n.pesan}
                                    </span>
                                </DropdownMenuItem>
                            ))
                        )}
                        {notifications.length > 5 && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-center text-sm text-primary justify-center"
                                    onClick={() => navigate('/notifikasi')}
                                >
                                    Lihat semua notifikasi
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase">
                                {user?.nama?.charAt(0) || 'U'}
                            </div>
                            <span className="hidden text-sm font-medium sm:inline-block">
                                {user?.nama || 'User'}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="font-normal">
                            <p className="text-sm font-medium">{user?.nama}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                            <User className="h-4 w-4" />
                            Profil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                            Keluar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
