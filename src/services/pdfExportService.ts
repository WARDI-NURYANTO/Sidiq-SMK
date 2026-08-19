import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SiswaDapodik, SekolahConfig } from '../types/dapodik';

export const exportSingleSiswaPdf = (siswa: SiswaDapodik, config: SekolahConfig): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // --- HEADER / KOP SURAT ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138); // Dark Navy Blue
  doc.text('PEMERINTAH DAERAH PROVINSI JAWA BARAT', pageWidth / 2, y, { align: 'center' });
  
  y += 5;
  doc.setFontSize(9);
  doc.text('DINAS PENDIDIKAN - CABANG DINAS PENDIDIKAN WILAYAH IX', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text(config.namaSekolah, pageWidth / 2, y, { align: 'center' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`${config.alamat}, Kec. ${config.kecamatan}, Kab. ${config.kabupaten} ${config.kodePos}`, pageWidth / 2, y, { align: 'center' });
  
  y += 3.5;
  doc.text(`NPSN: ${config.npsn} | Telp: ${config.telepon} | Website: ${config.website} | Email: ${config.email}`, pageWidth / 2, y, { align: 'center' });

  y += 3;
  // Divider double lines
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.line(14, y, pageWidth - 14, y);
  doc.setLineWidth(0.2);
  doc.line(14, y + 0.8, pageWidth - 14, y + 0.8);

  y += 7;

  // --- TITLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('FORMULIR PESERTA DIDIK (F-PD) - DAPODIK 2027', pageWidth / 2, y, { align: 'center' });
  
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Tahun Ajaran: ${config.tahunAjaran} | Semester: ${config.semester} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, y, { align: 'center' });

  y += 5;

  // --- SECTION 1: DATA PRIBADI ---
  const dataPribadi = [
    ['1. Nama Lengkap', `: ${siswa.nama}`, '7. Agama & Kepercayaan', `: ${siswa.agama}`],
    ['2. Jenis Kelamin', `: ${siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}`, '8. Kewarganegaraan', `: ${siswa.kewarganegaraan}`],
    ['3. NISN', `: ${siswa.nisn}`, '9. Kebutuhan Khusus', `: ${siswa.berkebutuhanKhusus}`],
    ['4. NIK / No. KTP', `: ${siswa.nik}`, '10. Anak Ke-', `: ${siswa.anakKe}`],
    ['5. No. Kartu Keluarga', `: ${siswa.noKk}`, '11. Penerima KIP/PIP', `: ${siswa.punyaKip} ${siswa.nomorKip ? `(${siswa.nomorKip})` : ''}`],
    ['6. Tempat, Tgl Lahir', `: ${siswa.tempatLahir}, ${siswa.tanggalLahir}`, '12. Program Keahlian', `: ${siswa.jurusan}`]
  ];

  autoTable(doc, {
    startY: y,
    head: [[{ content: 'I. DATA PRIBADI PESERTA DIDIK', colSpan: 4, styles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 8.5 } }]],
    body: dataPribadi,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.2, textColor: [31, 41, 55] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 52 },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 50 }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  y = doc.lastAutoTable.finalY + 3;

  // --- SECTION 2: ALAMAT & KONTAK ---
  const dataAlamat = [
    ['Alamat Jalan / Blok', `: ${siswa.alamatJalan}`, 'Kecamatan / Kab', `: ${siswa.kecamatan} / ${siswa.kabupatenKota}`],
    ['RT / RW / Dusun', `: RT ${siswa.rt} / RW ${siswa.rw} - ${siswa.namaDusun}`, 'Kode Pos', `: ${siswa.kodePos}`],
    ['Kelurahan / Desa', `: ${siswa.desaKelurahan}`, 'Tempat Tinggal', `: ${siswa.tempatTinggal}`],
    ['Moda Transportasi', `: ${siswa.modaTransportasi}`, 'Nomor HP / WhatsApp', `: ${siswa.nomorHpSiswa}`],
    ['Email Siswa', `: ${siswa.emailSiswa}`, 'Rombel / Kelas', `: ${siswa.rombel}`]
  ];

  autoTable(doc, {
    startY: y,
    head: [[{ content: 'II. ALAMAT TEMPAT TINGGAL & KONTAK', colSpan: 4, styles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 8.5 } }]],
    body: dataAlamat,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.2, textColor: [31, 41, 55] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 52 },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 50 }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  y = doc.lastAutoTable.finalY + 3;

  // --- SECTION 3: DATA ORANG TUA / WALI ---
  const waliInfo = siswa.mempunyaiWali === 'Ya' && siswa.namaWali
    ? `${siswa.namaWali} (${siswa.hubunganWali || 'Wali'})`
    : 'Tidak Ada (Bersama Ortu)';

  const dataOrtu = [
    ['Nama Ibu Kandung', `: ${siswa.namaIbuKandung || '-'}`, 'Nama Ayah Kandung', `: ${siswa.namaAyah || '-'}`],
    ['NIK Ibu', `: ${siswa.nikIbu || '-'}`, 'NIK Ayah', `: ${siswa.nikAyah || '-'}`],
    ['Tahun Lahir / Pendidikan', `: ${siswa.tahunLahirIbu || '-'} / ${siswa.pendidikanIbu || '-'}`, 'Tahun Lahir / Pendidikan', `: ${siswa.tahunLahirAyah || '-'} / ${siswa.pendidikanAyah || '-'}`],
    ['Pekerjaan Ibu', `: ${siswa.pekerjaanIbu || '-'}`, 'Pekerjaan Ayah', `: ${siswa.pekerjaanAyah || '-'}`],
    ['Penghasilan Ibu', `: ${siswa.penghasilanIbu || '-'}`, 'Penghasilan Ayah', `: ${siswa.penghasilanAyah || '-'}`],
    ['Wali Murid (Opsional)', `: ${waliInfo}`, 'Pekerjaan / WA Wali', `: ${siswa.mempunyaiWali === 'Ya' && siswa.namaWali ? `${siswa.pekerjaanWali || '-'} / ${siswa.nomorHpWali || '-'}` : '-'}`],
    ['Nomor HP / WA Ortu', `: ${siswa.nomorHpOrtu || '-'}`, 'No. Kartu Keluarga (KK)', `: ${siswa.noKk || '-'}`]
  ];

  autoTable(doc, {
    startY: y,
    head: [[{ content: 'III. DATA ORANG TUA / WALI', colSpan: 4, styles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 8.5 } }]],
    body: dataOrtu,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.2, textColor: [31, 41, 55] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 52 },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 50 }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  y = doc.lastAutoTable.finalY + 3;

  // --- SECTION 4: DATA RINCI & PERIODIK ---
  const dataPeriodik = [
    ['Tinggi Badan', `: ${siswa.tinggiBadan} cm`, 'Jarak Tempat Tinggal ke Sekolah', `: ${siswa.jarakKeSekolahKm} km (${siswa.jarakKategori})`],
    ['Berat Badan', `: ${siswa.beratBadan} kg`, 'Waktu Tempuh ke Sekolah', `: ${siswa.waktuTempuhMenit} Menit`],
    ['Lingkar Kepala', `: ${siswa.lingkarKepala} cm`, 'Jumlah Saudara Kandung', `: ${siswa.jumlahSaudaraKandung} Orang`],
    ['Sekolah Asal (SMP/MTs)', `: ${siswa.sekolahAsalSmp}`, 'Prestasi Siswa', `: ${siswa.prestasi || '-'}`]
  ];

  autoTable(doc, {
    startY: y,
    head: [[{ content: 'IV. DATA RINCI & PERIODIK', colSpan: 4, styles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 8.5 } }]],
    body: dataPeriodik,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.2, textColor: [31, 41, 55] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 52 },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 50 }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  y = doc.lastAutoTable.finalY + 3;

  // --- SECTION 5: KELENGKAPAN DOKUMEN PENDUKUNG ---
  const dok = siswa.dokumen;
  const dataDokumen = [
    ['1. Pas Foto Siswa', dok.fotoName ? `[ V ] Terunggah (${dok.fotoName})` : '[ - ] Belum Terunggah', '4. Ijazah / SKL SMP', dok.ijazahSklName ? `[ V ] Terunggah (${dok.ijazahSklName})` : '[ - ] Belum Terunggah'],
    ['2. Scan Kartu Keluarga (KK)', dok.kkName ? `[ V ] Terunggah (${dok.kkName})` : '[ - ] Belum Terunggah', '5. Kartu KIP / PKH', dok.kipPkhName ? `[ V ] Terunggah (${dok.kipPkhName})` : '[ - ] Belum Terunggah / Tidak Ada'],
    ['3. Scan Akta Kelahiran', dok.aktaName ? `[ V ] Terunggah (${dok.aktaName})` : '[ - ] Belum Terunggah', '6. KTP Orang Tua / Wali', dok.ktpOrtuName ? `[ V ] Terunggah (${dok.ktpOrtuName})` : '[ - ] Belum Terunggah']
  ];

  autoTable(doc, {
    startY: y,
    head: [[{ content: 'V. STATUS DOKUMEN PENDUKUNG DIGITAL', colSpan: 4, styles: { fillColor: [75, 85, 99], textColor: 255, fontStyle: 'bold', fontSize: 8.5 } }]],
    body: dataDokumen,
    theme: 'plain',
    styles: { fontSize: 7.2, cellPadding: 1.2, textColor: [55, 65, 81] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 52 },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 50 }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  y = doc.lastAutoTable.finalY + 4;

  // Status Badge box
  doc.setDrawColor(siswa.statusVerifikasi === 'verified' ? 22 : 220, siswa.statusVerifikasi === 'verified' ? 163 : 38, 74);
  doc.setFillColor(siswa.statusVerifikasi === 'verified' ? 240 : 254, siswa.statusVerifikasi === 'verified' ? 253 : 242, 244);
  doc.roundedRect(14, y, pageWidth - 28, 9, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(siswa.statusVerifikasi === 'verified' ? 22 : 185, siswa.statusVerifikasi === 'verified' ? 101 : 28, 52);
  const statusTxt = siswa.statusVerifikasi === 'verified' 
    ? `STATUS: TERVERIFIKASI & TERDAFTAR RESMI DAPODIK 2027 (Divalidasi oleh: ${siswa.verifiedBy || config.operatorDapodik})` 
    : siswa.statusVerifikasi === 'revision_needed'
    ? `STATUS: PERLU REVISI BERKAS - Catatan: ${siswa.catatanOperator || 'Lengkapi dokumen yang diminta'}`
    : `STATUS: MENUNGGU VERIFIKASI OPERATOR SEKOLAH`;
  doc.text(statusTxt, pageWidth / 2, y + 5.8, { align: 'center' });

  y += 13;

  // --- SIGNATURE SECTION ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);

  const colWidth = (pageWidth - 28) / 3;
  const leftX = 14;
  const midX = 14 + colWidth;
  const rightX = 14 + colWidth * 2;

  doc.text('Mengetahui / Menyetujui,', leftX + colWidth / 2, y, { align: 'center' });
  doc.text('Orang Tua / Wali Murid', leftX + colWidth / 2, y + 3.5, { align: 'center' });

  doc.text('Patrol, ' + new Date().toLocaleDateString('id-ID'), rightX + colWidth / 2, y, { align: 'center' });
  doc.text('Murid Bersangkutan,', rightX + colWidth / 2, y + 3.5, { align: 'center' });

  doc.text('Mengetahui / Memverifikasi,', midX + colWidth / 2, y, { align: 'center' });
  doc.text('Operator Dapodik SMKN 1 Patrol', midX + colWidth / 2, y + 3.5, { align: 'center' });

  y += 18;

  // Sign lines and names
  doc.setFont('helvetica', 'bold');
  doc.text(`( ${siswa.namaAyah || siswa.namaIbuKandung || '.....................................'} )`, leftX + colWidth / 2, y, { align: 'center' });
  doc.text(`( ${config.operatorDapodik} )`, midX + colWidth / 2, y, { align: 'center' });
  doc.text(`( ${siswa.nama} )`, rightX + colWidth / 2, y, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(107, 114, 128);
  doc.text(`NIP: ${config.nipOperator}`, midX + colWidth / 2, y + 3.5, { align: 'center' });
  doc.text(`NISN: ${siswa.nisn}`, rightX + colWidth / 2, y + 3.5, { align: 'center' });

  // Save the PDF
  doc.save(`Formulir_Dapodik_2027_${siswa.nisn}_${siswa.nama.replace(/\s+/g, '_')}.pdf`);
};

export const exportBatchRekapPdf = (siswaList: SiswaDapodik[], config: SekolahConfig): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text(`REKAPITULASI BIODATA MURID DAPODIK 2027`, pageWidth / 2, y, { align: 'center' });
  
  y += 5;
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(config.namaSekolah + ` (NPSN: ${config.npsn})`, pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Tahun Ajaran ${config.tahunAjaran} | Dicetak pada: ${new Date().toLocaleString('id-ID')} | Total: ${siswaList.length} Murid`, pageWidth / 2, y, { align: 'center' });

  y += 5;

  const tableData = siswaList.map((s, idx) => [
    idx + 1,
    s.nisn,
    s.nik,
    s.nama,
    s.jenisKelamin,
    s.rombel,
    s.jurusan.split('(')[1]?.replace(')', '') || s.jurusan,
    s.nomorHpSiswa || s.nomorHpOrtu || '-',
    s.punyaKip === 'Ya' ? 'KIP/PIP' : '-',
    s.statusVerifikasi === 'verified' ? 'TERVERIFIKASI' : s.statusVerifikasi === 'revision_needed' ? 'PERLU REVISI' : 'PENDING'
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      'No', 'NISN', 'NIK', 'Nama Lengkap', 'L/P', 'Rombel', 'Jurusan', 'No. HP/WA', 'Bansos', 'Status'
    ]],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5, textColor: [31, 41, 55] },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 32 },
      3: { cellWidth: 50, fontStyle: 'bold' },
      4: { cellWidth: 10, halign: 'center' },
      5: { cellWidth: 22 },
      6: { cellWidth: 24, halign: 'center' },
      7: { cellWidth: 30 },
      8: { cellWidth: 20, halign: 'center' },
      9: { cellWidth: 32, halign: 'center' }
    },
    margin: { left: 12, right: 12 }
  });

  doc.save(`Rekap_Dapodik_2027_${config.namaSekolah.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.pdf`);
};

export const exportMultipleSiswaPdf = (siswaList: SiswaDapodik[], config: SekolahConfig, filename?: string): void => {
  exportBatchRekapPdf(siswaList, config);
};

