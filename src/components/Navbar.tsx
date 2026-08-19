import React from 'react';
import { 
  School, 
  Smartphone, 
  ShieldCheck, 
  Bell, 
  Download,
  LogOut,
  User,
  KeyRound
} from 'lucide-react';
import { SekolahConfig, AuthSession } from '../types/dapodik';

interface NavbarProps {
  mode: 'siswa' | 'operator';
  onToggleMode: (newMode: 'siswa' | 'operator') => void;
  config: SekolahConfig;
  unreadAnnouncementsCount: number;
  onOpenNotifications: () => void;
  onOpenInstallGuide: () => void;
  session: AuthSession | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onToggleMode,
  config,
  unreadAnnouncementsCount,
  onOpenNotifications,
  onOpenInstallGuide,
  session,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#11141B]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      {/* Top micro banner */}
      <div className="bg-[#0D1117] border-b border-slate-800/80 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold tracking-wide uppercase border border-blue-500/30">
              DAPODIK 2027
            </span>
            <span className="truncate hidden sm:inline text-slate-300">
              Sistem Pendataan & Formulir F-PD Resmi {config.namaSekolah} (NPSN: {config.npsn})
            </span>
            <span className="truncate sm:hidden text-slate-300">
              SiDiQ - {config.namaSekolah}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400 shrink-0">
            <span className="hidden md:inline">Tahun Ajaran: <strong className="text-slate-200">{config.tahunAjaran}</strong></span>
            <button 
              onClick={onOpenInstallGuide}
              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full transition-all text-[11px] font-medium"
              title="Panduan pasang aplikasi di HP Murid"
            >
              <Smartphone className="w-3 h-3" />
              <span>Pasang di HP (PWA)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & School Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shadow-md">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-[#E2E8F0] text-base sm:text-lg tracking-tight leading-none">
                  SiDiQ <span className="text-blue-400">2027</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  SMKN 1 PATROL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block mt-0.5">
                Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
              </p>
            </div>
          </div>

          {/* Mode Switcher & Right actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* If logged in as operator, show mode switcher pill */}
            {session?.role === 'operator' && (
              <div className="bg-[#0D1117] p-1 rounded-xl flex items-center border border-slate-800">
                <button
                  id="btn-mode-siswa"
                  onClick={() => onToggleMode('siswa')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'siswa'
                      ? 'bg-[#161B22] text-blue-400 shadow-xs border border-slate-700'
                      : 'text-slate-400 hover:text-[#E2E8F0]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pratinjau Murid</span>
                  <span className="sm:hidden">Murid</span>
                </button>

                <button
                  id="btn-mode-operator"
                  onClick={() => onToggleMode('operator')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'operator'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-[#E2E8F0]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dashboard Operator</span>
                  <span className="sm:hidden">Operator</span>
                </button>
              </div>
            )}

            {/* Active User Badge */}
            {session && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-[#0D1117] border border-slate-800 rounded-xl text-xs">
                <div className={`w-2 h-2 rounded-full ${session.role === 'operator' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <div className="text-left">
                  <div className="font-semibold text-slate-200 truncate max-w-[130px] leading-tight">
                    {session.nama}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                    {session.role === 'operator' ? 'Operator Dapodik' : (session.rombel || 'Murid')}
                  </div>
                </div>
              </div>
            )}

            {/* Notification Bell */}
            <button
              id="btn-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700"
              title="Pemberitahuan & Pengumuman Sekolah"
            >
              <Bell className="w-5 h-5" />
              {unreadAnnouncementsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
                    {unreadAnnouncementsCount}
                  </span>
                </span>
              )}
            </button>

            {/* Logout Button */}
            {session ? (
              <button
                id="btn-logout"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20"
                title="Keluar dari sesi akun saat ini"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            ) : null}

          </div>

        </div>
      </div>
    </header>
  );
};
