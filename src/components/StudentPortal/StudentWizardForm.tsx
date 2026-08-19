import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Users, 
  Activity, 
  FileUp, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Download, 
  Sparkles,
  School,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SiswaDapodik, JurusanSMK, SekolahConfig, TempatTinggal, ModaTransportasi } from '../../types/dapodik';
import { JURUSAN_LIST } from '../../data/initialData';
import { DocumentUploadCard } from './DocumentUploadCard';
import { exportSingleSiswaPdf } from '../../services/pdfExportService';

interface StudentWizardFormProps {
  initialData?: Partial<SiswaDapodik>;
  config: SekolahConfig;
  initialStep?: number;
  onSave: (data: Partial<SiswaDapodik> & { nama: string; nisn: string }) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, label: 'Identitas Pribadi', icon: User, desc: 'NIK, NISN, Nama & TTL' },
  { id: 2, label: 'Jurusan & Kelas', icon: School, desc: 'Program Keahlian & Rombel' },
  { id: 3, label: 'Alamat & Kontak', icon: MapPin, desc: 'Domisili, No WA & HP' },
  { id: 4, label: 'Orang Tua & KIP', icon: Users, desc: 'Ayah, Ibu, Wali & PIP' },
  { id: 5, label: 'Data Periodik', icon: Activity, desc: 'TB, BB, Jarak & Saudara' },
  { id: 6, label: 'Upload Dokumen', icon: FileUp, desc: 'Foto, KK, Akta & SKL' },
  { id: 7, label: 'Konfirmasi', icon: CheckCircle2, desc: 'Validasi & Cetak PDF' },
];

export const StudentWizardForm: React.FC<StudentWizardFormProps> = ({
  initialData,
  config,
  initialStep = 1,
  onSave,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<SiswaDapodik>>({
    nama: initialData?.nama || '',
    jenisKelamin: initialData?.jenisKelamin || 'L',
    nisn: initialData?.nisn || '',
    nik: initialData?.nik || '',
    noKk: initialData?.noKk || '',
    tempatLahir: initialData?.tempatLahir || 'Indramayu',
    tanggalLahir: initialData?.tanggalLahir || '2008-01-01',
    noRegistrasiAkta: initialData?.noRegistrasiAkta || '',
    agama: initialData?.agama || 'Islam',
    kewarganegaraan: initialData?.kewarganegaraan || 'Indonesia',
    berkebutuhanKhusus: initialData?.berkebutuhanKhusus || 'Tidak Ada',
    anakKe: initialData?.anakKe || 1,

    // Step 2
    jurusan: initialData?.jurusan || 'Teknik Jaringan Komputer dan Telekomunikasi (TJKT)',
    tingkatKelas: initialData?.tingkatKelas || 'X',
    rombel: initialData?.rombel || 'X TJKT 1',
    sekolahAsalSmp: initialData?.sekolahAsalSmp || '',
    npsnSekolahAsal: initialData?.npsnSekolahAsal || '',
    noPesertaUjianSmp: initialData?.noPesertaUjianSmp || '',

    // Step 3
    alamatJalan: initialData?.alamatJalan || '',
    rt: initialData?.rt || '001',
    rw: initialData?.rw || '001',
    namaDusun: initialData?.namaDusun || '',
    desaKelurahan: initialData?.desaKelurahan || '',
    kecamatan: initialData?.kecamatan || 'Patrol',
    kabupatenKota: initialData?.kabupatenKota || 'Kabupaten Indramayu',
    provinsi: initialData?.provinsi || 'Jawa Barat',
    kodePos: initialData?.kodePos || '45257',
    tempatTinggal: initialData?.tempatTinggal || 'Bersama Orang Tua',
    modaTransportasi: initialData?.modaTransportasi || 'Sepeda Motor',
    nomorHpSiswa: initialData?.nomorHpSiswa || '',
    nomorHpOrtu: initialData?.nomorHpOrtu || '',
    emailSiswa: initialData?.emailSiswa || '',

    // Step 4
    namaAyah: initialData?.namaAyah || '',
    nikAyah: initialData?.nikAyah || '',
    tahunLahirAyah: initialData?.tahunLahirAyah || '1975',
    pendidikanAyah: initialData?.pendidikanAyah || 'SMA / Sederajat',
    pekerjaanAyah: initialData?.pekerjaanAyah || 'Wiraswasta',
    penghasilanAyah: initialData?.penghasilanAyah || 'Rp 1.000.000 - Rp 2.000.000',
    namaIbuKandung: initialData?.namaIbuKandung || '',
    nikIbu: initialData?.nikIbu || '',
    tahunLahirIbu: initialData?.tahunLahirIbu || '1978',
    pendidikanIbu: initialData?.pendidikanIbu || 'SMA / Sederajat',
    pekerjaanIbu: initialData?.pekerjaanIbu || 'Ibu Rumah Tangga',
    penghasilanIbu: initialData?.penghasilanIbu || 'Tidak Berpenghasilan',
    
    // Data Wali (Opsional)
    mempunyaiWali: initialData?.mempunyaiWali || (initialData?.namaWali ? 'Ya' : 'Tidak'),
    namaWali: initialData?.namaWali || '',
    nikWali: initialData?.nikWali || '',
    tahunLahirWali: initialData?.tahunLahirWali || '',
    hubunganWali: initialData?.hubunganWali || 'Paman / Bibi',
    pendidikanWali: initialData?.pendidikanWali || 'SMA / Sederajat',
    pekerjaanWali: initialData?.pekerjaanWali || 'Wiraswasta',
    penghasilanWali: initialData?.penghasilanWali || 'Rp 1.000.000 - Rp 2.000.000',
    nomorHpWali: initialData?.nomorHpWali || '',

    punyaKip: initialData?.punyaKip || 'Tidak',
    nomorKip: initialData?.nomorKip || '',
    namaTerteraDiKip: initialData?.namaTerteraDiKip || '',
    nomorKksPkh: initialData?.nomorKksPkh || '',
    alasanLayakPip: initialData?.alasanLayakPip || '',

    // Step 5
    tinggiBadan: initialData?.tinggiBadan || 165,
    beratBadan: initialData?.beratBadan || 55,
    lingkarKepala: initialData?.lingkarKepala || 55,
    jarakKeSekolahKm: initialData?.jarakKeSekolahKm || 1.5,
    jarakKategori: (initialData?.jarakKeSekolahKm || 1.5) < 1 ? '< 1 KM' : '> 1 KM',
    waktuTempuhMenit: initialData?.waktuTempuhMenit || 10,
    jumlahSaudaraKandung: initialData?.jumlahSaudaraKandung || 1,
    prestasi: initialData?.prestasi || '',
    beasiswa: initialData?.beasiswa || '',

    // Step 6 (Dokumen)
    dokumen: initialData?.dokumen || {},
    statusVerifikasi: initialData?.statusVerifikasi || 'pending'
  });

  const handleChange = (field: keyof SiswaDapodik, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'jarakKeSekolahKm') {
        const num = parseFloat(value) || 0;
        updated.jarakKategori = num < 1 ? '< 1 KM' : '> 1 KM';
      }
      return updated;
    });
  };

  const handleDocumentChange = (docKey: 'foto' | 'kk' | 'akta' | 'ijazahSkl' | 'kipPkh' | 'ktpOrtu', base64: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      dokumen: {
        ...prev.dokumen,
        [docKey]: base64,
        [`${docKey}Name`]: name
      }
    }));
  };

  const handleDocumentRemove = (docKey: 'foto' | 'kk' | 'akta' | 'ijazahSkl' | 'kipPkh' | 'ktpOrtu') => {
    setFormData(prev => {
      const copy: Record<string, any> = { ...prev.dokumen };
      delete copy[docKey];
      delete copy[`${docKey}Name`];
      return {
        ...prev,
        dokumen: copy as typeof prev.dokumen
      };
    });
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!formData.nama?.trim()) {
        alert('Mohon masukkan Nama Lengkap murid sesuai Akta/KK!');
        return false;
      }
      if (!formData.nisn?.trim() || formData.nisn.length < 10) {
        alert('NISN harus 10 digit angka!');
        return false;
      }
      if (!formData.nik?.trim() || formData.nik.length < 16) {
        alert('NIK murid harus 16 digit sesuai Kartu Keluarga!');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.nomorHpSiswa?.trim()) {
        alert('Nomor HP/WhatsApp Murid wajib diisi untuk notifikasi Dapodik!');
        return false;
      }
      if (!formData.desaKelurahan?.trim()) {
        alert('Kelurahan / Desa domisili wajib diisi!');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.namaIbuKandung?.trim()) {
        alert('Nama Ibu Kandung wajib diisi sesuai Kartu Keluarga (Wajib Dapodik)!');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    if (!formData.nama || !formData.nisn) {
      alert('Nama dan NISN wajib terisi.');
      return;
    }

    onSave({
      ...formData,
      nama: formData.nama.toUpperCase().trim(),
      nisn: formData.nisn.trim(),
      statusVerifikasi: formData.statusVerifikasi === 'verified' ? 'verified' : 'pending'
    });

    setIsSuccessSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (isSuccessSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg ring-8 ring-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#E2E8F0] mb-2">
          Data Biodata Dapodik 2027 Berhasil Disimpan!
        </h2>
        
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          Data murid atas nama <strong className="text-slate-200">{formData.nama}</strong> (NISN: {formData.nisn}) telah tercatat di sistem SMKN 1 Patrol dan siap diverifikasi oleh Operator Dapodik Sekolah.
        </p>

        <div className="bg-[#11141B] border border-slate-800 rounded-2xl p-5 mb-8 text-left space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Nama Murid:</span>
            <span className="font-bold text-slate-200">{formData.nama}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Jurusan / Rombel:</span>
            <span className="font-bold text-slate-200">{formData.jurusan} ({formData.rombel})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Status Dapodik:</span>
            <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Menunggu Verifikasi Operator</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => exportSingleSiswaPdf(formData as SiswaDapodik, config)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Cetak Formulir F-PD (PDF)</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 bg-[#161B22] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-bold text-sm transition-colors"
          >
            Kembali ke Beranda Murid
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      
      {/* Top Header & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batal & Kembali</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#E2E8F0] tracking-tight">
            Formulir Murid (F-PD) Dapodik 2027
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {config.namaSekolah} • Standar Resmi Kemdikbudristek
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Langkah {currentStep} dari {STEPS.length}
          </span>
        </div>
      </div>

      {/* Wizard Step Navigation Pills (Scrollable on mobile) */}
      <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center min-w-max space-x-2 sm:space-x-3 bg-[#11141B] p-2 rounded-2xl border border-slate-800 shadow-2xs">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isDone = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isDone || step.id <= currentStep || !!initialData?.nisn) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/40'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent 
                    ? 'bg-white/20 text-white' 
                    : isDone 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isDone ? '✓' : step.id}
                </div>
                <div className="text-left">
                  <div className="leading-none">{step.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-[#11141B] rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
        
        {/* Step Header */}
        <div className="p-5 sm:p-6 bg-[#161B22] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {React.createElement(STEPS[currentStep - 1].icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <h3 className="font-extrabold text-[#E2E8F0] text-base sm:text-lg">
                {STEPS[currentStep - 1].label}
              </h3>
              <p className="text-xs text-slate-400">
                {STEPS[currentStep - 1].desc}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400 sm:hidden">
            {currentStep}/{STEPS.length}
          </span>
        </div>

        {/* Step Form Body */}
        <div className="p-5 sm:p-7 space-y-6">

          {/* STEP 1: IDENTITAS PRIBADI */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Murid <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MUHAMMAD RIZKY PRATAMA (Huruf Kapital sesuai Akta/Ijazah)"
                  value={formData.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden transition-all placeholder-slate-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Harap tulis tanpa gelar dan sesuai Akta Kelahiran.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Jenis Kelamin <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('jenisKelamin', 'L')}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        formData.jenisKelamin === 'L'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-2xs'
                          : 'bg-[#0D1117] border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Laki-laki (L)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('jenisKelamin', 'P')}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        formData.jenisKelamin === 'P'
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-2xs'
                          : 'bg-[#0D1117] border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Perempuan (P)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Agama & Kepercayaan <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.agama}
                    onChange={(e) => handleChange('agama', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                    <option value="Kepercayaan Lainnya">Kepercayaan Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    NISN (10 Digit) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    placeholder="Contoh: 0078912345"
                    value={formData.nisn}
                    onChange={(e) => handleChange('nisn', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all font-mono placeholder-slate-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Nomor Induk Siswa Nasional dari Kemdikbud.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    NIK Murid (16 Digit KTP/KK) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    required
                    placeholder="Contoh: 3212051508080001"
                    value={formData.nik}
                    onChange={(e) => handleChange('nik', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all font-mono placeholder-slate-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Nomor Induk Kependudukan tercantum di Kartu Keluarga.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nomor Kartu Keluarga (KK) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="Contoh: 3212052002100005"
                    value={formData.noKk}
                    onChange={(e) => handleChange('noKk', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all font-mono placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    No. Registrasi Akta Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 3212-LT-15082008-0012"
                    value={formData.noRegistrasiAkta}
                    onChange={(e) => handleChange('noRegistrasiAkta', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tempat Lahir <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Indramayu"
                    value={formData.tempatLahir}
                    onChange={(e) => handleChange('tempatLahir', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tanggal Lahir <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => handleChange('tanggalLahir', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Anak Ke-
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.anakKe}
                    onChange={(e) => handleChange('anakKe', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Kewarganegaraan
                  </label>
                  <select
                    value={formData.kewarganegaraan}
                    onChange={(e) => handleChange('kewarganegaraan', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                  >
                    <option value="Indonesia">WNI - Indonesia</option>
                    <option value="WNA">WNA - Warga Negara Asing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Kebutuhan Khusus
                  </label>
                  <select
                    value={formData.berkebutuhanKhusus}
                    onChange={(e) => handleChange('berkebutuhanKhusus', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                  >
                    <option value="Tidak Ada">Tidak Ada (Normal)</option>
                    <option value="Netra">Netra (A)</option>
                    <option value="Rungu">Rungu (B)</option>
                    <option value="Grahita Ringan">Grahita Ringan (C)</option>
                    <option value="Daksa Ringan">Daksa Ringan (D)</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: JURUSAN & KELAS */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Program Keahlian / Jurusan SMKN 1 Patrol <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.jurusan}
                  onChange={(e) => {
                    const jur = e.target.value as JurusanSMK;
                    handleChange('jurusan', jur);
                    const code = jur.split('(')[1]?.replace(')', '') || 'TJKT';
                    handleChange('rombel', `${formData.tingkatKelas} ${code} 1`);
                  }}
                  className="w-full px-4 py-3 text-sm font-semibold bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                >
                  {JURUSAN_LIST.map((jurusan) => (
                    <option key={jurusan} value={jurusan}>
                      {jurusan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tingkat Kelas <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['X', 'XI', 'XII'] as const).map((tingkat) => (
                      <button
                        key={tingkat}
                        type="button"
                        onClick={() => {
                          handleChange('tingkatKelas', tingkat);
                          const code = formData.jurusan?.split('(')[1]?.replace(')', '') || 'TJKT';
                          handleChange('rombel', `${tingkat} ${code} 1`);
                        }}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          formData.tingkatKelas === tingkat
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                            : 'bg-[#0D1117] border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Kelas {tingkat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Rombongan Belajar (Rombel) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: X TJKT 1, XI TM 2, XII TO 1"
                    value={formData.rombel}
                    onChange={(e) => handleChange('rombel', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all font-semibold text-blue-300"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-3">
                  Informasi Sekolah Asal (SMP / MTs)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nama Sekolah Asal (SMP/MTs) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: SMPN 1 Patrol / MTs Negeri Patrol"
                      value={formData.sekolahAsalSmp}
                      onChange={(e) => handleChange('sekolahAsalSmp', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      NPSN SMP / MTs Asal
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 20216120"
                      value={formData.npsnSekolahAsal}
                      onChange={(e) => handleChange('npsnSekolahAsal', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ALAMAT & KONTAK */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Alamat Jalan / Blok / Nomor Rumah <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Raya Patrol No. 45 Blok Sukatani"
                  value={formData.alamatJalan}
                  onChange={(e) => handleChange('alamatJalan', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">RT <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="001"
                    value={formData.rt}
                    onChange={(e) => handleChange('rt', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl font-mono text-center placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">RW <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="002"
                    value={formData.rw}
                    onChange={(e) => handleChange('rw', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl font-mono text-center placeholder-slate-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nama Dusun / Blok</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sukatani / Karanganyar"
                    value={formData.namaDusun}
                    onChange={(e) => handleChange('namaDusun', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Kelurahan / Desa <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Patrol Lor / Limpas / Bugel"
                    value={formData.desaKelurahan}
                    onChange={(e) => handleChange('desaKelurahan', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Kecamatan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Patrol / Sukra / Anjatan"
                    value={formData.kecamatan}
                    onChange={(e) => handleChange('kecamatan', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="45257"
                    value={formData.kodePos}
                    onChange={(e) => handleChange('kodePos', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl font-mono placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tempat Tinggal Saat Ini
                  </label>
                  <select
                    value={formData.tempatTinggal}
                    onChange={(e) => handleChange('tempatTinggal', e.target.value as TempatTinggal)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl"
                  >
                    <option value="Bersama Orang Tua">Bersama Orang Tua</option>
                    <option value="Wali">Wali</option>
                    <option value="Kost">Kost</option>
                    <option value="Asrama / Pesantren">Asrama / Pesantren</option>
                    <option value="Panti Asuhan">Panti Asuhan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Moda Transportasi ke Sekolah
                  </label>
                  <select
                    value={formData.modaTransportasi}
                    onChange={(e) => handleChange('modaTransportasi', e.target.value as ModaTransportasi)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl"
                  >
                    <option value="Sepeda Motor">Sepeda Motor</option>
                    <option value="Sepeda">Sepeda</option>
                    <option value="Jalan Kaki">Jalan Kaki</option>
                    <option value="Angkutan Umum / Angkot">Angkutan Umum / Angkot</option>
                    <option value="Ojek Online">Ojek Online</option>
                    <option value="Mobil Pribadi">Mobil Pribadi</option>
                    <option value="Antar Jemput Sekolah">Antar Jemput Sekolah</option>
                  </select>
                </div>
              </div>

              {/* Kontak WA Murid & Ortu */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="font-bold text-xs text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>Kontak WhatsApp (Untuk Notifikasi Dapodik)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      No. WhatsApp / HP Murid <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={formData.nomorHpSiswa}
                      onChange={(e) => handleChange('nomorHpSiswa', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#0D1117] border border-slate-700 rounded-xl font-mono text-emerald-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      No. WhatsApp Orang Tua / Wali
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 081398765432"
                      value={formData.nomorHpOrtu}
                      onChange={(e) => handleChange('nomorHpOrtu', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#0D1117] border border-slate-700 rounded-xl font-mono text-emerald-400 font-semibold"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Email Murid (Gmail / Akun Belajar.id)
                  </label>
                  <input
                    type="email"
                    placeholder="nama.murid@siswa.smkn1patrol.sch.id"
                    value={formData.emailSiswa}
                    onChange={(e) => handleChange('emailSiswa', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl placeholder-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DATA ORANG TUA & KIP/PIP */}
          {currentStep === 4 && (
            <div className="space-y-6">
              
              {/* IBU KANDUNG */}
              <div className="p-4 bg-pink-500/5 rounded-xl border border-pink-500/20 space-y-3">
                <h4 className="font-bold text-xs text-pink-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Data Ibu Kandung (Wajib Sesuai KK)</span>
                  <span className="text-red-400 text-[10px] lowercase font-normal">*wajib dapodik</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Lengkap Ibu Kandung <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SITI AMINAH"
                      value={formData.namaIbuKandung}
                      onChange={(e) => handleChange('namaIbuKandung', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-pink-500/30 rounded-lg placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      NIK Ibu Kandung (16 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="3212054508780004"
                      value={formData.nikIbu}
                      onChange={(e) => handleChange('nikIbu', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-pink-500/30 rounded-lg font-mono placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tahun Lahir</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1978"
                      value={formData.tahunLahirIbu}
                      onChange={(e) => handleChange('tahunLahirIbu', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-pink-500/30 rounded-lg font-mono placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Pekerjaan Ibu</label>
                    <select
                      value={formData.pekerjaanIbu}
                      onChange={(e) => handleChange('pekerjaanIbu', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-pink-500/30 rounded-lg"
                    >
                      <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                      <option value="Pedagang Kecil">Pedagang Kecil</option>
                      <option value="Wiraswasta">Wiraswasta</option>
                      <option value="Petani / Nelayan">Petani / Nelayan</option>
                      <option value="Buruh">Buruh</option>
                      <option value="PNS / TNI / Polri">PNS / TNI / Polri</option>
                      <option value="Karyawan Swasta">Karyawan Swasta</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Penghasilan Bulanan</label>
                    <select
                      value={formData.penghasilanIbu}
                      onChange={(e) => handleChange('penghasilanIbu', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-pink-500/30 rounded-lg"
                    >
                      <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                      <option value="Kurang dari Rp 500.000">Kurang dari Rp 500.000</option>
                      <option value="Rp 500.000 - Rp 999.999">Rp 500.000 - Rp 999.999</option>
                      <option value="Rp 1.000.000 - Rp 2.000.000">Rp 1.000.000 - Rp 2.000.000</option>
                      <option value="Rp 2.000.000 - Rp 4.999.999">Rp 2.000.000 - Rp 4.999.999</option>
                      <option value="Lebih dari Rp 5.000.000">Lebih dari Rp 5.000.000</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AYAH KANDUNG */}
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-3">
                <h4 className="font-bold text-xs text-blue-300 uppercase tracking-wider">
                  Data Ayah Kandung
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap Ayah</label>
                    <input
                      type="text"
                      placeholder="Contoh: AHMAD SUBAGJA"
                      value={formData.namaAyah}
                      onChange={(e) => handleChange('namaAyah', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-blue-500/30 rounded-lg placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">NIK Ayah (16 Digit)</label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="3212051005750003"
                      value={formData.nikAyah}
                      onChange={(e) => handleChange('nikAyah', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-blue-500/30 rounded-lg font-mono placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tahun Lahir</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1975"
                      value={formData.tahunLahirAyah}
                      onChange={(e) => handleChange('tahunLahirAyah', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-blue-500/30 rounded-lg font-mono placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Pekerjaan Ayah</label>
                    <select
                      value={formData.pekerjaanAyah}
                      onChange={(e) => handleChange('pekerjaanAyah', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-blue-500/30 rounded-lg"
                    >
                      <option value="Wiraswasta">Wiraswasta</option>
                      <option value="Petani / Nelayan">Petani / Nelayan</option>
                      <option value="Buruh">Buruh</option>
                      <option value="Mekanik Bengkel">Mekanik Bengkel</option>
                      <option value="Karyawan Swasta">Karyawan Swasta</option>
                      <option value="PNS / TNI / Polri">PNS / TNI / Polri</option>
                      <option value="Tidak Bekerja">Tidak Bekerja</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Penghasilan Bulanan</label>
                    <select
                      value={formData.penghasilanAyah}
                      onChange={(e) => handleChange('penghasilanAyah', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-blue-500/30 rounded-lg"
                    >
                      <option value="Rp 1.000.000 - Rp 2.000.000">Rp 1.000.000 - Rp 2.000.000</option>
                      <option value="Rp 500.000 - Rp 999.999">Rp 500.000 - Rp 999.999</option>
                      <option value="Kurang dari Rp 500.000">Kurang dari Rp 500.000</option>
                      <option value="Rp 2.000.000 - Rp 4.999.999">Rp 2.000.000 - Rp 4.999.999</option>
                      <option value="Lebih dari Rp 5.000.000">Lebih dari Rp 5.000.000</option>
                      <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DATA WALI MURID (OPSIONAL) */}
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Data Wali Murid (Opsional)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Diisi jika murid tinggal bersama wali (kakek/nenek, paman/bibi, saudara, atau wali lainnya).
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleChange('mempunyaiWali', 'Ya')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        formData.mempunyaiWali === 'Ya' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-[#0D1117] text-slate-400 border border-slate-700'
                      }`}
                    >
                      Ada Wali
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('mempunyaiWali', 'Tidak');
                        handleChange('namaWali', '');
                        handleChange('nikWali', '');
                        handleChange('nomorHpWali', '');
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        formData.mempunyaiWali !== 'Ya' ? 'bg-slate-700 text-white' : 'bg-[#0D1117] text-slate-400 border border-slate-700'
                      }`}
                    >
                      Tidak Ada
                    </button>
                  </div>
                </div>

                {formData.mempunyaiWali === 'Ya' && (
                  <div className="space-y-3 pt-3 border-t border-emerald-500/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nama Lengkap Wali Murid
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: H. KASAN BASARI"
                          value={formData.namaWali || ''}
                          onChange={(e) => handleChange('namaWali', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-emerald-500/30 rounded-lg placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Hubungan dengan Murid
                        </label>
                        <select
                          value={formData.hubunganWali || 'Paman / Bibi'}
                          onChange={(e) => handleChange('hubunganWali', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-emerald-500/30 rounded-lg"
                        >
                          <option value="Kakek / Nenek">Kakek / Nenek</option>
                          <option value="Paman / Bibi">Paman / Bibi</option>
                          <option value="Kakak Kandung">Kakak Kandung</option>
                          <option value="Saudara Lainnya">Saudara Lainnya</option>
                          <option value="Orang Tua Asuh / Pengasuh">Orang Tua Asuh / Pengasuh</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          NIK Wali (16 Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="3212050107700002"
                          value={formData.nikWali || ''}
                          onChange={(e) => handleChange('nikWali', e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-emerald-500/30 rounded-lg font-mono placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Tahun Lahir Wali</label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="1970"
                          value={formData.tahunLahirWali || ''}
                          onChange={(e) => handleChange('tahunLahirWali', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-emerald-500/30 rounded-lg font-mono placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Pendidikan Terakhir</label>
                        <select
                          value={formData.pendidikanWali || 'SMA / Sederajat'}
                          onChange={(e) => handleChange('pendidikanWali', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-emerald-500/30 rounded-lg"
                        >
                          <option value="Tidak Sekolah">Tidak Sekolah</option>
                          <option value="SD / Sederajat">SD / Sederajat</option>
                          <option value="SMP / Sederajat">SMP / Sederajat</option>
                          <option value="SMA / Sederajat">SMA / Sederajat</option>
                          <option value="D1 / D2 / D3">D1 / D2 / D3</option>
                          <option value="D4 / S1">D4 / S1</option>
                          <option value="S2 / S3">S2 / S3</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Pekerjaan Wali</label>
                        <select
                          value={formData.pekerjaanWali || 'Wiraswasta'}
                          onChange={(e) => handleChange('pekerjaanWali', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-emerald-500/30 rounded-lg"
                        >
                          <option value="Wiraswasta">Wiraswasta</option>
                          <option value="Petani / Nelayan">Petani / Nelayan</option>
                          <option value="Pedagang">Pedagang</option>
                          <option value="Buruh">Buruh</option>
                          <option value="Karyawan Swasta">Karyawan Swasta</option>
                          <option value="PNS / TNI / Polri">PNS / TNI / Polri</option>
                          <option value="Pensiunan">Pensiunan</option>
                          <option value="Tidak Bekerja">Tidak Bekerja</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Penghasilan Bulanan</label>
                        <select
                          value={formData.penghasilanWali || 'Rp 1.000.000 - Rp 2.000.000'}
                          onChange={(e) => handleChange('penghasilanWali', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-emerald-500/30 rounded-lg"
                        >
                          <option value="Kurang dari Rp 500.000">Kurang dari Rp 500.000</option>
                          <option value="Rp 500.000 - Rp 999.999">Rp 500.000 - Rp 999.999</option>
                          <option value="Rp 1.000.000 - Rp 2.000.000">Rp 1.000.000 - Rp 2.000.000</option>
                          <option value="Rp 2.000.000 - Rp 4.999.999">Rp 2.000.000 - Rp 4.999.999</option>
                          <option value="Lebih dari Rp 5.000.000">Lebih dari Rp 5.000.000</option>
                          <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp / HP Wali</label>
                        <input
                          type="tel"
                          placeholder="081234567890"
                          value={formData.nomorHpWali || ''}
                          onChange={(e) => handleChange('nomorHpWali', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-emerald-500/30 rounded-lg font-mono placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BEASISWA / PROGRAM INDONESIA PINTAR (PIP / KIP) */}
              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Program Indonesia Pintar (KIP / PIP / PKH)</span>
                  </h4>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleChange('punyaKip', 'Ya')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        formData.punyaKip === 'Ya' ? 'bg-amber-600 text-white' : 'bg-[#0D1117] text-slate-400 border border-slate-700'
                      }`}
                    >
                      Ya, Punya KIP
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('punyaKip', 'Tidak')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        formData.punyaKip === 'Tidak' ? 'bg-slate-700 text-white' : 'bg-[#0D1117] text-slate-400 border border-slate-700'
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                {formData.punyaKip === 'Ya' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-500/20">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nomor Kartu Indonesia Pintar (KIP)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: KIP-2026-3212-0042"
                        value={formData.nomorKip}
                        onChange={(e) => handleChange('nomorKip', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-amber-500/30 rounded-lg font-mono placeholder-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nomor KKS / PKH (Jika Ada)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: PKH-3212-9988"
                        value={formData.nomorKksPkh}
                        onChange={(e) => handleChange('nomorKksPkh', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#0D1117] text-[#E2E8F0] border border-amber-500/30 rounded-lg font-mono placeholder-slate-500"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 5: DATA PERIODIK & RIWAYAT */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tinggi Badan (cm) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={220}
                    value={formData.tinggiBadan}
                    onChange={(e) => handleChange('tinggiBadan', parseInt(e.target.value) || 160)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Berat Badan (kg) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={150}
                    value={formData.beratBadan}
                    onChange={(e) => handleChange('beratBadan', parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Lingkar Kepala (cm)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={70}
                    value={formData.lingkarKepala}
                    onChange={(e) => handleChange('lingkarKepala', parseInt(e.target.value) || 55)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Jarak ke SMKN 1 Patrol (KM) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={formData.jarakKeSekolahKm}
                    onChange={(e) => handleChange('jarakKeSekolahKm', parseFloat(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kategori: <strong className="text-slate-200">{formData.jarakKategori}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Waktu Tempuh (Menit) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={formData.waktuTempuhMenit}
                    onChange={(e) => handleChange('waktuTempuhMenit', parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Jumlah Saudara Kandung
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={formData.jumlahSaudaraKandung}
                    onChange={(e) => handleChange('jumlahSaudaraKandung', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Prestasi Murid (Akademik / Non-Akademik)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Juara 2 LKS Web Technologies Tingkat Kab. Indramayu / Juara Futsal"
                  value={formData.prestasi}
                  onChange={(e) => handleChange('prestasi', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#0D1117] text-[#E2E8F0] border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {/* STEP 6: UPLOAD DOKUMEN PENDUKUNG */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs text-blue-300 flex items-start space-x-2">
                <FileUp className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  Unggah berkas resmi dalam format gambar (JPG/PNG) atau PDF. Dokumen ini akan diperiksa oleh Operator Sekolah untuk verifikasi dan sinkronisasi ke server Pusat Dapodik 2027.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Pas Foto Murid */}
                <DocumentUploadCard
                  id="doc-foto"
                  title="1. Pas Foto Formal Murid"
                  description="Foto formal berseragam/rapi dengan latar belakang merah atau biru."
                  required={true}
                  acceptedTypes="image/jpeg,image/png,image/webp"
                  fileData={formData.dokumen?.foto}
                  fileName={formData.dokumen?.fotoName}
                  onFileSelect={(base64, name) => handleDocumentChange('foto', base64, name)}
                  onFileRemove={() => handleDocumentRemove('foto')}
                />

                {/* 2. Kartu Keluarga (KK) */}
                <DocumentUploadCard
                  id="doc-kk"
                  title="2. Scan Kartu Keluarga (KK)"
                  description="Scan atau foto KK asli yang memuat data murid dan orang tua."
                  required={true}
                  fileData={formData.dokumen?.kk}
                  fileName={formData.dokumen?.kkName}
                  onFileSelect={(base64, name) => handleDocumentChange('kk', base64, name)}
                  onFileRemove={() => handleDocumentRemove('kk')}
                />

                {/* 3. Akta Kelahiran */}
                <DocumentUploadCard
                  id="doc-akta"
                  title="3. Scan Akta Kelahiran"
                  description="Scan Akta Kelahiran resmi dari Dinas Kependudukan & Catatan Sipil."
                  required={true}
                  fileData={formData.dokumen?.akta}
                  fileName={formData.dokumen?.aktaName}
                  onFileSelect={(base64, name) => handleDocumentChange('akta', base64, name)}
                  onFileRemove={() => handleDocumentRemove('akta')}
                />

                {/* 4. Ijazah / SKL SMP */}
                <DocumentUploadCard
                  id="doc-ijazah"
                  title="4. Scan Ijazah / SKL SMP / MTs"
                  description="Surat Keterangan Lulus (SKL) atau Ijazah SMP/MTs asal."
                  required={false}
                  fileData={formData.dokumen?.ijazahSkl}
                  fileName={formData.dokumen?.ijazahSklName}
                  onFileSelect={(base64, name) => handleDocumentChange('ijazahSkl', base64, name)}
                  onFileRemove={() => handleDocumentRemove('ijazahSkl')}
                />

                {/* 5. Kartu KIP / PKH */}
                <DocumentUploadCard
                  id="doc-kip"
                  title="5. Kartu Indonesia Pintar (KIP / PKH)"
                  description="Wajib bagi murid pemegang kartu bantuan beasiswa PIP / KIP / PKH."
                  required={formData.punyaKip === 'Ya'}
                  fileData={formData.dokumen?.kipPkh}
                  fileName={formData.dokumen?.kipPkhName}
                  onFileSelect={(base64, name) => handleDocumentChange('kipPkh', base64, name)}
                  onFileRemove={() => handleDocumentRemove('kipPkh')}
                />

                {/* 6. KTP Orang Tua / Wali */}
                <DocumentUploadCard
                  id="doc-ktp-ortu"
                  title="6. Scan KTP Orang Tua / Wali"
                  description="KTP Ayah / Ibu Kandung untuk verifikasi NIK."
                  required={false}
                  fileData={formData.dokumen?.ktpOrtu}
                  fileName={formData.dokumen?.ktpOrtuName}
                  onFileSelect={(base64, name) => handleDocumentChange('ktpOrtu', base64, name)}
                  onFileRemove={() => handleDocumentRemove('ktpOrtu')}
                />

              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & KONFIRMASI AKHIR */}
          {currentStep === 7 && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Langkah Terakhir: Periksa Kembali Data Anda</p>
                  <p className="mt-0.5 text-emerald-400/80">
                    Pastikan seluruh isian formulir biodata telah sesuai dengan data kependudukan asli. Setelah disimpan, Anda dapat langsung mengunduh Formulir F-PD resmi format PDF.
                  </p>
                </div>
              </div>

              {/* Review summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 bg-[#161B22] rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-[#E2E8F0] text-sm border-b border-slate-800 pb-1">Identitas Murid</h4>
                  <div className="flex justify-between"><span className="text-slate-400">Nama:</span> <strong className="text-slate-200">{formData.nama}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">NISN:</span> <strong className="text-slate-200">{formData.nisn}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">NIK:</span> <strong className="text-slate-200">{formData.nik}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">TTL:</span> <span className="text-slate-300">{formData.tempatLahir}, {formData.tanggalLahir}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Jurusan:</span> <strong className="text-blue-400">{formData.jurusan}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Rombel:</span> <span className="text-slate-300">{formData.rombel}</span></div>
                </div>

                <div className="p-4 bg-[#161B22] rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-[#E2E8F0] text-sm border-b border-slate-800 pb-1">Alamat & Kontak</h4>
                  <div className="flex justify-between"><span className="text-slate-400">Alamat:</span> <span className="text-slate-300 text-right">{formData.alamatJalan}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Desa/Kec:</span> <span className="text-slate-300">{formData.desaKelurahan}, Kec. {formData.kecamatan}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">No. WA Murid:</span> <strong className="text-emerald-400 font-mono">{formData.nomorHpSiswa}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Ibu Kandung:</span> <strong className="text-slate-200">{formData.namaIbuKandung}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Ayah Kandung:</span> <span className="text-slate-300">{formData.namaAyah || '-'}</span></div>
                  {formData.mempunyaiWali === 'Ya' && formData.namaWali && (
                    <div className="flex justify-between"><span className="text-slate-400">Wali Murid:</span> <strong className="text-emerald-400">{formData.namaWali} ({formData.hubunganWali || 'Wali'})</strong></div>
                  )}
                  <div className="flex justify-between"><span className="text-slate-400">Penerima KIP:</span> <span className="text-slate-300">{formData.punyaKip} {formData.nomorKip ? `(${formData.nomorKip})` : ''}</span></div>
                </div>

              </div>

              {/* Document upload checklist preview */}
              <div className="p-4 bg-[#161B22] rounded-xl border border-slate-800 text-xs">
                <h4 className="font-bold text-[#E2E8F0] mb-2">Status Upload Dokumen Pendukung:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <span className={`px-2 py-1 rounded-md font-semibold border ${formData.dokumen?.fotoName ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/30'}`}>
                    {formData.dokumen?.fotoName ? '✓ Pas Foto' : '✕ Pas Foto'}
                  </span>
                  <span className={`px-2 py-1 rounded-md font-semibold border ${formData.dokumen?.kkName ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/30'}`}>
                    {formData.dokumen?.kkName ? '✓ Scan KK' : '✕ Scan KK'}
                  </span>
                  <span className={`px-2 py-1 rounded-md font-semibold border ${formData.dokumen?.aktaName ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/30'}`}>
                    {formData.dokumen?.aktaName ? '✓ Scan Akta' : '✕ Scan Akta'}
                  </span>
                  <span className={`px-2 py-1 rounded-md font-semibold border ${formData.dokumen?.ijazahSklName ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {formData.dokumen?.ijazahSklName ? '✓ Ijazah/SKL' : '- Ijazah/SKL'}
                  </span>
                  <span className={`px-2 py-1 rounded-md font-semibold border ${formData.dokumen?.kipPkhName ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {formData.dokumen?.kipPkhName ? '✓ Kartu KIP' : '- Kartu KIP'}
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Form Footer Action Buttons */}
        <div className="p-5 sm:p-6 bg-[#161B22] border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={currentStep === 1 ? onCancel : handlePrev}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#0D1117] border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Batal' : 'Sebelumnya'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
              >
                <span>Lanjut ke Langkah {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Kirim Biodata Dapodik 2027</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
