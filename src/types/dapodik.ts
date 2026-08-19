export type JenisKelamin = 'L' | 'P';
export type UserRole = 'siswa' | 'operator';
export type StatusVerifikasi = 'draft' | 'pending' | 'verified' | 'revision_needed';
export type StatusPernikahanOrtu = 'Menikah' | 'Cerai Hidup' | 'Cerai Mati';
export type ModaTransportasi = 
  | 'Jalan Kaki' 
  | 'Sepeda Motor' 
  | 'Sepeda' 
  | 'Angkutan Umum / Angkot' 
  | 'Ojek Online' 
  | 'Mobil Pribadi' 
  | 'Antar Jemput Sekolah' 
  | 'Lainnya';

export type TempatTinggal = 
  | 'Bersama Orang Tua' 
  | 'Wali' 
  | 'Kost' 
  | 'Asrama / Pesantren' 
  | 'Panti Asuhan' 
  | 'Lainnya';

export type JurusanSMK = 
  | 'Teknik Jaringan Komputer dan Telekomunikasi (TJKT)'
  | 'Teknik Mesin (TM)'
  | 'Teknik Otomotif (TO)';

export interface DokumenSiswa {
  foto?: string; // Base64 data URL
  fotoName?: string;
  kk?: string;
  kkName?: string;
  akta?: string;
  aktaName?: string;
  ijazahSkl?: string;
  ijazahSklName?: string;
  kipPkh?: string;
  kipPkhName?: string;
  ktpOrtu?: string;
  ktpOrtuName?: string;
}

export interface SiswaDapodik {
  id: string;
  // --- IDENTITAS PESERTA DIDIK ---
  nama: string;
  jenisKelamin: JenisKelamin;
  nisn: string; // 10 digit
  nik: string; // 16 digit
  noKk: string; // 16 digit
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  noRegistrasiAkta: string;
  agama: string;
  kewarganegaraan: string;
  berkebutuhanKhusus: string;
  
  // --- ALAMAT TEMPAT TINGGAL ---
  alamatJalan: string;
  rt: string;
  rw: string;
  namaDusun: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  tempatTinggal: TempatTinggal;
  modaTransportasi: ModaTransportasi;
  anakKe: number;
  punyaKip: 'Ya' | 'Tidak';
  nomorKip?: string;
  namaTerteraDiKip?: string;
  nomorKksPkh?: string;
  alasanLayakPip?: string;

  // --- DATA SEKOLAH & JURUSAN ---
  jurusan: JurusanSMK;
  tingkatKelas: 'X' | 'XI' | 'XII';
  rombel: string; // contoh: X TJKT 1, XI TM 2, XII TO 1
  sekolahAsalSmp: string;
  npsnSekolahAsal?: string;
  noPesertaUjianSmp?: string;

  // --- DATA AYAH KANDUNG ---
  namaAyah: string;
  nikAyah: string;
  tahunLahirAyah: string;
  pendidikanAyah: string;
  pekerjaanAyah: string;
  penghasilanAyah: string;
  berkebutuhanKhususAyah?: string;

  // --- DATA IBU KANDUNG ---
  namaIbuKandung: string;
  nikIbu: string;
  tahunLahirIbu: string;
  pendidikanIbu: string;
  pekerjaanIbu: string;
  penghasilanIbu: string;
  berkebutuhanKhususIbu?: string;

  // --- DATA WALI (JIKA ADA / OPSIONAL) ---
  mempunyaiWali: 'Ya' | 'Tidak';
  namaWali?: string;
  nikWali?: string;
  tahunLahirWali?: string;
  hubunganWali?: string; // Kakek/Nenek, Paman/Bibi, Saudara Kandung, Lainnya
  pendidikanWali?: string;
  pekerjaanWali?: string;
  penghasilanWali?: string;
  nomorHpWali?: string;

  // --- KONTAK & KOMUNIKASI ---
  nomorTeleponRumah?: string;
  nomorHpSiswa: string; // untuk WA
  nomorHpOrtu: string; // untuk WA
  emailSiswa: string;

  // --- DATA RINCI / PERIODIK ---
  tinggiBadan: number; // cm
  beratBadan: number; // kg
  lingkarKepala: number; // cm
  jarakKeSekolahKm: number; // km
  jarakKategori: '< 1 KM' | '> 1 KM';
  waktuTempuhMenit: number;
  jumlahSaudaraKandung: number;

  // --- PRESTASI & CATATAN ---
  prestasi?: string;
  beasiswa?: string;

  // --- DOKUMEN PENDUKUNG ---
  dokumen: DokumenSiswa;

  // --- STATUS & AUDIT OPERATOR ---
  statusVerifikasi: StatusVerifikasi;
  catatanOperator?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  tanggalInput: string;
  tanggalUpdate: string;

  // --- KREDENSIAL / LOGIN SISWA ---
  username?: string;
  password?: string;
  lastLogin?: string;
}

export interface AuthSession {
  role: UserRole;
  username: string;
  nama: string;
  siswaId?: string; // Id siswa jika role === 'siswa'
  nisn?: string;
  rombel?: string;
  jurusan?: string;
  operatorName?: string;
  nipOperator?: string;
  loginTime: string;
}

export type PasswordPattern = 'birthdate' | 'random_pin' | 'random_digits' | 'custom';
export type UsernamePattern = 'nisn' | 'name_nisn' | 'nik';

export interface BatchCredentialOptions {
  scope: 'all' | 'unassigned_only' | 'selected' | 'jurusan';
  targetJurusan?: string;
  selectedIds?: string[];
  usernamePattern: UsernamePattern;
  passwordPattern: PasswordPattern;
  customPassword?: string;
}

export interface PengumumanSekolah {
  id: string;
  judul: string;
  isi: string;
  kategori: 'Penting' | 'Verifikasi Berkas' | 'PIP / KIP' | 'Jadwal Dapodik' | 'Umum';
  tanggal: string;
  ditujukanUntuk: 'Semua Murid' | 'Jurusan Tertentu' | 'Murid Belum Lengkap' | 'Penerima KIP';
  targetJurusan?: string;
  kirimKeWa: boolean;
  pinToTop: boolean;
}

export interface SekolahConfig {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  email: string;
  website: string;
  telepon: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  operatorDapodik: string;
  nipOperator: string;
  emailOperator?: string;
  passwordOperator?: string;
  tahunAjaran: string;
  semester: string;
}
