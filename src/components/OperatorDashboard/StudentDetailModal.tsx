import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  FileText, 
  Eye, 
  EyeOff,
  ExternalLink, 
  User, 
  MapPin, 
  Users, 
  Activity, 
  ShieldCheck,
  Send,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { SiswaDapodik, SekolahConfig, StatusVerifikasi } from '../../types/dapodik';
import { exportSingleSiswaPdf } from '../../services/pdfExportService';
import { createWaLink, generateWaPemberitahuanVerifikasi, generateWaPengingatBerkas } from '../../services/whatsappService';
import { resetStudentPassword, formatBirthdateToDDMMYYYY } from '../../services/storageService';
import { QrisMuridModal } from '../StudentPortal/QrisMuridModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface StudentDetailModalProps {
  siswa: SiswaDapodik | null;
  config: SekolahConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: StatusVerifikasi, catatan?: string) => void;
  onEdit: (siswa: SiswaDapodik) => void;
  onDelete: (id: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  siswa,
  config,
  isOpen,
  onClose,
  onUpdateStatus,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'biodata' | 'dokumen' | 'verifikasi' | 'kredensial' | 'whatsapp'>('biodata');
  const [revisionNote, setRevisionNote] = useState(siswa?.catatanOperator || '');
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  if (!isOpen || !siswa) return null;

  const handleApprove = () => {
    onUpdateStatus(siswa.id, 'verified', 'Data telah diperiksa dan dinyatakan valid sesuai dokumen resmi.');
    showNotification(`Status murid ${siswa.nama} berhasil diverifikasi valid!`);
  };

  const handleRequestRevision = () => {
    if (!revisionNote.trim()) {
      showNotification('Mohon tuliskan catatan perbaikan berkas untuk murid/orang tua.', 'error');
      return;
    }
    onUpdateStatus(siswa.id, 'revision_needed', revisionNote.trim());
    showNotification(`Status murid diubah menjadi "Perlu Revisi". Catatan tersimpan.`);
  };

  const waVerificationMessage = generateWaPemberitahuanVerifikasi(siswa, config);
  const waReminderMessage = generateWaPengingatBerkas(siswa, config);

  const docs = siswa.dokumen || {};
  const docList = [
    { key: 'foto', label: 'Pas Foto Murid (3x4)', url: docs.foto, name: docs.fotoName, required: true },
    { key: 'kk', label: 'Scan Kartu Keluarga (KK)', url: docs.kk, name: docs.kkName, required: true },
    { key: 'akta', label: 'Scan Akta Kelahiran', url: docs.akta, name: docs.aktaName, required: true },
    { key: 'ijazahSkl', label: 'Scan Ijazah / SKL SMP', url: docs.ijazahSkl, name: docs.ijazahSklName, required: false },
    { key: 'kipPkh', label: 'Kartu KIP / PKH', url: docs.kipPkh, name: docs.kipPkhName, required: siswa.punyaKip === 'Ya' },
    { key: 'ktpOrtu', label: 'Scan KTP Orang Tua / Wali', url: docs.ktpOrtu, name: docs.ktpOrtuName, required: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#11141B] w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-800 text-[#E2E8F0] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {docs.foto ? (
                <img src={docs.foto} alt={siswa.nama} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-[#E2E8F0]">{siswa.nama}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {siswa.rombel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                NISN: <span className="font-mono font-bold text-white">{siswa.nisn}</span> | NIK: <span className="font-mono text-white">{siswa.nik}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsQrisModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-xl text-xs font-bold transition-all border border-red-500/40"
              title="Buka QRIS Murid Standar Nasional & Presensi Dapodik"
            >
              <QrCode className="w-3.5 h-3.5 text-red-400" />
              <span>QRIS Murid</span>
            </button>

            <button
              onClick={() => exportSingleSiswaPdf(siswa, config)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all border border-blue-500/50"
              title="Unduh Formulir F-PD (PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cetak F-PD</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-[#0D1117] px-5 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('biodata')}
            className={`py-3 px-4 border-b-2 transition-all shrink-0 ${
              activeTab === 'biodata'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Biodata Lengkap
          </button>

          <button
            onClick={() => setActiveTab('dokumen')}
            className={`py-3 px-4 border-b-2 transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'dokumen'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📁 Dokumen Pendukung</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
              {docList.filter(d => !!d.url || !!d.name).length}/6
            </span>
          </button>

          <button
            onClick={() => setActiveTab('verifikasi')}
            className={`py-3 px-4 border-b-2 transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'verifikasi'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛡️ Verifikasi Operator</span>
            <span className={`w-2 h-2 rounded-full ${siswa.statusVerifikasi === 'verified' ? 'bg-emerald-400' : siswa.statusVerifikasi === 'revision_needed' ? 'bg-red-400' : 'bg-amber-400'}`} />
          </button>

          <button
            onClick={() => setActiveTab('kredensial')}
            className={`py-3 px-4 border-b-2 transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'kredensial'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Akun & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 px-4 border-b-2 transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'whatsapp'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kirim WhatsApp</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: BIODATA LENGKAP */}
          {activeTab === 'biodata' && (
            <div className="space-y-6 text-xs text-slate-300">
              
              {/* Section 1: Identitas */}
              <div>
                <h4 className="font-extrabold text-[#E2E8F0] text-sm flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>I. Identitas Murid</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#0D1117] p-4 rounded-2xl border border-slate-800">
                  <div><span className="text-slate-500 block">Nama Lengkap:</span> <strong className="text-[#E2E8F0]">{siswa.nama}</strong></div>
                  <div><span className="text-slate-500 block">Jenis Kelamin:</span> <span className="text-[#E2E8F0]">{siswa.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span></div>
                  <div><span className="text-slate-500 block">NISN (10 Digit):</span> <strong className="text-blue-400 font-mono">{siswa.nisn}</strong></div>
                  <div><span className="text-slate-500 block">NIK (16 Digit):</span> <strong className="text-blue-400 font-mono">{siswa.nik}</strong></div>
                  <div><span className="text-slate-500 block">No. KK:</span> <span className="font-mono text-[#E2E8F0]">{siswa.noKk}</span></div>
                  <div><span className="text-slate-500 block">Tempat, Tgl Lahir:</span> <span className="text-[#E2E8F0]">{siswa.tempatLahir}, {siswa.tanggalLahir}</span></div>
                  <div><span className="text-slate-500 block">No. Akta Lahir:</span> <span className="text-[#E2E8F0]">{siswa.noRegistrasiAkta || '-'}</span></div>
                  <div><span className="text-slate-500 block">Agama:</span> <span className="text-[#E2E8F0]">{siswa.agama}</span></div>
                  <div><span className="text-slate-500 block">Kebutuhan Khusus:</span> <span className="text-[#E2E8F0]">{siswa.berkebutuhanKhusus}</span></div>
                </div>
              </div>

              {/* Section 2: Jurusan & Kelas */}
              <div>
                <h4 className="font-extrabold text-[#E2E8F0] text-sm flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>II. Sekolah, Jurusan & Rombel</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#0D1117] p-4 rounded-2xl border border-slate-800">
                  <div className="sm:col-span-2"><span className="text-slate-500 block">Program Keahlian / Jurusan:</span> <strong className="text-blue-300">{siswa.jurusan}</strong></div>
                  <div><span className="text-slate-500 block">Tingkat / Rombel:</span> <strong className="text-[#E2E8F0]">Kelas {siswa.tingkatKelas} - {siswa.rombel}</strong></div>
                  <div><span className="text-slate-500 block">Sekolah Asal (SMP/MTs):</span> <span className="text-[#E2E8F0]">{siswa.sekolahAsalSmp}</span></div>
                  <div><span className="text-slate-500 block">NPSN SMP:</span> <span className="text-[#E2E8F0]">{siswa.npsnSekolahAsal || '-'}</span></div>
                  <div><span className="text-slate-500 block">Penerima PIP / KIP:</span> <span className="text-[#E2E8F0]">{siswa.punyaKip} {siswa.nomorKip ? `(${siswa.nomorKip})` : ''}</span></div>
                </div>
              </div>

              {/* Section 3: Alamat & Kontak */}
              <div>
                <h4 className="font-extrabold text-[#E2E8F0] text-sm flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>III. Alamat & Kontak</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#0D1117] p-4 rounded-2xl border border-slate-800">
                  <div className="sm:col-span-2"><span className="text-slate-500 block">Alamat Jalan:</span> <span className="text-[#E2E8F0]">{siswa.alamatJalan}</span></div>
                  <div><span className="text-slate-500 block">RT / RW / Dusun:</span> <span className="text-[#E2E8F0]">RT {siswa.rt} / RW {siswa.rw} - {siswa.namaDusun}</span></div>
                  <div><span className="text-slate-500 block">Desa & Kecamatan:</span> <span className="text-[#E2E8F0]">{siswa.desaKelurahan}, Kec. {siswa.kecamatan}</span></div>
                  <div><span className="text-slate-500 block">Kabupaten & Kode Pos:</span> <span className="text-[#E2E8F0]">{siswa.kabupatenKota}, {siswa.kodePos}</span></div>
                  <div><span className="text-slate-500 block">No. HP / WhatsApp Murid:</span> <strong className="text-emerald-400 font-mono">{siswa.nomorHpSiswa}</strong></div>
                  <div><span className="text-slate-500 block">No. HP / WhatsApp Orang Tua:</span> <strong className="text-emerald-400 font-mono">{siswa.nomorHpOrtu}</strong></div>
                  <div><span className="text-slate-500 block">Email Murid:</span> <span className="text-[#E2E8F0]">{siswa.emailSiswa}</span></div>
                </div>
              </div>

              {/* Section 4: Data Orang Tua */}
              <div>
                <h4 className="font-extrabold text-[#E2E8F0] text-sm flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>IV. Data Orang Tua / Wali</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-pink-950/20 p-4 rounded-2xl border border-pink-900/40 space-y-1.5">
                    <span className="font-bold text-pink-300 block mb-1">Ibu Kandung</span>
                    <p><span className="text-slate-500">Nama:</span> <strong className="text-[#E2E8F0]">{siswa.namaIbuKandung}</strong></p>
                    <p><span className="text-slate-500">NIK Ibu:</span> <span className="font-mono text-slate-300">{siswa.nikIbu || '-'}</span></p>
                    <p><span className="text-slate-500">Pekerjaan / Penghasilan:</span> <span className="text-slate-300">{siswa.pekerjaanIbu} / {siswa.penghasilanIbu}</span></p>
                  </div>

                  <div className="bg-blue-950/20 p-4 rounded-2xl border border-blue-900/40 space-y-1.5">
                    <span className="font-bold text-blue-300 block mb-1">Ayah Kandung</span>
                    <p><span className="text-slate-500">Nama:</span> <strong className="text-[#E2E8F0]">{siswa.namaAyah || '-'}</strong></p>
                    <p><span className="text-slate-500">NIK Ayah:</span> <span className="font-mono text-slate-300">{siswa.nikAyah || '-'}</span></p>
                    <p><span className="text-slate-500">Pekerjaan / Penghasilan:</span> <span className="text-slate-300">{siswa.pekerjaanAyah} / {siswa.penghasilanAyah}</span></p>
                  </div>

                  <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-900/40 space-y-1.5">
                    <span className="font-bold text-emerald-300 block mb-1">Wali Murid (Opsional)</span>
                    {siswa.mempunyaiWali === 'Ya' && siswa.namaWali ? (
                      <>
                        <p><span className="text-slate-500">Nama:</span> <strong className="text-emerald-300">{siswa.namaWali}</strong></p>
                        <p><span className="text-slate-500">Hubungan:</span> <span className="text-slate-300">{siswa.hubunganWali || 'Wali'}</span></p>
                        <p><span className="text-slate-500">NIK / Pekerjaan:</span> <span className="text-slate-300 font-mono">{siswa.nikWali || '-'}</span> • <span className="text-slate-300">{siswa.pekerjaanWali || '-'}</span></p>
                        {siswa.nomorHpWali && (
                          <p><span className="text-slate-500">No. WA:</span> <span className="font-mono text-emerald-400">{siswa.nomorHpWali}</span></p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-400 italic text-xs pt-1">Tidak ada wali (Murid tinggal bersama orang tua)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 5: Data Periodik */}
              <div>
                <h4 className="font-extrabold text-[#E2E8F0] text-sm flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>V. Data Periodik & Riwayat</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0D1117] p-4 rounded-2xl border border-slate-800">
                  <div><span className="text-slate-500 block">Tinggi Badan:</span> <strong className="text-[#E2E8F0]">{siswa.tinggiBadan} cm</strong></div>
                  <div><span className="text-slate-500 block">Berat Badan:</span> <strong className="text-[#E2E8F0]">{siswa.beratBadan} kg</strong></div>
                  <div><span className="text-slate-500 block">Jarak ke SMKN 1 Patrol:</span> <strong className="text-[#E2E8F0]">{siswa.jarakKeSekolahKm} km</strong></div>
                  <div><span className="text-slate-500 block">Waktu Tempuh:</span> <strong className="text-[#E2E8F0]">{siswa.waktuTempuhMenit} menit</strong></div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DOKUMEN PENDUKUNG */}
          {activeTab === 'dokumen' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docList.map((doc) => (
                  <div key={doc.key} className="p-4 rounded-2xl border border-slate-800 bg-[#0D1117] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-[#E2E8F0]">{doc.label}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {doc.name || (doc.url ? 'File Terunggah' : 'Belum diunggah')}
                        </p>
                      </div>
                      {doc.url || doc.name ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                          Ada
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          {doc.required ? 'Belum (Wajib)' : 'Kosong'}
                        </span>
                      )}
                    </div>

                    {/* Preview box */}
                    {doc.url ? (
                      <div className="h-36 bg-[#161B22] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 relative group">
                        {doc.url.startsWith('data:image/') ? (
                          <img src={doc.url} alt={doc.label} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-center p-3 text-slate-400">
                            <FileText className="w-8 h-8 mx-auto text-blue-400 mb-1" />
                            <span className="text-xs font-bold block text-slate-200">{doc.name || 'Dokumen PDF'}</span>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setPreviewDocUrl(doc.url || null)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md border border-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Detail</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                        Berkas belum diunggah oleh murid
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIKASI OPERATOR */}
          {activeTab === 'verifikasi' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0D1117] rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-[#E2E8F0]">Form Validasi & Catatan Operator</h4>
                <p className="text-xs text-slate-400">
                  Periksa kesesuaian antara isian data dengan dokumen scan Kartu Keluarga, Akta Kelahiran, dan Ijazah SMP. Jika valid, klik tombol verifikasi di bawah.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Catatan Revisi / Evaluasi (Akan dibaca oleh murid & masuk template WhatsApp):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Scan Kartu Keluarga tidak terbaca jelas / NIK Ibu kurang 1 digit. Harap unggah ulang scan KK asli..."
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    className="w-full p-3 text-xs bg-[#161B22] border border-slate-800 rounded-xl text-[#E2E8F0] placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleApprove}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui & Verifikasi Valid (Dapodik 2027)</span>
                  </button>

                  <button
                    onClick={handleRequestRevision}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Minta Perbaikan / Revisi Berkas</span>
                  </button>
                </div>
              </div>

              {/* Status history info */}
              <div className="p-4 bg-blue-950/20 rounded-2xl border border-blue-900/40 text-xs space-y-1">
                <p><span className="text-slate-500">Status Saat Ini:</span> <strong className="text-[#E2E8F0] uppercase">{siswa.statusVerifikasi}</strong></p>
                <p><span className="text-slate-500">Tanggal Input Data:</span> <span className="text-slate-300">{siswa.tanggalInput}</span></p>
                <p><span className="text-slate-500">Terakhir Diperbarui:</span> <span className="text-slate-300">{siswa.tanggalUpdate}</span></p>
                {siswa.verifiedBy && (
                  <p><span className="text-slate-500">Diverifikasi oleh:</span> <strong className="text-blue-300">{siswa.verifiedBy} ({siswa.verifiedAt})</strong></p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AKUN & KREDENSIAL SISWA */}
          {activeTab === 'kredensial' && (
            <div className="space-y-5">
              {resetSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <div className="p-5 bg-[#0D1117] rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>Kredensial Akun Murid (Portal SiDiQ)</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    ID: {siswa.id}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Gunakan kredensial berikut untuk login mandiri murid ke dalam aplikasi SiDiQ Dapodik 2027 SMKN 1 Patrol.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username Box */}
                  <div className="bg-[#161B22] p-4 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Username / ID Login:</div>
                    <div className="text-base font-mono font-bold text-blue-300">
                      {siswa.username || siswa.nisn}
                    </div>
                    <p className="text-[10px] text-slate-500">Standar 10 digit NISN Dapodik</p>
                  </div>

                  {/* Password Box */}
                  <div className="bg-[#161B22] p-4 rounded-xl border border-slate-700/80 space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Password Akun:</div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="text-base font-mono font-bold text-emerald-300">
                      {showPassword 
                        ? (siswa.password || formatBirthdateToDDMMYYYY(siswa.tanggalLahir))
                        : '••••••••'}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Pola: Tanggal Lahir (DDMMYYYY) / Generator
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const u = siswa.username || siswa.nisn;
                      const p = siswa.password || formatBirthdateToDDMMYYYY(siswa.tanggalLahir);
                      const text = `Akun SiDiQ SMKN 1 PATROL:\nNama: ${siswa.nama}\nNISN: ${siswa.nisn}\nUsername: ${u}\nPassword: ${p}\nPortal: ${window.location.origin}`;
                      navigator.clipboard.writeText(text);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Kredensial Disalin!' : 'Salin Akun & Password'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const pass = resetStudentPassword(siswa.id);
                      setResetSuccess(`Password berhasil direset ke "${pass}" (Tanggal Lahir DDMMYYYY).`);
                      setTimeout(() => setResetSuccess(null), 3000);
                    }}
                    className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset Password ke Tanggal Lahir</span>
                  </button>

                  <a
                    href={createWaLink(
                      siswa.nomorHpSiswa || siswa.nomorHpOrtu,
                      `*KARTU AKSES MURID - SiDiQ 2027*\n*${config.namaSekolah}*\n\nYth. *${siswa.nama}* (${siswa.rombel})\n\nBerikut kredensial login portal Dapodik Anda:\n- *Username / NISN:* ${siswa.username || siswa.nisn}\n- *Password:* ${siswa.password || formatBirthdateToDDMMYYYY(siswa.tanggalLahir)}\n- *Link Portal:* ${window.location.origin}\n\nSalam,\nOperator: *${config.operatorDapodik}*`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Kirim Akun ke WA Murid</span>
                  </a>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: WHATSAPP BROADCAST / NOTIFIKASI */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-900/40 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Kirim Notifikasi & Pengumuman ke WhatsApp</span>
                </div>
                
                <p className="text-xs text-slate-300">
                  Tujuan Pengiriman: No. Murid <strong className="font-mono text-emerald-400">{siswa.nomorHpSiswa || '-'}</strong> | No. Ortu <strong className="font-mono text-emerald-400">{siswa.nomorHpOrtu || '-'}</strong>
                </p>

                {/* Quick Pre-formatted Message Template Buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Pilih Template Pesan Cepat:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    
                    <a
                      href={createWaLink(siswa.nomorHpSiswa || siswa.nomorHpOrtu, waVerificationMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-[#161B22] rounded-xl border border-emerald-800/60 hover:border-emerald-500 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <span className="font-bold text-xs text-[#E2E8F0] group-hover:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Pemberitahuan Status Verifikasi</span>
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {waVerificationMessage}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 mt-2 flex items-center gap-1">
                        <span>Buka Chat WA</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>

                    <a
                      href={createWaLink(siswa.nomorHpSiswa || siswa.nomorHpOrtu, waReminderMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-[#161B22] rounded-xl border border-amber-800/60 hover:border-amber-500 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <span className="font-bold text-xs text-[#E2E8F0] group-hover:text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pengingat Kelengkapan Berkas</span>
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {waReminderMessage}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-amber-400 mt-2 flex items-center gap-1">
                        <span>Buka Chat WA</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>

                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-[#0D1117] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(siswa);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data Murid</span>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-950/40 hover:bg-red-950/70 text-red-300 hover:text-red-200 border border-red-800/70 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Hapus Data</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        target={{ type: 'single', siswa }}
        onConfirmSingle={(id) => {
          onDelete(id);
          setIsDeleteModalOpen(false);
          onClose();
        }}
        onConfirmBatch={() => {}}
      />

      {/* Full Document Viewer Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-[#11141B] rounded-2xl max-w-2xl w-full p-4 space-y-3 border border-slate-800 text-[#E2E8F0]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-[#E2E8F0]">Pratinjau Dokumen</h4>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-[#0D1117] rounded-xl p-2 border border-slate-800">
              <img src={previewDocUrl} alt="Dokumen" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* QRIS Murid Modal */}
      {siswa && (
        <QrisMuridModal
          isOpen={isQrisModalOpen}
          onClose={() => setIsQrisModalOpen(false)}
          siswa={siswa}
          config={config}
        />
      )}

    </div>
  );
};
