import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  Megaphone, 
  Sparkles, 
  Settings, 
  Trash2, 
  Edit3, 
  Eye, 
  MessageCircle, 
  UploadCloud, 
  CheckSquare, 
  Award, 
  KeyRound, 
  UserPlus, 
  LayoutGrid, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  ShieldAlert, 
  Info,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { SiswaDapodik, SekolahConfig, PengumumanSekolah, StatusVerifikasi } from '../../types/dapodik';
import { JURUSAN_LIST } from '../../data/initialData';
import { exportSingleSiswaPdf, exportMultipleSiswaPdf } from '../../services/pdfExportService';
import { exportRekapDapodikExcel, downloadTemplateExcel } from '../../services/excelExportService';
import { createWaLink, generateWaPengingatBerkas } from '../../services/whatsappService';

import { StudentDetailModal } from './StudentDetailModal';
import { AnnouncementManagerModal } from './AnnouncementManagerModal';
import { AuditAssistantModal } from './AuditAssistantModal';
import { SchoolSettingsModal } from './SchoolSettingsModal';
import { DataImportModal } from './DataImportModal';
import { AccountGeneratorModal } from './AccountGeneratorModal';
import { DeleteConfirmationModal, DeleteModalTarget } from './DeleteConfirmationModal';
import { StudentWizardForm } from '../StudentPortal/StudentWizardForm';

interface OperatorDashboardProps {
  siswaList?: SiswaDapodik[];
  config: SekolahConfig;
  announcements: PengumumanSekolah[];
  onSaveSiswa: (data: Partial<SiswaDapodik> & { nama: string; nisn: string }) => void;
  onUpdateStatus: (id: string, status: StatusVerifikasi, catatan?: string) => void;
  onDeleteSiswa: (id: string) => void;
  onBatchDeleteSiswa: (ids: string[]) => void;
  onBatchVerifySiswa: (ids: string[]) => void;
  onSaveConfig: (config: SekolahConfig) => void;
  onResetDefaultConfig: () => void;
  onAddAnnouncement: (ann: Omit<PengumumanSekolah, 'id' | 'tanggal'>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onImportStudents: (students: Partial<SiswaDapodik>[]) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  siswaList = [],
  config,
  announcements,
  onSaveSiswa,
  onUpdateStatus,
  onDeleteSiswa,
  onBatchDeleteSiswa,
  onBatchVerifySiswa,
  onSaveConfig,
  onResetDefaultConfig,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onImportStudents
}) => {
  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState('all');
  const [selectedTingkat, setSelectedTingkat] = useState('all');
  const [selectedRombel, setSelectedRombel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedKip, setSelectedKip] = useState('all');
  const [selectedDocFilter, setSelectedDocFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // View mode (table for PC desktop, cards for mobile/tablet)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination state (critical for fast rendering with 1,200+ students)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Selected IDs for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [selectedSiswaDetail, setSelectedSiswaDetail] = useState<SiswaDapodik | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = useState<DeleteModalTarget | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Form Wizard state (for adding or editing a student)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<SiswaDapodik> | undefined>(undefined);

  // Extract unique available Rombels
  const availableRombels = useMemo(() => {
    const set = new Set<string>();
    siswaList.forEach(s => {
      if (s.rombel) set.add(s.rombel);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [siswaList]);

  // Filtered student list
  const filteredList = useMemo(() => {
    return siswaList.filter((siswa) => {
      const term = searchTerm.trim().toLowerCase();
      const matchSearch = 
        !term ||
        (siswa.nama || '').toLowerCase().includes(term) ||
        (siswa.nisn || '').includes(term) ||
        (siswa.nik || '').includes(term) ||
        (siswa.rombel || '').toLowerCase().includes(term);

      const matchJurusan = selectedJurusan === 'all' || siswa.jurusan === selectedJurusan;
      const matchTingkat = selectedTingkat === 'all' || siswa.tingkatKelas === selectedTingkat;
      const matchRombel = selectedRombel === 'all' || siswa.rombel === selectedRombel;
      const matchStatus = selectedStatus === 'all' || siswa.statusVerifikasi === selectedStatus;
      const matchKip = selectedKip === 'all' || siswa.punyaKip === selectedKip;

      let matchDocs = true;
      const docs = siswa.dokumen || {};
      const docCount = [docs.fotoName, docs.kkName, docs.aktaName, docs.ijazahSklName, docs.kipPkhName, docs.ktpOrtuName].filter(Boolean).length;
      
      if (selectedDocFilter === 'complete') {
        matchDocs = docCount >= 5;
      } else if (selectedDocFilter === 'incomplete') {
        matchDocs = docCount < 5;
      }

      return matchSearch && matchJurusan && matchTingkat && matchRombel && matchStatus && matchKip && matchDocs;
    });
  }, [siswaList, searchTerm, selectedJurusan, selectedTingkat, selectedRombel, selectedStatus, selectedKip, selectedDocFilter]);

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJurusan, selectedTingkat, selectedRombel, selectedStatus, selectedKip, selectedDocFilter, pageSize]);

  // Paginated student list
  const paginatedList = useMemo(() => {
    if (pageSize === -1) return filteredList;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredList.slice(startIndex, startIndex + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredList.length / pageSize));

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedJurusan !== 'all') count++;
    if (selectedTingkat !== 'all') count++;
    if (selectedRombel !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (selectedKip !== 'all') count++;
    if (selectedDocFilter !== 'all') count++;
    if (searchTerm) count++;
    return count;
  }, [selectedJurusan, selectedTingkat, selectedRombel, selectedStatus, selectedKip, selectedDocFilter, searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedJurusan('all');
    setSelectedTingkat('all');
    setSelectedRombel('all');
    setSelectedStatus('all');
    setSelectedKip('all');
    setSelectedDocFilter('all');
    setCurrentPage(1);
  };

  // Key Statistics
  const totalStudents = siswaList.length;
  const verifiedCount = siswaList.filter(s => s.statusVerifikasi === 'verified').length;
  const pendingCount = siswaList.filter(s => s.statusVerifikasi === 'pending').length;
  const revisionCount = siswaList.filter(s => s.statusVerifikasi === 'revision_needed').length;
  const kipCount = siswaList.filter(s => s.punyaKip === 'Ya').length;

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(s => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchVerify = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    onBatchVerifySiswa(selectedIds);
    setSelectedIds([]);
    showToast(`Berhasil memverifikasi ${count} data murid.`);
  };

  // Delete Request Handlers
  const handleRequestDeleteSingle = (siswa: SiswaDapodik) => {
    setDeleteTarget({ type: 'single', siswa });
    setIsDeleteModalOpen(true);
  };

  const handleRequestDeleteBatch = () => {
    if (selectedIds.length === 0) return;
    const targets = siswaList.filter(s => selectedIds.includes(s.id));
    setDeleteTarget({ type: 'batch', students: targets });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteSingle = (id: string) => {
    onDeleteSiswa(id);
    setSelectedIds(prev => prev.filter(item => item !== id));
    showToast('Data murid berhasil dihapus secara permanen.');
  };

  const handleConfirmDeleteBatch = (ids: string[]) => {
    onBatchDeleteSiswa(ids);
    setSelectedIds([]);
    showToast(`${ids.length} data murid terpilih berhasil dihapus.`);
  };

  const handleBatchPdfExport = () => {
    const targets = selectedIds.length > 0
      ? siswaList.filter(s => selectedIds.includes(s.id))
      : filteredList;

    if (targets.length === 0) {
      showToast('Tidak ada data murid untuk dicetak!', 'info');
      return;
    }

    exportMultipleSiswaPdf(targets, config, `Rekap_Dapodik_SMKN1Patrol_${config.tahunAjaran.replace('/', '_')}.pdf`);
  };

  const handleBatchExcelExport = () => {
    const targets = selectedIds.length > 0
      ? siswaList.filter(s => selectedIds.includes(s.id))
      : filteredList;

    if (targets.length === 0) {
      showToast('Tidak ada data murid untuk diekspor!', 'info');
      return;
    }

    exportRekapDapodikExcel(targets, config);
  };

  // If in add/edit wizard form mode
  if (isFormOpen) {
    return (
      <StudentWizardForm
        initialData={formInitialData}
        config={config}
        onSave={(data) => {
          onSaveSiswa(data);
          setIsFormOpen(false);
        }}
        onCancel={() => setIsFormOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-24 px-2 sm:px-4">

      {/* Top Banner / Operator Header - Responsive for Mobile & Desktop */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-3xl p-4 sm:p-6 lg:p-7 text-white shadow-2xl border border-slate-700/60 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* School & Operator Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500 text-white tracking-wide shadow-xs">
                OPERATOR PANEL
              </span>
              <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
                NPSN: {config.npsn}
              </span>
              <span className="text-xs text-blue-300 font-semibold bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-800/50">
                T.A {config.tahunAjaran}
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Pusat Pengelolaan Data Murid (Dapodik 2027)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              <strong className="text-white">{config.namaSekolah}</strong> • Operator: <span className="text-blue-300 font-semibold">{config.operatorDapodik}</span> (WA: {config.telepon})
            </p>
          </div>

          {/* Action Button Grid/Group */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 shrink-0">
            {/* Primary Action 1: Add New */}
            <button
              onClick={() => {
                setFormInitialData(undefined);
                setIsFormOpen(true);
              }}
              className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Input Murid</span>
            </button>

            {/* Primary Action 2: Generate Accounts */}
            <button
              id="btn-open-account-generator"
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              title="Kelola Akun, Generate Username & Password Murid, Cetak Kartu Login"
            >
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Generate Akun</span>
            </button>

            {/* Action 3: Import Excel */}
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Import Excel</span>
            </button>

            {/* Action 4: Announcements & WA */}
            <button
              onClick={() => setIsAnnouncementOpen(true)}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pengumuman</span>
            </button>

            {/* Action 5: AI Audit */}
            <button
              onClick={() => setIsAuditOpen(true)}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>Audit Data</span>
            </button>

            {/* Action 6: Settings */}
            <button
              id="btn-open-school-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              title="Pengaturan KOP Sekolah & Akun Operator"
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Pengaturan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards - Interactive quick filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        
        {/* Total Murid */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('all');
            setSelectedKip('all');
          }}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'all' && selectedKip === 'all'
              ? 'bg-[#161E2E] border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
              : 'bg-[#11141B] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-[11px] sm:text-xs">Total Murid</span>
            <Users className="w-4 h-4 text-blue-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{totalStudents.toLocaleString()}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Semua tingkat kelas</span>
        </button>

        {/* Verified Valid */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus(selectedStatus === 'verified' ? 'all' : 'verified');
          }}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'verified'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
              : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span className="font-bold text-[11px] sm:text-xs">Valid & Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-300">{verifiedCount.toLocaleString()}</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-400/90 font-medium">
            {totalStudents > 0 ? Math.round((verifiedCount / totalStudents) * 100) : 0}% terverifikasi
          </span>
        </button>

        {/* Menunggu Cek */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending');
          }}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'pending'
              ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/40'
              : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span className="font-bold text-[11px] sm:text-xs">Menunggu Cek</span>
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-300">{pendingCount.toLocaleString()}</p>
          <span className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium">Perlu verifikasi</span>
        </button>

        {/* Perlu Revisi */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatus(selectedStatus === 'revision_needed' ? 'all' : 'revision_needed');
          }}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'revision_needed'
              ? 'bg-red-950/40 border-red-500 shadow-md ring-1 ring-red-500/40'
              : 'bg-red-950/20 border-red-500/30 hover:border-red-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-red-400 text-xs mb-1">
            <span className="font-bold text-[11px] sm:text-xs">Perlu Revisi</span>
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-300">{revisionCount.toLocaleString()}</p>
          <span className="text-[10px] sm:text-[11px] text-red-400/90 font-medium">Berkas kurang</span>
        </button>

        {/* Penerima PIP / KIP */}
        <button
          type="button"
          onClick={() => {
            setSelectedKip(selectedKip === 'Ya' ? 'all' : 'Ya');
          }}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            selectedKip === 'Ya'
              ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
              : 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-400 text-xs mb-1">
            <span className="font-bold text-[11px] sm:text-xs">Penerima PIP / KIP</span>
            <Award className="w-4 h-4 text-indigo-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-300">{kipCount.toLocaleString()}</p>
          <span className="text-[10px] sm:text-[11px] text-indigo-400/90 font-medium">Bantuan siswa</span>
        </button>

      </div>

      {/* Main Database Content Card */}
      <div className="bg-[#11141B] rounded-3xl border border-slate-800/90 shadow-xl overflow-hidden text-[#E2E8F0]">
        
        {/* Search, Filter Toolbar & Export Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 space-y-3.5">
          
          {/* Top Row: Search Input + View Mode + Export Actions */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nama, NISN, NIK, rombel (e.g. X TJKT 1)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-[#0D1117] border border-slate-700/80 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
              
              {/* Filter toggle on mobile/desktop */}
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  showAdvancedFilters || activeFiltersCount > 0
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-[#0D1117] border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-blue-500 text-white rounded-full font-black">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-[#0D1117] border border-slate-700/80 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tampilan Tabel (Desktop PC)"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tabel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tampilan Kartu (Mobile / Tablet)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kartu</span>
                </button>
              </div>

              {/* Export Excel */}
              <button
                onClick={handleBatchExcelExport}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Ekspor seluruh data atau baris terpilih ke format Excel Dapodik"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                <span>Excel {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
              </button>

              {/* Export PDF */}
              <button
                onClick={handleBatchPdfExport}
                className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Cetak formulir F-PD Dapodik 2027 ke PDF dengan KOP SMKN 1 Patrol"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>PDF {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
              </button>
            </div>

          </div>

          {/* Filter Dropdowns Grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 text-xs border-t border-slate-800/60 ${showAdvancedFilters ? 'block' : 'hidden sm:grid'}`}>
            
            {/* Filter Jurusan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Jurusan:</label>
              <select
                value={selectedJurusan}
                onChange={(e) => setSelectedJurusan(e.target.value)}
                className="w-full p-2 bg-[#0D1117] border border-slate-700/80 rounded-xl font-medium text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="all">Semua Jurusan</option>
                {JURUSAN_LIST.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Filter Tingkat Kelas */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Tingkat Kelas:</label>
              <select
                value={selectedTingkat}
                onChange={(e) => {
                  setSelectedTingkat(e.target.value);
                  setSelectedRombel('all');
                }}
                className="w-full p-2 bg-[#0D1117] border border-slate-700/80 rounded-xl font-medium text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="all">Semua Tingkat</option>
                <option value="X">Kelas X (Sepuluh)</option>
                <option value="XI">Kelas XI (Sebelas)</option>
                <option value="XII">Kelas XII (Duabelas)</option>
              </select>
            </div>

            {/* Filter Rombel Spesifik */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Rombel / Kelas:</label>
              <select
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
                className="w-full p-2 bg-[#0D1117] border border-slate-700/80 rounded-xl font-medium text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="all">Semua Rombel</option>
                {availableRombels
                  .filter(r => selectedTingkat === 'all' || r.startsWith(selectedTingkat + ' '))
                  .map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
              </select>
            </div>

            {/* Filter Status Verifikasi */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Status Verifikasi:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 bg-[#0D1117] border border-slate-700/80 rounded-xl font-medium text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="all">Semua Status</option>
                <option value="verified">Valid / Verified</option>
                <option value="pending">Menunggu Cek</option>
                <option value="revision_needed">Perlu Revisi</option>
              </select>
            </div>

            {/* Filter PIP / KIP */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Penerima PIP / KIP:</label>
              <select
                value={selectedKip}
                onChange={(e) => setSelectedKip(e.target.value)}
                className="w-full p-2 bg-[#0D1117] border border-slate-700/80 rounded-xl font-medium text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="all">Semua Murid</option>
                <option value="Ya">Penerima KIP (Ya)</option>
                <option value="Tidak">Bukan KIP (Tidak)</option>
              </select>
            </div>

            {/* Filter Kelengkapan Dokumen */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Kelengkapan Berkas:</label>
              <select
                value={selectedDocFilter}
                onChange={(e) => setSelectedDocFilter(e.target.value)}
                className="w-full p-2 bg-[#0D1117] border border-slate-700/80 rounded-xl font-medium text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="all">Semua Berkas</option>
                <option value="complete">Lengkap (5-6 Berkas)</option>
                <option value="incomplete">Belum Lengkap (&lt; 5)</option>
              </select>
            </div>

          </div>

          {/* Active Filter Chips & Reset Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                <span className="text-[11px] font-semibold">Filter aktif:</span>
                {searchTerm && (
                  <span className="px-2 py-0.5 bg-blue-950/70 border border-blue-700/50 text-blue-300 rounded-md text-[10px] font-medium">
                    Pencarian: "{searchTerm}"
                  </span>
                )}
                {selectedJurusan !== 'all' && (
                  <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-[10px] font-medium">
                    {selectedJurusan}
                  </span>
                )}
                {selectedRombel !== 'all' && (
                  <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-[10px] font-medium">
                    Rombel: {selectedRombel}
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-[10px] font-medium">
                    Status: {selectedStatus}
                  </span>
                )}
                {selectedKip !== 'all' && (
                  <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-700/50 text-amber-300 rounded-md text-[10px] font-medium">
                    KIP: {selectedKip}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center space-x-1 text-red-400 hover:text-red-300 text-xs font-semibold py-1 px-2 rounded-lg bg-red-950/30 border border-red-900/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter ({activeFiltersCount})</span>
              </button>
            </div>
          )}

        </div>

        {/* Sticky Batch Action Bar (Mobile & Desktop) */}
        {selectedIds.length > 0 && (
          <div className="bg-gradient-to-r from-blue-950 via-[#0E1726] to-slate-900 border-b border-blue-800/60 text-white px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 font-bold text-blue-300">
              <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{selectedIds.length} Data Murid Terpilih</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(true)}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Generate akun dan password untuk murid terpilih"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Buat Akun ({selectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={handleBatchVerify}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verifikasi Sekaligus</span>
              </button>

              <button
                type="button"
                onClick={handleRequestDeleteBatch}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-md shadow-red-600/30 cursor-pointer active:scale-95 transition-all"
                title="Hapus data murid yang dipilih dengan konfirmasi aman"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {siswaList.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-200">
                  Basis Data Murid Masih Kosong
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Belum ada data murid yang diunggah. Silakan unggah file Excel/CSV data murid atau tambahkan data murid pertama secara manual.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload File Excel / CSV</span>
                </button>
                <button
                  type="button"
                  onClick={downloadTemplateExcel}
                  className="px-3.5 py-2.5 bg-[#161B22] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Format Template Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormInitialData(undefined);
                    setIsFormOpen(true);
                  }}
                  className="px-3.5 py-2.5 bg-[#161B22] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>Input Manual</span>
                </button>
              </div>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-300">Tidak ada murid yang cocok</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Cobalah ubah kata kunci pencarian atau reset filter untuk menampilkan kembali data.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View (PC Desktop Precision) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D1117] text-slate-300 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px] sticky top-0 z-10 backdrop-blur-md">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredList.length > 0 && selectedIds.length === filteredList.length}
                      onChange={handleSelectAll}
                      className="rounded bg-[#161B22] border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 w-12 text-center">No</th>
                  <th className="p-3.5 min-w-[230px]">Murid (Nama & NISN)</th>
                  <th className="p-3.5 min-w-[160px]">Rombel & Jurusan</th>
                  <th className="p-3.5 min-w-[150px]">Berkas F-PD</th>
                  <th className="p-3.5 min-w-[120px]">Status Dapodik</th>
                  <th className="p-3.5 text-center min-w-[210px]">Aksi Operator</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {paginatedList.map((siswa, index) => {
                  const globalIndex = pageSize === -1 ? index : (currentPage - 1) * pageSize + index;
                  const isSelected = selectedIds.includes(siswa.id);
                  const docs = siswa.dokumen || {};
                  const docCount = [docs.fotoName, docs.kkName, docs.aktaName, docs.ijazahSklName, docs.kipPkhName, docs.ktpOrtuName].filter(Boolean).length;

                  return (
                    <tr
                      key={siswa.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-950/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(siswa.id)}
                          className="rounded bg-[#161B22] border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Number */}
                      <td className="p-3.5 text-center text-slate-500 font-mono text-[11px]">
                        {globalIndex + 1}
                      </td>

                      {/* Student Info */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-11 rounded-lg bg-[#0D1117] border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {docs.foto ? (
                              <img src={docs.foto} alt={siswa.nama} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">{siswa.jenisKelamin}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => {
                                setSelectedSiswaDetail(siswa);
                                setIsDetailOpen(true);
                              }}
                              className="font-extrabold text-slate-100 hover:text-blue-400 text-left transition-colors flex items-center gap-1.5 cursor-pointer truncate max-w-[220px]"
                              title={siswa.nama}
                            >
                              <span className="truncate">{siswa.nama}</span>
                              {siswa.punyaKip === 'Ya' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                  KIP
                                </span>
                              )}
                            </button>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              NISN: <span className="font-mono font-bold text-slate-200">{siswa.nisn}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              NIK: {siswa.nik || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Jurusan & Rombel */}
                      <td className="p-3.5">
                        <strong className="text-slate-100 block font-bold">{siswa.rombel}</strong>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[180px]" title={siswa.jurusan}>
                          {siswa.jurusan}
                        </span>
                      </td>

                      {/* Document Badges */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${docs.fotoName ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`} title="Pas Foto">Foto</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${docs.kkName ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`} title="Kartu Keluarga">KK</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${docs.aktaName ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`} title="Akta Kelahiran">Akta</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${docs.ijazahSklName ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`} title="Ijazah/SKL">SKL</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${docs.ktpOrtuName ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`} title="KTP Ortu">KTP</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {docCount} dari 6 berkas
                        </span>
                      </td>

                      {/* Status Verifikasi Badge */}
                      <td className="p-3.5">
                        {siswa.statusVerifikasi === 'verified' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Valid</span>
                          </span>
                        )}
                        {siswa.statusVerifikasi === 'pending' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Menunggu</span>
                          </span>
                        )}
                        {siswa.statusVerifikasi === 'revision_needed' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/40">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span>Revisi</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          
                          {/* Detail View */}
                          <button
                            onClick={() => {
                              setSelectedSiswaDetail(siswa);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="Detail & Verifikasi Data"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Account & Password */}
                          <button
                            onClick={() => {
                              setSelectedIds([siswa.id]);
                              setIsAccountModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                            title="Kelola Akun & Password Murid"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Print PDF */}
                          <button
                            onClick={() => exportSingleSiswaPdf(siswa, config)}
                            className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-500/30 transition-colors cursor-pointer"
                            title="Cetak Form F-PD (PDF)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Reminder */}
                          <a
                            href={createWaLink(
                              siswa.nomorHpSiswa || siswa.nomorHpOrtu,
                              generateWaPengingatBerkas(siswa, config)
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 transition-colors"
                            title="Kirim Pengingat Berkas via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setFormInitialData(siswa);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="Edit Data Murid"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleRequestDeleteSingle(siswa)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/70 text-red-400 hover:text-red-200 border border-red-900/50 transition-all cursor-pointer active:scale-95"
                            title={`Hapus Data Murid ${siswa.nama}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View (Mobile & Tablet Precision) */
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {paginatedList.map((siswa, index) => {
              const globalIndex = pageSize === -1 ? index : (currentPage - 1) * pageSize + index;
              const isSelected = selectedIds.includes(siswa.id);
              const docs = siswa.dokumen || {};
              const docCount = [docs.fotoName, docs.kkName, docs.aktaName, docs.ijazahSklName, docs.kipPkhName, docs.ktpOrtuName].filter(Boolean).length;

              return (
                <div
                  key={siswa.id}
                  className={`bg-[#0D1117] rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3.5 ${
                    isSelected 
                      ? 'border-blue-500/70 bg-blue-950/20 ring-1 ring-blue-500/40' 
                      : 'border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  {/* Top Card Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(siswa.id)}
                        className="rounded bg-[#161B22] border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 mt-0.5"
                      />
                      
                      <div className="w-11 h-13 rounded-xl bg-[#161B22] border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                        {docs.foto ? (
                          <img src={docs.foto} alt={siswa.nama} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500">{siswa.jenisKelamin}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <button
                          onClick={() => {
                            setSelectedSiswaDetail(siswa);
                            setIsDetailOpen(true);
                          }}
                          className="font-extrabold text-sm text-slate-100 hover:text-blue-400 text-left truncate block transition-colors cursor-pointer"
                        >
                          {globalIndex + 1}. {siswa.nama}
                        </button>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          NISN: <span className="text-white font-bold">{siswa.nisn}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                          {siswa.rombel} • {siswa.jurusan}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {siswa.statusVerifikasi === 'verified' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Valid</span>
                        </span>
                      )}
                      {siswa.statusVerifikasi === 'pending' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Cek</span>
                        </span>
                      )}
                      {siswa.statusVerifikasi === 'revision_needed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <span>Revisi</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Documents & PIP row */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                    <div className="flex items-center space-x-1.5 text-[10px]">
                      <span className="text-slate-400">Berkas:</span>
                      <strong className="text-slate-200">{docCount}/6</strong>
                      <div className="flex items-center space-x-0.5">
                        <span className={`w-2 h-2 rounded-full ${docs.fotoName ? 'bg-emerald-400' : 'bg-slate-700'}`} title="Pas Foto" />
                        <span className={`w-2 h-2 rounded-full ${docs.kkName ? 'bg-emerald-400' : 'bg-slate-700'}`} title="KK" />
                        <span className={`w-2 h-2 rounded-full ${docs.aktaName ? 'bg-emerald-400' : 'bg-slate-700'}`} title="Akta" />
                        <span className={`w-2 h-2 rounded-full ${docs.ijazahSklName ? 'bg-emerald-400' : 'bg-slate-700'}`} title="SKL" />
                        <span className={`w-2 h-2 rounded-full ${docs.ktpOrtuName ? 'bg-emerald-400' : 'bg-slate-700'}`} title="KTP" />
                      </div>
                    </div>
                    {siswa.punyaKip === 'Ya' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Penerima KIP
                      </span>
                    )}
                  </div>

                  {/* Card Action Buttons (Touch-friendly targets) */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSiswaDetail(siswa);
                        setIsDetailOpen(true);
                      }}
                      className="py-2 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer"
                      title="Lihat Detail"
                    >
                      <Eye className="w-3.5 h-3.5 mb-0.5 text-blue-400" />
                      <span>Detail</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIds([siswa.id]);
                        setIsAccountModalOpen(true);
                      }}
                      className="py-2 px-1 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer"
                      title="Akun Login Murid"
                    >
                      <KeyRound className="w-3.5 h-3.5 mb-0.5" />
                      <span>Akun</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportSingleSiswaPdf(siswa, config)}
                      className="py-2 px-1 bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer"
                      title="Cetak PDF"
                    >
                      <Download className="w-3.5 h-3.5 mb-0.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormInitialData(siswa);
                        setIsFormOpen(true);
                      }}
                      className="py-2 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit3 className="w-3.5 h-3.5 mb-0.5 text-slate-300" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestDeleteSingle(siswa)}
                      className="py-2 px-1 bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/60 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
                      title={`Hapus data ${siswa.nama}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 mb-0.5 text-red-400" />
                      <span>Hapus</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Table Footer with Responsive Pagination Controls */}
        {filteredList.length > 0 && (
          <div className="p-4 bg-[#0D1117] border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            
            {/* Page Count Info & Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Menampilkan <strong className="text-slate-100 font-bold">
                  {pageSize === -1 ? filteredList.length : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filteredList.length)}`}
                </strong> dari <strong className="text-slate-100 font-bold">{filteredList.length}</strong> murid
                {filteredList.length < totalStudents && ` (Total ${totalStudents})`}
              </span>

              <div className="flex items-center space-x-1.5 bg-[#161B22] px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-transparent text-slate-200 font-bold focus:outline-hidden cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={-1}>Semua ({filteredList.length})</option>
                </select>
              </div>
            </div>

            {/* Pagination Navigation Buttons */}
            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-all cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-1 px-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                    let pageNum = idx + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = Math.min(currentPage - 3 + idx + 1, totalPages);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-all cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Modals Mounting */}
      <StudentDetailModal
        isOpen={isDetailOpen}
        siswa={selectedSiswaDetail}
        config={config}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSiswaDetail(null);
        }}
        onUpdateStatus={onUpdateStatus}
        onEdit={(s) => {
          setIsDetailOpen(false);
          setFormInitialData(s);
          setIsFormOpen(true);
        }}
        onDelete={onDeleteSiswa}
      />

      <AnnouncementManagerModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        announcements={announcements}
        config={config}
        onAddAnnouncement={onAddAnnouncement}
        onDeleteAnnouncement={onDeleteAnnouncement}
      />

      <AuditAssistantModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        siswaList={siswaList}
        onSelectSiswa={(s) => {
          setIsAuditOpen(false);
          setSelectedSiswaDetail(s);
          setIsDetailOpen(true);
        }}
      />

      <SchoolSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={onSaveConfig}
        onResetDefault={onResetDefaultConfig}
      />

      <DataImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={onImportStudents}
      />

      <AccountGeneratorModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        siswaList={siswaList}
        config={config}
        selectedSiswaIds={selectedIds}
        onDataUpdated={() => {
          window.dispatchEvent(new Event('sipendik-data-updated'));
        }}
      />

      {/* Dedicated Responsive Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        target={deleteTarget}
        onConfirmSingle={handleConfirmDeleteSingle}
        onConfirmBatch={handleConfirmDeleteBatch}
      />

      {/* Floating Responsive Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200 max-w-sm">
          <div className={`p-3.5 rounded-2xl shadow-2xl border flex items-center space-x-3 text-xs font-semibold backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600/50 shadow-emerald-950/40' 
              : toast.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-600/50 shadow-red-950/40'
              : 'bg-blue-950/90 text-blue-200 border-blue-600/50 shadow-blue-950/40'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};
