import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { Modal } from "../../ui/modal/index";
import { useModal } from "../../../hooks/useModal";
import Alert from "../../ui/alert/Alert";
import { Link } from "react-router-dom";

type AlertVariant = "success" | "warning" | "info" | "error";

interface AlertInfo {
  show: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

interface LogbookVerification {
  id: number;
  studentName: string;
  industry: string;
  date: string;
  activity: string;
}

const tableData: LogbookVerification[] = [
  { id: 1, studentName: "Fahmi Andika", industry: "PT. Telkom", date: "22 Okt 2026", activity: "Setup jaringan LAN" },
  { id: 2, studentName: "Budi Santoso", industry: "PT. Telkom", date: "22 Okt 2026", activity: "Mempelajari mikrotik" },
  { id: 3, studentName: "Siti Aminah", industry: "CV. Media Tech", date: "21 Okt 2026", activity: "Desain UI/UX Website" },
];

export default function LogbookPending() {
  const [selectedLog, setSelectedLog] = useState<LogbookVerification | null>(null);
  const approveModal = useModal();
  const reviseModal = useModal();
  const [reviseNote, setReviseNote] = useState("");

  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const handleApprove = (log: LogbookVerification) => {
    setSelectedLog(log);
    approveModal.openModal();
  };

  const handleRevise = (log: LogbookVerification) => {
    setSelectedLog(log);
    setReviseNote("");
    reviseModal.openModal();
  };

  const confirmApprove = () => {
    setAlertInfo({
      show: true,
      variant: "success",
      title: "Logbook Disetujui",
      message: `Aktivitas logbook milik ${selectedLog?.studentName} berhasil disetujui.`,
    });
    approveModal.closeModal();
  };

  const confirmRevise = () => {
    if (!reviseNote.trim()) {
      setAlertInfo({
        show: true,
        variant: "warning",
        title: "Perhatian",
        message: "Silakan isi catatan revisi sebelum mengirim.",
      });
      return;
    }
    setAlertInfo({
      show: true,
      variant: "info",
      title: "Revisi Dikirim",
      message: `Catatan revisi telah dikirimkan ke logbook milik ${selectedLog?.studentName}.`,
    });
    reviseModal.closeModal();
  };

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.show]);

  return (
    <div className="space-y-4">
      {alertInfo.show && (
        <div className="animate-fade-in">
          <Alert variant={alertInfo.variant} title={alertInfo.title} message={alertInfo.message} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              Logbook Menunggu Verifikasi
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Daftar aktivitas siswa yang belum Anda tinjau.
            </p>
          </div>
          <Link to="/pembimbing/verifikasi-logbook">
            <button className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">
              Lihat Semua Antrean
            </button>
          </Link>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs min-w-[200px] whitespace-nowrap">Nama Siswa</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs min-w-[150px] whitespace-nowrap">Tanggal</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs min-w-[250px] whitespace-nowrap">Aktivitas Singkat</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs min-w-[150px] whitespace-nowrap">Aksi</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableData.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <TableCell className="py-3 whitespace-nowrap">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{log.studentName}</p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">{log.industry}</span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm whitespace-nowrap">{log.date}</TableCell>
                  <TableCell className="py-3 text-gray-600 dark:text-gray-300 font-medium text-theme-sm max-w-[200px] truncate whitespace-nowrap">
                    {log.activity}
                  </TableCell>
                  <TableCell className="py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => handleApprove(log)}
                        className="rounded bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-theme-xs"
                      >
                        Setujui
                      </button>
                      <button 
                        onClick={() => handleRevise(log)}
                        className="rounded bg-error-50 px-3 py-1.5 text-xs font-semibold text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500 dark:hover:bg-error-500/20 transition-colors"
                      >
                        Revisi
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Modal isOpen={approveModal.isOpen} onClose={approveModal.closeModal} className="max-w-[400px]" showCloseButton={false}>
          <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-6 py-4 dark:border-brand-800/30 dark:bg-brand-900/10">
            <h3 className="text-lg font-bold text-brand-800 dark:text-brand-400">
              Setujui Logbook
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {selectedLog && (
                <>
                  Anda akan menyetujui logbook untuk <span className="font-bold text-gray-800 dark:text-white/90">{selectedLog.studentName}</span> dengan aktivitas <span className="font-semibold italic">"{selectedLog.activity}"</span>. Lanjutkan?
                </>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={approveModal.closeModal}
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmApprove}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors shadow-theme-xs"
              >
                Ya, Setujui
              </button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={reviseModal.isOpen} onClose={reviseModal.closeModal} className="max-w-[450px]" showCloseButton={false}>
          <div className="flex items-center justify-between border-b border-error-100 bg-error-50 px-6 py-4 dark:border-error-800/30 dark:bg-error-900/10">
            <h3 className="text-lg font-bold text-error-800 dark:text-error-400">
              Minta Revisi Logbook
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {selectedLog && (
                <>
                  Beri catatan revisi untuk logbook <span className="font-bold text-gray-800 dark:text-white/90">{selectedLog.studentName}</span> dengan aktivitas <span className="font-semibold italic">"{selectedLog.activity}"</span>.
                </>
              )}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-error-600 dark:text-error-400 mb-1.5">
                Catatan Revisi <span className="text-error-500">*</span>
              </label>
              <textarea
                placeholder="Misal: Harap lampirkan foto dokumentasi yang lebih jelas..."
                value={reviseNote}
                onChange={(e) => setReviseNote(e.target.value)}
                className="w-full rounded-xl border border-error-300 bg-error-50/50 px-4 py-3 text-sm text-gray-900 dark:bg-error-900/10 dark:text-white focus:border-error-500 focus:outline-none focus:ring-1 focus:ring-error-500 transition-all"
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={reviseModal.closeModal}
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmRevise}
                className="rounded-lg bg-error-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-error-700 transition-colors shadow-theme-xs"
              >
                Kirim Revisi
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}