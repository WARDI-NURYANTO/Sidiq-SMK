import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  QrCode, 
  Download, 
  Edit3, 
  School, 
  FileSpreadsheet, 
  UploadCloud, 
  User, 
  Lock, 
  FileText, 
  BadgeCheck, 
  Database,
  Calendar,
  MapPin,
  HeartHandshake,
  BookOpen,
  Sparkles,
  PhoneCall,
  Activity
} from 'lucide-react';
import { SiswaDapodik, SekolahConfig, StatusVerifikasi } from '../../types/dapodik';
import { exportSingleSiswaPdf } from '../../services/pdfExportService';
import { QrisMuridModal } from './QrisMuridModal';

interface StudentDatabaseViewProps {
  siswaList: SiswaDapodik[];
  config: SekolahConfig;
  currentSiswaId?: string;
  onSelectSiswa: (siswa: SiswaDapodik) => void;
  onEditSiswa?: (siswa: SiswaDapodik, step?: number) => void;
  loggedInNisn?: string;
  currentSiswa?: SiswaDapodik;
}

export const StudentDatabaseView: React.FC<StudentDatabaseViewProps> = ({
  siswaList,
  config,
  currentSiswaId,
  onSelectSiswa,
  onEditSiswa,
  loggedInNisn,
  currentSiswa: passedCurrentSiswa
}) => {
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);

  // Student is strictly the logged in student or the active student
  const student: SiswaDapodik | undefined = passedCurrentSiswa || 
    (loggedInNisn ? siswaList.find(s => s.nisn === loggedInNisn || s.nik === loggedInNisn) : undefined) ||
    siswaList.find(s => s.id === currentSiswaId) ||
    siswaList[0];

  if (!student) {
    return (
      <div className="bg-[#11141B] border border-slate-800 rounded-3xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <Database className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200">Data Database Dapodik Belum Tersedia</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Akun Anda belum tersinkronisasi dengan database Operator Dapodik. Silakan hubungi Operator Sekolah.
        </p>
      </div>
    );
  }

  const docs = student.dokumen || {};
  const docCount = [docs.fotoName, docs.kkName, docs.aktaName, docs.ijazahSklName, docs.kipPkhName, docs.ktpOrtuName].filter(Boolean).length;
  const docPercentage = Math.round((docCount / 6) * 100);

  const getStatusDisplay = (status?: StatusVerifikasi) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Terverifikasi & Valid di Database Pusat',
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle2,
          desc: 'Seluruh data biodata dan berkas telah diverifikasi valid oleh Operator Dapodik SMKN 1 Patrol.'
        };
      case 'revision_needed':
        return {
          label: 'Perlu Perbaikan Berkas / Data',
          bg: 'bg-red-500/10 text-red-300 border-red-500/30',
          icon: AlertTriangle,
          desc: student.catatanOperator || 'Terdapat beberapa isian atau dokumen yang perlu diperbaiki.'
        };
      case 'pending':
      default:
        return {
          label: 'Menunggu Verifikasi Operator Sekolah',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          icon: Clock,
          desc: 'Data Anda telah tersimpan di database lokal Dapodik 2027 dan menunggu antrean validasi.'
        };
    }
  };

  const statusInfo = getStatusDisplay(student.statusVerifikasi);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Privacy & Account Isolation Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-[#11141B] to-slate-900 border border-blue-800/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
                <Lock className="w-3 h-3 text-blue-400" />
                <span>Database Dapodik 2027 • Akses Privat Akun Murid</span>
              </span>
              <span className="text-xs text-slate-400">
                NPSN: <strong className="text-slate-200">{config.npsn}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#E2E8F0] tracking-tight flex items-center gap-2.5">
              <span>{student.nama}</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#0D1117] text-blue-400 border border-slate-700">
                NISN: {student.nisn}
              </span>
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Perlindungan Privasi:</strong> Data Dapodik ini bersifat pribadi dan hanya dapat diakses melalui akun murid Anda serta akun Operator Sekolah SMKN 1 Patrol.
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEditSiswa && onEditSiswa(student, 1)}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Data Mandiri (F-PD)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQrisModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-red-400" />
              <span>QRIS Murid</span>
            </button>

            <button
              type="button"
              onClick={() => exportSingleSiswaPdf(student, config)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-[#161B22] hover:bg-slate-800 border border-slate-700 text-[#E2E8F0] font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Cetak F-PD (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status & Registration Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Verification Status Card */}
        <div className="bg-[#11141B] rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Validasi Operator</span>
            <StatusIcon className="w-4 h-4 text-slate-400" />
          </div>
          <div className={`p-3 rounded-xl border text-xs ${statusInfo.bg}`}>
            <div className="font-extrabold text-sm mb-1">{statusInfo.label}</div>
            <p className="opacity-90 leading-relaxed text-[11px]">{statusInfo.desc}</p>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Operator: <strong>{config.operatorDapodik}</strong></span>
            <span>T.A. {config.tahunAjaran}</span>
          </div>
        </div>

        {/* Database Registration Profile Card */}
        <div className="bg-[#11141B] rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Entri Rombel & Jurusan</span>
            <School className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-black text-slate-100 text-base">{student.rombel}</div>
            <div className="text-blue-400 font-semibold text-xs">{student.jurusan}</div>
            <div className="text-slate-400 text-[11px] pt-1">Tingkat: <strong className="text-slate-200">Kelas {student.tingkatKelas}</strong> • Kurikulum Merdeka</div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Sekolah: <strong>{config.namaSekolah}</strong></span>
            <span>ID: <code className="font-mono text-[10px] text-slate-300">{student.id.slice(0, 10)}</code></span>
          </div>
        </div>

        {/* Uploaded Documents Progress Card */}
        <div className="bg-[#11141B] rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Berkas Dokumen Digital</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {docCount}/6 Berkas
            </span>
          </div>
          <div>
            <div className="w-full bg-[#0D1117] border border-slate-800 rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  docPercentage === 100 ? 'bg-emerald-500' : docPercentage >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                }`}
                style={{ width: `${docPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Kelengkapan Berkas: <strong>{docPercentage}%</strong></span>
              <button
                type="button"
                onClick={() => onEditSiswa && onEditSiswa(student, 6)}
                className="text-blue-400 hover:underline font-bold"
              >
                Upload / Cek Berkas →
              </button>
            </div>
          </div>
          <div className="pt-1 text-[10px] text-slate-500">
            KK, Akta, Ijazah SMP, Pas Foto, KIP/PKH, KTP Orang Tua
          </div>
        </div>

      </div>

      {/* Complete Data Entry Breakdown Table / Sections */}
      <div className="bg-[#11141B] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-[#E2E8F0] tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span>Rincian Entri Data Dapodik 2027 Anda</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh data berikut tersimpan secara terenkripsi dan sinkron dengan formulir F-PD Dapodik sekolah.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onEditSiswa && onEditSiswa(student, 1)}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Perbarui Biodata</span>
          </button>
        </div>

        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Section 1: Identitas Pribadi */}
          <div className="bg-[#0D1117] border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <User className="w-4 h-4" />
                <span>1. Identitas Pribadi Murid</span>
              </span>
              <button
                type="button"
                onClick={() => onEditSiswa && onEditSiswa(student, 1)}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Ubah
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-slate-500 text-[11px] block">Nama Lengkap:</span>
                <span className="font-bold text-slate-200">{student.nama}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Jenis Kelamin:</span>
                <span className="font-semibold text-slate-200">{student.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">NISN (10 Digit):</span>
                <span className="font-mono font-bold text-emerald-400">{student.nisn}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">NIK (16 Digit):</span>
                <span className="font-mono font-semibold text-slate-200">{student.nik || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Tempat, Tanggal Lahir:</span>
                <span className="text-slate-200">{student.tempatLahir}, {student.tanggalLahir}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">No. Registrasi Akta:</span>
                <span className="font-mono text-slate-300">{student.noRegistrasiAkta || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Agama & Kepercayaan:</span>
                <span className="text-slate-200">{student.agama || 'Islam'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Kewarganegaraan:</span>
                <span className="text-slate-200">{student.kewarganegaraan || 'Indonesia (WNI)'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Alamat Tempat Tinggal */}
          <div className="bg-[#0D1117] border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <MapPin className="w-4 h-4" />
                <span>2. Alamat Tempat Tinggal</span>
              </span>
              <button
                type="button"
                onClick={() => onEditSiswa && onEditSiswa(student, 2)}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Ubah
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2">
                <span className="text-slate-500 text-[11px] block">Alamat Jalan & Dusun:</span>
                <span className="font-semibold text-slate-200">{student.alamatJalan || '-'} {student.namaDusun ? `(Dusun ${student.namaDusun})` : ''}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">RT / RW:</span>
                <span className="font-mono text-slate-200">{student.rt || '00'}/{student.rw || '00'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Desa / Kelurahan:</span>
                <span className="font-semibold text-slate-200">{student.desaKelurahan || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Kecamatan:</span>
                <span className="text-slate-200">{student.kecamatan || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Kabupaten / Kota:</span>
                <span className="text-slate-200">{student.kabupatenKota || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Tempat Tinggal:</span>
                <span className="text-slate-200">{student.tempatTinggal || 'Bersama Orang Tua'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Moda Transportasi:</span>
                <span className="text-slate-200">{student.modaTransportasi || 'Sepeda Motor'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Data Orang Tua & Wali */}
          <div className="bg-[#0D1117] border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <HeartHandshake className="w-4 h-4" />
                <span>3. Data Orang Tua / Wali</span>
              </span>
              <button
                type="button"
                onClick={() => onEditSiswa && onEditSiswa(student, 4)}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Ubah
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-slate-500 text-[11px] block">Nama Ibu Kandung:</span>
                <span className="font-bold text-slate-200">{student.namaIbuKandung || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Pekerjaan Ibu:</span>
                <span className="text-slate-200">{student.pekerjaanIbu || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Nama Ayah Kandung:</span>
                <span className="font-bold text-slate-200">{student.namaAyah || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Pekerjaan Ayah:</span>
                <span className="text-slate-200">{student.pekerjaanAyah || '-'}</span>
              </div>

              {/* Data Wali (Opsional) */}
              <div className="col-span-2 pt-1 border-t border-slate-800/60">
                <span className="text-slate-500 text-[11px] block">Wali Murid (Opsional):</span>
                {student.mempunyaiWali === 'Ya' && student.namaWali ? (
                  <div className="text-emerald-400 font-semibold mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>{student.namaWali}</span>
                    <span className="text-xs text-slate-400">({student.hubunganWali || 'Wali'} • {student.pekerjaanWali || 'Wiraswasta'})</span>
                    {student.nomorHpWali && (
                      <span className="text-xs font-mono text-emerald-300">WA: {student.nomorHpWali}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Tidak ada (Tinggal bersama orang tua)</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">No. Kartu Keluarga (KK):</span>
                <span className="font-mono text-slate-200">{student.noKk || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Nomor WhatsApp Ortu:</span>
                <span className="font-mono font-bold text-emerald-400">{student.nomorHpOrtu || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Data Periodik & Riwayat Sekolah */}
          <div className="bg-[#0D1117] border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Activity className="w-4 h-4" />
                <span>4. Data Periodik & Kesejahteraan</span>
              </span>
              <button
                type="button"
                onClick={() => onEditSiswa && onEditSiswa(student, 5)}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Ubah
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-slate-500 text-[11px] block">Tinggi / Berat Badan:</span>
                <span className="text-slate-200 font-semibold">{student.tinggiBadan || '-'} cm / {student.beratBadan || '-'} kg</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Jarak ke SMKN 1 Patrol:</span>
                <span className="text-slate-200 font-semibold">{student.jarakKeSekolahKm || '1'} km ({student.waktuTempuhMenit || '10'} menit)</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Sekolah Asal SMP/MTs:</span>
                <span className="text-slate-200">{student.sekolahAsalSmp || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Penerima KIP / PIP:</span>
                <span className={`font-bold ${student.punyaKip === 'Ya' ? 'text-amber-400' : 'text-slate-400'}`}>
                  {student.punyaKip === 'Ya' ? `Ya (No: ${student.nomorKip || '-'})` : 'Tidak'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Anak Ke / Jml Saudara:</span>
                <span className="text-slate-200">Anak ke-{student.anakKe || 1} dari {student.jumlahSaudaraKandung || 1} bersaudara</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">No. HP / Kontak Murid:</span>
                <span className="font-mono font-bold text-emerald-400">{student.nomorHpSiswa || '-'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* QRIS Modal */}
      {student && (
        <QrisMuridModal
          isOpen={isQrisModalOpen}
          onClose={() => setIsQrisModalOpen(false)}
          siswa={student}
          config={config}
        />
      )}

    </div>
  );
};
