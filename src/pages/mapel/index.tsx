import { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { mapelService } from '@/services/mapel';
import type { Mapel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MapelPage() {
    const [mapelList, setMapelList] = useState<Mapel[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editing, setEditing] = useState<Mapel | null>(null);
    const [deleting, setDeleting] = useState<Mapel | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formNama, setFormNama] = useState('');
    const [formKode, setFormKode] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const res = await mapelService.getAll();
            setMapelList(res.data.data || []);
        } catch {
            toast.error('Gagal memuat data mata pelajaran');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = mapelList.filter(
        (m) =>
            m.namaMapel.toLowerCase().includes(search.toLowerCase()) ||
            m.kodeMapel.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditing(null);
        setFormNama('');
        setFormKode('');
        setDialogOpen(true);
    };

    const openEdit = (mapel: Mapel) => {
        setEditing(mapel);
        setFormNama(mapel.namaMapel);
        setFormKode(mapel.kodeMapel);
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formNama || !formKode) {
            toast.error('Semua field harus diisi');
            return;
        }
        setSubmitting(true);
        try {
            if (editing) {
                await mapelService.update(editing.id, { namaMapel: formNama, kodeMapel: formKode });
                toast.success('Mata pelajaran berhasil diperbarui');
            } else {
                await mapelService.create({ namaMapel: formNama, kodeMapel: formKode });
                toast.success('Mata pelajaran berhasil ditambahkan');
            }
            setDialogOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menyimpan mata pelajaran');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setSubmitting(true);
        try {
            await mapelService.delete(deleting.id);
            toast.success('Mata pelajaran berhasil dihapus');
            setDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus mata pelajaran');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageContainer
            title="Kelola Mata Pelajaran"
            description="Manajemen data mata pelajaran"
            action={
                <Button size="sm" onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Mapel
                </Button>
            }
        >
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari mapel..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {loading ? (
                <TableSkeleton cols={4} rows={5} />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Mata Pelajaran</TableHead>
                                <TableHead className="w-28 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        {search ? 'Tidak ditemukan' : 'Belum ada data'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((mapel, i) => (
                                    <TableRow key={mapel.id}>
                                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                        <TableCell className="font-mono text-sm">{mapel.kodeMapel}</TableCell>
                                        <TableCell className="font-medium">{mapel.namaMapel}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(mapel)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeleting(mapel); setDeleteOpen(true); }}>
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Mapel' : 'Tambah Mapel'}</DialogTitle>
                        <DialogDescription>Masukkan data mata pelajaran</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Kode Mapel</Label>
                            <Input value={formKode} onChange={(e) => setFormKode(e.target.value)} placeholder="Contoh: MTK" />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Mata Pelajaran</Label>
                            <Input value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Contoh: Matematika" />
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

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Mapel</DialogTitle>
                        <DialogDescription>Yakin ingin menghapus <strong>{deleting?.namaMapel}</strong>?</DialogDescription>
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
