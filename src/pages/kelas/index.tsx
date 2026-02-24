import { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { kelasService } from '@/services/kelas';
import type { Kelas } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, QrCode, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function KelasPage() {
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Kelas | null>(null);
    const [deleting, setDeleting] = useState<Kelas | null>(null);
    const [qrData, setQrData] = useState<{ tokenQr: string; namaKelas: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formNama, setFormNama] = useState('');
    const [formTahun, setFormTahun] = useState('2025/2026');

    const fetchData = useCallback(async () => {
        try {
            const res = await kelasService.getAll();
            setKelasList(res.data.data || []);
        } catch {
            toast.error('Gagal memuat data kelas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = kelasList.filter(
        (k) => k.namaKelas.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditing(null);
        setFormNama('');
        setFormTahun('2025/2026');
        setDialogOpen(true);
    };

    const openEdit = (kelas: Kelas) => {
        setEditing(kelas);
        setFormNama(kelas.namaKelas);
        setFormTahun(kelas.tahunAjaran);
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formNama || !formTahun) {
            toast.error('Semua field harus diisi');
            return;
        }
        setSubmitting(true);
        try {
            if (editing) {
                await kelasService.update(editing.id, { namaKelas: formNama, tahunAjaran: formTahun });
                toast.success('Kelas berhasil diperbarui');
            } else {
                await kelasService.create({ namaKelas: formNama, tahunAjaran: formTahun });
                toast.success('Kelas berhasil ditambahkan');
            }
            setDialogOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menyimpan kelas');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setSubmitting(true);
        try {
            await kelasService.delete(deleting.id);
            toast.success('Kelas berhasil dihapus');
            setDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus kelas');
        } finally {
            setSubmitting(false);
        }
    };

    const showQr = async (kelas: Kelas) => {
        try {
            const res = await kelasService.getQr(kelas.id);
            setQrData({ tokenQr: res.data.data.tokenQr, namaKelas: kelas.namaKelas });
            setQrDialogOpen(true);
        } catch {
            toast.error('QR Code belum tersedia');
        }
    };

    const regenerateQr = async (kelas: Kelas) => {
        try {
            await kelasService.regenerateQr(kelas.id);
            toast.success('QR Code berhasil di-regenerate');
            showQr(kelas);
        } catch {
            toast.error('Gagal regenerate QR');
        }
    };

    return (
        <PageContainer
            title="Kelola Kelas"
            description="Manajemen data kelas dan QR Code"
            action={
                <Button size="sm" onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kelas
                </Button>
            }
        >
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari kelas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {loading ? (
                <TableSkeleton cols={4} rows={5} />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Nama Kelas</TableHead>
                                <TableHead>Tahun Ajaran</TableHead>
                                <TableHead className="w-40 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        {search ? 'Tidak ditemukan' : 'Belum ada data kelas'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((kelas, i) => (
                                    <TableRow key={kelas.id}>
                                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                        <TableCell className="font-medium">{kelas.namaKelas}</TableCell>
                                        <TableCell className="text-muted-foreground">{kelas.tahunAjaran}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => showQr(kelas)} title="Lihat QR">
                                                    <QrCode className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(kelas)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeleting(kelas); setDeleteOpen(true); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
                        <DialogDescription>Masukkan data kelas</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Nama Kelas</Label>
                            <Input value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Contoh: X RPL 1" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tahun Ajaran</Label>
                            <Input value={formTahun} onChange={(e) => setFormTahun(e.target.value)} placeholder="2025/2026" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Batal</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editing ? 'Simpan' : 'Tambah'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Kelas</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus kelas <strong>{deleting?.namaKelas}</strong>?
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

            {/* QR Dialog */}
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>QR Code — {qrData?.namaKelas}</DialogTitle>
                        <DialogDescription>Token untuk scan presensi kelas</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="rounded-lg border bg-white p-4">
                            <div className="text-center text-xs text-muted-foreground break-all font-mono">
                                {qrData?.tokenQr || 'N/A'}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const kelas = kelasList.find(k => k.namaKelas === qrData?.namaKelas);
                                if (kelas) regenerateQr(kelas);
                            }}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate QR
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
