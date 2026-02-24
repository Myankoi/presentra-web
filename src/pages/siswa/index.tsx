import { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { siswaService } from '@/services/siswa';
import { kelasService } from '@/services/kelas';
import type { Siswa, Kelas } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SiswaPage() {
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterKelas, setFilterKelas] = useState<string>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editing, setEditing] = useState<Siswa | null>(null);
    const [deleting, setDeleting] = useState<Siswa | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formNis, setFormNis] = useState('');
    const [formNama, setFormNama] = useState('');
    const [formGender, setFormGender] = useState<'L' | 'P'>('L');
    const [formKelasId, setFormKelasId] = useState<string>('');

    const fetchData = useCallback(async () => {
        try {
            const [siswaRes, kelasRes] = await Promise.all([
                siswaService.getAll(),
                kelasService.getAll(),
            ]);
            setSiswaList(siswaRes.data.data || []);
            setKelasList(kelasRes.data.data || []);
        } catch {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = siswaList.filter((s) => {
        const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
        const matchKelas = filterKelas === 'all' || String(s.kelasId) === filterKelas;
        return matchSearch && matchKelas;
    });

    const getKelasName = (kelasId: number) =>
        kelasList.find((k) => k.id === kelasId)?.namaKelas || '-';

    const openCreate = () => {
        setEditing(null);
        setFormNis('');
        setFormNama('');
        setFormGender('L');
        setFormKelasId('');
        setDialogOpen(true);
    };

    const openEdit = (siswa: Siswa) => {
        setEditing(siswa);
        setFormNis(siswa.nis);
        setFormNama(siswa.nama);
        setFormGender(siswa.jenisKelamin);
        setFormKelasId(String(siswa.kelasId));
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formNis || !formNama || !formKelasId) {
            toast.error('Semua field harus diisi');
            return;
        }
        setSubmitting(true);
        try {
            if (editing) {
                await siswaService.update(editing.id, {
                    nis: formNis, nama: formNama, jenisKelamin: formGender, kelasId: Number(formKelasId),
                });
                toast.success('Siswa berhasil diperbarui');
            } else {
                await siswaService.create({
                    nis: formNis, nama: formNama, jenisKelamin: formGender, kelasId: Number(formKelasId),
                });
                toast.success('Siswa berhasil ditambahkan');
            }
            setDialogOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menyimpan siswa');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setSubmitting(true);
        try {
            await siswaService.delete(deleting.id);
            toast.success('Siswa berhasil dihapus');
            setDeleteOpen(false);
            fetchData();
        } catch {
            toast.error('Gagal menghapus siswa');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageContainer
            title="Kelola Siswa"
            description="Manajemen data siswa per kelas"
            action={
                <Button size="sm" onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Siswa
                </Button>
            }
        >
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Cari NIS atau nama..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter kelas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kelas</SelectItem>
                        {kelasList.map((k) => (
                            <SelectItem key={k.id} value={String(k.id)}>{k.namaKelas}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <TableSkeleton cols={5} rows={8} />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>NIS</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>L/P</TableHead>
                                <TableHead className="w-28 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {search || filterKelas !== 'all' ? 'Tidak ditemukan' : 'Belum ada data siswa'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((siswa, i) => (
                                    <TableRow key={siswa.id}>
                                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                        <TableCell className="font-mono text-sm">{siswa.nis}</TableCell>
                                        <TableCell className="font-medium">{siswa.nama}</TableCell>
                                        <TableCell>{getKelasName(siswa.kelasId)}</TableCell>
                                        <TableCell>
                                            <Badge variant={siswa.jenisKelamin === 'L' ? 'secondary' : 'outline'}>
                                                {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(siswa)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeleting(siswa); setDeleteOpen(true); }}>
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
                        <DialogTitle>{editing ? 'Edit Siswa' : 'Tambah Siswa'}</DialogTitle>
                        <DialogDescription>Masukkan data siswa</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>NIS</Label>
                            <Input value={formNis} onChange={(e) => setFormNis(e.target.value)} placeholder="Nomor Induk Siswa" />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama</Label>
                            <Input value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Nama lengkap" />
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis Kelamin</Label>
                            <Select value={formGender} onValueChange={(v) => setFormGender(v as 'L' | 'P')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L">Laki-laki</SelectItem>
                                    <SelectItem value="P">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kelas</Label>
                            <Select value={formKelasId} onValueChange={setFormKelasId}>
                                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                                <SelectContent>
                                    {kelasList.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>{k.namaKelas}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <DialogTitle>Hapus Siswa</DialogTitle>
                        <DialogDescription>Yakin ingin menghapus <strong>{deleting?.nama}</strong>?</DialogDescription>
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
