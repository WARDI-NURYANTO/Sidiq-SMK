import React, { useState } from 'react';
import { 
  X, 
  Megaphone, 
  MessageCircle, 
  Send, 
  Share2, 
  Trash2, 
  CheckCircle2, 
  Calendar,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { PengumumanSekolah, SekolahConfig, JurusanSMK } from '../../types/dapodik';
import { JURUSAN_LIST } from '../../data/initialData';
import { generateWaBroadcastPengumuman } from '../../services/whatsappService';

interface AnnouncementManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: PengumumanSekolah[];
  config: SekolahConfig;
  onAddAnnouncement: (item: Omit<PengumumanSekolah, 'id' | 'tanggal'>) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const AnnouncementManagerModal: React.FC<AnnouncementManagerModalProps> = ({
  isOpen,
  onClose,
  announcements,
  config,
  onAddAnnouncement,
  onDeleteAnnouncement
}) => {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [kategori, setKategori] = useState<PengumumanSekolah['kategori']>('Penting');
  const [ditujukanUntuk, setDitujukanUntuk] = useState<PengumumanSekolah['ditujukanUntuk']>('Semua Murid');
  const [targetJurusan, setTargetJurusan] = useState<string>('');
  const [pinToTop, setPinToTop] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) {
      alert('Judul dan isi pengumuman wajib diisi!');
      return;
    }

    onAddAnnouncement({
      judul: judul.trim(),
      isi: isi.trim(),
      kategori,
      ditujukanUntuk,
      targetJurusan: ditujukanUntuk === 'Jurusan Tertentu' ? targetJurusan : undefined,
      kirimKeWa: true,
      pinToTop
    });

    // Reset form
    setJudul('');
    setIsi('');
    alert('Pengumuman berhasil diterbitkan dan disiarkan ke notifikasi murid!');
  };

  const handleCopyWaText = (ann: PengumumanSekolah) => {
    const text = generateWaBroadcastPengumuman(ann, config);
    navigator.clipboard.writeText(text);
    setCopiedId(ann.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#11141B] w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-800 text-[#E2E8F0] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#E2E8F0]">
                Pusat Pengumuman & Broadcast WhatsApp
              </h3>
              <p className="text-xs text-slate-400">
                Kirim notifikasi in-app ke murid & broadcast pesan resmi ke grup WA
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

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Create Announcement Form */}
          <form onSubmit={handleSubmit} className="p-5 bg-[#0D1117] rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-[#E2E8F0] flex items-center gap-1.5">
              <span>+ Buat Pengumuman Baru</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Judul Pengumuman <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 📢 Batas Akhir Upload Scan KK & Akta Kelahiran Dapodik 2027"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#161B22] border border-slate-800 rounded-xl text-[#E2E8F0] placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Kategori</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#161B22] border border-slate-800 rounded-xl text-slate-200"
                >
                  <option value="Jadwal Dapodik">Jadwal Dapodik</option>
                  <option value="Verifikasi Berkas">Verifikasi Berkas</option>
                  <option value="PIP / KIP">PIP / KIP</option>
                  <option value="Penting">Penting</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Sasaran Murid</label>
                <select
                  value={ditujukanUntuk}
                  onChange={(e) => setDitujukanUntuk(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#161B22] border border-slate-800 rounded-xl text-slate-200"
                >
                  <option value="Semua Murid">Semua Murid</option>
                  <option value="Jurusan Tertentu">Jurusan Tertentu</option>
                  <option value="Murid Belum Lengkap">Murid Belum Lengkap</option>
                  <option value="Penerima KIP">Penerima KIP</option>
                </select>
              </div>
            </div>

            {ditujukanUntuk === 'Jurusan Tertentu' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Pilih Jurusan Sasaran:</label>
                <select
                  value={targetJurusan}
                  onChange={(e) => setTargetJurusan(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#161B22] border border-slate-800 rounded-xl text-slate-200"
                >
                  <option value="">-- Pilih Jurusan --</option>
                  {JURUSAN_LIST.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Isi Pengumuman / Pesan Lengkap <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Tuliskan detail pengumuman secara jelas untuk dibaca di aplikasi murid dan dikirimkan via WhatsApp..."
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                className="w-full p-3 text-xs bg-[#161B22] border border-slate-800 rounded-xl text-[#E2E8F0] placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinToTop}
                  onChange={(e) => setPinToTop(e.target.checked)}
                  className="rounded bg-[#161B22] border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Sematkan di Atas (Pin to Top)</span>
              </label>

              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Terbitkan Pengumuman</span>
              </button>
            </div>
          </form>

          {/* List of Active Announcements */}
          <div>
            <h4 className="font-bold text-sm text-[#E2E8F0] mb-3">Daftar Pengumuman Aktif ({announcements.length})</h4>
            
            <div className="space-y-3">
              {announcements.map((ann) => {
                const waText = generateWaBroadcastPengumuman(ann, config);
                const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;

                return (
                  <div key={ann.id} className="p-4 bg-[#161B22] rounded-2xl border border-slate-800 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {ann.kategori}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ann.tanggal}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteAnnouncement(ann.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h5 className="font-bold text-[#E2E8F0] text-xs sm:text-sm">{ann.judul}</h5>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{ann.isi}</p>

                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Sasaran: <strong className="text-slate-200">{ann.ditujukanUntuk}</strong>
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyWaText(ann)}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                        >
                          {copiedId === ann.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === ann.id ? 'Tersalin!' : 'Salin Format WA'}</span>
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Kirim ke Grup WA</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
