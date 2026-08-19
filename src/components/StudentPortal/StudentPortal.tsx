import React, { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  UserPlus, 
  Download, 
  Edit3, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageCircle, 
  School, 
  Smartphone, 
  UploadCloud, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  QrCode,
  Maximize2,
  Users,
  Layers
} from 'lucide-react';
import { SiswaDapodik, SekolahConfig, PengumumanSekolah } from '../../types/dapodik';
import { StudentWizardForm } from './StudentWizardForm';
import { exportSingleSiswaPdf } from '../../services/pdfExportService';
import { createWaLink } from '../../services/whatsappService';
import { QrisMuridModal } from './QrisMuridModal';
import { generateQrisQrCodeDataUrl } from '../../services/qrisService';
import { StudentDatabaseView } from './StudentDatabaseView';

interface StudentPortalProps {
  siswaList?: SiswaDapodik[];
  config: SekolahConfig;
  announcements: PengumumanSekolah[];
  onSaveSiswa: (data: Partial<SiswaDapodik> & { nama: string; nisn: string }) => void;
  onOpenInstallGuide: () => void;
  onOpenNotifications: () => void;
  session?: import('../../types/dapodik').AuthSession | null;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  siswaList = [],
  config,
  announcements,
  onSaveSiswa,
  onOpenInstallGuide,
  onOpenNotifications,
  session
}) => {
  const isStudentSession = session?.role === 'siswa';

  // If logged in as student, find their exact record or create temporary fallback based on their session
  const studentFromSession = isStudentSession && session?.nisn 
    ? (siswaList.find(s => s.nisn === session.nisn || s.id === session.siswaId) || {
        id: session.siswaId || `siswa-${Date.now()}`,
        nama: session.nama,
        nisn: session.nisn,
        rombel: session.rombel || 'X TJKT 1',
        jurusan: session.jurusan || 'Teknik Jaringan Komputer dan Telekomunikasi (TJKT)',
        jenisKelamin: 'L',
        nik: '',
        tempatLahir: 'Indramayu',
        tanggalLahir: '2008-01-01',
        statusVerifikasi: 'pending'
      } as SiswaDapodik)
    : undefined;

  const defaultId = studentFromSession 
    ? studentFromSession.id 
    : (siswaList[0]?.id || '');

  const [activeNisnSearch, setActiveNisnSearch] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>(defaultId);
  const [activePortalTab, setActivePortalTab] = useState<'my_card' | 'database'>('my_card');
  const [isEditingOrNew, setIsEditingOrNew] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editInitialData, setEditInitialData] = useState<Partial<SiswaDapodik> | undefined>(undefined);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [miniQrUrl, setMiniQrUrl] = useState<string>('');

  const currentSiswa: SiswaDapodik | undefined = studentFromSession || siswaList.find(s => s.id === selectedSiswaId) || siswaList[0];

  useEffect(() => {
    if (currentSiswa) {
      generateQrisQrCodeDataUrl(currentSiswa, config).then(url => setMiniQrUrl(url));
    }
  }, [currentSiswa, config]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNisnSearch.trim()) return;

    const found = siswaList.find(
      s => s.nisn === activeNisnSearch.trim() || s.nik === activeNisnSearch.trim()
    );

    if (found) {
      setSelectedSiswaId(found.id);
    } else {
      const confirmNew = window.confirm(
        `Data dengan NISN/NIK "${activeNisnSearch}" belum ditemukan. Apakah Anda ingin mengisi formulir biodata baru untuk NISN ini?`
      );
      if (confirmNew) {
        setEditInitialData({ nisn: activeNisnSearch.trim() });
        setWizardStep(1);
        setIsEditingOrNew(true);
      }
    }
  };

  const handleStartNew = () => {
    setEditInitialData(undefined);
    setWizardStep(1);
    setIsEditingOrNew(true);
  };

  const handleEditCurrent = (step: number = 1) => {
    if (currentSiswa) {
      setEditInitialData(currentSiswa);
      setWizardStep(step);
      setIsEditingOrNew(true);
    }
  };

  if (isEditingOrNew) {
    return (
      <StudentWizardForm
        initialData={editInitialData}
        initialStep={wizardStep}
        config={config}
        onSave={(data) => {
          onSaveSiswa(data);
          setIsEditingOrNew(false);
        }}
        onCancel={() => setIsEditingOrNew(false)}
      />
    );
  }

  // Calculate document completion count
  const docs = currentSiswa?.dokumen || {};
  const docCount = [docs.fotoName, docs.kkName, docs.aktaName, docs.ijazahSklName, docs.kipPkhName, docs.ktpOrtuName].filter(Boolean).length;
  const docPercentage = Math.round((docCount / 6) * 100);

  const getStatusDisplay = (status: SiswaDapodik['statusVerifikasi']) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Diverifikasi & Valid',
          bg: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
          icon: CheckCircle2,
          desc: 'Data telah diverifikasi oleh Operator Dapodik SMKN 1 Patrol.'
        };
      case 'revision_needed':
        return {
          label: 'Perlu Perbaikan Berkas',
          bg: 'bg-red-500/10 text-red-300 border border-red-500/30',
          icon: AlertTriangle,
          desc: currentSiswa?.catatanOperator || 'Terdapat dokumen/data yang perlu diunggah ulang.'
        };
      case 'pending':
      default:
        return {
          label: 'Menunggu Verifikasi Operator',
          bg: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
          icon: Clock,
          desc: 'Data telah masuk antrean pemeriksaan Operator Sekolah.'
        };
    }
  };

  const statusDisplay = getStatusDisplay(currentSiswa?.statusVerifikasi || 'pending');
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">

      {/* Top Welcome / Mobile Hero Card */}
      <div className="bg-[#11141B] border border-slate-800 rounded-3xl p-5 sm:p-7 text-[#E2E8F0] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                {isStudentSession ? 'Akun Murid Aktif' : 'Portal Murid 2027'}
              </span>
              <span className="text-xs text-slate-400">
                SMK Negeri 1 Patrol - Indramayu
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#E2E8F0]">
              {isStudentSession && currentSiswa 
                ? `Selamat Datang, ${currentSiswa.nama.split(' ')[0]}!`
                : 'Sistem Pendataan & Formulir F-PD Dapodik'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              {isStudentSession && currentSiswa 
                ? `Anda dapat melengkapi biodata pribadi, data orang tua/wali, data periodik, dan mengunggah dokumen berkas Dapodik 2027 secara mandiri.`
                : 'Lengkapi biodata, unggah dokumen pendukung, cek status verifikasi operator, dan unduh bukti formulir Dapodik 2027 resmi.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isStudentSession ? (
              <>
                <button
                  type="button"
                  onClick={() => handleEditCurrent(1)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Update Data Mandiri (F-PD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleEditCurrent(6)}
                  className="flex items-center space-x-2 px-3.5 py-2.5 bg-[#161B22] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                  <span>Upload Berkas</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartNew}
                className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Isi Biodata Murid Baru</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenInstallGuide}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-[#161B22] hover:bg-slate-800 border border-slate-700 text-[#E2E8F0] font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Pasang di HP</span>
            </button>
          </div>
        </div>

        {/* Quick Search Student by NISN / NIK bar (only if not logged in as student) */}
        {!isStudentSession && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-xl">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari atau ganti murid berdasarkan NISN atau NIK..."
                  value={activeNisnSearch}
                  onChange={(e) => setActiveNisnSearch(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2.5 bg-[#0D1117] text-[#E2E8F0] placeholder:text-slate-500 rounded-xl text-xs sm:text-sm font-medium border border-slate-700 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Cari Data Murid
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Portal View Navigation Tabs (Kartu Biodata vs Status Database Dapodik Murid) */}
      <div className="flex items-center space-x-2 bg-[#11141B] p-1.5 rounded-2xl border border-slate-800 shadow-md overflow-x-auto">
        <button
          type="button"
          onClick={() => setActivePortalTab('my_card')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activePortalTab === 'my_card'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B22]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isStudentSession ? 'Kartu & Biodata Saya' : 'Kartu & Formulir Murid'}</span>
          {currentSiswa && (
            <span className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/20 text-white/90">
              {currentSiswa.nama.split(' ')[0]}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActivePortalTab('database')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activePortalTab === 'database'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B22]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>{isStudentSession ? 'Status Database Dapodik Saya' : 'Rincian Database Dapodik'}</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Terproteksi
          </span>
        </button>
      </div>

      {/* Conditionally Render: Database View OR Single Student Card */}
      {activePortalTab === 'database' ? (
        <StudentDatabaseView
          siswaList={siswaList}
          config={config}
          currentSiswaId={currentSiswa?.id}
          currentSiswa={currentSiswa}
          loggedInNisn={session?.nisn}
          onSelectSiswa={(siswa) => {
            setSelectedSiswaId(siswa.id);
            setActivePortalTab('my_card');
          }}
          onEditSiswa={(siswa, step = 1) => {
            setSelectedSiswaId(siswa.id);
            setEditInitialData(siswa);
            setWizardStep(step);
            setIsEditingOrNew(true);
          }}
        />
      ) : currentSiswa ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Student Card and Detailed Tabs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student ID Card Frame */}
            <div className="bg-[#11141B] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
              
              {/* Card top banner */}
              <div className="bg-[#161B22] border-b border-slate-800 px-6 py-4 text-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <School className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    KARTU BIODATA DAPODIK 2027
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsQrisModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Buka QRIS Murid Standar Nasional & Presensi Dapodik"
                  >
                    <QrCode className="w-3.5 h-3.5 text-red-400" />
                    <span>QRIS Murid</span>
                  </button>
                  <span className="text-xs font-mono font-bold bg-[#0D1117] text-blue-400 px-2.5 py-1 rounded-full border border-slate-700">
                    NISN: {currentSiswa.nisn}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  
                  {/* Student Photo */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-32 rounded-2xl bg-[#0D1117] border-2 border-slate-700 overflow-hidden shadow-xs flex items-center justify-center">
                      {currentSiswa.dokumen?.foto ? (
                        <img
                          src={currentSiswa.dokumen.foto}
                          alt={currentSiswa.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <User className="w-10 h-10 text-slate-600 mx-auto" />
                          <span className="text-[10px] text-slate-500 font-medium">Belum ada foto</span>
                        </div>
                      )}
                    </div>
                    <span className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      currentSiswa.jenisKelamin === 'L' ? 'bg-blue-600' : 'bg-pink-600'
                    }`}>
                      {currentSiswa.jenisKelamin}
                    </span>
                  </div>

                  {/* Student Essential Details */}
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#E2E8F0] tracking-tight">
                        {currentSiswa.nama}
                      </h3>
                      {currentSiswa.punyaKip === 'Ya' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Penerima KIP/PIP
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-blue-400">
                      {currentSiswa.jurusan}
                    </p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500">Rombel:</span>{' '}
                        <strong className="text-slate-200">{currentSiswa.rombel}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">NIK:</span>{' '}
                        <strong className="text-slate-200 font-mono">{currentSiswa.nik || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">TTL:</span>{' '}
                        <span className="text-slate-300">{currentSiswa.tempatLahir}, {currentSiswa.tanggalLahir}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Desa/Kec:</span>{' '}
                        <span className="text-slate-300">{currentSiswa.desaKelurahan || '-'}, {currentSiswa.kecamatan || '-'}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* QRIS Murid Interactive Banner Inside Card */}
                <div className="mt-5 p-3.5 bg-gradient-to-r from-red-950/30 via-[#161B22] to-slate-900/60 rounded-2xl border border-red-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center space-x-3.5 w-full sm:w-auto">
                    <div 
                      onClick={() => setIsQrisModalOpen(true)}
                      className="w-13 h-13 rounded-xl bg-white p-1 shadow-md border border-slate-300 shrink-0 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative group"
                      title="Klik untuk memperbesar & unduh QRIS Murid"
                    >
                      {miniQrUrl ? (
                        <img src={miniQrUrl} alt="QRIS Mini" className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="w-8 h-8 text-slate-800" />
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-red-400 tracking-wider">QRIS MURID DAPODIK</span>
                        <span className="px-1.5 py-0.2 rounded-sm bg-red-600 text-white font-extrabold text-[9px] tracking-wider leading-none">GPN</span>
                        <span className="px-1.5 py-0.2 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[9px] leading-none">AKTIF</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono font-bold mt-0.5 truncate">
                        NMID: ID1024{config.npsn || '20216008'}{currentSiswa.nisn}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Identitas digital & pembayaran iuran/SPP/kantin SMKN 1 Patrol
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQrisModalOpen(true)}
                    className="w-full sm:w-auto px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer active:scale-95 shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Lihat & Unduh QRIS</span>
                  </button>
                </div>

                {/* Verification Status Alert Box */}
                <div className={`mt-4 p-4 rounded-2xl border flex items-start space-x-3 ${statusDisplay.bg}`}>
                  <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{statusDisplay.label}</span>
                      <span className="text-[11px] opacity-75">Tahun Ajaran {config.tahunAjaran}</span>
                    </div>
                    <p className="mt-1 leading-relaxed">{statusDisplay.desc}</p>
                    {currentSiswa.verifiedBy && (
                      <p className="mt-1 text-[11px] opacity-80">
                        Divalidasi oleh: <strong>{currentSiswa.verifiedBy}</strong> pada {currentSiswa.verifiedAt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Edit Mandiri, Download PDF, QRIS Murid, Contact WA */}
                <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleEditCurrent(1)}
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Perbarui Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsQrisModalOpen(true)}
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-red-400" />
                    <span>QRIS Murid</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportSingleSiswaPdf(currentSiswa, config)}
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#161B22] hover:bg-slate-800 text-[#E2E8F0] border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Cetak F-PD</span>
                  </button>

                  <a
                    href={createWaLink(
                      config.telepon, 
                      `Halo Operator Dapodik ${config.namaSekolah}, saya ${currentSiswa.nama} (${currentSiswa.rombel}) ingin konfirmasi pembaruan biodata Dapodik 2027.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Chat WA</span>
                  </a>
                </div>

              </div>
            </div>

            {/* Quick Data Breakdown View with Step Jump Links */}
            <div className="bg-[#11141B] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <h4 className="font-extrabold text-[#E2E8F0] text-sm uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Rincian Data Formulir Dapodik 2027</span>
                <button
                  type="button"
                  onClick={() => handleEditCurrent(1)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Semua Data</span>
                </button>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Orang Tua */}
                <div className="space-y-1.5 p-3.5 bg-[#0D1117] border border-slate-800/80 rounded-xl relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-300">Data Orang Tua / Wali</span>
                    <button
                      type="button"
                      onClick={() => handleEditCurrent(4)}
                      className="text-[11px] text-blue-400 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  <p><span className="text-slate-500">Ibu Kandung:</span> <strong className="text-slate-200">{currentSiswa.namaIbuKandung || '-'}</strong> ({currentSiswa.pekerjaanIbu || '-'})</p>
                  <p><span className="text-slate-500">Ayah Kandung:</span> <strong className="text-slate-200">{currentSiswa.namaAyah || '-'}</strong> ({currentSiswa.pekerjaanAyah || '-'})</p>
                  <p><span className="text-slate-500">No. WA Ortu:</span> <strong className="font-mono text-emerald-400">{currentSiswa.nomorHpOrtu || '-'}</strong></p>
                </div>

                {/* Periodik */}
                <div className="space-y-1.5 p-3.5 bg-[#0D1117] border border-slate-800/80 rounded-xl relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-300">Data Periodik & Riwayat</span>
                    <button
                      type="button"
                      onClick={() => handleEditCurrent(5)}
                      className="text-[11px] text-blue-400 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  <p><span className="text-slate-500">Tinggi / Berat Badan:</span> <strong className="text-slate-200">{currentSiswa.tinggiBadan} cm / {currentSiswa.beratBadan} kg</strong></p>
                  <p><span className="text-slate-500">Jarak ke SMKN 1 Patrol:</span> <strong className="text-slate-200">{currentSiswa.jarakKeSekolahKm} km ({currentSiswa.waktuTempuhMenit} menit)</strong></p>
                  <p><span className="text-slate-500">Sekolah Asal:</span> <strong className="text-slate-200">{currentSiswa.sekolahAsalSmp || '-'}</strong></p>
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Document Status & School Announcements */}
          <div className="space-y-6">
            
            {/* Supporting Documents Checklist Widget */}
            <div className="bg-[#11141B] rounded-3xl border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-[#E2E8F0] text-sm">Dokumen Pendukung</h4>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {docCount}/6 Berkas
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#0D1117] border border-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    docPercentage === 100 ? 'bg-emerald-500' : docPercentage >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${docPercentage}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-2.5 text-xs">
                {[
                  { name: 'Pas Foto Murid (3x4)', uploaded: !!currentSiswa.dokumen?.fotoName },
                  { name: 'Kartu Keluarga (KK)', uploaded: !!currentSiswa.dokumen?.kkName },
                  { name: 'Akta Kelahiran', uploaded: !!currentSiswa.dokumen?.aktaName },
                  { name: 'Ijazah / SKL SMP', uploaded: !!currentSiswa.dokumen?.ijazahSklName },
                  { name: 'Kartu KIP / PKH', uploaded: !!currentSiswa.dokumen?.kipPkhName },
                  { name: 'KTP Orang Tua / Wali', uploaded: !!currentSiswa.dokumen?.ktpOrtuName }
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#0D1117] border border-slate-800/80">
                    <span className="text-slate-300 font-medium">{doc.name}</span>
                    {doc.uploaded ? (
                      <span className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ada</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Belum</span>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleEditCurrent(6)}
                className="w-full mt-4 flex items-center justify-center space-x-1.5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload / Perbarui Berkas Dokumen</span>
              </button>
            </div>

            {/* School Announcements Card */}
            <div className="bg-[#11141B] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#E2E8F0] text-sm">Pengumuman Sekolah</h4>
                <button 
                  type="button"
                  onClick={onOpenNotifications}
                  className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-3">
                {announcements.slice(0, 2).map((ann) => (
                  <div key={ann.id} className="p-3 bg-[#0D1117] rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {ann.kategori}
                    </span>
                    <p className="font-bold text-slate-200 leading-snug line-clamp-1">
                      {ann.judul}
                    </p>
                    <p className="text-slate-400 text-[11px] line-clamp-2">
                      {ann.isi}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Database Murid Quick Access Widget */}
            <div className="bg-[#11141B] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#E2E8F0] text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Database Dapodik Terproteksi</span>
                </h4>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Privat
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Data Dapodik 2027 tersinkronisasi aman dan hanya dapat diakses melalui akun murid Anda serta Operator Dapodik SMKN 1 Patrol.
              </p>
              <button
                type="button"
                onClick={() => setActivePortalTab('database')}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                <span>Lihat Entri Database Dapodik Saya</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-[#11141B] rounded-3xl border border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#E2E8F0] mb-2">
            Data Murid Belum Tersedia
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            Basis data murid SMKN 1 Patrol belum diunggah oleh Operator Dapodik, atau NISN Anda belum terdaftar. Silakan hubungi Operator Sekolah atau isi formulir mandiri.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartNew}
              className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Isi Formulir Biodata Mandiri (F-PD)</span>
            </button>
            <a
              href={createWaLink('081234567890', `Halo Operator Dapodik ${config.namaSekolah}, saya ingin menanyakan data NISN saya di Dapodik 2027.`)}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3 bg-[#161B22] hover:bg-slate-800 border border-slate-700 text-[#E2E8F0] text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Hubungi Operator via WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Modal QRIS Murid SMKN 1 Patrol */}
      {currentSiswa && (
        <QrisMuridModal
          isOpen={isQrisModalOpen}
          onClose={() => setIsQrisModalOpen(false)}
          siswa={currentSiswa}
          config={config}
        />
      )}

    </div>
  );
};
