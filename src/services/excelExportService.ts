import * as XLSX from 'xlsx';
import { SiswaDapodik } from '../types/dapodik';

export const exportToExcelDapodik = (siswaList: SiswaDapodik[], filename = 'Data_Murid_Dapodik_2027_SMKN1Patrol.xlsx'): void => {
  const exportRows = siswaList.map((s, index) => ({
    'No': index + 1,
    'Nama Murid': s.nama,
    'Jenis Kelamin (L/P)': s.jenisKelamin,
    'NISN': s.nisn,
    'NIK / No. KTP': s.nik,
    'No. KK': s.noKk,
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir (YYYY-MM-DD)': s.tanggalLahir,
    'No. Registrasi Akta Lahir': s.noRegistrasiAkta || '',
    'Agama': s.agama,
    'Kewarganegaraan': s.kewarganegaraan,
    'Berkebutuhan Khusus': s.berkebutuhanKhusus,
    'Alamat Jalan': s.alamatJalan,
    'RT': s.rt,
    'RW': s.rw,
    'Dusun': s.namaDusun,
    'Kelurahan / Desa': s.desaKelurahan,
    'Kecamatan': s.kecamatan,
    'Kabupaten / Kota': s.kabupatenKota,
    'Provinsi': s.provinsi,
    'Kode Pos': s.kodePos,
    'Tempat Tinggal': s.tempatTinggal,
    'Moda Transportasi': s.modaTransportasi,
    'Anak Ke-': s.anakKe,
    'Punya KIP (Ya/Tidak)': s.punyaKip,
    'Nomor KIP': s.nomorKip || '',
    'Nama Tertera di KIP': s.namaTerteraDiKip || '',
    'No. KKS/PKH': s.nomorKksPkh || '',
    'Alasan Layak PIP': s.alasanLayakPip || '',
    'Jurusan / Keahlian': s.jurusan,
    'Tingkat': s.tingkatKelas,
    'Rombel': s.rombel,
    'Sekolah Asal SMP': s.sekolahAsalSmp,
    'Nama Ibu Kandung': s.namaIbuKandung,
    'NIK Ibu': s.nikIbu,
    'Tahun Lahir Ibu': s.tahunLahirIbu,
    'Pendidikan Ibu': s.pendidikanIbu,
    'Pekerjaan Ibu': s.pekerjaanIbu,
    'Penghasilan Ibu': s.penghasilanIbu,
    'Nama Ayah Kandung': s.namaAyah,
    'NIK Ayah': s.nikAyah,
    'Tahun Lahir Ayah': s.tahunLahirAyah,
    'Pendidikan Ayah': s.pendidikanAyah,
    'Pekerjaan Ayah': s.pekerjaanAyah,
    'Penghasilan Ayah': s.penghasilanAyah,
    'Mempunyai Wali (Ya/Tidak)': s.mempunyaiWali || 'Tidak',
    'Nama Wali (Opsional)': s.namaWali || '',
    'Hubungan Wali': s.hubunganWali || '',
    'NIK Wali': s.nikWali || '',
    'Tahun Lahir Wali': s.tahunLahirWali || '',
    'Pendidikan Wali': s.pendidikanWali || '',
    'Pekerjaan Wali': s.pekerjaanWali || '',
    'Penghasilan Wali': s.penghasilanWali || '',
    'No. HP / WA Wali': s.nomorHpWali || '',
    'No. HP Murid': s.nomorHpSiswa,
    'No. HP / WA Orang Tua': s.nomorHpOrtu,
    'Email': s.emailSiswa,
    'Tinggi Badan (cm)': s.tinggiBadan,
    'Berat Badan (kg)': s.beratBadan,
    'Lingkar Kepala (cm)': s.lingkarKepala,
    'Jarak ke Sekolah (km)': s.jarakKeSekolahKm,
    'Waktu Tempuh (menit)': s.waktuTempuhMenit,
    'Jumlah Saudara': s.jumlahSaudaraKandung,
    'Status Verifikasi': s.statusVerifikasi,
    'Catatan Operator': s.catatanOperator || '',
    'Terverifikasi Oleh': s.verifiedBy || '',
    'Waktu Verifikasi': s.verifiedAt || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  
  // Set auto column width
  const cols = Object.keys(exportRows[0] || {}).map(() => ({ wch: 20 }));
  worksheet['!cols'] = cols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dapodik 2027 SMKN1Patrol');
  XLSX.writeFile(workbook, filename);
};

export const exportRekapDapodikExcel = exportToExcelDapodik;

export const downloadTemplateExcel = (): void => {
  const sampleRow = [{
    'Nama Murid': 'CONTOH NAMA MURID',
    'Jenis Kelamin (L/P)': 'L',
    'NISN': '0081234567',
    'NIK / No. KTP': '3212051203080001',
    'No. KK': '3212052002100005',
    'Tempat Lahir': 'Indramayu',
    'Tanggal Lahir (YYYY-MM-DD)': '2008-03-12',
    'No. Registrasi Akta Lahir': '3212-LT-12032008-0001',
    'Agama': 'Islam',
    'Kewarganegaraan': 'Indonesia',
    'Berkebutuhan Khusus': 'Tidak Ada',
    'Alamat Jalan': 'Jl. Raya Patrol Blok Balai Desa',
    'RT': '001',
    'RW': '002',
    'Dusun': 'Sukatani',
    'Kelurahan / Desa': 'Patrol',
    'Kecamatan': 'Patrol',
    'Kabupaten / Kota': 'Kabupaten Indramayu',
    'Provinsi': 'Jawa Barat',
    'Kode Pos': '45257',
    'Tempat Tinggal': 'Bersama Orang Tua',
    'Moda Transportasi': 'Sepeda Motor',
    'Anak Ke-': 1,
    'Punya KIP (Ya/Tidak)': 'Tidak',
    'Nomor KIP': '',
    'Jurusan / Keahlian': 'Teknik Jaringan Komputer dan Telekomunikasi (TJKT)',
    'Tingkat': 'X',
    'Rombel': 'X TJKT 1',
    'Sekolah Asal SMP': 'SMPN 1 Patrol',
    'Nama Ibu Kandung': 'Siti Aminah',
    'NIK Ibu': '3212054508780004',
    'Tahun Lahir Ibu': '1978',
    'Pendidikan Ibu': 'SMA / Sederajat',
    'Pekerjaan Ibu': 'Ibu Rumah Tangga',
    'Penghasilan Ibu': 'Tidak Berpenghasilan',
    'Nama Ayah Kandung': 'Ahmad Subagja',
    'NIK Ayah': '3212051005750003',
    'Tahun Lahir Ayah': '1975',
    'Pendidikan Ayah': 'SMA / Sederajat',
    'Pekerjaan Ayah': 'Wiraswasta',
    'Penghasilan Ayah': 'Rp 1.000.000 - Rp 2.000.000',
    'No. HP Murid': '081234567890',
    'No. HP / WA Orang Tua': '081398765432',
    'Email': 'murid@smkn1patrol.sch.id',
    'Tinggi Badan (cm)': 165,
    'Berat Badan (kg)': 55,
    'Lingkar Kepala (cm)': 55,
    'Jarak ke Sekolah (km)': 1.5,
    'Waktu Tempuh (menit)': 10,
    'Jumlah Saudara': 2
  }];

  const worksheet = XLSX.utils.json_to_sheet(sampleRow);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Murid');
  XLSX.writeFile(workbook, 'Template_Import_Murid_SMKN1Patrol_Dapodik2027.xlsx');
};
