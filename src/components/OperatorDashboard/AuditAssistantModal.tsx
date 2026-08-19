import React from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  UserX, 
  FileWarning, 
  PhoneOff, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SiswaDapodik } from '../../types/dapodik';

interface AuditAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswaList?: SiswaDapodik[];
  onSelectSiswa: (siswa: SiswaDapodik) => void;
}

export interface AnomaliItem {
  id: string;
  siswa: SiswaDapodik;
  tipe: 'nik_invalid' | 'nisn_invalid' | 'missing_docs' | 'missing_mother' | 'missing_phone';
  pesan: string;
  severity: 'high' | 'medium';
}

export const AuditAssistantModal: React.FC<AuditAssistantModalProps> = ({
  isOpen,
  onClose,
  siswaList = [],
  onSelectSiswa
}) => {
  if (!isOpen) return null;

  // Run validation audits
  const anomalies: AnomaliItem[] = [];

  siswaList.forEach((s) => {
    // 1. NIK check (must be 16 digits)
    if (!s.nik || s.nik.length !== 16) {
      anomalies.push({
        id: `${s.id}-nik`,
        siswa: s,
        tipe: 'nik_invalid',
        pesan: `NIK "${s.nik || 'kosong'}" tidak valid (harus 16 digit).`,
        severity: 'high'
      });
    }

    // 2. NISN check (must be 10 digits)
    if (!s.nisn || s.nisn.length !== 10) {
      anomalies.push({
        id: `${s.id}-nisn`,
        siswa: s,
        tipe: 'nisn_invalid',
        pesan: `NISN "${s.nisn || 'kosong'}" tidak valid (harus 10 digit).`,
        severity: 'high'
      });
    }

    // 3. Mandatory documents check
    const docs = s.dokumen || {};
    const missingDocs: string[] = [];
    if (!docs.fotoName && !docs.foto) missingDocs.push('Pas Foto');
    if (!docs.kkName && !docs.kk) missingDocs.push('Kartu Keluarga');
    if (!docs.aktaName && !docs.akta) missingDocs.push('Akta Kelahiran');

    if (missingDocs.length > 0) {
      anomalies.push({
        id: `${s.id}-docs`,
        siswa: s,
        tipe: 'missing_docs',
        pesan: `Dokumen wajib belum diunggah: ${missingDocs.join(', ')}.`,
        severity: 'medium'
      });
    }

    // 4. Mother name check (mandatory for Dapodik)
    if (!s.namaIbuKandung || !s.namaIbuKandung.trim()) {
      anomalies.push({
        id: `${s.id}-mother`,
        siswa: s,
        tipe: 'missing_mother',
        pesan: 'Nama Ibu Kandung belum terisi (Wajib Dapodik).',
        severity: 'high'
      });
    }

    // 5. Phone check
    if (!s.nomorHpSiswa && !s.nomorHpOrtu) {
      anomalies.push({
        id: `${s.id}-phone`,
        siswa: s,
        tipe: 'missing_phone',
        pesan: 'Nomor WhatsApp Murid / Orang Tua belum terisi.',
        severity: 'medium'
      });
    }
  });

  const highCount = anomalies.filter(a => a.severity === 'high').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#11141B] w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-800 text-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#E2E8F0]">
                Asisten Audit Data Dapodik 2027
              </h3>
              <p className="text-xs text-slate-400">
                Pemeriksa otomatis anomali NIK, NISN, nama ibu & kelengkapan dokumen murid
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary banner */}
        <div className="p-5 bg-[#0D1117] border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#161B22] rounded-xl border border-slate-800 shadow-2xs">
              <span className="text-slate-400 block">Total Data Diperiksa</span>
              <strong className="text-base text-[#E2E8F0]">{siswaList.length} Murid</strong>
            </div>
            <div className="p-3 bg-red-950/30 rounded-xl border border-red-900/50 shadow-2xs">
              <span className="text-red-300 font-semibold block">Anomali Kritis (High)</span>
              <strong className="text-base text-red-400">{highCount} Isu</strong>
            </div>
            <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-900/50 shadow-2xs">
              <span className="text-amber-300 font-semibold block">Perhatian (Medium)</span>
              <strong className="text-base text-amber-400">{anomalies.length - highCount} Isu</strong>
            </div>
          </div>
        </div>

        {/* Anomalies List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {anomalies.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-bold text-[#E2E8F0] text-sm">Semua Data Murid Valid!</h4>
              <p className="text-xs text-slate-400 mt-1">Tidak ditemukan anomali NIK, NISN, atau berkas wajib yang kosong.</p>
            </div>
          ) : (
            anomalies.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  item.severity === 'high'
                    ? 'bg-red-950/20 border-red-900/40 hover:border-red-700/60'
                    : 'bg-amber-950/20 border-amber-900/40 hover:border-amber-700/60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {item.severity === 'high' ? (
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <FileWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-[#E2E8F0] text-xs sm:text-sm">
                        {item.siswa.nama}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                        {item.siswa.rombel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{item.pesan}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onSelectSiswa(item.siswa);
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
                >
                  <span>Periksa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-[#0D1117] border-t border-slate-800 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
