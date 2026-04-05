import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal";
import ComponentCard from "../../components/common/ComponentCard";
import { useStudentMenteeStore } from "../../store/Pembimbing/useStudentMenteeStore";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { studentDetail, isLoading, fetchStudentDetail, reportProblem } = useStudentMenteeStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (id) {
      fetchStudentDetail(id);
    }
  }, [id, fetchStudentDetail]);

  const handleTerminate = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await reportProblem(id!, reason);
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Siswa Dibekukan",
        message: "Status siswa telah diubah menjadi Bermasalah dan akses logbook dikunci.",
      });
      setIsModalOpen(false);
      setReason("");
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlertInfo({
        show: true,
        variant: "error",
        title: "Gagal Proses",
        message: "Terjadi kesalahan saat memperbarui status siswa.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Memuat detail siswa...</div>;
  }

  if (!studentDetail) {
    return <div className="flex h-64 items-center justify-center text-error-500">Data siswa tidak ditemukan!</div>;
  }

  return (
    <>
      <PageMeta title="Detail Siswa Bimbingan" description="Informasi lengkap siswa bimbingan PKL." />

      <PageBreadcrumb pageTitle="Detail Profil Siswa" />

      <div className="space-y-6">
        {alertInfo.show && (
          <div className="animate-fade-in">
            <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
          </div>
        )}

        <ComponentCard title="Status & Identitas Utama" desc="Informasi dasar dan status pelaksanaan PKL saat ini.">
          <div className="p-5 border border-brand-100 bg-brand-50/50 rounded-2xl dark:border-brand-900/30 dark:bg-brand-900/10 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center gap-6 xl:flex-row">
                <div className="w-20 h-20 overflow-hidden border-2 border-white rounded-full dark:border-gray-800 flex items-center justify-center bg-brand-500 text-white text-3xl font-bold flex-shrink-0 shadow-theme-xs uppercase">
                  {studentDetail.name.charAt(0)}
                </div>
                <div className="text-center xl:text-left">
                  <h4 className="mb-2 text-xl font-bold text-gray-800 dark:text-white/90">
                    {studentDetail.name}
                  </h4>
                  <div className="flex flex-col items-center gap-1 xl:flex-row xl:gap-3">
                    <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {studentDetail.major}
                    </p>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm font-medium text-gray-500">
                      NIS: <span className="font-bold text-gray-800 dark:text-gray-300">{studentDetail.nis}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 xl:items-end shrink-0">
                <Badge color={studentDetail.status === "Aktif" ? "success" : studentDetail.status === "Selesai" ? "primary" : studentDetail.status === "Menunggu" ? "warning" : "error"}>
                  Status: {studentDetail.status}
                </Badge>

                {studentDetail.status === "Aktif" && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-error-50 px-4 py-2 text-sm font-bold text-error-700 hover:bg-error-100 border border-error-200 transition-colors whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Report Siswa
                  </button>
                )}
              </div>
            </div>
          </div>
        </ComponentCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ComponentCard title="Informasi Kontak & Penempatan">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Industri Mitra</p>
                <div className="bg-gray-50 p-3 rounded-xl border dark:bg-gray-800/50">
                  <p className="text-sm font-bold">{studentDetail.industry}</p>
                  <p className="text-xs text-gray-500 mt-1">{studentDetail.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Telepon</p>
                  <p className="text-sm font-medium p-3 bg-gray-50 rounded-xl border dark:bg-gray-800/50">{studentDetail.phone}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Email</p>
                  <p className="text-sm font-medium p-3 bg-gray-50 rounded-xl border dark:bg-gray-800/50 truncate" title={studentDetail.email}>{studentDetail.email}</p>
                </div>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Waktu Pelaksanaan PKL">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border text-center dark:bg-gray-800/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Mulai</p>
                  <p className="text-xs font-bold mt-1">{studentDetail.startDate}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border text-center dark:bg-gray-800/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Selesai</p>
                  <p className="text-xs font-bold mt-1">{studentDetail.endDate}</p>
                </div>
                <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 text-center dark:bg-brand-900/20">
                  <p className="text-[10px] font-bold text-brand-600 uppercase">Durasi</p>
                  <p className="text-xs font-bold mt-1">{studentDetail.duration} Bln</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border dark:bg-gray-800/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progres Waktu</span>
                  <span className="text-sm font-bold text-brand-600">{studentDetail.progressPercent}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 shadow-[0_0_10px_rgba(0,104,55,0.4)] transition-all duration-700"
                    style={{ width: `${studentDetail.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md p-0 overflow-hidden" showCloseButton={false}>
        <div className="bg-error-50 px-6 py-4 border-b border-error-100">
          <h3 className="text-lg font-bold text-error-700">Tandai Siswa Bermasalah</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-warning-50 border border-warning-200 p-4 rounded-xl text-xs text-warning-700 leading-relaxed font-medium">
            <strong>⚠️ Peringatan:</strong> Tindakan ini akan membekukan status magang siswa. Siswa tidak akan bisa mengisi logbook dan Koordinator akan segera diberitahu untuk proses penarikan.
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alasan Penarikan/Masalah</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Indisipliner, sering bolos tanpa keterangan, atau melanggar aturan industri..."
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-error-500/20 dark:bg-gray-900 dark:border-gray-700 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-sm font-bold text-gray-500 hover:text-gray-700 transition"
            >
              Batal
            </button>
            <button
              onClick={handleTerminate}
              disabled={!reason.trim() || isSubmitting}
              className="bg-error-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-error-500/20 hover:bg-error-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Eksekusi Penarikan"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}