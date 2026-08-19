import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, Trash2, Eye, Camera, AlertCircle } from 'lucide-react';

interface DocumentUploadCardProps {
  id: string;
  title: string;
  description: string;
  required?: boolean;
  acceptedTypes?: string;
  fileData?: string; // base64
  fileName?: string;
  onFileSelect: (base64: string, name: string) => void;
  onFileRemove: () => void;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  id,
  title,
  description,
  required = false,
  acceptedTypes = 'image/jpeg,image/png,image/webp,application/pdf',
  fileData,
  fileName,
  onFileSelect,
  onFileRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleProcessFile = (file: File) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 5 MB per dokumen.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onFileSelect(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const isImage = fileData?.startsWith('data:image/') || fileName?.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = fileData?.startsWith('data:application/pdf') || fileName?.match(/\.pdf$/i);

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      fileData 
        ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20' 
        : isDragging 
        ? 'bg-blue-500/10 border-blue-500 border-dashed'
        : 'bg-[#0D1117] border-slate-800 hover:border-slate-700'
    }`}>
      
      {/* Title & Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-[#E2E8F0] text-sm">{title}</h4>
            {required ? (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                Wajib
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                Opsional
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>

        {fileData ? (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terunggah</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700 shrink-0">
            <span>Belum ada</span>
          </span>
        )}
      </div>

      {/* Hidden file input */}
      <input
        id={id}
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Uploader Box or File Preview */}
      {!fileData ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#11141B]/80 hover:bg-blue-600/10 group"
        >
          <UploadCloud className="w-8 h-8 mx-auto text-slate-500 group-hover:text-blue-400 transition-colors mb-1.5" />
          <p className="text-xs font-semibold text-slate-300 group-hover:text-blue-300">
            Klik atau Tarik Berkas ke Sini
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Format JPG, PNG, PDF (Maks. 5 MB)
          </p>
        </div>
      ) : (
        <div className="mt-2 p-3 bg-[#161B22] rounded-lg border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            {isImage ? (
              <img
                src={fileData}
                alt={title}
                className="w-10 h-10 rounded-md object-cover border border-slate-700 shrink-0 bg-[#0D1117]"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}
            
            <div className="truncate">
              <p className="text-xs font-bold text-slate-200 truncate" title={fileName}>
                {fileName || 'Dokumen Terunggah'}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">Siap disinkronkan ke Dapodik</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {isImage && (
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                title="Lihat Pratinjau Foto"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onFileRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Hapus / Unggah Ulang"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && fileData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#11141B] border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-[#E2E8F0]">{title} - Pratinjau</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-[#161B22] border border-slate-700 rounded-md"
              >
                Tutup
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-[#0D1117] rounded-xl my-3 max-h-96 overflow-auto border border-slate-800">
              <img src={fileData} alt={title} className="max-h-80 rounded-lg object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
