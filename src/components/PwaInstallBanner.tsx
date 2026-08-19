import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, Apple, Share2, PlusSquare, ArrowRight, X } from 'lucide-react';

interface PwaInstallBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ isOpen, onClose }) => {
  const [platformTab, setPlatformTab] = useState<'android' | 'ios'>('android');
  const [installedSimulation, setInstalledSimulation] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#11141B] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 text-[#E2E8F0] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 relative border-b border-slate-800">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 backdrop-blur-xs">
              <Smartphone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider mb-1">
                Progressive Web App (PWA)
              </span>
              <h2 className="text-lg font-bold text-[#E2E8F0]">Instal SiDiQ di Smartphone Murid</h2>
              <p className="text-xs text-slate-400">
                Akses cepat, ringan & bisa diisi offline langsung dari layar utama HP
              </p>
            </div>
          </div>
        </div>

        {/* Platform Switcher */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0D1117] rounded-xl mb-4 text-xs font-semibold border border-slate-800">
            <button
              onClick={() => setPlatformTab('android')}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
                platformTab === 'android'
                  ? 'bg-blue-600 text-white shadow-xs border border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Android (Google Chrome)</span>
            </button>

            <button
              onClick={() => setPlatformTab('ios')}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
                platformTab === 'ios'
                  ? 'bg-blue-600 text-white shadow-xs border border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Apple className="w-4 h-4 text-slate-200" />
              <span>iPhone / iPad (Safari)</span>
            </button>
          </div>

          {/* Android Step by Step */}
          {platformTab === 'android' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start space-x-3 p-3 bg-[#161B22] rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-500/30">
                  1
                </span>
                <div>
                  <p className="font-semibold text-[#E2E8F0]">Buka di Browser Google Chrome</p>
                  <p className="text-slate-400 mt-0.5">Buka tautan website SiDiQ SMKN 1 Patrol melalui aplikasi Chrome di HP Android Anda.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[#161B22] rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-500/30">
                  2
                </span>
                <div>
                  <p className="font-semibold text-[#E2E8F0]">Tekan Menu Titik Tiga (⋮) di Pojok Kanan Atas</p>
                  <p className="text-slate-400 mt-0.5">Pilih opsi <strong className="text-slate-200 font-semibold">"Instal aplikasi"</strong> atau <strong className="text-slate-200 font-semibold">"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[#161B22] rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-500/30">
                  3
                </span>
                <div>
                  <p className="font-semibold text-[#E2E8F0]">Konfirmasi Instalasi</p>
                  <p className="text-slate-400 mt-0.5">Klik <strong className="text-slate-200 font-semibold">"Instal"</strong>. Ikon SiDiQ 2027 akan otomatis muncul di menu aplikasi HP Anda seperti aplikasi native.</p>
                </div>
              </div>
            </div>
          )}

          {/* iOS Step by Step */}
          {platformTab === 'ios' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start space-x-3 p-3 bg-[#161B22] rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs border border-indigo-500/30">
                  1
                </span>
                <div>
                  <p className="font-semibold text-[#E2E8F0]">Buka Melalui Safari di iPhone / iPad</p>
                  <p className="text-slate-400 mt-0.5">Pastikan membuka tautan ini menggunakan browser bawaan Safari.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[#161B22] rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs border border-indigo-500/30">
                  2
                </span>
                <div>
                  <p className="font-semibold text-[#E2E8F0] flex items-center gap-1.5">
                    <span>Tekan Tombol Bagikan</span>
                    <Share2 className="w-3.5 h-3.5 text-blue-400 inline" />
                  </p>
                  <p className="text-slate-400 mt-0.5">Ketuk ikon bagikan (kotak dengan panah ke atas) di bagian bawah layar Safari.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[#161B22] rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs border border-indigo-500/30">
                  3
                </span>
                <div>
                  <p className="font-semibold text-[#E2E8F0] flex items-center gap-1.5">
                    <span>Pilih "Tambah ke Layar Utama"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-slate-200 inline" />
                  </p>
                  <p className="text-slate-400 mt-0.5">Gulir ke bawah dan ketuk opsi <strong className="text-slate-200 font-semibold">"Tambah ke Layar Utama" (Add to Home Screen)</strong> lalu tekan <strong className="text-slate-200 font-semibold">"Tambah"</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Simulation CTA */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
            {installedSimulation ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>PWA Siap Digunakan di HP!</span>
              </div>
            ) : (
              <button
                onClick={() => setInstalledSimulation(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Simulasikan Pasang di HP</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#0D1117] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
