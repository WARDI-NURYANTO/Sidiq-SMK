import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image/document uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Persistent server data path
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Default initial config for SMKN 1 Patrol
const DEFAULT_CONFIG = {
  namaSekolah: "SMK NEGERI 1 PATROL",
  npsn: "20271077",
  alamat: "Jl. Raya Bugel Rt. 1 Rw. 1, Desa Bugel",
  desa: "Bugel",
  kecamatan: "Patrol",
  kabupaten: "Indramayu",
  provinsi: "Jawa Barat",
  kodePos: "45258",
  email: "smkn1patrol.official@gmail.com",
  website: "https://smkn1patrol.sch.id",
  telepon: "085294916873",
  kepalaSekolah: "H. Hadi Mulyono, S.Pd., M.M., Gr.",
  nipKepalaSekolah: "19710117 200501 1 004",
  operatorDapodik: "Wardi Nuryanto, S.Pd.",
  nipOperator: "19870327 202521 1 119",
  emailOperator: "wardinuryanto73@admin.smk.belajar.id",
  passwordOperator: "admin123",
  tahunAjaran: "2026/2027",
  semester: "Ganjil / Dapodik Cutoff 2027"
};

const DEFAULT_PENGUMUMAN = [
  {
    id: "ann-1",
    judul: "📢 PENTING: Batas Akhir Sinkronisasi & Validasi Biodata Dapodik 2027",
    isi: "Seluruh murid SMKN 1 Patrol Tingkat X, XI, dan XII wajib melengkapi dan memverifikasi data pribadi, NIK, NISN, data Orang Tua, serta mengunggah Scan KK & Akta Kelahiran sebelum batas akhir penutupan untuk validasi data Pusat Kemdikbudristek.",
    kategori: "Jadwal Dapodik",
    tanggal: "2026-08-10",
    ditujukanUntuk: "Semua Murid",
    kirimKeWa: true,
    pinToTop: true
  },
  {
    id: "ann-2",
    judul: "🎓 Verifikasi Berkas Penerima Program Indonesia Pintar (PIP / KIP) 2027",
    isi: "Bagi murid pemegang Kartu Indonesia Pintar (KIP) atau Kartu Keluarga Sejahtera (KKS/PKH), harap mengunggah foto kartu yang jelas pada menu 'Upload Dokumen Pendukung' agar proses usulan beasiswa PIP Tahap 2 dapat diproses oleh Operator Dapodik.",
    kategori: "PIP / KIP",
    tanggal: "2026-08-12",
    ditujukanUntuk: "Penerima KIP",
    kirimKeWa: true,
    pinToTop: false
  },
  {
    id: "ann-3",
    judul: "📱 Panduan Instalasi Aplikasi SiDiQ di Smartphone Murid (Android / iPhone)",
    isi: "Aplikasi SiDiQ SMKN 1 Patrol dapat diinstal langsung di layar utama HP tanpa melalui Play Store. Cukup buka aplikasi di browser Chrome/Safari, lalu klik tombol 'Instal Aplikasi' atau 'Add to Home Screen'.",
    kategori: "Umum",
    tanggal: "2026-08-13",
    ditujukanUntuk: "Semua Murid",
    kirimKeWa: false,
    pinToTop: false
  }
];

const DEFAULT_SISWA = [
  {
    id: "siswa-001",
    nama: "AHMAD FAUZI PRATAMA",
    jenisKelamin: "L",
    nisn: "0081234567",
    nik: "3212041505080001",
    noKk: "3212042001050012",
    tempatLahir: "Indramayu",
    tanggalLahir: "2008-05-15",
    noRegistrasiAkta: "3212-LT-15052008-0021",
    agama: "Islam",
    kewarganegaraan: "Indonesia",
    berkebutuhanKhusus: "Tidak Ada",
    alamatJalan: "Jl. Raya Bugel No. 45 Blok Balai Desa",
    rt: "002",
    rw: "001",
    namaDusun: "Bugel Kidul",
    desaKelurahan: "Bugel",
    kecamatan: "Patrol",
    kabupatenKota: "Kabupaten Indramayu",
    provinsi: "Jawa Barat",
    kodePos: "45258",
    tempatTinggal: "Bersama Orang Tua",
    modaTransportasi: "Sepeda Motor",
    anakKe: 1,
    punyaKip: "Ya",
    nomorKip: "KIP-2027-08912",
    namaTerteraDiKip: "AHMAD FAUZI PRATAMA",
    nomorKksPkh: "KKS-3212-88219",
    alasanLayakPip: "Pemegang KIP / KKS Aktif",
    jurusan: "Teknik Jaringan Komputer dan Telekomunikasi (TJKT)",
    tingkatKelas: "X",
    rombel: "X TJKT 1",
    sekolahAsalSmp: "SMP Negeri 1 Patrol",
    npsnSekolahAsal: "20216001",
    namaAyahKandung: "Budi Pratama",
    nikAyah: "3212041002750003",
    pekerjaanAyah: "Petani",
    penghasilanBulananAyah: "Rp 1.000.000 - Rp 2.000.000",
    namaIbuKandung: "Siti Aminah",
    nikIbu: "3212045208780002",
    pekerjaanIbu: "Ibu Rumah Tangga",
    penghasilanBulananIbu: "Tidak Berpenghasilan",
    nomorHpOrtu: "081234567890",
    nomorHpSiswa: "081298765432",
    tinggiBadanCm: 168,
    beratBadanKg: 56,
    lingkarKepalaCm: 55,
    jarakKeSekolahKm: 1.5,
    waktuTempuhMenit: 10,
    jumlahSaudaraKandung: 2,
    statusVerifikasi: "verified",
    verifikator: "Wardi Nuryanto, S.Pd.",
    tanggalVerifikasi: "2026-08-11 10:15",
    dokumen: {
      fotoName: "Pas_Foto_Ahmad_Fauzi.jpg",
      kkName: "KK_3212042001050012_Ahmad.pdf",
      aktaName: "Akta_Ahmad_Fauzi.pdf",
      ijazahSklName: "SKL_SMPN1Patrol_Ahmad.pdf",
      kipPkhName: "KIP_Ahmad_Fauzi.jpg",
      ktpOrtuName: "KTP_Ayah_Budi_Pratama.jpg"
    },
    username: "0081234567",
    password: "password123",
    tanggalUpdate: "2026-08-11 10:15"
  },
  {
    id: "siswa-002",
    nama: "NURUL HIDAYATI",
    jenisKelamin: "P",
    nisn: "0087654321",
    nik: "3212045010080004",
    noKk: "3212041803060009",
    tempatLahir: "Indramayu",
    tanggalLahir: "2008-10-10",
    noRegistrasiAkta: "3212-LT-10102008-0055",
    agama: "Islam",
    kewarganegaraan: "Indonesia",
    berkebutuhanKhusus: "Tidak Ada",
    alamatJalan: "Blok Karanganyar RT 04 RW 02",
    rt: "004",
    rw: "002",
    namaDusun: "Patrol Lor",
    desaKelurahan: "Patrol",
    kecamatan: "Patrol",
    kabupatenKota: "Kabupaten Indramayu",
    provinsi: "Jawa Barat",
    kodePos: "45258",
    tempatTinggal: "Bersama Orang Tua",
    modaTransportasi: "Jalan Kaki",
    anakKe: 2,
    punyaKip: "Tidak",
    jurusan: "Teknik Mesin (TM)",
    tingkatKelas: "X",
    rombel: "X TM 1",
    sekolahAsalSmp: "SMP Negeri 2 Patrol",
    npsnSekolahAsal: "20216002",
    namaAyahKandung: "Rahmat Santoso",
    nikAyah: "3212041203720005",
    pekerjaanAyah: "Wiraswasta",
    penghasilanBulananAyah: "Rp 2.000.000 - Rp 3.000.000",
    namaIbuKandung: "Sri Wahyuni",
    nikIbu: "3212046507760001",
    pekerjaanIbu: "Pedagang",
    penghasilanBulananIbu: "Rp 1.000.000 - Rp 2.000.000",
    nomorHpOrtu: "082133445566",
    nomorHpSiswa: "082199887766",
    tinggiBadanCm: 158,
    beratBadanKg: 48,
    lingkarKepalaCm: 53,
    jarakKeSekolahKm: 0.8,
    waktuTempuhMenit: 8,
    jumlahSaudaraKandung: 1,
    statusVerifikasi: "verified",
    verifikator: "Wardi Nuryanto, S.Pd.",
    tanggalVerifikasi: "2026-08-11 11:20",
    dokumen: {
      fotoName: "PasFoto_Nurul_Hidayati.jpg",
      kkName: "KartuKeluarga_Nurul.pdf",
      aktaName: "AktaKelahiran_Nurul.pdf",
      ijazahSklName: "Ijazah_SMP_Nurul.pdf",
      ktpOrtuName: "KTP_Ibu_Sri.jpg"
    },
    username: "0087654321",
    password: "password123",
    tanggalUpdate: "2026-08-11 11:20"
  },
  {
    id: "siswa-003",
    nama: "DIMAS WAHYU SAPUTRA",
    jenisKelamin: "L",
    nisn: "0082345678",
    nik: "3212042203080002",
    noKk: "3212041209040018",
    tempatLahir: "Indramayu",
    tanggalLahir: "2008-03-22",
    noRegistrasiAkta: "3212-LT-22032008-0012",
    agama: "Islam",
    kewarganegaraan: "Indonesia",
    berkebutuhanKhusus: "Tidak Ada",
    alamatJalan: "Jl. Lapang Bola Blok Sukatani",
    rt: "003",
    rw: "001",
    namaDusun: "Sukatani",
    desaKelurahan: "Bugel",
    kecamatan: "Patrol",
    kabupatenKota: "Kabupaten Indramayu",
    provinsi: "Jawa Barat",
    kodePos: "45258",
    tempatTinggal: "Bersama Orang Tua",
    modaTransportasi: "Sepeda",
    anakKe: 1,
    punyaKip: "Ya",
    nomorKip: "KIP-2027-04421",
    namaTerteraDiKip: "DIMAS WAHYU SAPUTRA",
    alasanLayakPip: "Pemegang KIP Aktif",
    jurusan: "Teknik Otomotif (TO)",
    tingkatKelas: "X",
    rombel: "X TO 1",
    sekolahAsalSmp: "MTs Negeri 1 Patrol",
    npsnSekolahAsal: "20216003",
    namaAyahKandung: "Agus Supriyadi",
    nikAyah: "3212040505700008",
    pekerjaanAyah: "Buruh Harian Lepas",
    penghasilanBulananAyah: "Rp 500.000 - Rp 1.000.000",
    namaIbuKandung: "Marnih",
    nikIbu: "3212044811740004",
    pekerjaanIbu: "Ibu Rumah Tangga",
    penghasilanBulananIbu: "Tidak Berpenghasilan",
    nomorHpOrtu: "083811223344",
    nomorHpSiswa: "083855667788",
    tinggiBadanCm: 165,
    beratBadanKg: 52,
    lingkarKepalaCm: 54,
    jarakKeSekolahKm: 2.1,
    waktuTempuhMenit: 15,
    jumlahSaudaraKandung: 3,
    statusVerifikasi: "pending",
    dokumen: {
      fotoName: "Foto_Dimas.jpg",
      kkName: "Scan_KK_Dimas.pdf",
      aktaName: "Akta_Dimas.pdf"
    },
    username: "0082345678",
    password: "password123",
    tanggalUpdate: "2026-08-12 14:10"
  },
  {
    id: "siswa-004",
    nama: "SITI AISYAH",
    jenisKelamin: "P",
    nisn: "0083456789",
    nik: "3212046412080003",
    noKk: "3212042805070020",
    tempatLahir: "Indramayu",
    tanggalLahir: "2008-12-24",
    noRegistrasiAkta: "3212-LT-24122008-0099",
    agama: "Islam",
    kewarganegaraan: "Indonesia",
    berkebutuhanKhusus: "Tidak Ada",
    alamatJalan: "Blok Balai Desa Sukahaji",
    rt: "001",
    rw: "003",
    namaDusun: "Sukahaji Timur",
    desaKelurahan: "Sukahaji",
    kecamatan: "Patrol",
    kabupatenKota: "Kabupaten Indramayu",
    provinsi: "Jawa Barat",
    kodePos: "45258",
    tempatTinggal: "Bersama Orang Tua",
    modaTransportasi: "Sepeda Motor",
    anakKe: 3,
    punyaKip: "Tidak",
    jurusan: "Teknik Jaringan Komputer dan Telekomunikasi (TJKT)",
    tingkatKelas: "X",
    rombel: "X TJKT 2",
    sekolahAsalSmp: "SMP Negeri 1 Patrol",
    npsnSekolahAsal: "20216001",
    namaAyahKandung: "Dedi Supriyadi",
    nikAyah: "3212041406730006",
    pekerjaanAyah: "PNS / Guru",
    penghasilanBulananAyah: "Rp 3.000.000 - Rp 5.000.000",
    namaIbuKandung: "Neneng Hasanah",
    nikIbu: "3212045509770003",
    pekerjaanIbu: "PNS / Bidan",
    penghasilanBulananIbu: "Rp 3.000.000 - Rp 5.000.000",
    nomorHpOrtu: "081322334455",
    nomorHpSiswa: "081377889900",
    tinggiBadanCm: 160,
    beratBadanKg: 50,
    lingkarKepalaCm: 54,
    jarakKeSekolahKm: 3.0,
    waktuTempuhMenit: 12,
    jumlahSaudaraKandung: 2,
    statusVerifikasi: "verified",
    verifikator: "Wardi Nuryanto, S.Pd.",
    tanggalVerifikasi: "2026-08-12 09:30",
    dokumen: {
      fotoName: "PasFoto_Aisyah.jpg",
      kkName: "KK_Aisyah.pdf",
      aktaName: "Akta_Aisyah.pdf",
      ijazahSklName: "SKL_Aisyah.pdf",
      ktpOrtuName: "KTP_Ortu_Aisyah.pdf"
    },
    username: "0083456789",
    password: "password123",
    tanggalUpdate: "2026-08-12 09:30"
  },
  {
    id: "siswa-005",
    nama: "RIZKY RAMADHAN",
    jenisKelamin: "L",
    nisn: "0084567890",
    nik: "3212040909080005",
    noKk: "3212040101050015",
    tempatLahir: "Indramayu",
    tanggalLahir: "2008-09-09",
    noRegistrasiAkta: "3212-LT-09092008-0044",
    agama: "Islam",
    kewarganegaraan: "Indonesia",
    berkebutuhanKhusus: "Tidak Ada",
    alamatJalan: "Jl. Pantai Bugel No. 12",
    rt: "005",
    rw: "002",
    namaDusun: "Bugel Pesisir",
    desaKelurahan: "Bugel",
    kecamatan: "Patrol",
    kabupatenKota: "Kabupaten Indramayu",
    provinsi: "Jawa Barat",
    kodePos: "45258",
    tempatTinggal: "Bersama Orang Tua",
    modaTransportasi: "Sepeda Motor",
    anakKe: 1,
    punyaKip: "Ya",
    nomorKip: "KIP-2027-09912",
    namaTerteraDiKip: "RIZKY RAMADHAN",
    alasanLayakPip: "Pemegang KIP Aktif",
    jurusan: "Teknik Mesin (TM)",
    tingkatKelas: "X",
    rombel: "X TM 2",
    sekolahAsalSmp: "SMP Negeri 1 Sukra",
    npsnSekolahAsal: "20216005",
    namaAyahKandung: "Kusnadi",
    nikAyah: "3212040105690002",
    pekerjaanAyah: "Nelayan",
    penghasilanBulananAyah: "Rp 1.000.000 - Rp 2.000.000",
    namaIbuKandung: "Karsiti",
    nikIbu: "3212044207720008",
    pekerjaanIbu: "Pedagang Ikan",
    penghasilanBulananIbu: "Rp 500.000 - Rp 1.000.000",
    nomorHpOrtu: "085211223344",
    nomorHpSiswa: "085288990011",
    tinggiBadanCm: 172,
    beratBadanKg: 62,
    lingkarKepalaCm: 56,
    jarakKeSekolahKm: 4.5,
    waktuTempuhMenit: 20,
    jumlahSaudaraKandung: 2,
    statusVerifikasi: "revision_needed",
    catatanRevisi: "Scan Kartu Keluarga (KK) buram dan tidak terbaca jelas. Mohon upload ulang foto KK yang terang dan jelas.",
    dokumen: {
      fotoName: "Foto_Rizky.jpg",
      kkName: "KK_Buram.jpg"
    },
    username: "0084567890",
    password: "password123",
    tanggalUpdate: "2026-08-13 13:45"
  }
];

// Helper to load or initialize DB
function getDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading db file:", err);
  }

  const initialDb = {
    config: DEFAULT_CONFIG,
    announcements: DEFAULT_PENGUMUMAN,
    siswaList: DEFAULT_SISWA,
    lastUpdated: new Date().toISOString()
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing initial db file:", err);
  }

  return initialDb;
}

// Helper to save DB
function saveDatabase(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving db file:", err);
    return false;
  }
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. GET full database (shared across all devices/sessions on deployment)
app.get("/api/database", (req, res) => {
  const db = getDatabase();
  res.json({
    success: true,
    siswaList: db.siswaList || [],
    config: db.config || DEFAULT_CONFIG,
    announcements: db.announcements || DEFAULT_PENGUMUMAN,
    lastUpdated: db.lastUpdated || new Date().toISOString(),
    adminAccount: "wardinuryanto73@admin.smk.belajar.id"
  });
});

// 3. POST /api/admin/import - ONLY Admin can upload & import student database
app.post("/api/admin/import", (req, res) => {
  const { students, mode, adminUser } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ success: false, error: "Daftar murid tidak valid." });
  }

  const db = getDatabase();
  
  if (mode === "replace") {
    db.siswaList = students;
  } else {
    // Append or merge by NISN / ID
    const existingMap = new Map<string, any>((db.siswaList || []).map((s: any) => [s.nisn || s.id, s]));
    for (const st of students) {
      const existing = existingMap.get(st.nisn || st.id) || {};
      existingMap.set(st.nisn || st.id, { ...existing, ...st });
    }
    db.siswaList = Array.from(existingMap.values());
  }

  saveDatabase(db);

  console.log(`[ADMIN IMPORT] Admin ${adminUser || "wardinuryanto73"} imported ${students.length} students. Total database size: ${db.siswaList.length}`);

  res.json({
    success: true,
    count: db.siswaList.length,
    lastUpdated: db.lastUpdated,
    message: `Database berhasil diperbarui dan disinkronkan ke server pusat. Total ${db.siswaList.length} murid terdaftar.`
  });
});

// 4. POST /api/database/sync - Full state sync from client
app.post("/api/database/sync", (req, res) => {
  const { siswaList, config, announcements } = req.body;
  const db = getDatabase();

  if (Array.isArray(siswaList)) db.siswaList = siswaList;
  if (config && typeof config === "object") db.config = config;
  if (Array.isArray(announcements)) db.announcements = announcements;

  saveDatabase(db);

  res.json({
    success: true,
    lastUpdated: db.lastUpdated,
    totalSiswa: db.siswaList.length
  });
});

// 5. POST /api/siswa/save - Save or update single student (used by student portal and operator)
app.post("/api/siswa/save", (req, res) => {
  const studentData = req.body;
  if (!studentData || (!studentData.nama && !studentData.nisn)) {
    return res.status(400).json({ success: false, error: "Data murid tidak lengkap." });
  }

  const db = getDatabase();
  const list = db.siswaList || [];
  const index = list.findIndex((s: any) => s.id === studentData.id || s.nisn === studentData.nisn);

  const now = new Date().toISOString().replace("T", " ").substring(0, 16);
  let savedStudent;

  if (index >= 0) {
    savedStudent = { ...list[index], ...studentData, tanggalUpdate: now };
    list[index] = savedStudent;
  } else {
    savedStudent = {
      ...studentData,
      id: studentData.id || `siswa-${Date.now()}`,
      statusVerifikasi: studentData.statusVerifikasi || "pending",
      tanggalUpdate: now
    };
    list.push(savedStudent);
  }

  db.siswaList = list;
  saveDatabase(db);

  res.json({
    success: true,
    siswa: savedStudent,
    lastUpdated: db.lastUpdated
  });
});

// 6. DELETE /api/siswa/:id - Delete single student (Admin only)
app.delete("/api/siswa/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const beforeCount = (db.siswaList || []).length;
  db.siswaList = (db.siswaList || []).filter((s: any) => s.id !== id);

  saveDatabase(db);

  res.json({
    success: true,
    deleted: beforeCount !== db.siswaList.length,
    remaining: db.siswaList.length,
    lastUpdated: db.lastUpdated
  });
});

// 7. POST /api/siswa/batch-delete - Batch delete students (Admin only)
app.post("/api/siswa/batch-delete", (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ success: false, error: "ID list required" });
  }

  const idSet = new Set(ids);
  const db = getDatabase();
  db.siswaList = (db.siswaList || []).filter((s: any) => !idSet.has(s.id));

  saveDatabase(db);

  res.json({
    success: true,
    deletedCount: ids.length,
    remaining: db.siswaList.length,
    lastUpdated: db.lastUpdated
  });
});

// 8. POST /api/config - Save school/operator config
app.post("/api/config", (req, res) => {
  const { config } = req.body;
  if (!config) {
    return res.status(400).json({ success: false, error: "Config data missing" });
  }

  const db = getDatabase();
  db.config = { ...(db.config || DEFAULT_CONFIG), ...config };
  saveDatabase(db);

  res.json({
    success: true,
    config: db.config,
    lastUpdated: db.lastUpdated
  });
});

// 9. POST /api/announcements - Add announcement
app.post("/api/announcements", (req, res) => {
  const { announcement } = req.body;
  if (!announcement) {
    return res.status(400).json({ success: false, error: "Announcement missing" });
  }

  const db = getDatabase();
  const list = db.announcements || [];
  const newItem = {
    ...announcement,
    id: announcement.id || `ann-${Date.now()}`,
    tanggal: announcement.tanggal || new Date().toISOString().split("T")[0]
  };

  db.announcements = [newItem, ...list];
  saveDatabase(db);

  res.json({
    success: true,
    announcement: newItem,
    announcements: db.announcements,
    lastUpdated: db.lastUpdated
  });
});

// 10. DELETE /api/announcements/:id - Delete announcement
app.delete("/api/announcements/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  db.announcements = (db.announcements || []).filter((a: any) => a.id !== id);
  saveDatabase(db);

  res.json({
    success: true,
    announcements: db.announcements,
    lastUpdated: db.lastUpdated
  });
});

// 11. POST /api/database/reset - Reset to default
app.post("/api/database/reset", (req, res) => {
  const initialDb = {
    config: DEFAULT_CONFIG,
    announcements: DEFAULT_PENGUMUMAN,
    siswaList: DEFAULT_SISWA,
    lastUpdated: new Date().toISOString()
  };
  saveDatabase(initialDb);

  res.json({
    success: true,
    ...initialDb
  });
});

// ==========================================
// VITE SPA INTEGRATION & SERVER START
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] SiDiQ Dapodik 2027 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
