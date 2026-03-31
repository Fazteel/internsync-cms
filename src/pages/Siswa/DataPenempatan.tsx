import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { CalenderIcon } from "../../icons";
import Alert from "../../components/ui/alert/Alert";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function DataPenempatan() {
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });
  
  const handleDownloadLetter = () => {
    setAlertInfo({
      show: true,
      variant: "info",
      title: "Mendownload Surat Pengantar",
      message: `Sedang menyiapkan surat pengantar...`,
    });
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const penempatanData = {
    status: "Aktif",
    durasi: "3 Bulan",
    tanggalMulai: "10 Agustus 2026",
    tanggalSelesai: "10 November 2026",
    industri: {
      nama: "PT. Telkom Indonesia (Witel Karawang)",
      alamat: "Jl. Tuparev No.123, Nagasari, Kec. Karawang Barat, Karawang, Jawa Barat 41312",
      pembimbingLapangan: "Bpk. Hendra Gunawan",
      kontak: "0812-3456-7890 (HRD)",
    },
    guruPembimbing: {
      nama: "Mohammad Robihul Mufid, M.Tr.Kom",
      kontak: "0857-1122-3344",
    },
  };

  return (
    <>
      <PageMeta
        title="Data Penempatan | Sistem Manajemen PKL"
        description="Informasi detail mengenai lokasi industri, waktu pelaksanaan, dan guru pembimbing PKL."
      />

      <div className="space-y-6">

        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Informasi Penempatan PKL
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Detail lokasi dan waktu pelaksanaan magang Anda.
            </p>
          </div>
          <div>
            <Badge color={penempatanData.status === "Aktif" ? "success" : "warning"}>
              Status: {penempatanData.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                 <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                Lokasi Industri
              </h3>
            </div>
            <div className="space-y-5">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nama Perusahaan</span>
                <p className="font-bold text-gray-800 dark:text-white/90 text-base">{penempatanData.industri.nama}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Alamat Lengkap</span>
                <p className="text-sm text-gray-800 dark:text-white/90 leading-relaxed bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">{penempatanData.industri.alamat}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Pembimbing Lapangan / Kontak HR</span>
                <p className="text-sm font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 p-3 rounded-lg border border-brand-100 dark:border-brand-800/50">{penempatanData.industri.pembimbingLapangan} — {penempatanData.industri.kontak}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-900/20">
                  <CalenderIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                  Waktu Pelaksanaan
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tanggal Mulai</span>
                  <p className="font-bold text-gray-800 dark:text-white/90">{penempatanData.tanggalMulai}</p>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tanggal Selesai</span>
                  <p className="font-bold text-gray-800 dark:text-white/90">{penempatanData.tanggalSelesai}</p>
                </div>
                <div className="col-span-2 flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Durasi Program</span>
                  <Badge color="success">{penempatanData.durasi}</Badge>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 border-2 border-brand-200 dark:border-brand-800/50">
                    <span className="text-xl font-bold text-brand-700 dark:text-brand-300">
                      {penempatanData.guruPembimbing.nama.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white/90 text-lg">
                      {penempatanData.guruPembimbing.nama}
                    </h4>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">Guru Pembimbing Sekolah</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-brand-800 dark:text-brand-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Surat Pengantar Industri
              </h3>
              <p className="mt-1.5 text-sm text-brand-700/80 dark:text-brand-400/80 max-w-2xl leading-relaxed">
                Dokumen resmi dari Hubin untuk diserahkan ke pihak industri pada hari pertama magang. Surat hanya bisa diunduh jika status penempatan Aktif.
              </p>
            </div>
            <button
              onClick={() => handleDownloadLetter()}
              disabled={penempatanData.status !== "Aktif"}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-theme-xs hover:bg-brand-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Unduh Surat
            </button>
          </div>
        </div>

      </div>
    </>
  );
}