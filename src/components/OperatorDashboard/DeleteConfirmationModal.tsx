import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  User, 
  CheckCircle2, 
  ShieldAlert, 
  Users,
  AlertCircle
} from 'lucide-react';
import { SiswaDapodik } from '../../types/dapodik';

export interface DeleteModalTarget {
  type: 'single' | 'batch' | 'all';
  siswa?: SiswaDapodik;
  students?: SiswaDapodik[];
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: DeleteModalTarget | null;
  onConfirmSingle: (id: string) => void;
  onConfirmBatch: (ids: string[]) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirmSingle,
  onConfirmBatch
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !target) return null;

  const isSingle = target.type === 'single' && target.siswa;
  const isBatch = target.type === 'batch' && target.students && target.students.length > 0;
  const count = isSingle ? 1 : (target.students?.length || 0);

  const handleConfirm = () => {
    setIsDeleting(true);
    setTimeout(() => {
      if (isSingle && target.siswa) {
        onConfirmSingle(target.siswa.id);
      } else if (isBatch && target.students) {
        onConfirmBatch(target.students.map(s => s.id));
      }
      setIsDeleting(false);
      onClose();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#11141B] w-full max-w-lg rounded-3xl shadow-2xl border border-red-900/50 text-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header Warning */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-4 sm:p-5 flex items-center justify-between border-b border-red-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {isSingle ? 'Hapus Data Murid' : `Hapus ${count} Data Murid Terpilih`}
              </h3>
              <p className="text-[11px] sm:text-xs text-red-300/90 font-medium">
                Konfirmasi penghapusan data Dapodik
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Warning Banner */}
          <div className="p-3.5 bg-red-950/30 border border-red-900/50 rounded-2xl flex items-start space-x-3 text-red-200">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-red-300">
                Peringatan: Tindakan ini bersifat permanen!
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Data murid, kelengkapan berkas yang diunggah, dan akun login yang bersangkutan akan dihapus dari sistem pendataan Dapodik SMKN 1 Patrol.
              </p>
            </div>
          </div>

          {/* Single Student Card */}
          {isSingle && target.siswa && (
            <div className="p-3.5 bg-[#0A0C10] border border-slate-800 rounded-2xl flex items-center space-x-3.5">
              <div className="w-12 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {target.siswa.dokumen?.foto ? (
                  <img 
                    src={target.siswa.dokumen.foto} 
                    alt={target.siswa.nama} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-white truncate">
                  {target.siswa.nama}
                </h4>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-400 mt-1">
                  <span>NISN: <strong className="font-mono text-slate-200">{target.siswa.nisn}</strong></span>
                  <span>•</span>
                  <span>Rombel: <strong className="text-blue-300">{target.siswa.rombel}</strong></span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {target.siswa.jurusan}
                </p>
              </div>
            </div>
          )}

          {/* Batch Students List */}
          {isBatch && target.students && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Daftar {count} Murid yang akan dihapus:</span>
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-[#0A0C10] border border-slate-800 rounded-2xl divide-y divide-slate-800/60">
                {target.students.map((s, idx) => (
                  <div key={s.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2 px-2 py-1 text-[11px]">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-slate-400 font-mono w-5 shrink-0 text-center">{idx + 1}.</span>
                      <span className="font-bold text-slate-200 truncate">{s.nama}</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 text-slate-400 font-mono text-[10px]">
                      <span>{s.rombel}</span>
                      <span className="text-slate-400">({s.nisn})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons - Fully Responsive */}
        <div className="p-4 sm:p-5 bg-[#0D1117] border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700 flex items-center justify-center cursor-pointer active:scale-98"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>
              {isSingle ? 'Ya, Hapus Data Murid Ini' : `Ya, Hapus ${count} Murid Terpilih`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
