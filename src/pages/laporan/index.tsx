import { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { laporanService } from '@/services/laporan';
import { kelasService } from '@/services/kelas';
import type { LaporanRekap, Kelas } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Download, FileBarChart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LaporanPage() {
    const [rekap, setRekap] = useState<LaporanRekap[]>([]);
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [filterDari, setFilterDari] = useState('');
    const [filterSampai, setFilterSampai] = useState('');
    const [filterKelas, setFilterKelas] = useState<string>('all');

    useEffect(() => {
        kelasService.getAll().then((res) => setKelasList(res.data.data || [])).catch(() => { });
    }, []);

    const fetchRekap = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {};
            if (filterDari) params.dari = filterDari;
            if (filterSampai) params.sampai = filterSampai;
            if (filterKelas !== 'all') params.kelasId = Number(filterKelas);

            const res = await laporanService.getRekap(params);
            setRekap(res.data.data || []);
        } catch {
            toast.error('Gagal memuat laporan');
        } finally {
            setLoading(false);
        }
    }, [filterDari, filterSampai, filterKelas]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params: Record<string, string | number> = {};
            if (filterDari) params.dari = filterDari;
            if (filterSampai) params.sampai = filterSampai;
            if (filterKelas !== 'all') params.kelasId = Number(filterKelas);

            const res = await laporanService.exportExcel(params);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan-presensi-${filterDari || 'all'}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('File berhasil diunduh');
        } catch {
            toast.error('Gagal mengunduh laporan');
        } finally {
            setExporting(false);
        }
    };

    // Totals
    const totalHadir = rekap.reduce((s, r) => s + r.hadir, 0);
    const totalIzin = rekap.reduce((s, r) => s + r.izin, 0);
    const totalSakit = rekap.reduce((s, r) => s + r.sakit, 0);
    const totalAlfa = rekap.reduce((s, r) => s + r.alfa, 0);

    return (
        <PageContainer
            title="Laporan Presensi"
            description="Rekap dan export laporan kehadiran"
            action={
                <Button size="sm" onClick={handleExport} disabled={exporting || rekap.length === 0}>
                    {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export Excel
                </Button>
            }
        >
            {/* Filters */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileBarChart className="h-4 w-4" />
                        Filter Laporan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="space-y-2">
                            <Label>Dari Tanggal</Label>
                            <Input type="date" value={filterDari} onChange={(e) => setFilterDari(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Sampai Tanggal</Label>
                            <Input type="date" value={filterSampai} onChange={(e) => setFilterSampai(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Kelas</Label>
                            <Select value={filterKelas} onValueChange={setFilterKelas}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Semua Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kelas</SelectItem>
                                    {kelasList.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>{k.namaKelas}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={fetchRekap} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Tampilkan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary badges */}
            {rekap.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 px-4 py-2 text-sm">
                        <span className="text-muted-foreground">Hadir: </span>
                        <span className="font-bold text-green-700 dark:text-green-400">{totalHadir}</span>
                    </div>
                    <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 px-4 py-2 text-sm">
                        <span className="text-muted-foreground">Izin: </span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{totalIzin}</span>
                    </div>
                    <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 px-4 py-2 text-sm">
                        <span className="text-muted-foreground">Sakit: </span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">{totalSakit}</span>
                    </div>
                    <div className="rounded-lg border bg-red-50 dark:bg-red-950/20 px-4 py-2 text-sm">
                        <span className="text-muted-foreground">Alfa: </span>
                        <span className="font-bold text-red-700 dark:text-red-400">{totalAlfa}</span>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <TableSkeleton cols={7} rows={6} />
            ) : rekap.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Pilih filter dan klik "Tampilkan" untuk melihat data
                </div>
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead className="text-center">Hadir</TableHead>
                                <TableHead className="text-center">Izin</TableHead>
                                <TableHead className="text-center">Sakit</TableHead>
                                <TableHead className="text-center">Alfa</TableHead>
                                <TableHead className="text-center">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rekap.map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-sm">{r.tanggal}</TableCell>
                                    <TableCell className="font-medium">{r.kelas}</TableCell>
                                    <TableCell className="text-center text-green-600 font-medium">{r.hadir}</TableCell>
                                    <TableCell className="text-center text-blue-600">{r.izin}</TableCell>
                                    <TableCell className="text-center text-amber-600">{r.sakit}</TableCell>
                                    <TableCell className="text-center text-red-600 font-medium">{r.alfa}</TableCell>
                                    <TableCell className="text-center font-bold">{r.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </PageContainer>
    );
}
