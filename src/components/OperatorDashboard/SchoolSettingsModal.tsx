import React, { useState } from 'react';
import { 
  X, 
  Save, 
  School, 
  RotateCcw, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Building,
  UserCheck
} from 'lucide-react';
import { SekolahConfig } from '../../types/dapodik';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SekolahConfig;
  onSave: (config: SekolahConfig) => void;
  onResetDefault: () => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onResetDefault
}) => {
  const [activeTab, setActiveTab] = useState<'sekolah' | 'keamanan'>('sekolah');
  const [form, setForm] = useState<SekolahConfig>({ ...config });
  
  // Password Change States
  const [newPassword, setNewPassword] = useState(config.passwordOperator || 'admin123');
  const [confirmPassword, setConfirmPassword] = useState(config.passwordOperator || 'admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setSaveSuccessMsg(null);

    // Validate password if on security tab or password modified
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      setActiveTab('keamanan');
      return;
    }

    if (newPassword.trim().length < 4) {
      setPasswordError('Kata sandi operator minimal 4 karakter.');
      setActiveTab('keamanan');
      return;
    }

    const updatedConfig: SekolahConfig = {
      ...form,
      passwordOperator: newPassword.trim()
    };

    onSave(updatedConfig);
    setSaveSuccessMsg('Pengaturan dan kata sandi Operator Dapodik berhasil disimpan!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('Reset data ke pengaturan awal SMKN 1 Patrol (termasuk kata sandi bawaan admin123)?')) {
      onResetDefault();
      setNewPassword('admin123');
      setConfirmPassword('admin123');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#11141B] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-800 text-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#E2E8F0]">
                Pengaturan Sekolah & Akun Operator
              </h3>
              <p className="text-xs text-slate-400">
                Kelola identitas KOP Dapodik dan ubah kata sandi akses Administrator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 pb-2 bg-[#0D1117] border-b border-slate-800/80 flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('sekolah')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sekolah'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Identitas Sekolah & KOP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keamanan')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'keamanan'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Keamanan & Password Operator</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Notification Banners */}
          {passwordError && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-2xl text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{saveSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: IDENTITAS SEKOLAH */}
          {activeTab === 'sekolah' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-400 mb-1">Nama Satuan Pendidikan / SMK</label>
                <input
                  type="text"
                  required
                  value={form.namaSekolah}
                  onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">NPSN</label>
                <input
                  type="text"
                  required
                  value={form.npsn}
                  onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl font-mono text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Tahun Ajaran & Semester</label>
                <input
                  type="text"
                  required
                  value={form.tahunAjaran}
                  onChange={(e) => setForm({ ...form, tahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-400 mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Kecamatan & Kabupaten</label>
                <input
                  type="text"
                  value={`${form.kecamatan}, ${form.kabupaten}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setForm({ ...form, kecamatan: parts[0]?.trim() || '', kabupaten: parts[1]?.trim() || '' });
                  }}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={form.kodePos}
                  onChange={(e) => setForm({ ...form, kodePos: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl font-mono text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Kepala Sekolah</label>
                <input
                  type="text"
                  value={form.kepalaSekolah}
                  onChange={(e) => setForm({ ...form, kepalaSekolah: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={form.nipKepalaSekolah}
                  onChange={(e) => setForm({ ...form, nipKepalaSekolah: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl font-mono text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Nomor Telepon / WhatsApp Sekolah</label>
                <input
                  type="text"
                  value={form.telepon}
                  onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl font-mono text-[#E2E8F0] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: KEAMANAN & PASSWORD OPERATOR */}
          {activeTab === 'keamanan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Operator Info Card */}
              <div className="p-4 bg-[#0A0C10] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold">Profil Akun Operator Dapodik</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Nama Operator Pendataan</label>
                    <input
                      type="text"
                      value={form.operatorDapodik}
                      onChange={(e) => setForm({ ...form, operatorDapodik: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl text-[#E2E8F0] focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">NIP Operator</label>
                    <input
                      type="text"
                      value={form.nipOperator}
                      onChange={(e) => setForm({ ...form, nipOperator: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl font-mono text-[#E2E8F0] focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-400 mb-1">Email Belajar.id Akun Operator</label>
                    <input
                      type="email"
                      value={form.emailOperator || 'wardinuryanto73@admin.smk.belajar.id'}
                      onChange={(e) => setForm({ ...form, emailOperator: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded-xl font-mono text-[#E2E8F0] focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Box */}
              <div className="p-4 bg-gradient-to-br from-amber-950/20 via-[#0A0C10] to-[#0A0C10] border border-amber-900/40 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-300">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="font-bold">Ubah Kata Sandi / Password Baru Operator</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Perlihatkan'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Kata Sandi Baru Operator <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan password baru..."
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-700/80 rounded-xl font-mono text-[#E2E8F0] focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Ulangi Kata Sandi Baru <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Konfirmasi password baru..."
                        className="w-full px-3 py-2 text-xs bg-[#0D1117] border border-slate-700/80 rounded-xl font-mono text-[#E2E8F0] focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-900/30 text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-center space-x-1 text-amber-300/90 font-medium">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Kata sandi ini digunakan untuk masuk ke tab "Operator Sekolah".</span>
                  </p>
                  <p className="text-slate-400">
                    Pastikan kata sandi baru mudah diingat oleh Operator Dapodik resmi. Anda dapat mengubahnya kapan saja melalui menu ini.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1 text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
