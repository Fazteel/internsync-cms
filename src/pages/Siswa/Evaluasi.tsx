import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function EvaluasiPKL() {
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
      title: "Mendownload lembar penilaian",
      message: `Sedang menyiapkan lembar penilaian...`,
    });
  }

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  const evaluationData = {
    isEvaluated: true, 
    score: 92,
    grade: "A",
    evaluator: "Mohammad Robihul Mufid, M.Tr.Kom",
    date: "12 Februari 2027",
    industry: "PT. Telkom Indonesia (Witel Karawang)",
    notes: "Siswa menunjukkan dedikasi yang luar biasa selama masa PKL. Mampu menyelesaikan tugas tepat waktu dan beradaptasi dengan sangat baik di lingkungan kerja. Keterampilan teknis dalam manajemen database dan pembuatan API sangat menonjol. Pertahankan kinerja baik ini untuk persiapan memasuki dunia kerja yang sesungguhnya!",
  };

  return (
    <>
      <PageMeta
        title="Evaluasi & Nilai PKL | Sistem Manajemen PKL"
        description="Halaman untuk melihat hasil evaluasi dan nilai akhir kegiatan Praktik Kerja Lapangan."
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
              Evaluasi & Nilai Akhir
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Hasil penilaian dari Guru Pembimbing setelah masa PKL Anda selesai.
            </p>
          </div>
          <div>
            <Badge color={evaluationData.isEvaluated ? "success" : "warning"}>
              Status: {evaluationData.isEvaluated ? "Sudah Dinilai" : "Menunggu Penilaian"}
            </Badge>
          </div>
        </div>

        {!evaluationData.isEvaluated ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 px-5 text-center dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-warning-50 text-warning-500 dark:bg-warning-900/20">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Penilaian Belum Tersedia
            </h3>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
              Guru Pembimbing Anda belum menginput nilai akhir. Silakan pastikan semua logbook harian Anda sudah terisi dan diverifikasi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 md:gap-6">
            
            <div className="col-span-1 lg:col-span-4 flex flex-col items-center justify-center rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center dark:border-brand-900/30 dark:bg-brand-900/10 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-brand-700 dark:text-brand-400 tracking-widest">
                Nilai Akhir
              </h3>
              
              <div className="mt-6 flex h-36 w-36 items-center justify-center rounded-full border-[8px] border-white bg-brand-500 dark:border-gray-900 shadow-theme-sm relative">
                 <div className="absolute inset-0 rounded-full border-4 border-brand-200/50"></div>
                <span className="text-5xl font-black text-white">
                  {evaluationData.score}
                </span>
              </div>
              
              <div className="mt-6 bg-white dark:bg-gray-800/50 px-5 py-2.5 rounded-full border border-brand-100 dark:border-brand-800/30 shadow-sm">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Predikat: </span>
                <span className="text-lg font-black text-brand-600 dark:text-brand-400 ml-1">
                  {evaluationData.grade} (Sangat Baik)
                </span>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-8 flex flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-8 shadow-sm">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100 pb-6 dark:border-gray-800">
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Dinilai Oleh</span>
                  <p className="font-bold text-gray-800 dark:text-white/90 text-base">{evaluationData.evaluator}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">Guru Pembimbing</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Lokasi PKL</span>
                    <p className="font-bold text-gray-800 dark:text-white/90">{evaluationData.industry}</p>
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tanggal Penilaian</span>
                    <p className="font-bold text-gray-800 dark:text-white/90">{evaluationData.date}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex-1">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white/90 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                  Catatan Evaluasi / Feedback
                </h4>
                <div className="rounded-xl bg-gray-50 p-5 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-700 shadow-inner">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-loose italic font-medium">
                    "{evaluationData.notes}"
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleDownloadLetter()}
                    disabled={!evaluationData.isEvaluated}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-6 py-3 text-sm font-bold text-white shadow-theme-xs hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Cetak Lembar Penilaian
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}