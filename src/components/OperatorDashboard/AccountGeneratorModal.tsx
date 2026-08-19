import React, { useState, useMemo } from 'react';
import { 
  X, 
  KeyRound, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  MessageCircle, 
  School, 
  Smartphone,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { SiswaDapodik, SekolahConfig, PasswordPattern, UsernamePattern, BatchCredentialOptions } from '../../types/dapodik';
import { JURUSAN_LIST } from '../../data/initialData';
import { 
  batchGenerateCredentials, 
  generateStudentCredentials, 
  resetStudentPassword, 
  generateStudentPasswordValue, 
  generateStudentUsernameValue,
  formatBirthdateToDDMMYYYY 
} from '../../services/storageService';
import { createWaLink } from '../../services/whatsappService';

interface AccountGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswaList?: SiswaDapodik[];
  config: SekolahConfig;
  selectedSiswaIds?: string[];
  onDataUpdated: () => void;
}

export const AccountGeneratorModal: React.FC<AccountGeneratorModalProps> = ({
  isOpen,
  onClose,
  siswaList = [],
  config,
  selectedSiswaIds = [],
  onDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'batch' | 'cards' | 'list'>('batch');

  // Batch Form State
  const [batchScope, setBatchScope] = useState<'all' | 'unassigned_only' | 'selected' | 'jurusan'>(
    selectedSiswaIds.length > 0 ? 'selected' : 'all'
  );
  const [targetJurusan, setTargetJurusan] = useState<string>(
    siswaList[0]?.jurusan || 'Teknik Jaringan Komputer dan Telekomunikasi (TJKT)'
  );
  const [usernamePattern, setUsernamePattern] = useState<UsernamePattern>('nisn');
  const [passwordPattern, setPasswordPattern] = useState<PasswordPattern>('birthdate');
  const [customPassword, setCustomPassword] = useState('patrol2027');
  
  // List Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('all');
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Success Feedback
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered for table & cards
  const filteredStudents = useMemo(() => {
    return siswaList.filter(s => {
      const matchSearch = 
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nisn.includes(searchTerm) ||
        (s.username && s.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.rombel.toLowerCase().includes(searchTerm.toLowerCase());

      const matchJurusan = filterJurusan === 'all' || s.jurusan === filterJurusan;
      return matchSearch && matchJurusan;
    });
  }, [siswaList, searchTerm, filterJurusan]);

  // 3 Official Jurusan List
  const jurusanList = JURUSAN_LIST;

  // Live Preview calculation
  const previewSamples = useMemo(() => {
    const samplePool = siswaList.slice(0, 3);
    return samplePool.map(s => ({
      nama: s.nama,
      nisn: s.nisn,
      rombel: s.rombel,
      username: generateStudentUsernameValue(usernamePattern, s),
      password: generateStudentPasswordValue(passwordPattern, s, customPassword)
    }));
  }, [siswaList, usernamePattern, passwordPattern, customPassword]);

  if (!isOpen) return null;

  // Handle Batch Execution
  const handleExecuteBatch = () => {
    const options: BatchCredentialOptions = {
      scope: batchScope,
      targetJurusan: batchScope === 'jurusan' ? targetJurusan : undefined,
      selectedIds: batchScope === 'selected' ? selectedSiswaIds : undefined,
      usernamePattern,
      passwordPattern,
      customPassword: passwordPattern === 'custom' ? customPassword : undefined
    };

    const result = batchGenerateCredentials(options);
    setGeneratedCount(result.count);
    onDataUpdated();
    showNotification(`Berhasil membuat ${result.count} akun dan password siswa!`);
  };

  // Handle Single Student Reset
  const handleResetSingle = (siswaId: string) => {
    const student = siswaList.find(s => s.id === siswaId);
    if (!student) return;

    const newPass = formatBirthdateToDDMMYYYY(student.tanggalLahir);
    resetStudentPassword(siswaId, newPass);
    onDataUpdated();
    showNotification(`Password untuk ${student.nama} direset ke "${newPass}" (Tanggal Lahir).`);
  };

  // Copy Single Student Credential
  const handleCopyCredential = (student: SiswaDapodik) => {
    const u = student.username || student.nisn;
    const p = student.password || formatBirthdateToDDMMYYYY(student.tanggalLahir);
    const text = `Akun SiDiQ SMKN 1 PATROL:\nNama: ${student.nama}\nNISN: ${student.nisn}\nUsername: ${u}\nPassword: ${p}\nPortal: ${window.location.origin}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
    showNotification(`Kredensial ${student.nama} berhasil disalin!`);
  };

  // Send Single Credential via WA
  const handleSendWa = (student: SiswaDapodik) => {
    const u = student.username || student.nisn;
    const p = student.password || formatBirthdateToDDMMYYYY(student.tanggalLahir);
    const phone = student.nomorHpSiswa || student.nomorHpOrtu || '';
    
    const message = `*KARTU AKSES MURID - SiDiQ 2027*\n*${config.namaSekolah}*\n\nYth. Ananda *${student.nama}* (${student.rombel})\n\nBerikut adalah akun resmi untuk pengisian & verifikasi berkas Dapodik 2027:\n- *Username / NISN:* ${u}\n- *Password:* ${p}\n\nSilakan login ke portal resmi sekolah:\n👉 ${window.location.origin}\n\n_Catatan: Segera lengkapi biodata dan unggah scan KK & Akta Kelahiran._\n\nSalam,\n*Operator Dapodik: ${config.operatorDapodik}*`;
    
    const url = createWaLink(phone, message);
    window.open(url, '_blank');
  };

  // Copy WhatsApp Broadcast Text for All Filtered Students
  const handleCopyBroadcastWa = () => {
    if (filteredStudents.length === 0) return;

    let text = `📢 *DAFTAR AKUN & PASSWORD SiDiQ 2027*\n*${config.namaSekolah}*\n\n`;
    text += `Silakan gunakan akun berikut untuk masuk ke portal F-PD Dapodik: ${window.location.origin}\n\n`;
    text += `------------------------------------\n`;

    filteredStudents.forEach((s, idx) => {
      const u = s.username || s.nisn;
      const p = s.password || formatBirthdateToDDMMYYYY(s.tanggalLahir);
      text += `${idx + 1}. *${s.nama}* (${s.rombel})\n   NISN/User: \`${u}\` | Pass: \`${p}\`\n\n`;
    });

    text += `------------------------------------\nBila mengalami kendala login, hubungi Operator: ${config.operatorDapodik}`;
    
    navigator.clipboard.writeText(text);
    showNotification('Format siaran WhatsApp berhasil disalin ke clipboard!');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['No', 'Nama Murid', 'NISN', 'Rombel', 'Jurusan', 'Username', 'Password', 'Status Verifikasi'];
    const rows = filteredStudents.map((s, idx) => [
      (idx + 1).toString(),
      `"${s.nama}"`,
      `"${s.nisn}"`,
      `"${s.rombel}"`,
      `"${s.jurusan}"`,
      `"${s.username || s.nisn}"`,
      `"${s.password || formatBirthdateToDDMMYYYY(s.tanggalLahir)}"`,
      `"${s.statusVerifikasi}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Akun_Murid_SiDiQ_SMKN1Patrol_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('File CSV data akun berhasil diunduh!');
  };

  // Print Login Cards
  const handlePrintCards = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#11141B] border border-slate-700/90 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#161B22] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-[#E2E8F0] tracking-tight">
                  Kelola Akun & Generator Password Murid
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  DAPODIK 2027
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate username, atur pola password, cetak slip login, atau kirim akun ke WhatsApp murid.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="px-6 pt-3 pb-0 bg-[#0D1117] border-b border-slate-800 flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 border-b-2 ${
              activeTab === 'batch'
                ? 'bg-[#11141B] text-blue-400 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>⚡ Generate Akun Massal</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 border-b-2 ${
              activeTab === 'cards'
                ? 'bg-[#11141B] text-blue-400 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>🖨️ Cetak Kartu Login & Slip Akun</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 border-b-2 ${
              activeTab === 'list'
                ? 'bg-[#11141B] text-blue-400 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>📋 Daftar & Reset Kredensial ({siswaList.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: GENERATE MASSAL */}
          {activeTab === 'batch' && (
            <div className="space-y-6">
              
              {/* Feedback banner */}
              {generatedCount !== null && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span><strong>Sukses!</strong> {generatedCount} akun dan password murid telah dibuat & diperbarui.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('cards')}
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    Lihat & Cetak Kartu →
                  </button>
                </div>
              )}

              {/* 1. Target Scope */}
              <div className="p-4 bg-[#161B22] border border-slate-800 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  1. Pilih Target Murid:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    batchScope === 'all' 
                       ? 'bg-blue-600/10 border-blue-500 text-blue-300' 
                      : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">Semua Murid</span>
                      <input 
                        type="radio" 
                        name="scope" 
                        checked={batchScope === 'all'} 
                        onChange={() => setBatchScope('all')} 
                        className="text-blue-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">Total: {siswaList.length} murid</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    batchScope === 'unassigned_only' 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-300' 
                      : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">Belum Ada Akun</span>
                      <input 
                        type="radio" 
                        name="scope" 
                        checked={batchScope === 'unassigned_only'} 
                        onChange={() => setBatchScope('unassigned_only')} 
                        className="text-blue-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {siswaList.filter(s => !s.username || !s.password).length} murid
                    </span>
                  </label>

                  <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    batchScope === 'jurusan' 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-300' 
                      : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">Per Jurusan</span>
                      <input 
                        type="radio" 
                        name="scope" 
                        checked={batchScope === 'jurusan'} 
                        onChange={() => setBatchScope('jurusan')} 
                        className="text-blue-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">Filter program</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    batchScope === 'selected' 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-300' 
                      : 'bg-[#0A0C10] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">Murid Tercentang</span>
                      <input 
                        type="radio" 
                        name="scope" 
                        checked={batchScope === 'selected'} 
                        onChange={() => setBatchScope('selected')} 
                        className="text-blue-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {selectedSiswaIds.length} murid dipilih
                    </span>
                  </label>
                </div>

                {batchScope === 'jurusan' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pilih Program Keahlian:
                    </label>
                    <select
                      value={targetJurusan}
                      onChange={(e) => setTargetJurusan(e.target.value)}
                      className="w-full bg-[#0A0C10] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {jurusanList.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. Format Pattern Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Username Pattern */}
                <div className="p-4 bg-[#161B22] border border-slate-800 rounded-2xl space-y-3">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. Pola Username:
                  </label>
                  <div className="space-y-2 text-xs">
                    <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                      usernamePattern === 'nisn' ? 'bg-blue-600/10 border-blue-500 text-blue-300' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200">NISN (10 Digit)</div>
                        <div className="text-[11px] text-slate-400">Standar Nasional Dapodik (Contoh: 0078912345)</div>
                      </div>
                      <input 
                        type="radio" 
                        name="uPattern" 
                        checked={usernamePattern === 'nisn'} 
                        onChange={() => setUsernamePattern('nisn')} 
                      />
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                      usernamePattern === 'name_nisn' ? 'bg-blue-600/10 border-blue-500 text-blue-300' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200">Nama + 3 Digit NISN</div>
                        <div className="text-[11px] text-slate-400">Mudah diingat (Contoh: rizky.345)</div>
                      </div>
                      <input 
                        type="radio" 
                        name="uPattern" 
                        checked={usernamePattern === 'name_nisn'} 
                        onChange={() => setUsernamePattern('name_nisn')} 
                      />
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                      usernamePattern === 'nik' ? 'bg-blue-600/10 border-blue-500 text-blue-300' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200">NIK (16 Digit KTP/KK)</div>
                        <div className="text-[11px] text-slate-400">Sesuai data kependudukan</div>
                      </div>
                      <input 
                        type="radio" 
                        name="uPattern" 
                        checked={usernamePattern === 'nik'} 
                        onChange={() => setUsernamePattern('nik')} 
                      />
                    </label>
                  </div>
                </div>

                {/* Password Pattern */}
                <div className="p-4 bg-[#161B22] border border-slate-800 rounded-2xl space-y-3">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Pola Password:
                  </label>
                  <div className="space-y-2 text-xs">
                    <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                      passwordPattern === 'birthdate' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-300' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>Tanggal Lahir (DDMMYYYY)</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">Rekomendasi</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Contoh: 15082008 (mudah diingat siswa/ortu)</div>
                      </div>
                      <input 
                        type="radio" 
                        name="pPattern" 
                        checked={passwordPattern === 'birthdate'} 
                        onChange={() => setPasswordPattern('birthdate')} 
                      />
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                      passwordPattern === 'random_pin' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-300' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200">6 Digit Acak Alfanumerik</div>
                        <div className="text-[11px] text-slate-400">Kombinasi unik (Contoh: Pt78a2)</div>
                      </div>
                      <input 
                        type="radio" 
                        name="pPattern" 
                        checked={passwordPattern === 'random_pin'} 
                        onChange={() => setPasswordPattern('random_pin')} 
                      />
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                      passwordPattern === 'custom' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-300' : 'bg-[#0A0C10] border-slate-800 text-slate-400'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200">Password Kustom Seragam</div>
                        <div className="text-[11px] text-slate-400">Satu password untuk semua (Contoh: patrol2027)</div>
                      </div>
                      <input 
                        type="radio" 
                        name="pPattern" 
                        checked={passwordPattern === 'custom'} 
                        onChange={() => setPasswordPattern('custom')} 
                      />
                    </label>

                    {passwordPattern === 'custom' && (
                      <div className="pt-1">
                        <input
                          type="text"
                          value={customPassword}
                          onChange={(e) => setCustomPassword(e.target.value)}
                          placeholder="Masukkan password seragam..."
                          className="w-full bg-[#0A0C10] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* 3. Live Preview of Generated Accounts */}
              <div className="p-4 bg-[#0D1117] border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Pratinjau Hasil Generate Kredensial:</span>
                  <span className="text-amber-400 font-normal normal-case text-[11px]">3 Sampel Data Riil</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {previewSamples.map((sample, idx) => (
                    <div key={idx} className="p-3 bg-[#161B22] rounded-xl border border-slate-700/60 text-xs space-y-1 font-mono">
                      <div className="font-bold text-slate-200 font-sans truncate">{sample.nama}</div>
                      <div className="text-[11px] text-slate-400">Rombel: {sample.rombel}</div>
                      <div className="pt-1 border-t border-slate-800 flex flex-col gap-0.5 text-[11px]">
                        <div><span className="text-slate-500 font-sans">User: </span><strong className="text-blue-300">{sample.username}</strong></div>
                        <div><span className="text-slate-500 font-sans">Pass: </span><strong className="text-emerald-300">{sample.password}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="btn-execute-batch-generate"
                  onClick={handleExecuteBatch}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Proses & Simpan Kredensial Murid</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: CETAK KARTU LOGIN & SLIP AKUN */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#161B22] border border-slate-800 rounded-2xl">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={filterJurusan}
                    onChange={(e) => setFilterJurusan(e.target.value)}
                    className="bg-[#0A0C10] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="all">Semua Program Keahlian ({siswaList.length})</option>
                    {jurusanList.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleCopyBroadcastWa}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
                    title="Salin daftar akun format siaran WhatsApp grup kelas"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Salin Siaran WA</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Unduh Excel/CSV</span>
                  </button>

                  <button
                    onClick={handlePrintCards}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Slip Kartu</span>
                  </button>
                </div>
              </div>

              {/* Printable Grid Cards (Styling supports native window.print) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
                {filteredStudents.map((student) => {
                  const u = student.username || student.nisn;
                  const p = student.password || formatBirthdateToDDMMYYYY(student.tanggalLahir);

                  return (
                    <div 
                      key={student.id} 
                      className="bg-[#0D1117] border border-slate-700/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between print:border-slate-800 print:bg-white print:text-black"
                    >
                      {/* Card Header */}
                      <div className="border-b border-slate-800 pb-2.5 mb-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <School className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                              KARTU AKSES MURID DAPODIK 2027
                            </div>
                            <div className="text-xs font-extrabold text-slate-200 leading-tight">
                              {config.namaSekolah}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {student.rombel}
                        </span>
                      </div>

                      {/* Card Details */}
                      <div className="space-y-1.5 text-xs">
                        <div className="font-bold text-slate-100 truncate text-sm">
                          {student.nama}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                          <span>NISN: <strong>{student.nisn}</strong></span>
                          <span className="truncate max-w-[160px]">{student.jurusan}</span>
                        </div>

                        {/* Credential Box */}
                        <div className="mt-2 p-2.5 bg-[#161B22] rounded-xl border border-slate-700/60 font-mono text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-sans text-[11px]">Username / ID:</span>
                            <span className="font-bold text-blue-300">{u}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-sans text-[11px]">Password Akun:</span>
                            <span className="font-bold text-emerald-300">{p}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Portal: {window.location.host}</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCredential(student)}
                            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded transition-colors"
                            title="Salin Kredensial"
                          >
                            {copiedId === student.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendWa(student)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 rounded transition-colors"
                            title="Kirim ke WhatsApp Murid"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: DAFTAR & RESET KREDENSIAL */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Search & Filter Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama, NISN, username..."
                    className="w-full bg-[#0A0C10] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAllPasswords(!showAllPasswords)}
                    className="px-3 py-2 bg-[#161B22] border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
                  >
                    {showAllPasswords ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{showAllPasswords ? 'Sembunyikan Password' : 'Tampilkan Password'}</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#161B22] text-slate-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nama Murid</th>
                      <th className="py-3 px-4">Rombel & NISN</th>
                      <th className="py-3 px-4 font-mono">Username</th>
                      <th className="py-3 px-4 font-mono">Password</th>
                      <th className="py-3 px-4 text-right">Aksi Kredensial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredStudents.map((s) => {
                      const u = s.username || s.nisn;
                      const p = s.password || formatBirthdateToDDMMYYYY(s.tanggalLahir);

                      return (
                        <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{s.nama}</div>
                            <div className="text-[11px] text-slate-500 font-mono">NIK: {s.nik || '-'}</div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <div className="text-blue-300 font-semibold">{s.rombel}</div>
                            <div className="text-slate-400 text-[11px]">{s.nisn}</div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded font-semibold">
                              {u}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded font-semibold">
                              {showAllPasswords ? p : '••••••••'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyCredential(s)}
                                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Salin Kredensial"
                              >
                                {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSendWa(s)}
                                className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                title="Kirim Akun ke WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleResetSingle(s.id)}
                                className="p-1.5 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors"
                                title="Reset Password ke Tanggal Lahir"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#161B22] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Operator: <strong className="text-orange-300">{config.operatorDapodik}</strong> (NPSN: {config.npsn})</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>

    </div>
  );
};
