import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentPortal/StudentPortal';
import { OperatorDashboard } from './components/OperatorDashboard/OperatorDashboard';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { LoginPortal } from './components/Auth/LoginPortal';
import { 
  getSiswaList, 
  saveSiswa, 
  deleteSiswa, 
  batchDeleteSiswa, 
  updateStatusVerifikasi, 
  batchVerifySiswa, 
  getSekolahConfig, 
  saveSekolahConfig, 
  resetToDefaultConfig, 
  getPengumumanList, 
  addPengumuman, 
  deletePengumuman,
  importBatchSiswa,
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
  initServerSync
} from './services/storageService';
import { SiswaDapodik, SekolahConfig, PengumumanSekolah, UserRole, StatusVerifikasi, AuthSession } from './types/dapodik';
import { School, Smartphone, ShieldCheck, KeyRound } from 'lucide-react';

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());
  const [role, setRole] = useState<UserRole>(() => (getAuthSession()?.role || 'siswa'));
  const [siswaList, setSiswaList] = useState<SiswaDapodik[]>([]);
  const [config, setConfig] = useState<SekolahConfig>(getSekolahConfig());
  const [announcements, setAnnouncements] = useState<PengumumanSekolah[]>([]);
  
  // UI states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load and subscribe to storage changes
  const reloadData = () => {
    setSiswaList(getSiswaList());
    setConfig(getSekolahConfig());
    setAnnouncements(getPengumumanList());
  };

  useEffect(() => {
    // 1. Initial local load
    reloadData();

    // 2. Initialize real-time server database synchronization
    initServerSync();

    const handleStorageUpdate = () => {
      reloadData();
      // Check if session still exists
      const current = getAuthSession();
      setSession(current);
    };

    window.addEventListener('sipendik-data-updated', handleStorageUpdate);
    window.addEventListener('sipendik-announcements-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('sipendik-data-updated', handleStorageUpdate);
      window.removeEventListener('sipendik-announcements-updated', handleStorageUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth Handlers
  const handleLoginSuccess = (newSession: AuthSession) => {
    saveAuthSession(newSession);
    setSession(newSession);
    setRole(newSession.role);
    showToast(`Selamat datang, ${newSession.nama}! Anda masuk sebagai ${newSession.role === 'operator' ? 'Operator Dapodik' : 'Murid'}.`);
  };

  const handleToggleMode = (newMode: UserRole) => {
    if (newMode === 'operator' && session?.role !== 'operator') {
      showToast('Akses ditolak: Dashboard & Formulir Admin hanya dapat diakses oleh akun Operator.');
      return;
    }
    setRole(newMode);
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    setRole('siswa');
    showToast('Berhasil keluar dari akun.');
  };

  // Handlers for Siswa CRUD
  const handleSaveSiswa = (data: Partial<SiswaDapodik> & { nama: string; nisn: string }) => {
    const saved = saveSiswa(data);
    reloadData();
    showToast(`Data murid "${saved.nama}" berhasil disimpan ke sistem Dapodik 2027!`);
  };

  const handleUpdateStatus = (id: string, status: StatusVerifikasi, catatan?: string) => {
    updateStatusVerifikasi(id, status, catatan, config.operatorDapodik);
    reloadData();
    showToast(`Status verifikasi berhasil diperbarui menjadi "${status}"`);
  };

  const handleDeleteSiswa = (id: string) => {
    deleteSiswa(id);
    reloadData();
    showToast('Data murid berhasil dihapus dari sistem.');
  };

  const handleBatchDelete = (ids: string[]) => {
    batchDeleteSiswa(ids);
    reloadData();
    showToast(`${ids.length} data murid berhasil dihapus.`);
  };

  const handleBatchVerify = (ids: string[]) => {
    batchVerifySiswa(ids, config.operatorDapodik);
    reloadData();
    showToast(`${ids.length} data murid berhasil diverifikasi valid!`);
  };

  // Handlers for Config
  const handleSaveConfig = (newConfig: SekolahConfig) => {
    saveSekolahConfig(newConfig);
    setConfig(newConfig);
    showToast('Identitas dan konfigurasi sekolah berhasil diperbarui.');
  };

  const handleResetDefaultConfig = () => {
    resetToDefaultConfig();
    reloadData();
    showToast('Pengaturan awal SMKN 1 Patrol berhasil dimuat kembali.');
  };

  // Handlers for Announcements
  const handleAddAnnouncement = (item: Omit<PengumumanSekolah, 'id' | 'tanggal'>) => {
    addPengumuman(item);
    reloadData();
    showToast('Pengumuman baru berhasil disiarkan ke notifikasi murid!');
  };

  const handleDeleteAnnouncement = (id: string) => {
    deletePengumuman(id);
    reloadData();
    showToast('Pengumuman telah dihapus.');
  };

  const handleImportStudents = (students: Partial<SiswaDapodik>[]) => {
    if (session?.role !== 'operator') {
      showToast('Otoritas ditolak: Hanya 1 akun Administrator (wardinuryanto73@admin.smk.belajar.id) yang berhak mengunggah database murid.');
      return;
    }
    importBatchSiswa(students);
    reloadData();
    showToast(`Master database berhasil diperbarui: ${students.length} murid tersinkronisasi ke server & siap diakses semua akun.`);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-[#161B22] text-[#E2E8F0] text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* If not logged in, display the initial Login Portal */}
      {!session ? (
        <LoginPortal 
          config={config}
          siswaList={siswaList}
          onLoginSuccess={handleLoginSuccess}
          onOpenInstallGuide={() => setIsInstallModalOpen(true)}
        />
      ) : (
        <>
          {/* Main Responsive Header / Navigation Bar */}
          <Navbar
            mode={session.role === 'operator' ? role : 'siswa'}
            onToggleMode={handleToggleMode}
            unreadAnnouncementsCount={announcements.length}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onOpenInstallGuide={() => setIsInstallModalOpen(true)}
            config={config}
            session={session}
            onLogout={handleLogout}
          />

          {/* Main Application Container */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            {session.role === 'operator' && role === 'operator' ? (
              <OperatorDashboard
                siswaList={siswaList}
                config={config}
                announcements={announcements}
                onSaveSiswa={handleSaveSiswa}
                onUpdateStatus={handleUpdateStatus}
                onDeleteSiswa={handleDeleteSiswa}
                onBatchDeleteSiswa={handleBatchDelete}
                onBatchVerifySiswa={handleBatchVerify}
                onSaveConfig={handleSaveConfig}
                onResetDefaultConfig={handleResetDefaultConfig}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onImportStudents={handleImportStudents}
              />
            ) : (
              <StudentPortal
                siswaList={siswaList}
                config={config}
                announcements={announcements}
                onSaveSiswa={handleSaveSiswa}
                onOpenInstallGuide={() => setIsInstallModalOpen(true)}
                onOpenNotifications={() => setIsNotificationOpen(true)}
                session={session}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="bg-[#11141B] border-t border-slate-800 py-6 px-4 text-xs text-slate-400 text-center">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <School className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-slate-200">{config.namaSekolah}</span>
                <span className="text-slate-600">|</span>
                <span>NPSN: {config.npsn}</span>
              </div>

              <div className="flex items-center space-x-4 text-[11px]">
                <span>Form F-PD Dapodik @ 2027 | Azzura</span>
                <span>•</span>
                <button
                  onClick={() => setIsInstallModalOpen(true)}
                  className="text-blue-400 hover:text-orange-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Instalasi PWA Mobile</span>
                </button>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        announcements={announcements}
        config={config}
        userRole={role}
        onAddAnnouncementClick={() => {
          setIsNotificationOpen(false);
        }}
      />

      {/* PWA Mobile Installation Guide Modal */}
      <PwaInstallBanner
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

    </div>
  );
}
export default App;
