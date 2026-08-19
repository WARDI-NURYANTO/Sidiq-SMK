import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { X, UploadCloud, Download, FileSpreadsheet, CheckCircle2, ShieldCheck, Database, Globe } from 'lucide-react';
import { SiswaDapodik } from '../../types/dapodik';
import { downloadTemplateExcel } from '../../services/excelExportService';
import { normalizeJurusan } from '../../services/storageService';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedStudents: Partial<SiswaDapodik>[]) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedList, setParsedList] = useState<Partial<SiswaDapodik>[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (!data || data.length === 0) {
          setImportError('File Excel kosong atau format sheet tidak terbaca.');
          setIsProcessing(false);
          return;
        }

        const mapped: Partial<SiswaDapodik>[] = data.map((row, idx) => ({
          id: `siswa-imp-${Date.now()}-${idx}`,
          nama: String(row['Nama Murid'] || row['Nama Siswa'] || row['Nama'] || row['NAMA'] || 'MURID BARU').toUpperCase().trim(),
          jenisKelamin: (row['Jenis Kelamin (L/P)'] || row['JK'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
          nisn: String(row['NISN'] || row['nisn'] || '').trim(),
          nik: String(row['NIK / No. KTP'] || row['NIK'] || '').trim(),
          noKk: String(row['No. KK'] || row['KK'] || '').trim(),
          tempatLahir: String(row['Tempat Lahir'] || 'Indramayu'),
          tanggalLahir: String(row['Tanggal Lahir (YYYY-MM-DD)'] || row['Tgl Lahir'] || '2008-01-01'),
          jurusan: normalizeJurusan(row['Jurusan / Keahlian'] || row['Jurusan'] || row['Program Keahlian']),
          tingkatKelas: row['Tingkat'] || 'X',
          rombel: (row['Rombel'] || 'X TJKT 1').replace(/\bTKJ\b/g, 'TJKT'),
          namaIbuKandung: row['Nama Ibu Kandung'] || row['Nama Ibu'] || 'Ibu Murid',
          namaAyah: row['Nama Ayah Kandung'] || row['Nama Ayah'] || '',
          alamatJalan: row['Alamat Jalan'] || row['Alamat'] || 'Desa Patrol',
          desaKelurahan: row['Kelurahan / Desa'] || 'Patrol',
          kecamatan: row['Kecamatan'] || 'Patrol',
          kabupatenKota: row['Kabupaten / Kota'] || 'Kabupaten Indramayu',
          nomorHpSiswa: String(row['No. HP Murid'] || row['No. HP Siswa'] || row['HP'] || ''),
          nomorHpOrtu: String(row['No. HP / WA Orang Tua'] || ''),
          punyaKip: row['Punya KIP (Ya/Tidak)'] === 'Ya' ? 'Ya' : 'Tidak',
          statusVerifikasi: 'pending'
        }));

        setParsedList(mapped);
      } catch (err) {
        setImportError('Gagal membaca file Excel/CSV! Pastikan format file sesuai dengan template Dapodik SMKN 1 Patrol.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (parsedList.length === 0) return;
    onImportSuccess(parsedList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#11141B] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-800 text-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#E2E8F0]">
                Upload Master Database Murid (Excel / CSV)
              </h3>
              <p className="text-xs text-slate-400">
                Otorisasi Khusus Administrator • Sinkronisasi Otomatis Server & Akun Murid
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Admin Authority & Multi-Device Sync Notice */}
          <div className="p-4 bg-emerald-950/25 rounded-2xl border border-emerald-800/40 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Otoritas Tunggal Administrator (wardinuryanto73@admin.smk.belajar.id)</span>
            </div>
            <div className="flex items-start space-x-2 text-[11px] text-slate-300">
              <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Data murid yang Anda unggah di sini akan <strong>tersimpan permanen di database pusat server</strong> dan langsung tersinkronisasi secara otomatis saat aplikasi di-deploy, sehingga akun murid dan data di dashboard operator langsung muncul di semua perangkat (komputer admin maupun HP murid).
              </p>
            </div>
          </div>

          {/* Template Download Box */}
          <div className="p-4 bg-blue-950/30 rounded-2xl border border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[#E2E8F0] text-sm">Unduh Format Template Excel</p>
              <p className="text-slate-400 text-xs mt-0.5">Format standar Dapodik 2027 SMKN 1 Patrol (NISN, NIK, Rombel, Jurusan, Ortu, KIP).</p>
            </div>
            <button
              onClick={downloadTemplateExcel}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl border border-slate-700 shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-[#0D1117] hover:bg-blue-950/20 transition-all group"
          >
            <UploadCloud className="w-10 h-10 mx-auto text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" />
            <p className="font-bold text-[#E2E8F0] text-sm">Pilih File Excel / CSV (.xlsx, .xls, .csv)</p>
            <p className="text-slate-400 text-xs mt-0.5">Klik untuk memilih berkas basis data murid dari komputer Anda</p>
          </div>

          {isProcessing && (
            <div className="p-3 text-center text-blue-400 bg-blue-950/20 rounded-xl font-medium animate-pulse">
              Sedang memproses dan memvalidasi struktur data murid...
            </div>
          )}

          {importError && (
            <div className="p-3 text-red-300 bg-red-950/30 border border-red-900/50 rounded-xl font-medium">
              {importError}
            </div>
          )}

          {/* Preview of Parsed Data */}
          {parsedList.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#E2E8F0] text-sm flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Pratinjau: {parsedList.length} Murid Terdeteksi</span>
                </span>
                <span className="text-emerald-300 font-bold bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[10px]">
                  File: {fileName}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-800 bg-[#0D1117]">
                {parsedList.slice(0, 10).map((s, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-[#E2E8F0]">{s.nama}</strong>
                      <span className="text-slate-400 ml-2 font-mono">NISN: {s.nisn || '-'} | {s.rombel}</span>
                    </div>
                    <span className="text-blue-400 font-semibold">{s.jurusan?.split('(')[1]?.replace(')', '') || s.jurusan}</span>
                  </div>
                ))}
                {parsedList.length > 10 && (
                  <div className="p-2 text-center text-slate-400 text-[11px] font-medium bg-[#161B22]">
                    ... dan {parsedList.length - 10} murid lainnya siap disinkronkan ke server
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        <div className="p-4 bg-[#0D1117] border-t border-slate-800 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200 font-bold text-xs cursor-pointer">
            Batal
          </button>

          {parsedList.length > 0 && (
            <button
              onClick={handleConfirmImport}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Sinkronkan {parsedList.length} Murid ke Server</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
