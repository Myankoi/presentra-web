import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    School,
    GraduationCap,
    BookOpen,
    Calendar,
    ShieldCheck,
    FileBarChart,
    AlertTriangle,
    Bell,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const menuItems = [
    {
        section: 'Utama',
        items: [
            { label: 'Dashboard', href: '/', icon: LayoutDashboard },
        ],
    },
    {
        section: 'Data Master',
        items: [
            { label: 'Pengguna', href: '/pengguna', icon: Users },
            { label: 'Kelas', href: '/kelas', icon: School },
            { label: 'Siswa', href: '/siswa', icon: GraduationCap },
            { label: 'Mata Pelajaran', href: '/mapel', icon: BookOpen },
        ],
    },
    {
        section: 'Jadwal',
        items: [
            { label: 'Jadwal Mengajar', href: '/jadwal-mengajar', icon: Calendar },
            { label: 'Jadwal Piket', href: '/jadwal-piket', icon: ShieldCheck },
        ],
    },
    {
        section: 'Monitoring',
        items: [
            { label: 'Laporan', href: '/laporan', icon: FileBarChart },
            { label: 'BK', href: '/bk', icon: AlertTriangle },
            { label: 'Notifikasi', href: '/notifikasi', icon: Bell },
        ],
    },
];

export function Sidebar({ open, onClose }: SidebarProps) {
    const { user } = useAuth();
    const location = useLocation();

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                            P
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">
                                Presentra
                            </h1>
                            <p className="text-[10px] text-muted-foreground leading-none">
                                Admin Dashboard
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-8 w-8"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 px-3 py-4">
                    <nav className="space-y-6">
                        {menuItems.map((section) => (
                            <div key={section.section}>
                                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {section.section}
                                </p>
                                <div className="space-y-0.5">
                                    {section.items.map((item) => {
                                        const isActive =
                                            item.href === '/'
                                                ? location.pathname === '/'
                                                : location.pathname.startsWith(item.href);

                                        return (
                                            <NavLink
                                                key={item.href}
                                                to={item.href}
                                                onClick={onClose}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                                                    isActive
                                                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                                )}
                                            >
                                                <item.icon className="h-4 w-4 shrink-0" />
                                                {item.label}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </ScrollArea>

                {/* Bottom user info */}
                <Separator />
                <div className="p-4">
                    <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase">
                            {user?.nama?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">
                                {user?.nama || 'User'}
                            </p>
                            <p className="text-[11px] text-muted-foreground capitalize">
                                {user?.role || 'admin'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
