import React, { useState } from 'react';
import { 
  School, 
  ShieldCheck, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  MessageCircle, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Smartphone
} from 'lucide-react';
import { SiswaDapodik, SekolahConfig, AuthSession } from '../../types/dapodik';
import { verifyStudentLogin, verifyAdminLogin, saveAuthSession } from '../../services/storageService';
import { createWaLink } from '../../services/whatsappService';

interface LoginPortalProps {
  config: SekolahConfig;
  siswaList?: SiswaDapodik[];
  onLoginSuccess: (session: AuthSession) => void;
  onOpenInstallGuide: () => void;
  initialRole?: 'siswa' | 'operator';
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  config,
  siswaList = [],
  onLoginSuccess,
  onOpenInstallGuide,
  initialRole = 'siswa'
}) => {
  // Primary role tab: 'siswa' or 'operator'
  const [activeTab, setActiveTab] = useState<'siswa' | 'operator'>(initialRole);
  
  // Siswa Form States
  const [siswaIdentifier, setSiswaIdentifier] = useState('');
  const [siswaPassword, setSiswaPassword] = useState('');
  const [showSiswaPass, setShowSiswaPass] = useState(false);
  
  // Admin / Operator Form States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Status States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear error messages when switching tabs
  const handleTabSwitch = (tab: 'siswa' | 'operator') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSiswaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (siswaList.length === 0) {
      setErrorMessage('Basis data murid masih kosong. Silakan masuk ke tab "Operator Sekolah" untuk mengunggah data murid terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = verifyStudentLogin(siswaIdentifier, siswaPassword);
      setIsLoading(false);

      if (result.success && result.siswa) {
        const student = result.siswa;
        const session: AuthSession = {
          role: 'siswa',
          username: student.username || student.nisn,
          nama: student.nama,
          siswaId: student.id,
          nisn: student.nisn,
          rombel: student.rombel,
          jurusan: student.jurusan,
          loginTime: new Date().toISOString()
        };
        setSuccessMessage(`Berhasil masuk sebagai ${student.nama}. Mengalihkan ke portal...`);
        setTimeout(() => {
          saveAuthSession(session);
          onLoginSuccess(session);
        }, 400);
      } else {
        setErrorMessage(result.error || 'Gagal masuk. Periksa kembali NISN/Username dan password Anda.');
      }
    }, 300);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = verifyAdminLogin(adminUsername, adminPassword, config);
      setIsLoading(false);

      if (result.success) {
        const session: AuthSession = {
          role: 'operator',
          username: adminUsername,
          nama: config.operatorDapodik || 'Wardi Nuryanto, S.Pd.',
          operatorName: config.operatorDapodik,
          nipOperator: config.nipOperator,
          loginTime: new Date().toISOString()
        };
        setSuccessMessage(`Autentikasi berhasil! Mengalihkan ke Dashboard Operator...`);
        setTimeout(() => {
          saveAuthSession(session);
          onLoginSuccess(session);
        }, 400);
      } else {
        setErrorMessage(result.error || 'Autentikasi operator gagal. Periksa username dan password.');
      }
    }, 300);
  };

  const handleHubungiOperatorWa = () => {
    const text = `Halo Bapak/Ibu Operator Dapodik ${config.namaSekolah} (${config.operatorDapodik}), saya murid yang ingin meminta bantuan informasi login akun SiDiQ 2027. Terima kasih.`;
    const waUrl = createWaLink(config.telepon || '085294916873', text);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6">
      
      {/* Container Card */}
      <div className="w-full max-w-xl bg-[#11141B] border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-b from-[#161B22] to-[#11141B] p-6 sm:p-7 text-center border-b border-slate-800/80 relative">
          
          {/* Top Badges */}
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <School className="w-3.5 h-3.5 mr-1" />
              NPSN: {config.npsn}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              DAPODIK 2027
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E2E8F0] tracking-tight">
            SiDiQ <span className="text-blue-400">SMKN 1 PATROL</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Sistem Digital Murid & Validasi Formulir F-PD Dapodik Resmi
          </p>

          {/* Prominent Tab Switcher: Murid vs Operator */}
          <div className="mt-6 grid grid-cols-2 p-1.5 bg-[#0A0C10] rounded-2xl border border-slate-800 max-w-md mx-auto">
            <button
              id="tab-select-murid"
              type="button"
              onClick={() => handleTabSwitch('siswa')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'siswa'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Portal Murid</span>
            </button>

            <button
              id="tab-select-operator"
              type="button"
              onClick={() => handleTabSwitch('operator')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'operator'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Operator Sekolah</span>
            </button>
          </div>

        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-950/50 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-semibold">{successMessage}</div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 1. PORTAL MASUK MURID                                        */}
          {/* ============================================================ */}
          {activeTab === 'siswa' && (
            <form onSubmit={handleSiswaSubmit} className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-2xl flex items-center space-x-2 text-xs text-blue-300">
                <User className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Akses mandiri & validasi biodata murid</span>
              </div>

              {/* Notice if database is empty */}
              {siswaList.length === 0 && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-amber-300 text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Basis Data Murid Masih Kosong</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    Data murid belum diunggah oleh Operator Sekolah. Silakan buka tab <strong>Operator Sekolah</strong> untuk mengunggah file Excel data murid.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('operator')}
                    className="mt-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Buka Login Operator</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  NISN / Username / NIK Murid <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <input
                    type="text"
                    id="input-login-siswa-id"
                    value={siswaIdentifier}
                    onChange={(e) => setSiswaIdentifier(e.target.value)}
                    placeholder="Masukkan 10 digit NISN atau username murid..."
                    className="w-full bg-[#0A0C10] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Gunakan NISN 10 digit yang terdaftar di Dapodik SMKN 1 Patrol.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password Murid <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Format: Tanggal Lahir (DDMMYYYY)
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showSiswaPass ? 'text' : 'password'}
                    id="input-login-siswa-pass"
                    value={siswaPassword}
                    onChange={(e) => setSiswaPassword(e.target.value)}
                    placeholder="Contoh: 15082008 (DDMMYYYY)..."
                    className="w-full bg-[#0A0C10] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#E2E8F0] placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSiswaPass(!showSiswaPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showSiswaPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-login-siswa"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Portal Murid</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Help & Contact */}
              <div className="pt-3 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleHubungiOperatorWa}
                  className="text-xs text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Belum punya password / Butuh bantuan? Hubungi Operator Dapodik via WA</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* 2. PORTAL MASUK OPERATOR DAPODIK / ADMIN                    */}
          {/* ============================================================ */}
          {activeTab === 'operator' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 animate-in fade-in duration-150">
              
              {/* Operator Info & Security Notice */}
              <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-[#E2E8F0] tracking-wide">
                      Akses Terbatas: Administrator & Operator Dapodik
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Portal ini hanya dapat diakses oleh Admin / Operator Dapodik resmi SMKN 1 Patrol.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-red-900/30 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Petugas: <strong className="text-amber-300">{config.operatorDapodik || 'Wardi Nuryanto, S.Pd.'}</strong></span>
                  <span className="font-mono text-slate-400">NIP: {config.nipOperator}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Belajar.id / Username Administrator <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    id="input-login-operator-id"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="wardinuryanto73@admin.smk.belajar.id atau username admin..."
                    className="w-full bg-[#0A0C10] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Masukkan akun resmi Belajar.id Operator Dapodik SMKN 1 Patrol.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Kata Sandi / Kunci Otentikasi Admin <span className="text-red-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    id="input-login-operator-pass"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan kata sandi admin..."
                    className="w-full bg-[#0A0C10] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#E2E8F0] placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-login-operator"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Autentikasi & Masuk Dashboard Operator</span>
                  </>
                )}
              </button>

              <div className="pt-2 p-3 bg-[#0A0C10] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Keamanan Akun Administrator:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Akses modul ini memerlukan hak otoritas Administrator Dapodik. Murid atau pihak luar dilarang mencoba mengakses area manajemen ini.
                </p>
              </div>
            </form>
          )}

        </div>

        {/* Footer Info */}
        <div className="bg-[#0D1117] px-6 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Tahun Ajaran {config.tahunAjaran} • Semester Ganjil</span>
          </div>

          <button
            type="button"
            onClick={onOpenInstallGuide}
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pasang Aplikasi di HP (PWA)</span>
          </button>
        </div>

      </div>

    </div>
  );
};
