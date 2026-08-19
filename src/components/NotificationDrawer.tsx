import React from 'react';
import { 
  Bell, 
  X, 
  Megaphone, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  MessageCircle 
} from 'lucide-react';
import { PengumumanSekolah, SekolahConfig } from '../types/dapodik';
import { createWaLink, generateWaBroadcastPengumuman } from '../services/whatsappService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: PengumumanSekolah[];
  config: SekolahConfig;
  userRole: 'siswa' | 'operator';
  onAddAnnouncementClick?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  announcements,
  config,
  userRole,
  onAddAnnouncementClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#11141B] shadow-2xl flex flex-col border-l border-slate-800 text-[#E2E8F0]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#E2E8F0]">Pusat Pemberitahuan</h2>
                <p className="text-xs text-slate-400">
                  Pengumuman Resmi & Notifikasi Dapodik 2027
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Announcements list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {userRole === 'operator' && onAddAnnouncementClick && (
              <button
                onClick={onAddAnnouncementClick}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 text-blue-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Megaphone className="w-4 h-4" />
                <span>+ Buat Pengumuman Baru & Broadcast WA</span>
              </button>
            )}

            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">Belum ada pengumuman baru</p>
                <p className="text-xs text-slate-500 mt-1">Semua info resmi Dapodik akan tampil di sini.</p>
              </div>
            ) : (
              announcements.map((item) => {
                const waMessage = generateWaBroadcastPengumuman(item, config);
                const waShareUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

                const getCategoryBadge = () => {
                  switch (item.kategori) {
                    case 'Jadwal Dapodik':
                      return 'bg-red-500/10 text-red-400 border-red-500/30';
                    case 'PIP / KIP':
                      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                    case 'Verifikasi Berkas':
                      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                    default:
                      return 'bg-slate-800 text-slate-300 border-slate-700';
                  }
                };

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.pinToTop
                        ? 'bg-blue-950/30 border-blue-500/40 ring-1 ring-blue-500/20'
                        : 'bg-[#161B22] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadge()}`}>
                        {item.kategori}
                      </span>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{item.tanggal}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-[#E2E8F0] text-sm mb-1.5 leading-snug">
                      {item.judul}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                      {item.isi}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Sasaran: <strong className="text-slate-200">{item.ditujukanUntuk}</strong>
                      </span>

                      <a
                        href={waShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg transition-colors border border-emerald-500/30 text-[11px]"
                        title="Bagikan pengumuman ini ke WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                        <span>Share WA</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer help */}
          <div className="p-4 bg-[#0D1117] border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="font-medium">Kontak Operator Sekolah:</span>
              <a
                href={createWaLink(config.telepon, `Halo Operator ${config.namaSekolah}, saya ingin bertanya mengenai pendataan Dapodik 2027.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-blue-400 font-bold hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chat WA Operator</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
