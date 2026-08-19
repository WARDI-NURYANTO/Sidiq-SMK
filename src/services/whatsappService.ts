import { SiswaDapodik, SekolahConfig, PengumumanSekolah } from '../types/dapodik';

export const formatWaNumber = (phone?: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

export const createWaLink = (phone: string, message: string): string => {
  const formattedPhone = formatWaNumber(phone);
  if (!formattedPhone) return '#';
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

export const generateWaPemberitahuanVerifikasi = (siswa: SiswaDapodik, config: SekolahConfig): string => {
  const isVerified = siswa.statusVerifikasi === 'verified';
  const statusLabel = isVerified ? '✅ TELAH DIVERIFIKASI & VALID' : 
                      siswa.statusVerifikasi === 'revision_needed' ? '⚠️ PERLU PERBAIKAN BERKAS' : 
                      '⏳ SEDANG DALAM PROSES PENGECEKAN';

  return `*PEMBERITAHUAN RESMI OPERATOR DAPODIK 2027*
*${config.namaSekolah}*
NPSN: ${config.npsn}
━━━━━━━━━━━━━━━━━━━━

Halo *${siswa.nama}* (${siswa.rombel}),
Berikut status pemutakhiran data Formulir F-PD Dapodik 2027 Anda:

• *NISN*: ${siswa.nisn}
• *NIK*: ${siswa.nik}
• *Jurusan*: ${siswa.jurusan}
• *Status Verifikasi*: ${statusLabel}
${siswa.catatanOperator ? `• *Catatan Operator*: _"${siswa.catatanOperator}"_\n` : ''}
${isVerified ? `
Dokumen Formulir Biodata Dapodik 2027 Anda sudah sah dan dapat dicetak/diunduh dalam format PDF resmi melalui aplikasi SiDiQ SMKN 1 Patrol.
` : `
Mohon segera login ke aplikasi SiDiQ untuk melengkapi data atau mengunggah ulang dokumen yang diminta oleh operator.
`}
Salam,
*Tim Operator Pendataan Dapodik*
${config.namaSekolah}
Alamat: ${config.alamat}, Kec. ${config.kecamatan}`;
};

export const generateWaPengingatBerkas = (siswa: SiswaDapodik, config: SekolahConfig): string => {
  return `*PENGINGAT PENGISIAN BIODATA DAPODIK 2027*
*${config.namaSekolah}*
━━━━━━━━━━━━━━━━━━━━

Yth. Murid/Orang Tua dari *${siswa.nama}* (${siswa.rombel}),

Kami menginformasikan bahwa data Dapodik 2027 untuk murid atas nama ${siswa.nama} saat ini *BELUM LENGKAP / MEMERLUKAN TINDAK LANJUT*.

*Yang perlu dicek:*
1. Kelengkapan NIK, No. KK, & Data Orang Tua
2. Upload Scan KK, Akta Kelahiran, & Pas Foto
3. Nomor KIP/PKH (Bagi pemegang kartu bantuan)

Batas sinkronisasi Dapodik Pusat semakin dekat. Mohon akses aplikasi *SiDiQ SMKN 1 PATROL* dan selesaikan pengisian segera.

Terima kasih atas kerja samanya.
*Operator Dapodik ${config.namaSekolah}*`;
};

export const generateWaBroadcastPengumuman = (
  pengumuman: PengumumanSekolah, 
  config: SekolahConfig
): string => {
  return `*PENGUMUMAN RESMI SMKN 1 PATROL*
Kategori: *${pengumuman.kategori}* | Tgl: ${pengumuman.tanggal}
━━━━━━━━━━━━━━━━━━━━

*${pengumuman.judul}*

${pengumuman.isi}

━━━━━━━━━━━━━━━━━━━━
Aplikasi Pendataan: *SiDiQ SMKN 1 PATROL*
Website: ${config.website}
Email: ${config.email}`;
};
