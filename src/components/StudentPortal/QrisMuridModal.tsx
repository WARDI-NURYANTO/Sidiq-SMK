import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  School,
  CreditCard,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { SiswaDapodik, SekolahConfig } from '../../types/dapodik';
import { generateQrisMuridPayload, generateQrisQrCodeDataUrl } from '../../services/qrisService';

interface QrisMuridModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: SiswaDapodik;
  config: SekolahConfig;
}

export const QrisMuridModal: React.FC<QrisMuridModalProps> = ({
  isOpen,
  onClose,
  siswa,
  config
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && siswa) {
      generateQrisQrCodeDataUrl(siswa, config).then(url => setQrDataUrl(url));
    }
  }, [isOpen, siswa, config]);

  if (!isOpen || !siswa) return null;

  const nmid = `ID1024${config.npsn || '20216008'}${siswa.nisn || '0000000000'}`;
  const payload = generateQrisMuridPayload(siswa, config);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QRIS_MURID_${siswa.nama.replace(/\s+/g, '_')}_${siswa.nisn}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0D1117] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Top Header */}
        <div className="bg-[#161B22] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#E2E8F0] flex items-center gap-1.5">
                <span>QRIS Murid SMKN 1 Patrol</span>
                <span className="text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.2 rounded-sm">
                  DAPODIK 2027
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Standar Identitas & Pembayaran Digital Resmi Murid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: The Official QRIS Murid Visual Card */}
        <div className="p-6 space-y-5">
          
          <div 
            ref={cardRef}
            className="bg-white text-slate-900 rounded-2xl p-5 shadow-xl border border-slate-200 text-center relative overflow-hidden"
          >
            {/* Red & Grey Decorative Accent Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-slate-800"></div>

            {/* Official QRIS Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div className="text-left">
                <span className="inline-block font-black text-lg tracking-tighter text-red-600 font-sans leading-none">
                  QRIS
                </span>
                <span className="block text-[8px] font-bold tracking-tight text-slate-500 leading-tight uppercase">
                  National Standard
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm bg-red-600 text-white tracking-wider">
                  GPN
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm bg-slate-900 text-white tracking-wider">
                  DAPODIK
                </span>
              </div>
            </div>

            {/* School & Student Identity */}
            <div className="space-y-0.5 mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                {config.namaSekolah || 'SMKN 1 PATROL'}
              </h4>
              <p className="text-sm font-extrabold text-slate-900 uppercase">
                {siswa.nama}
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600 font-medium">
                <span>NISN: <strong className="font-mono text-slate-900">{siswa.nisn}</strong></span>
                <span>•</span>
                <span className="font-semibold text-blue-700">{siswa.rombel}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {siswa.jurusan}
              </p>
            </div>

            {/* Center QR Code */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 inline-block shadow-inner mx-auto relative group">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt={`QRIS Murid ${siswa.nama}`} 
                  className="w-48 h-48 mx-auto object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Membuat QR Code...
                </div>
              )}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                <span className="bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-xs">
                  Scan untuk Verifikasi
                </span>
              </div>
            </div>

            {/* NMID / Footer Info */}
            <div className="mt-3 pt-2 border-t border-slate-200 space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-600">
                NMID: <span className="text-slate-900">{nmid}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[9px] font-semibold text-emerald-700">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Terverifikasi Sistem Validasi Dapodik 2027</span>
              </div>
              <p className="text-[8px] text-slate-400 tracking-tight">
                Dicetak melalui SiDiQ SMKN 1 Patrol • T.A. {config.tahunAjaran}
              </p>
            </div>

          </div>

          {/* Feature details */}
          <div className="p-3 bg-[#161B22] rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-2 font-bold text-[#E2E8F0]">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Fungsi & Kegunaan QRIS Murid:</span>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-400 pl-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verifikasi Cepat & Presensi Digital Dapodik 2027</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pembayaran SPP, Iuran Praktik Kejuruan & Kantin Digital Sekolah</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Identitas resmi murid tersinkronisasi dengan database operator</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh QRIS (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPayload}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#161B22] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Salin Data QRIS</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#161B22] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Operator: <strong className="text-slate-200">{config.operatorDapodik}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
