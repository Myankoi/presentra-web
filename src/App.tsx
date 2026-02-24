import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import PenggunaPage from '@/pages/pengguna';
import KelasPage from '@/pages/kelas';
import SiswaPage from '@/pages/siswa';
import MapelPage from '@/pages/mapel';
import JadwalMengajarPage from '@/pages/jadwal-mengajar';
import JadwalPiketPage from '@/pages/jadwal-piket';
import LaporanPage from '@/pages/laporan';
import BkPage from '@/pages/bk';
import NotifikasiPage from '@/pages/notifikasi';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pengguna" element={<PenggunaPage />} />
            <Route path="/kelas" element={<KelasPage />} />
            <Route path="/siswa" element={<SiswaPage />} />
            <Route path="/mapel" element={<MapelPage />} />
            <Route path="/jadwal-mengajar" element={<JadwalMengajarPage />} />
            <Route path="/jadwal-piket" element={<JadwalPiketPage />} />
            <Route path="/laporan" element={<LaporanPage />} />
            <Route path="/bk" element={<BkPage />} />
            <Route path="/notifikasi" element={<NotifikasiPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return null; // ProtectedRoute handles global loading
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={firebaseUser ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRoles={['admin', 'bk']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "'Lexend', sans-serif",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
