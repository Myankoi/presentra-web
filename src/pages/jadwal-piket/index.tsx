import { useEffect, useState, useCallback, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { jadwalPiketService } from '@/services/jadwal';
import { penggunaService } from '@/services/pengguna';
import type { JadwalPiket, User, Hari } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

const HARI_LIST: Hari[] = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];

const DAY_COLORS = [
    'from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800',
    'from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-800',
    'from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-800',
    'from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-800',
    'from-purple-500/10 to-purple-500/5 border-purple-200 dark:border-purple-800',
];

const CARD_COLORS = [
    { bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-800 dark:text-emerald-200' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-800 dark:text-amber-200' },
    { bg: 'bg-rose-100 dark:bg-rose-900/40', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-800 dark:text-rose-200' },
    { bg: 'bg-purple-100 dark:bg-purple-900/40', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-800 dark:text-purple-200' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/40', border: 'border-cyan-300 dark:border-cyan-700', text: 'text-cyan-800 dark:text-cyan-200' },
    { bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-800 dark:text-orange-200' },
    { bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-800 dark:text-pink-200' },
    { bg: 'bg-teal-100 dark:bg-teal-900/40', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-800 dark:text-teal-200' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-indigo-300 dark:border-indigo-700', text: 'text-indigo-800 dark:text-indigo-200' },
];

interface PiketFlat {
    id: number;
    guruId: number;
    namaGuru: string;
    hari: string;
    keterangan: string | null;
}

export default function JadwalPiketPage() {
    const [piketList, setPiketList] = useState<PiketFlat[]>([]);
    const [guruList, setGuruList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedPiket, setSelectedPiket] = useState<PiketFlat | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formGuruId, setFormGuruId] = useState('');
    const [formHari, setFormHari] = useState<string>('senin');
    const [formKeterangan, setFormKeterangan] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [piketRes, guruRes] = await Promise.all([
                jadwalPiketService.getAll(),
                penggunaService.getAll(),
            ]);
            const rawPiket: JadwalPiket[] = piketRes.data.data || [];
            setPiketList(rawPiket.map(p => ({
                id: p.id,
                guruId: p.guruId,
                namaGuru: p.guru?.nama ?? '',
                hari: p.hari,
                keterangan: p.keterangan ?? null,
            })));
            setGuruList((guruRes.data.data || []).filter((u: User) => u.role === 'guru'));
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Group piket by hari
    const piketByDay = useMemo(() => {
        const map = new Map<string, PiketFlat[]>();
        HARI_LIST.forEach(h => map.set(h, []));
        piketList.forEach(p => {
            const list = map.get(p.hari);
            if (list) list.push(p);
        });
        return map;
    }, [piketList]);

    const handleSubmit = async () => {
        if (!formGuruId || !formHari) {
            toast.error('Guru dan hari harus diisi');
            return;
        }
        setSubmitting(true);
        try {
            await jadwalPiketService.create({
                guruId: Number(formGuruId),
                hari: formHari,
                keterangan: formKeterangan || undefined,
            });
            toast.success('Jadwal piket berhasil ditambahkan');
            setDialogOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menyimpan jadwal piket');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPiket) return;
        setSubmitting(true);
        try {
            await jadwalPiketService.delete(selectedPiket.id);
            toast.success('Jadwal piket berhasil dihapus');
            setDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus jadwal piket');
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateForDay = (hari: string) => {
        setFormHari(hari);
        setFormGuruId('');
        setFormKeterangan('');
        setDialogOpen(true);
    };

    return (
        <PageContainer
            title="Jadwal Piket"
            description="Kelola jadwal piket guru per hari"
            action={
                <Button size="sm" onClick={() => { setFormHari('senin'); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Piket
                </Button>
            }
        >
            {/* Day Column Grid */}
            {loading ? (
                <div className="grid grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {HARI_LIST.map((hari, dayIdx) => {
                        const entries = piketByDay.get(hari) || [];
                        return (
                            <div
                                key={hari}
                                className={`rounded-xl border bg-gradient-to-b ${DAY_COLORS[dayIdx]} overflow-hidden`}
                            >
                                {/* Day header */}
                                <div className="px-4 py-3 border-b bg-background/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold capitalize text-sm">{hari}</h3>
                                        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                            {entries.length} guru
                                        </span>
                                    </div>
                                </div>

                                {/* Guru cards */}
                                <div className="p-2 space-y-2 min-h-[120px]">
                                    {entries.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50">
                                            <UserCircle className="h-8 w-8 mb-1" />
                                            <p className="text-xs">Belum ada</p>
                                        </div>
                                    ) : (
                                        entries.map((p, idx) => {
                                            const color = CARD_COLORS[p.guruId % CARD_COLORS.length];
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => { setSelectedPiket(p); setDeleteOpen(true); }}
                                                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer ${color.bg} ${color.border}`}
                                                >
                                                    <div className={`text-sm font-semibold ${color.text}`}>
                                                        {p.namaGuru}
                                                    </div>
                                                    {p.keterangan && (
                                                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                                            {p.keterangan}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}

                                    {/* Add button */}
                                    <button
                                        onClick={() => openCreateForDay(hari)}
                                        className="w-full rounded-lg border border-dashed border-muted-foreground/20 px-3 py-2 text-center text-xs text-muted-foreground/40 hover:text-muted-foreground/70 hover:border-muted-foreground/40 hover:bg-background/50 transition-all cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5 mx-auto mb-0.5" />
                                        Tambah
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Jadwal Piket</DialogTitle>
                        <DialogDescription>Atur jadwal piket guru</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Hari</Label>
                            <Select value={formHari} onValueChange={setFormHari}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {HARI_LIST.map(h => (
                                        <SelectItem key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Guru</Label>
                            <Select value={formGuruId} onValueChange={setFormGuruId}>
                                <SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                                <SelectContent>
                                    {guruList.map(g => (
                                        <SelectItem key={g.id} value={String(g.id)}>{g.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Keterangan (opsional)</Label>
                            <Input
                                value={formKeterangan}
                                onChange={e => setFormKeterangan(e.target.value)}
                                placeholder="Keterangan tambahan"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Batal</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tambah
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Jadwal Piket</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus piket {selectedPiket?.namaGuru} di hari <span className="capitalize">{selectedPiket?.hari}</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
