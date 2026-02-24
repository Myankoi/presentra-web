import { useEffect, useState, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { penggunaService } from '@/services/pengguna';
import type { User, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Upload, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const roleBadgeVariant: Record<UserRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    admin: 'default',
    guru: 'secondary',
    sekretaris: 'outline',
    bk: 'destructive',
};

export default function PenggunaPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formNama, setFormNama] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formRole, setFormRole] = useState<string>('guru');

    const fetchUsers = useCallback(async () => {
        try {
            const res = await penggunaService.getAll();
            setUsers(res.data.data || []);
        } catch {
            toast.error('Gagal memuat data pengguna');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter(
        (u) =>
            u.nama.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateDialog = () => {
        setEditingUser(null);
        setFormNama('');
        setFormEmail('');
        setFormRole('guru');
        setDialogOpen(true);
    };

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setFormNama(user.nama);
        setFormEmail(user.email);
        setFormRole(user.role);
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formNama || !formEmail || !formRole) {
            toast.error('Semua field harus diisi');
            return;
        }

        setSubmitting(true);
        try {
            if (editingUser) {
                await penggunaService.update(editingUser.id, {
                    nama: formNama,
                    email: formEmail,
                    role: formRole as UserRole,
                });
                toast.success('Pengguna berhasil diperbarui');
            } else {
                await penggunaService.create({ nama: formNama, email: formEmail, role: formRole });
                toast.success('Pengguna berhasil ditambahkan + akun Firebase dibuat');
            }
            setDialogOpen(false);
            fetchUsers();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingUser) return;
        setSubmitting(true);
        try {
            await penggunaService.delete(deletingUser.id);
            toast.success('Pengguna berhasil dihapus');
            setDeleteDialogOpen(false);
            setDeletingUser(null);
            fetchUsers();
        } catch {
            toast.error('Gagal menghapus pengguna');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSubmitting(true);
        try {
            const res = await penggunaService.bulkImport(file);
            const data = res.data;
            toast.success(
                `Import selesai: ${data.successCount} berhasil, ${data.failedCount} gagal`
            );
            setImportDialogOpen(false);
            fetchUsers();
        } catch {
            toast.error('Gagal mengimport file');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageContainer
            title="Kelola Pengguna"
            description="Manajemen akun guru, sekretaris, dan BK"
            action={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                    <Button size="sm" onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                </div>
            }
        >
            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Cari nama atau email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            {loading ? (
                <TableSkeleton cols={5} rows={6} />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="w-32 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        {search ? 'Tidak ditemukan' : 'Belum ada data pengguna'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user, i) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                        <TableCell className="font-medium">{user.nama}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={roleBadgeVariant[user.role]} className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(user)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        setDeletingUser(user);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
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
                        <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? 'Perbarui data pengguna'
                                : 'Pengguna baru akan otomatis dibuatkan akun Firebase'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Lengkap</Label>
                            <Input id="nama" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Nama lengkap" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@sekolah.sch.id" disabled={!!editingUser} />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={formRole} onValueChange={setFormRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="guru">Guru</SelectItem>
                                    <SelectItem value="sekretaris">Sekretaris</SelectItem>
                                    <SelectItem value="bk">BK</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingUser ? 'Simpan' : 'Tambah'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Pengguna</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus <strong>{deletingUser?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Pengguna dari Excel</DialogTitle>
                        <DialogDescription>
                            Upload file .xlsx dengan kolom: KODE_GURU, NAMA, EMAIL, ROLE
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleBulkImport}
                            disabled={submitting}
                        />
                        {submitting && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memproses file...
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
