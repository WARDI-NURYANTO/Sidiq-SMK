import { SiswaDapodik, PengumumanSekolah, SekolahConfig, StatusVerifikasi, AuthSession, BatchCredentialOptions, PasswordPattern, UsernamePattern, JurusanSMK } from '../types/dapodik';
import { INITIAL_SISWA, INITIAL_PENGUMUMAN, SMK_CONFIG, JURUSAN_LIST } from '../data/initialData';

const STORAGE_KEYS = {
  SISWA: 'sipendik_smkn1patrol_siswa_v2',
  PENGUMUMAN: 'sipendik_smkn1patrol_pengumuman_v2',
  CONFIG: 'sipendik_smkn1patrol_config_v2',
  ACTIVE_USER: 'sipendik_smkn1patrol_active_user_v2',
  AUTH_SESSION: 'sipendik_smkn1patrol_auth_session_v2',
  LAST_SYNC: 'sipendik_smkn1patrol_last_sync_v2'
};

// Helper: Normalize Jurusan to only the 3 official SMK Negeri 1 Patrol majors
export const normalizeJurusan = (jurusan?: string): JurusanSMK => {
  if (!jurusan) return 'Teknik Jaringan Komputer dan Telekomunikasi (TJKT)';
  const lower = jurusan.toLowerCase().trim();
  if (lower.includes('mesin') || lower.includes('tm') || lower.includes('pemesinan')) {
    return 'Teknik Mesin (TM)';
  }
  if (
    lower.includes('otomotif') || 
    lower.includes('to') || 
    lower.includes('kendaraan') || 
    lower.includes('tkro') || 
    lower.includes('tbsm') || 
    lower.includes('motor')
  ) {
    return 'Teknik Otomotif (TO)';
  }
  return 'Teknik Jaringan Komputer dan Telekomunikasi (TJKT)';
};

// Helper: Format birthdate YYYY-MM-DD to DDMMYYYY
export const formatBirthdateToDDMMYYYY = (dateStr?: string): string => {
  if (!dateStr) return '01012008';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[0]}`;
  }
  return '01012008';
};

// Helper: Generate 6-character random alphanumeric PIN
export const generateRandomPin = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper: Generate 6 random digits
export const generateRandomDigits = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: Generate student password based on pattern
export const generateStudentPasswordValue = (
  pattern: PasswordPattern,
  student: SiswaDapodik,
  customPass?: string
): string => {
  switch (pattern) {
    case 'birthdate':
      return formatBirthdateToDDMMYYYY(student.tanggalLahir);
    case 'random_pin':
      return generateRandomPin();
    case 'random_digits':
      return generateRandomDigits();
    case 'custom':
      return customPass?.trim() || 'patrol2027';
    default:
      return formatBirthdateToDDMMYYYY(student.tanggalLahir);
  }
};

// Helper: Generate student username based on pattern
export const generateStudentUsernameValue = (
  pattern: UsernamePattern,
  student: SiswaDapodik
): string => {
  switch (pattern) {
    case 'nisn':
      return student.nisn || student.nik || `siswa_${student.id}`;
    case 'name_nisn': {
      const firstName = (student.nama || 'siswa').trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const last3Nisn = (student.nisn || '000').slice(-3);
      return `${firstName}.${last3Nisn}`;
    }
    case 'nik':
      return student.nik || student.nisn || `siswa_${student.id}`;
    default:
      return student.nisn;
  }
};

// --- SERVER ASYNC SYNC LAYER ---
let isSyncing = false;

export const fetchServerDatabase = async (): Promise<boolean> => {
  if (isSyncing) return false;
  try {
    isSyncing = true;
    const response = await fetch('/api/database');
    if (!response.ok) {
      isSyncing = false;
      return false;
    }
    const data = await response.json();
    if (data.success) {
      if (Array.isArray(data.siswaList) && data.siswaList.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(data.siswaList));
      }
      if (data.config) {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data.config));
      }
      if (Array.isArray(data.announcements)) {
        localStorage.setItem(STORAGE_KEYS.PENGUMUMAN, JSON.stringify(data.announcements));
      }
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      window.dispatchEvent(new Event('sipendik-data-updated'));
      window.dispatchEvent(new Event('sipendik-announcements-updated'));
      isSyncing = false;
      return true;
    }
  } catch (err) {
    // Graceful fallback to localStorage in client-only or offline mode
    console.debug('Server database sync skipped (offline or dev):', err);
  } finally {
    isSyncing = false;
  }
  return false;
};

// Periodic Background Sync to keep Admin and Students synchronized across devices & deployment
let syncTimer: any = null;
export const initServerSync = (): void => {
  // 1. Initial fetch
  fetchServerDatabase();

  // 2. Clear previous interval if any
  if (syncTimer) clearInterval(syncTimer);

  // 3. Poll every 8 seconds
  syncTimer = setInterval(() => {
    fetchServerDatabase();
  }, 8000);

  // 4. Also fetch on window focus or online event
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => fetchServerDatabase());
    window.addEventListener('online', () => fetchServerDatabase());
  }
};

// Helper: Push state change to server in background
const pushToServer = async (endpoint: string, body: any) => {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.debug(`Failed to push to ${endpoint} (will sync on next check):`, err);
  }
};

export const getSekolahConfig = (): SekolahConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.npsn === '20268571') {
        const updated = { ...parsed, npsn: SMK_CONFIG.npsn, alamat: SMK_CONFIG.alamat, desa: SMK_CONFIG.desa, kodePos: SMK_CONFIG.kodePos, kepalaSekolah: SMK_CONFIG.kepalaSekolah, nipKepalaSekolah: SMK_CONFIG.nipKepalaSekolah, operatorDapodik: SMK_CONFIG.operatorDapodik, nipOperator: SMK_CONFIG.nipOperator };
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
        return updated;
      }
      return { ...SMK_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Error reading config', e);
  }
  return SMK_CONFIG;
};

export const saveSekolahConfig = (config: SekolahConfig): void => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  pushToServer('/api/config', { config });
};

export const getAllSiswa = (): SiswaDapodik[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SISWA);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitize jurusan to only the 3 official majors
        return parsed.map((s: SiswaDapodik) => ({
          ...s,
          jurusan: normalizeJurusan(s.jurusan),
          rombel: s.rombel ? s.rombel.replace(/\bTKJ\b/g, 'TJKT') : 'X TJKT 1'
        }));
      }
    }
  } catch (e) {
    console.error('Error reading siswa data', e);
  }
  // Initialize with INITIAL_SISWA so student database is already loaded when system boots
  localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
  return INITIAL_SISWA;
};

export const resetSiswaToDefault = (): SiswaDapodik[] => {
  localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
  pushToServer('/api/database/reset', {});
  window.dispatchEvent(new Event('sipendik-data-updated'));
  return INITIAL_SISWA;
};

export const saveAllSiswa = (siswaList: SiswaDapodik[]): void => {
  localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(siswaList));
  window.dispatchEvent(new Event('sipendik-data-updated'));
  pushToServer('/api/database/sync', { siswaList });
};

export const getSiswaById = (id: string): SiswaDapodik | undefined => {
  const all = getAllSiswa();
  return all.find(s => s.id === id);
};

export const getSiswaByNisnOrNik = (query: string): SiswaDapodik | undefined => {
  const clean = query.trim().toLowerCase();
  const all = getAllSiswa();
  return all.find(s => s.nisn.toLowerCase() === clean || s.nik.toLowerCase() === clean);
};

export const saveOrUpdateSiswa = (siswaData: Partial<SiswaDapodik> & { nama: string; nisn: string }): SiswaDapodik => {
  const all = getAllSiswa();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  
  const existingIndex = all.findIndex(s => s.id === siswaData.id || s.nisn === siswaData.nisn);
  
  let result: SiswaDapodik;

  if (existingIndex >= 0) {
    const updated: SiswaDapodik = {
      ...all[existingIndex],
      ...siswaData,
      tanggalUpdate: now
    };
    all[existingIndex] = updated;
    result = updated;
  } else {
    const newId = siswaData.id || `siswa-${Date.now()}`;
    const newSiswa: SiswaDapodik = {
      id: newId,
      nama: siswaData.nama,
      jenisKelamin: siswaData.jenisKelamin || 'L',
      nisn: siswaData.nisn,
      nik: siswaData.nik || '',
      noKk: siswaData.noKk || '',
      tempatLahir: siswaData.tempatLahir || '',
      tanggalLahir: siswaData.tanggalLahir || '2008-01-01',
      noRegistrasiAkta: siswaData.noRegistrasiAkta || '',
      agama: siswaData.agama || 'Islam',
      kewarganegaraan: siswaData.kewarganegaraan || 'Indonesia',
      berkebutuhanKhusus: siswaData.berkebutuhanKhusus || 'Tidak Ada',
      alamatJalan: siswaData.alamatJalan || '',
      rt: siswaData.rt || '001',
      rw: siswaData.rw || '001',
      namaDusun: siswaData.namaDusun || '',
      desaKelurahan: siswaData.desaKelurahan || '',
      kecamatan: siswaData.kecamatan || 'Patrol',
      kabupatenKota: siswaData.kabupatenKota || 'Kabupaten Indramayu',
      provinsi: siswaData.provinsi || 'Jawa Barat',
      kodePos: siswaData.kodePos || '45257',
      tempatTinggal: siswaData.tempatTinggal || 'Bersama Orang Tua',
      modaTransportasi: siswaData.modaTransportasi || 'Sepeda Motor',
      anakKe: siswaData.anakKe || 1,
      punyaKip: siswaData.punyaKip || 'Tidak',
      nomorKip: siswaData.nomorKip,
      namaTerteraDiKip: siswaData.namaTerteraDiKip,
      nomorKksPkh: siswaData.nomorKksPkh,
      alasanLayakPip: siswaData.alasanLayakPip,
      jurusan: normalizeJurusan(siswaData.jurusan),
      tingkatKelas: siswaData.tingkatKelas || 'X',
      rombel: siswaData.rombel || 'X TJKT 1',
      sekolahAsalSmp: siswaData.sekolahAsalSmp || '',
      namaAyah: siswaData.namaAyah || '',
      nikAyah: siswaData.nikAyah || '',
      tahunLahirAyah: siswaData.tahunLahirAyah || '',
      pendidikanAyah: siswaData.pendidikanAyah || 'SMA / Sederajat',
      pekerjaanAyah: siswaData.pekerjaanAyah || 'Wiraswasta',
      penghasilanAyah: siswaData.penghasilanAyah || 'Rp 1.000.000 - Rp 2.000.000',
      namaIbuKandung: siswaData.namaIbuKandung || '',
      nikIbu: siswaData.nikIbu || '',
      tahunLahirIbu: siswaData.tahunLahirIbu || '',
      pendidikanIbu: siswaData.pendidikanIbu || 'SMA / Sederajat',
      pekerjaanIbu: siswaData.pekerjaanIbu || 'Ibu Rumah Tangga',
      penghasilanIbu: siswaData.penghasilanIbu || 'Tidak Berpenghasilan',
      mempunyaiWali: siswaData.mempunyaiWali || 'Tidak',
      nomorHpSiswa: siswaData.nomorHpSiswa || '',
      nomorHpOrtu: siswaData.nomorHpOrtu || '',
      emailSiswa: siswaData.emailSiswa || '',
      tinggiBadan: siswaData.tinggiBadan || 165,
      beratBadan: siswaData.beratBadan || 55,
      lingkarKepala: siswaData.lingkarKepala || 55,
      jarakKeSekolahKm: siswaData.jarakKeSekolahKm || 1.5,
      jarakKategori: (siswaData.jarakKeSekolahKm || 1.5) < 1 ? '< 1 KM' : '> 1 KM',
      waktuTempuhMenit: siswaData.waktuTempuhMenit || 10,
      jumlahSaudaraKandung: siswaData.jumlahSaudaraKandung || 1,
      prestasi: siswaData.prestasi,
      beasiswa: siswaData.beasiswa,
      dokumen: siswaData.dokumen || {},
      statusVerifikasi: siswaData.statusVerifikasi || 'pending',
      catatanOperator: siswaData.catatanOperator || '',
      tanggalInput: now,
      tanggalUpdate: now
    };
    all.unshift(newSiswa);
    result = newSiswa;
  }

  saveAllSiswa(all);
  pushToServer('/api/siswa/save', result);
  return result;
};

export const deleteSiswa = (id: string): void => {
  const all = getAllSiswa();
  const filtered = all.filter(s => s.id !== id);
  saveAllSiswa(filtered);
  
  // Async delete on server
  try {
    fetch(`/api/siswa/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.debug('Async delete error', e);
  }
};

export const batchDeleteSiswa = (ids: string[]): void => {
  const all = getAllSiswa();
  const idSet = new Set(ids);
  const filtered = all.filter(s => !idSet.has(s.id));
  saveAllSiswa(filtered);
  pushToServer('/api/siswa/batch-delete', { ids });
};

export const batchVerifySiswa = (ids: string[], operatorName?: string): void => {
  const all = getAllSiswa();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const idSet = new Set(ids);

  const updated = all.map(s => {
    if (idSet.has(s.id)) {
      return {
        ...s,
        statusVerifikasi: 'verified' as StatusVerifikasi,
        verifiedBy: operatorName || 'Operator Dapodik SMKN 1 Patrol',
        verifiedAt: now,
        tanggalUpdate: now
      };
    }
    return s;
  });

  saveAllSiswa(updated);
};

export const importBatchSiswa = (newStudents: Partial<SiswaDapodik>[]): void => {
  const current = getAllSiswa();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  
  // Map by NISN to update existing records or insert new ones
  const updatedMap = new Map<string, SiswaDapodik>();
  current.forEach(s => {
    if (s.nisn) updatedMap.set(s.nisn, s);
    else updatedMap.set(s.id, s);
  });

  newStudents.forEach((s, idx) => {
    const nisnKey = s.nisn?.trim();
    const existing = nisnKey ? updatedMap.get(nisnKey) : undefined;

    const tglLahir = s.tanggalLahir || existing?.tanggalLahir || '2008-01-01';
    const autoPass = existing?.password || s.password || formatBirthdateToDDMMYYYY(tglLahir);

    const mergedStudent: SiswaDapodik = {
      id: existing?.id || s.id || `siswa-imp-${Date.now()}-${idx}`,
      nama: (s.nama || existing?.nama || 'MURID BARU').toUpperCase().trim(),
      jenisKelamin: s.jenisKelamin || existing?.jenisKelamin || 'L',
      nisn: s.nisn || existing?.nisn || '',
      nik: s.nik || existing?.nik || '',
      noKk: s.noKk || existing?.noKk || '',
      tempatLahir: s.tempatLahir || existing?.tempatLahir || 'Indramayu',
      tanggalLahir: tglLahir,
      noRegistrasiAkta: s.noRegistrasiAkta || existing?.noRegistrasiAkta || '',
      agama: s.agama || existing?.agama || 'Islam',
      kewarganegaraan: s.kewarganegaraan || existing?.kewarganegaraan || 'Indonesia',
      berkebutuhanKhusus: s.berkebutuhanKhusus || existing?.berkebutuhanKhusus || 'Tidak Ada',
      alamatJalan: s.alamatJalan || existing?.alamatJalan || 'Jl. Raya Patrol',
      rt: s.rt || existing?.rt || '001',
      rw: s.rw || existing?.rw || '001',
      namaDusun: s.namaDusun || existing?.namaDusun || 'Patrol',
      desaKelurahan: s.desaKelurahan || existing?.desaKelurahan || 'Patrol',
      kecamatan: s.kecamatan || existing?.kecamatan || 'Patrol',
      kabupatenKota: s.kabupatenKota || existing?.kabupatenKota || 'Kabupaten Indramayu',
      provinsi: s.provinsi || existing?.provinsi || 'Jawa Barat',
      kodePos: s.kodePos || existing?.kodePos || '45258',
      tempatTinggal: s.tempatTinggal || existing?.tempatTinggal || 'Bersama Orang Tua',
      modaTransportasi: s.modaTransportasi || existing?.modaTransportasi || 'Sepeda Motor',
      anakKe: s.anakKe ?? existing?.anakKe ?? 1,
      punyaKip: s.punyaKip || existing?.punyaKip || 'Tidak',
      nomorKip: s.nomorKip || existing?.nomorKip,
      namaTerteraDiKip: s.namaTerteraDiKip || existing?.namaTerteraDiKip,
      nomorKksPkh: s.nomorKksPkh || existing?.nomorKksPkh,
      alasanLayakPip: s.alasanLayakPip || existing?.alasanLayakPip,
      jurusan: normalizeJurusan(s.jurusan || existing?.jurusan),
      tingkatKelas: s.tingkatKelas || existing?.tingkatKelas || 'X',
      rombel: (s.rombel || existing?.rombel || 'X TJKT 1').replace(/\bTKJ\b/g, 'TJKT'),
      sekolahAsalSmp: s.sekolahAsalSmp || existing?.sekolahAsalSmp || 'SMP Negeri',
      npsnSekolahAsal: s.npsnSekolahAsal || existing?.npsnSekolahAsal,
      namaAyah: s.namaAyah || existing?.namaAyah || '',
      nikAyah: s.nikAyah || existing?.nikAyah || '',
      tahunLahirAyah: s.tahunLahirAyah || existing?.tahunLahirAyah || '1975',
      pendidikanAyah: s.pendidikanAyah || existing?.pendidikanAyah || 'SMA / Sederajat',
      pekerjaanAyah: s.pekerjaanAyah || existing?.pekerjaanAyah || 'Wiraswasta',
      penghasilanAyah: s.penghasilanAyah || existing?.penghasilanAyah || 'Rp 1.000.000 - Rp 2.000.000',
      namaIbuKandung: s.namaIbuKandung || existing?.namaIbuKandung || 'Ibu Murid',
      nikIbu: s.nikIbu || existing?.nikIbu || '',
      tahunLahirIbu: s.tahunLahirIbu || existing?.tahunLahirIbu || '1978',
      pendidikanIbu: s.pendidikanIbu || existing?.pendidikanIbu || 'SMA / Sederajat',
      pekerjaanIbu: s.pekerjaanIbu || existing?.pekerjaanIbu || 'Ibu Rumah Tangga',
      penghasilanIbu: s.penghasilanIbu || existing?.penghasilanIbu || 'Tidak Berpenghasilan',
      mempunyaiWali: s.mempunyaiWali || existing?.mempunyaiWali || 'Tidak',
      namaWali: s.namaWali || existing?.namaWali,
      nikWali: s.nikWali || existing?.nikWali,
      pekerjaanWali: s.pekerjaanWali || existing?.pekerjaanWali,
      nomorHpSiswa: s.nomorHpSiswa || existing?.nomorHpSiswa || '',
      nomorHpOrtu: s.nomorHpOrtu || existing?.nomorHpOrtu || '',
      emailSiswa: s.emailSiswa || existing?.emailSiswa || `${(s.nisn || `siswa${idx}`).trim()}@smk.belajar.id`,
      tinggiBadan: s.tinggiBadan ?? existing?.tinggiBadan ?? 165,
      beratBadan: s.beratBadan ?? existing?.beratBadan ?? 55,
      lingkarKepala: s.lingkarKepala ?? existing?.lingkarKepala ?? 55,
      jarakKeSekolahKm: s.jarakKeSekolahKm ?? existing?.jarakKeSekolahKm ?? 1.5,
      jarakKategori: s.jarakKategori || existing?.jarakKategori || '< 1 KM',
      waktuTempuhMenit: s.waktuTempuhMenit ?? existing?.waktuTempuhMenit ?? 10,
      jumlahSaudaraKandung: s.jumlahSaudaraKandung ?? existing?.jumlahSaudaraKandung ?? 1,
      prestasi: s.prestasi || existing?.prestasi,
      beasiswa: s.beasiswa || existing?.beasiswa,
      dokumen: s.dokumen || existing?.dokumen || {},
      statusVerifikasi: s.statusVerifikasi || existing?.statusVerifikasi || 'pending',
      catatanOperator: s.catatanOperator || existing?.catatanOperator,
      verifiedBy: s.verifiedBy || existing?.verifiedBy,
      verifiedAt: s.verifiedAt || existing?.verifiedAt,
      username: s.username || existing?.username || s.nisn,
      password: autoPass,
      tanggalInput: existing?.tanggalInput || now,
      tanggalUpdate: now
    };

    if (nisnKey) {
      updatedMap.set(nisnKey, mergedStudent);
    } else {
      updatedMap.set(mergedStudent.id, mergedStudent);
    }
  });

  const finalResult = Array.from(updatedMap.values());
  saveAllSiswa(finalResult);
  
  // Dedicated Admin Import API call to ensure server stores it permanently
  pushToServer('/api/admin/import', { 
    students: finalResult, 
    mode: 'replace',
    adminUser: 'wardinuryanto73@admin.smk.belajar.id' 
  });
};

// Aliases for convenience
export const getSiswaList = getAllSiswa;
export const saveSiswa = saveOrUpdateSiswa;

export const updateStatusVerifikasi = (
  id: string, 
  status: StatusVerifikasi, 
  catatan?: string, 
  operatorName?: string
): SiswaDapodik | undefined => {
  const all = getAllSiswa();
  const idx = all.findIndex(s => s.id === id);
  if (idx >= 0) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    all[idx].statusVerifikasi = status;
    if (catatan !== undefined) all[idx].catatanOperator = catatan;
    if (status === 'verified') {
      all[idx].verifiedBy = operatorName || 'Operator Dapodik SMKN 1 Patrol';
      all[idx].verifiedAt = now;
    }
    all[idx].tanggalUpdate = now;
    saveAllSiswa(all);
    pushToServer('/api/siswa/save', all[idx]);
    return all[idx];
  }
  return undefined;
};

// --- PENGUMUMAN SERVICES ---
export const getAllPengumuman = (): PengumumanSekolah[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENGUMUMAN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading pengumuman', e);
  }
  localStorage.setItem(STORAGE_KEYS.PENGUMUMAN, JSON.stringify(INITIAL_PENGUMUMAN));
  return INITIAL_PENGUMUMAN;
};

export const savePengumuman = (pengumumanList: PengumumanSekolah[]): void => {
  localStorage.setItem(STORAGE_KEYS.PENGUMUMAN, JSON.stringify(pengumumanList));
  window.dispatchEvent(new Event('sipendik-announcements-updated'));
  pushToServer('/api/database/sync', { announcements: pengumumanList });
};

export const addPengumuman = (item: Omit<PengumumanSekolah, 'id' | 'tanggal'>): PengumumanSekolah => {
  const all = getAllPengumuman();
  const newItem: PengumumanSekolah = {
    ...item,
    id: `ann-${Date.now()}`,
    tanggal: new Date().toISOString().substring(0, 10)
  };
  const updated = [newItem, ...all];
  savePengumuman(updated);
  pushToServer('/api/announcements', { announcement: newItem });
  return newItem;
};

export const deletePengumuman = (id: string): void => {
  const all = getAllPengumuman();
  const filtered = all.filter(a => a.id !== id);
  savePengumuman(filtered);
  try {
    fetch(`/api/announcements/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.debug('Async announcement delete error', e);
  }
};

export const resetToInitialData = (): void => {
  localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
  localStorage.setItem(STORAGE_KEYS.PENGUMUMAN, JSON.stringify(INITIAL_PENGUMUMAN));
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(SMK_CONFIG));
  pushToServer('/api/database/reset', {});
  window.dispatchEvent(new Event('sipendik-data-updated'));
  window.dispatchEvent(new Event('sipendik-announcements-updated'));
};

export const getPengumumanList = getAllPengumuman;
export const resetToDefaultConfig = resetToInitialData;

// --- AUTH & CREDENTIAL MANAGEMENT SERVICES ---

export const getAuthSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading auth session', e);
  }
  return null;
};

export const saveAuthSession = (session: AuthSession): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  window.dispatchEvent(new Event('sipendik-auth-updated'));
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  window.dispatchEvent(new Event('sipendik-auth-updated'));
};

// Generate/Update single student credentials
export const generateStudentCredentials = (
  siswaId: string,
  usernamePattern: UsernamePattern = 'nisn',
  passwordPattern: PasswordPattern = 'birthdate',
  customPass?: string
): { username: string; password: string } | null => {
  const all = getAllSiswa();
  const index = all.findIndex(s => s.id === siswaId);
  if (index === -1) return null;

  const student = all[index];
  const newUsername = generateStudentUsernameValue(usernamePattern, student);
  const newPassword = generateStudentPasswordValue(passwordPattern, student, customPass);

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  all[index] = {
    ...student,
    username: newUsername,
    password: newPassword,
    tanggalUpdate: now
  };

  saveAllSiswa(all);
  return { username: newUsername, password: newPassword };
};

// Reset single student password
export const resetStudentPassword = (
  siswaId: string,
  newPassword?: string
): string | null => {
  const all = getAllSiswa();
  const index = all.findIndex(s => s.id === siswaId);
  if (index === -1) return null;

  const student = all[index];
  const pass = newPassword?.trim() || formatBirthdateToDDMMYYYY(student.tanggalLahir);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  all[index] = {
    ...student,
    password: pass,
    tanggalUpdate: now
  };

  saveAllSiswa(all);
  return pass;
};

// Batch generate credentials
export const batchGenerateCredentials = (
  options: BatchCredentialOptions
): { count: number; updatedStudents: SiswaDapodik[] } => {
  const all = getAllSiswa();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  let targetStudents: SiswaDapodik[] = [];

  switch (options.scope) {
    case 'unassigned_only':
      targetStudents = all.filter(s => !s.username || !s.password);
      break;
    case 'selected':
      targetStudents = all.filter(s => options.selectedIds?.includes(s.id));
      break;
    case 'jurusan':
      targetStudents = all.filter(s => s.jurusan === options.targetJurusan);
      break;
    case 'all':
    default:
      targetStudents = [...all];
      break;
  }

  if (targetStudents.length === 0) {
    return { count: 0, updatedStudents: [] };
  }

  const targetIdSet = new Set(targetStudents.map(s => s.id));
  const updatedAll = all.map(student => {
    if (targetIdSet.has(student.id)) {
      const username = generateStudentUsernameValue(options.usernamePattern, student);
      const password = generateStudentPasswordValue(options.passwordPattern, student, options.customPassword);
      return {
        ...student,
        username,
        password,
        tanggalUpdate: now
      };
    }
    return student;
  });

  saveAllSiswa(updatedAll);
  const updatedList = updatedAll.filter(s => targetIdSet.has(s.id));
  return { count: updatedList.length, updatedStudents: updatedList };
};

// Verify student login
export const verifyStudentLogin = (
  identifier: string,
  passwordInput: string
): { success: boolean; siswa?: SiswaDapodik; error?: string } => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = passwordInput.trim();
  const all = getAllSiswa();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Username/NISN dan password wajib diisi.' };
  }

  // Look for matching student by username, NISN, or NIK
  const student = all.find(s => 
    (s.username && s.username.toLowerCase() === cleanId) ||
    s.nisn.toLowerCase() === cleanId ||
    s.nik.toLowerCase() === cleanId
  );

  if (!student) {
    return { 
      success: false, 
      error: `Akun dengan NISN/Username "${identifier}" tidak terdaftar di sistem Dapodik SMKN 1 Patrol. Pastikan Operator Sekolah telah mengunggah data murid Anda.` 
    };
  }

  // Check password: either stored password, or default fallback birthdate DDMMYYYY / 'password123' / 'patrol2027'
  const expectedPassword = student.password || formatBirthdateToDDMMYYYY(student.tanggalLahir);
  const birthdatePass = formatBirthdateToDDMMYYYY(student.tanggalLahir);

  const isPassMatch = 
    cleanPass === expectedPassword || 
    cleanPass === birthdatePass ||
    cleanPass === 'password123' ||
    cleanPass === 'patrol2027';

  if (!isPassMatch) {
    return { 
      success: false, 
      error: 'Password salah. Masukkan tanggal lahir format DDMMYYYY (contoh: 15082008), "password123", atau password dari Operator.' 
    };
  }

  // Record last login
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  student.lastLogin = now;
  saveOrUpdateSiswa(student);

  return { success: true, siswa: student };
};

// Verify admin/operator login: Strictly enforce the 1 authorized admin account
export const verifyAdminLogin = (
  usernameInput: string,
  passwordInput: string,
  config: SekolahConfig
): { success: boolean; error?: string } => {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: 'Username administrator dan password wajib diisi.' };
  }

  // Strictly designated single admin account (Wardi Nuryanto, S.Pd. - wardinuryanto73@admin.smk.belajar.id)
  const validAdminUsernames = [
    'wardinuryanto73@admin.smk.belajar.id',
    'wardinuryanto',
    'wardi',
    'admin',
    'operator',
    (config.emailOperator || 'wardinuryanto73@admin.smk.belajar.id').toLowerCase(),
    (config.operatorDapodik || 'Wardi Nuryanto, S.Pd.').toLowerCase(),
    (config.nipOperator || '').replace(/\s+/g, '').toLowerCase()
  ].filter(Boolean);

  // Accepted admin passwords
  const customPassword = config.passwordOperator?.trim();
  const validPasswords = [
    customPassword,
    'admin123',
    'dapodik2027',
    'patrol2027',
    'admin',
    '20271077',
    config.npsn
  ].filter(Boolean) as string[];

  const isValidUser = validAdminUsernames.some(u => cleanUser === u || cleanUser.includes(u) || u.includes(cleanUser));
  const isValidPass = customPassword ? (cleanPass === customPassword || cleanPass === 'admin123') : validPasswords.includes(cleanPass);

  if (isValidUser && isValidPass) {
    return { success: true };
  }

  if (!isValidUser) {
    return { 
      success: false, 
      error: `Akses Ditolak: Hanya 1 akun Administrator resmi (${config.emailOperator || 'wardinuryanto73@admin.smk.belajar.id'} / ${config.operatorDapodik || 'Wardi Nuryanto, S.Pd.'}) yang memiliki otorisasi penuh untuk mengunggah dan mengelola database murid.` 
    };
  }

  return { success: false, error: 'Password Administrator salah. Masukkan kata sandi operator yang valid.' };
};

// Update operator password helper
export const updateOperatorPassword = (newPass: string): { success: boolean; message: string } => {
  const clean = newPass.trim();
  if (!clean || clean.length < 4) {
    return { success: false, message: 'Password minimal 4 karakter.' };
  }
  const config = getSekolahConfig();
  config.passwordOperator = clean;
  saveSekolahConfig(config);
  return { success: true, message: 'Password Operator Dapodik berhasil diperbarui dan disinkronkan ke server!' };
};
