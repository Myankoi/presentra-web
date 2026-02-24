import { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { notificationService } from '@/services/notification';
import type { Notification } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotifikasiPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await notificationService.getAll();
            setNotifications(res.data.data || []);
        } catch {
            toast.error('Gagal memuat notifikasi');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const markAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch {
            toast.error('Gagal menandai notifikasi');
        }
    };

    const unread = notifications.filter((n) => !n.isRead).length;

    return (
        <PageContainer
            title="Notifikasi"
            description={`${unread} notifikasi belum dibaca`}
        >
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Bell className="h-12 w-12 opacity-30" />
                    <p>Tidak ada notifikasi</p>
                </div>
            ) : (
                <div className="space-y-2 max-w-2xl">
                    {notifications.map((n) => (
                        <Card
                            key={n.id}
                            className={`transition-all ${!n.isRead ? 'border-primary/30 bg-primary/5' : 'opacity-75'}`}
                        >
                            <CardContent className="flex items-start gap-4 py-4">
                                <div className="mt-0.5">
                                    {!n.isRead ? (
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-primary" />
                                    ) : (
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-muted" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-semibold">{n.judul}</h3>
                                        {!n.isRead && <Badge variant="secondary" className="text-[10px]">Baru</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{n.pesan}</p>
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        {new Date(n.createdAt).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="shrink-0">
                                        <Check className="h-4 w-4 mr-1" />
                                        Tandai dibaca
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
