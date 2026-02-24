import { useEffect, useState, useCallback, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { jadwalMengajarService } from '@/services/jadwal';
import { penggunaService } from '@/services/pengguna';
import { kelasService } from '@/services/kelas';
import { mapelService } from '@/services/mapel';
import type { User, Kelas, Mapel, Hari } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ============ FIXED SCHEDULE CONFIG ============

const HARI_LIST: Hari[] = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];

interface TimeSlot {
    jp: number;         // jam pelajaran number
    mulai: string;      // "07:15"
    selesai: string;    // "08:00"
}

interface BreakSlot {
    type: 'break';
    label: string;
    mulai: string;
    selesai: string;
}

type ScheduleRow = (TimeSlot & { type: 'jp' }) | BreakSlot;

// The fixed school schedule
const SCHEDULE: ScheduleRow[] = [
    { type: 'jp', jp: 1, mulai: '06:30', selesai: '07:15' },
    { type: 'jp', jp: 2, mulai: '07:15', selesai: '08:00' },
    { type: 'jp', jp: 3, mulai: '08:00', selesai: '08:45' },
    { type: 'jp', jp: 4, mulai: '08:45', selesai: '09:30' },
    { type: 'break', label: 'Istirahat 1', mulai: '09:30', selesai: '09:40' },
    { type: 'jp', jp: 5, mulai: '09:40', selesai: '10:25' },
    { type: 'jp', jp: 6, mulai: '10:25', selesai: '11:10' },
    { type: 'jp', jp: 7, mulai: '11:10', selesai: '11:55' },
    { type: 'break', label: 'Istirahat 2', mulai: '11:55', selesai: '12:45' },
    { type: 'jp', jp: 8, mulai: '12:45', selesai: '13:30' },
    { type: 'jp', jp: 9, mulai: '13:30', selesai: '14:15' },
    { type: 'jp', jp: 10, mulai: '14:15', selesai: '15:00' },
];

const JP_SLOTS = SCHEDULE.filter((s): s is TimeSlot & { type: 'jp' } => s.type === 'jp');

// Get time range for a span of JP numbers
function getTimeRange(jpStart: number, jpEnd: number) {
    const start = JP_SLOTS.find(s => s.jp === jpStart);
    const end = JP_SLOTS.find(s => s.jp === jpEnd);
    return { mulai: start?.mulai || '', selesai: end?.selesai || '' };
}

// 15 distinct colors for guru blocks
const GURU_COLORS = [
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
    { bg: 'bg-lime-100 dark:bg-lime-900/40', border: 'border-lime-300 dark:border-lime-700', text: 'text-lime-800 dark:text-lime-200' },
    { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40', border: 'border-fuchsia-300 dark:border-fuchsia-700', text: 'text-fuchsia-800 dark:text-fuchsia-200' },
    { bg: 'bg-sky-100 dark:bg-sky-900/40', border: 'border-sky-300 dark:border-sky-700', text: 'text-sky-800 dark:text-sky-200' },
    { bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-300 dark:border-red-700', text: 'text-red-800 dark:text-red-200' },
    { bg: 'bg-yellow-100 dark:bg-yellow-900/40', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-200' },
];

function getGuruColor(guruId: number) {
    return GURU_COLORS[guruId % GURU_COLORS.length];
}

function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
}

// ============ TYPES ============

interface JadwalFlat {
    id: number;
    guruId: number;
    namaGuru: string;
    kelasId: number;
    namaKelas: string;
    mapelId: number;
    namaMapel: string;
    hari: string;
    jamMulai: string;
    jamSelesai: string;
}

// Normalize time: "14:15:00" → "14:15", handles both "HH:mm" and "HH:mm:ss"
function normalizeTime(t: string): string {
    const parts = t.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}`;
}

// Given a jadwal entry, figure out which JP slots it covers
function getJpRange(j: JadwalFlat): { start: number; end: number } {
    const jMulai = normalizeTime(j.jamMulai);
    const jSelesai = normalizeTime(j.jamSelesai);
    const start = JP_SLOTS.find(s => s.mulai === jMulai);
    const end = JP_SLOTS.find(s => s.selesai === jSelesai);
    return {
        start: start?.jp || 1,
        end: end?.jp || (start?.jp || 1),
    };
}

export default function JadwalMengajarPage() {
    const [jadwalList, setJadwalList] = useState<JadwalFlat[]>([]);
    const [guruList, setGuruList] = useState<User[]>([]);
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [mapelList, setMapelList] = useState<Mapel[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeHari, setActiveHari] = useState<Hari>('senin');

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedJadwal, setSelectedJadwal] = useState<JadwalFlat | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [formGuruId, setFormGuruId] = useState('');
    const [formKelasId, setFormKelasId] = useState('');
    const [formMapelId, setFormMapelId] = useState('');
    const [formHari, setFormHari] = useState<string>('senin');
    const [formJpStart, setFormJpStart] = useState('');
    const [formJpEnd, setFormJpEnd] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [jadwalRes, guruRes, kelasRes, mapelRes] = await Promise.all([
                jadwalMengajarService.getAll(),
                penggunaService.getAll(),
                kelasService.getAll(),
                mapelService.getAll(),
            ]);
            setJadwalList((jadwalRes.data.data || []) as JadwalFlat[]);
            setGuruList((guruRes.data.data || []).filter((u: User) => u.role === 'guru'));
            setKelasList(kelasRes.data.data || []);
            setMapelList(mapelRes.data.data || []);
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Filter jadwal by active day
    const dayJadwal = useMemo(
        () => jadwalList.filter(j => j.hari === activeHari),
        [jadwalList, activeHari]
    );

    // JP groups separated by break rows — spans must NOT cross a group boundary
    // Group 1: JP 1–4 (before Istirahat 1)
    // Group 2: JP 5–7 (before Istirahat 2)
    // Group 3: JP 8–10 (rest of day)
    const JP_GROUPS: [number, number][] = [[1, 4], [5, 7], [8, 10]];

    // For detecting first cell of a span (capped at group boundary)
    const spanStartMap = useMemo(() => {
        const map = new Map<string, { jadwal: JadwalFlat; span: number }>();
        dayJadwal.forEach(j => {
            const range = getJpRange(j);
            // Split the jadwal into segments per group
            JP_GROUPS.forEach(([groupStart, groupEnd]) => {
                const segStart = Math.max(range.start, groupStart);
                const segEnd = Math.min(range.end, groupEnd);
                if (segStart > segEnd) return; // not in this group
                const span = segEnd - segStart + 1;
                map.set(`${segStart}|${j.kelasId}`, { jadwal: j, span });
            });
        });
        return map;
    }, [dayJadwal]);

    // Sort kelas by name
    const sortedKelas = useMemo(
        () => [...kelasList].sort((a, b) => a.namaKelas.localeCompare(b.namaKelas)),
        [kelasList]
    );

    const openCreateDialog = (hari: string, kelasId?: number, jp?: number) => {
        setFormHari(hari);
        setFormKelasId(kelasId ? String(kelasId) : '');
        setFormJpStart(jp ? String(jp) : '');
        setFormJpEnd(jp ? String(jp) : '');
        setFormGuruId('');
        setFormMapelId('');
        setDialogOpen(true);
    };

    const handleCellClick = (jadwal: JadwalFlat) => {
        setSelectedJadwal(jadwal);
        setDetailOpen(true);
    };

    const handleSubmit = async () => {
        if (!formGuruId || !formKelasId || !formMapelId || !formJpStart || !formJpEnd) {
            toast.error('Semua field harus diisi');
            return;
        }
        const jpStart = Number(formJpStart);
        const jpEnd = Number(formJpEnd);
        if (jpEnd < jpStart) {
            toast.error('Jam selesai harus >= jam mulai');
            return;
        }
        const { mulai, selesai } = getTimeRange(jpStart, jpEnd);
        setSubmitting(true);
        try {
            await jadwalMengajarService.create({
                guruId: Number(formGuruId),
                kelasId: Number(formKelasId),
                mapelId: Number(formMapelId),
                hari: formHari,
                jamMulai: mulai,
                jamSelesai: selesai,
            });
            toast.success('Jadwal berhasil ditambahkan');
            setDialogOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menyimpan jadwal');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedJadwal) return;
        setSubmitting(true);
        try {
            await jadwalMengajarService.delete(selectedJadwal.id);
            toast.success('Jadwal berhasil dihapus');
            setDeleteOpen(false);
            setDetailOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus jadwal');
        } finally {
            setSubmitting(false);
        }
    };

    // Set to track which cells are "continuation" of a span (skip rendering)
    // Only skip within the SAME group — never across a break
    const skipCells = useMemo(() => {
        const set = new Set<string>();
        dayJadwal.forEach(j => {
            const range = getJpRange(j);
            JP_GROUPS.forEach(([groupStart, groupEnd]) => {
                const segStart = Math.max(range.start, groupStart);
                const segEnd = Math.min(range.end, groupEnd);
                // Skip cells after the first JP in this segment
                for (let jp = segStart + 1; jp <= segEnd; jp++) {
                    set.add(`${jp}|${j.kelasId}`);
                }
            });
        });
        return set;
    }, [dayJadwal]);

    return (
        <PageContainer
            title="Jadwal Mengajar"
            description="Kelola jadwal mengajar guru"
            action={
                <Button size="sm" onClick={() => openCreateDialog(activeHari)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Jadwal
                </Button>
            }
        >
            {/* Day Tabs */}
            <div className="flex gap-1 rounded-lg bg-muted p-1">
                {HARI_LIST.map(h => (
                    <button
                        key={h}
                        onClick={() => setActiveHari(h)}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-all ${activeHari === h
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                            }`}
                    >
                        {h}
                    </button>
                ))}
            </div>

            {/* Timetable Grid */}
            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : sortedKelas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Belum ada kelas. Tambahkan kelas terlebih dahulu.
                </div>
            ) : (
                <TooltipProvider delayDuration={200}>
                    <div className="rounded-lg border overflow-x-auto bg-background">
                        <table className="w-full border-collapse" style={{ minWidth: `${134 + sortedKelas.length * 80}px` }}>
                            {/* Header */}
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-20 bg-muted border-b border-r px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground w-[44px]">
                                        JP
                                    </th>
                                    <th className="sticky left-[44px] z-20 bg-muted border-b border-r px-2 py-2.5 text-left text-xs font-semibold text-muted-foreground w-[90px]">
                                        Jam
                                    </th>
                                    {sortedKelas.map(k => (
                                        <th
                                            key={k.id}
                                            className="border-b border-r px-1 py-2.5 text-center text-xs font-semibold text-muted-foreground bg-muted w-[80px]"
                                        >
                                            {k.namaKelas}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {SCHEDULE.map((row) => {
                                    // Break row
                                    if (row.type === 'break') {
                                        return (
                                            <tr key={row.label}>
                                                <td
                                                    colSpan={sortedKelas.length + 2}
                                                    className="bg-zinc-800 dark:bg-zinc-950 text-white text-center text-[11px] font-semibold py-1.5 border-b"
                                                >
                                                    ☕ {row.label} ({row.mulai} – {row.selesai})
                                                </td>
                                            </tr>
                                        );
                                    }

                                    // JP row
                                    const jp = row.jp;
                                    const rowBg = jp % 2 === 0 ? 'bg-muted/30' : 'bg-background';
                                    const stickyBg = jp % 2 === 0 ? 'bg-zinc-100 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-950';

                                    return (
                                        <tr key={jp} className={rowBg} style={{ height: '48px' }}>
                                            {/* JP number */}
                                            <td className={`sticky left-0 z-10 ${stickyBg} border-r border-b px-2 text-center align-middle`}>
                                                <span className="text-xs font-bold text-muted-foreground">{jp}</span>
                                            </td>
                                            {/* Time */}
                                            <td className={`sticky left-[44px] z-10 ${stickyBg} border-r border-b px-2 align-middle`}>
                                                <div className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                                                    {row.mulai} – {row.selesai}
                                                </div>
                                            </td>

                                            {/* Kelas cells */}
                                            {sortedKelas.map(k => {
                                                const cellKey = `${jp}|${k.id}`;

                                                // Check span start FIRST — explicit segment starts always win over continuation skips
                                                const spanData = spanStartMap.get(cellKey);

                                                // Skip only if this is a continuation cell AND not a new segment start
                                                if (!spanData && skipCells.has(cellKey)) return null;
                                                if (spanData) {
                                                    const { jadwal, span } = spanData;
                                                    const color = getGuruColor(jadwal.guruId);
                                                    const jpRange = getJpRange(jadwal);
                                                    return (
                                                        <td key={k.id} rowSpan={span} className="border-r border-b p-[3px] align-stretch">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => handleCellClick(jadwal)}
                                                                        className={`w-full rounded-md border-2 px-1 text-center transition-all hover:shadow-lg hover:brightness-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 ${color.bg} ${color.border} ${color.text}`}
                                                                        style={{ height: `${span * 48 - 6}px` }}
                                                                    >
                                                                        <div className="text-xs font-bold leading-tight truncate w-full">
                                                                            {getInitials(jadwal.namaGuru)}
                                                                        </div>
                                                                        {span >= 2 && (
                                                                            <div className="text-[10px] leading-tight truncate w-full opacity-75">
                                                                                {jadwal.namaMapel.length > 10
                                                                                    ? jadwal.namaMapel.slice(0, 10) + '..'
                                                                                    : jadwal.namaMapel}
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" className="max-w-[220px]">
                                                                    <div className="text-xs space-y-0.5">
                                                                        <p className="font-semibold">{jadwal.namaGuru}</p>
                                                                        <p>{jadwal.namaMapel}</p>
                                                                        <p className="text-muted-foreground">{jadwal.namaKelas} • JP {jpRange.start}{jpRange.start !== jpRange.end ? `–${jpRange.end}` : ''}</p>
                                                                        <p className="text-muted-foreground font-mono">{normalizeTime(jadwal.jamMulai)} – {normalizeTime(jadwal.jamSelesai)}</p>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </td>
                                                    );
                                                }

                                                // Empty cell — clickable to add
                                                return (
                                                    <td key={k.id} className="border-r border-b p-[3px]" style={{ height: '48px' }}>
                                                        <button
                                                            onClick={() => openCreateDialog(activeHari, k.id, jp)}
                                                            className="w-full h-full rounded-md border border-transparent hover:bg-primary/5 hover:border-dashed hover:border-primary/30 transition-all cursor-pointer group flex items-center justify-center"
                                                        >
                                                            <Plus className="h-3.5 w-3.5 text-transparent group-hover:text-muted-foreground/40 transition-all" />
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </TooltipProvider>
            )}

            {/* Guru Legend */}
            {!loading && dayJadwal.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground mr-1 self-center">Guru:</span>
                    {Array.from(new Map(dayJadwal.map(j => [j.guruId, j])).values()).map(j => {
                        const color = getGuruColor(j.guruId);
                        return (
                            <Badge
                                key={j.guruId}
                                variant="outline"
                                className={`text-[11px] ${color.bg} ${color.border} ${color.text}`}
                            >
                                {getInitials(j.namaGuru)} = {j.namaGuru}
                            </Badge>
                        );
                    })}
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Detail Jadwal</DialogTitle>
                    </DialogHeader>
                    {selectedJadwal && (() => {
                        const range = getJpRange(selectedJadwal);
                        return (
                            <div className="space-y-3 py-2">
                                <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
                                    <span className="text-muted-foreground">Guru</span>
                                    <span className="font-medium">{selectedJadwal.namaGuru}</span>
                                    <span className="text-muted-foreground">Mapel</span>
                                    <span className="font-medium">{selectedJadwal.namaMapel}</span>
                                    <span className="text-muted-foreground">Kelas</span>
                                    <span className="font-medium">{selectedJadwal.namaKelas}</span>
                                    <span className="text-muted-foreground">Hari</span>
                                    <span className="font-medium capitalize">{selectedJadwal.hari}</span>
                                    <span className="text-muted-foreground">Jam Ke</span>
                                    <span className="font-mono font-medium">{range.start === range.end ? range.start : `${range.start} – ${range.end}`}</span>
                                    <span className="text-muted-foreground">Waktu</span>
                                    <span className="font-mono font-medium">{selectedJadwal.jamMulai} – {selectedJadwal.jamSelesai}</span>
                                </div>
                            </div>
                        );
                    })()}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDetailOpen(false)}>Tutup</Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => { setDetailOpen(false); setDeleteOpen(true); }}
                        >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Jadwal</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus jadwal {selectedJadwal?.namaGuru} di {selectedJadwal?.namaKelas}?
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

            {/* Create Dialog — simplified with JP selection */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Jadwal Mengajar</DialogTitle>
                        <DialogDescription>Pilih guru, kelas, mapel, dan jam pelajaran</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Hari</Label>
                            <Select value={formHari} onValueChange={setFormHari}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {HARI_LIST.map(h => (
                                        <SelectItem key={h} value={h} className="capitalize">{h.charAt(0).toUpperCase() + h.slice(1)}</SelectItem>
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
                            <Label>Kelas</Label>
                            <Select value={formKelasId} onValueChange={setFormKelasId}>
                                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                                <SelectContent>
                                    {sortedKelas.map(k => (
                                        <SelectItem key={k.id} value={String(k.id)}>{k.namaKelas}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Mata Pelajaran</Label>
                            <Select value={formMapelId} onValueChange={setFormMapelId}>
                                <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                                <SelectContent>
                                    {mapelList.map(m => (
                                        <SelectItem key={m.id} value={String(m.id)}>{m.namaMapel}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dari Jam Ke</Label>
                                <Select value={formJpStart} onValueChange={(v) => {
                                    setFormJpStart(v);
                                    // auto-set end to same if not set or less
                                    if (!formJpEnd || Number(formJpEnd) < Number(v)) setFormJpEnd(v);
                                }}>
                                    <SelectTrigger><SelectValue placeholder="JP" /></SelectTrigger>
                                    <SelectContent>
                                        {JP_SLOTS.map(s => (
                                            <SelectItem key={s.jp} value={String(s.jp)}>
                                                JP {s.jp} ({s.mulai})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sampai Jam Ke</Label>
                                <Select value={formJpEnd} onValueChange={setFormJpEnd}>
                                    <SelectTrigger><SelectValue placeholder="JP" /></SelectTrigger>
                                    <SelectContent>
                                        {JP_SLOTS.filter(s => s.jp >= Number(formJpStart || 1)).map(s => (
                                            <SelectItem key={s.jp} value={String(s.jp)}>
                                                JP {s.jp} ({s.selesai})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {formJpStart && formJpEnd && (
                            <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                                Waktu: <span className="font-mono font-medium text-foreground">
                                    {getTimeRange(Number(formJpStart), Number(formJpEnd)).mulai} – {getTimeRange(Number(formJpStart), Number(formJpEnd)).selesai}
                                </span>
                                {' '}({Number(formJpEnd) - Number(formJpStart) + 1} jam pelajaran)
                            </div>
                        )}
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
        </PageContainer>
    );
}
